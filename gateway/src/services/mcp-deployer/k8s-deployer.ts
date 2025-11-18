/**
 * Kubernetes Deployment Service for MCP Servers
 * Handles automated deployment, scaling, and lifecycle management
 */

import * as k8s from '@kubernetes/client-node';
import { logger } from '../../logging/logger';
import {
  K8sDeploymentConfig,
  DeploymentResult,
  K8sDeploymentStatus,
} from './types';
import {
  K8sDeploymentError,
  PodNotReadyError,
  K8sConnectionError,
} from '../../errors/gateway-errors';

/**
 * Kubernetes Deployer for MCP Servers
 *
 * Features:
 * - Automated Deployment and Service creation
 * - Health check monitoring
 * - Auto-scaling with HPA
 * - Resource limits and security context
 * - Graceful shutdown handling
 */
export class K8sDeployer {
  private _k8sClient: k8s.KubeConfig;
  private _appsApi!: k8s.AppsV1Api;
  private _coreApi!: k8s.CoreV1Api;
  private _autoscalingApi!: k8s.AutoscalingV1Api;
  private readonly _namespace = 'mcp-servers';
  private _initialized = false;

  constructor(kubeConfig?: k8s.KubeConfig) {
    this._k8sClient = kubeConfig || new k8s.KubeConfig();
  }

  /**
   * Initialize K8s client and verify connection
   */
  async initialize(): Promise<void> {
    try {
      // Load kubeconfig (from file or in-cluster)
      if (process.env.KUBERNETES_SERVICE_HOST) {
        // Running inside K8s cluster
        this._k8sClient.loadFromCluster();
        logger.info('Loaded in-cluster Kubernetes configuration');
      } else {
        // Running outside cluster - load from default kubeconfig
        this._k8sClient.loadFromDefault();
        logger.info('Loaded Kubernetes configuration from default kubeconfig');
      }

      // Initialize API clients
      this._appsApi = this._k8sClient.makeApiClient(k8s.AppsV1Api);
      this._coreApi = this._k8sClient.makeApiClient(k8s.CoreV1Api);
      this._autoscalingApi = this._k8sClient.makeApiClient(k8s.AutoscalingV1Api);

      // Verify connection by listing namespaces
      await this._coreApi.listNamespace();
      logger.info('Kubernetes connection verified');

      // Ensure mcp-servers namespace exists
      await this._ensureNamespace();

      this._initialized = true;
      logger.info('K8sDeployer initialized successfully');
    } catch (error) {
      const message = `Failed to initialize K8s client: ${(error as Error).message}`;
      logger.error(message, { error: (error as Error).stack });
      throw new K8sConnectionError(message, error as Error);
    }
  }

  /**
   * Deploy MCP server to Kubernetes
   *
   * Steps:
   * 1. Generate Deployment manifest
   * 2. Generate Service manifest
   * 3. Apply Deployment
   * 4. Apply Service
   * 5. Wait for pod ready
   * 6. Return deployment result
   */
  async deployMCPServer(config: K8sDeploymentConfig): Promise<DeploymentResult> {
    this._ensureInitialized();

    const { name, deploymentId } = config;

    logger.info('Starting K8s deployment', {
      deploymentId,
      name,
      imageTag: config.imageTag,
    });

    try {
      // Step 1: Generate manifests
      const deploymentManifest = this._generateDeploymentManifest(config);
      const serviceManifest = this._generateServiceManifest(config);

      // Step 2: Apply Deployment
      logger.debug('Creating Deployment', { deploymentId, name: deploymentManifest.metadata?.name });

      try {
        await this._appsApi.createNamespacedDeployment(this._namespace, deploymentManifest);
        logger.info('Deployment created', { deploymentId });
      } catch (error: any) {
        if (error.response?.statusCode === 409) {
          // Deployment already exists - update it
          logger.warn('Deployment already exists, updating instead', { deploymentId });
          await this._appsApi.replaceNamespacedDeployment(
            deploymentManifest.metadata!.name!,
            this._namespace,
            deploymentManifest
          );
        } else {
          throw error;
        }
      }

      // Step 3: Apply Service
      logger.debug('Creating Service', { deploymentId, name: serviceManifest.metadata?.name });

      try {
        await this._coreApi.createNamespacedService(this._namespace, serviceManifest);
        logger.info('Service created', { deploymentId });
      } catch (error: any) {
        if (error.response?.statusCode === 409) {
          // Service already exists - update it
          logger.warn('Service already exists, updating instead', { deploymentId });
          await this._coreApi.replaceNamespacedService(
            serviceManifest.metadata!.name!,
            this._namespace,
            serviceManifest
          );
        } else {
          throw error;
        }
      }

      // Step 4: Wait for pod to be ready (5 minute timeout)
      logger.info('Waiting for pod to be ready', { deploymentId });
      await this._waitForPodReady(deploymentManifest.metadata!.name!, 300000);

      // Step 5: Get pod IP and construct endpoint
      const pods = await this._coreApi.listNamespacedPod(
        this._namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        `app=mcp-server,deployment-id=${deploymentId}`
      );

      const podIP = pods.body.items[0]?.status?.podIP;
      const serviceName = serviceManifest.metadata!.name!;
      const endpoint = `http://${serviceName}.${this._namespace}.svc.cluster.local`;

      logger.info('MCP server deployed successfully', {
        deploymentId,
        endpoint,
        podIP,
      });

      return {
        deploymentName: deploymentManifest.metadata!.name!,
        serviceName,
        namespace: this._namespace,
        endpoint,
        podIP,
      };
    } catch (error) {
      const message = `Failed to deploy MCP server: ${(error as Error).message}`;
      logger.error(message, {
        deploymentId,
        error: (error as Error).stack,
      });

      // Cleanup on failure
      await this._cleanupFailedDeployment(deploymentId);

      throw new K8sDeploymentError(message, deploymentId, error as Error);
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(name: string): Promise<K8sDeploymentStatus> {
    this._ensureInitialized();

    try {
      // Get deployment
      const deploymentResponse = await this._appsApi.readNamespacedDeployment(name, this._namespace);
      const deployment = deploymentResponse.body;

      // Get pods for this deployment
      const podsResponse = await this._coreApi.listNamespacedPod(
        this._namespace,
        undefined,
        undefined,
        undefined,
        undefined,
        `app=mcp-server,deployment-id=${name.replace('mcp-', '')}`
      );

      const pods = podsResponse.body.items;
      const pod = pods[0];

      // Determine status
      let status: K8sDeploymentStatus['status'] = 'pending';
      if (deployment.status?.readyReplicas && deployment.status.readyReplicas > 0) {
        status = 'running';
      } else if (deployment.metadata?.deletionTimestamp) {
        status = 'terminating';
      } else if (pod?.status?.containerStatuses?.[0]?.state?.waiting) {
        status = 'pending';
      } else if (pod?.status?.containerStatuses?.[0]?.state?.terminated) {
        status = 'failed';
      }

      const serviceName = `${name}-svc`;
      const endpoint = `http://${serviceName}.${this._namespace}.svc.cluster.local`;

      return {
        status,
        readyReplicas: deployment.status?.readyReplicas || 0,
        availableReplicas: deployment.status?.availableReplicas || 0,
        podIP: pod?.status?.podIP,
        endpoint,
        restartCount: pod?.status?.containerStatuses?.[0]?.restartCount,
        lastError: pod?.status?.containerStatuses?.[0]?.state?.waiting?.message,
      };
    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        return {
          status: 'failed',
          readyReplicas: 0,
          availableReplicas: 0,
          lastError: 'Deployment not found',
        };
      }

      throw new K8sDeploymentError(
        `Failed to get deployment status: ${(error as Error).message}`,
        name,
        error as Error
      );
    }
  }

  /**
   * Remove MCP server deployment
   */
  async removeMCPServer(name: string): Promise<void> {
    this._ensureInitialized();

    logger.info('Removing MCP server deployment', { name });

    try {
      const deploymentName = name.startsWith('mcp-') ? name : `mcp-${name}`;
      const serviceName = `${deploymentName}-svc`;

      // Delete Service
      try {
        await this._coreApi.deleteNamespacedService(serviceName, this._namespace);
        logger.info('Service deleted', { serviceName });
      } catch (error: any) {
        if (error.response?.statusCode !== 404) {
          logger.warn('Failed to delete service', {
            serviceName,
            error: (error as Error).message,
          });
        }
      }

      // Delete Deployment (with 30 second grace period)
      try {
        await this._appsApi.deleteNamespacedDeployment(deploymentName, this._namespace, undefined, undefined, 30);
        logger.info('Deployment deleted', { deploymentName });
      } catch (error: any) {
        if (error.response?.statusCode !== 404) {
          logger.warn('Failed to delete deployment', {
            deploymentName,
            error: (error as Error).message,
          });
        }
      }

      // Wait for graceful shutdown (30 seconds)
      await this._sleep(2000);

      logger.info('MCP server removed successfully', { name });
    } catch (error) {
      const message = `Failed to remove MCP server: ${(error as Error).message}`;
      logger.error(message, { name, error: (error as Error).stack });
      throw new K8sDeploymentError(message, name, error as Error);
    }
  }

  /**
   * Create HorizontalPodAutoscaler for auto-scaling
   */
  async createAutoscaler(deploymentName: string, minReplicas = 1, maxReplicas = 5, targetCPU = 70): Promise<void> {
    this._ensureInitialized();

    const hpa: k8s.V1HorizontalPodAutoscaler = {
      apiVersion: 'autoscaling/v1',
      kind: 'HorizontalPodAutoscaler',
      metadata: {
        name: `${deploymentName}-hpa`,
        namespace: this._namespace,
        labels: {
          app: 'mcp-server',
        },
      },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: deploymentName,
        },
        minReplicas,
        maxReplicas,
        targetCPUUtilizationPercentage: targetCPU,
      },
    };

    try {
      await this._autoscalingApi.createNamespacedHorizontalPodAutoscaler(this._namespace, hpa);
      logger.info('HorizontalPodAutoscaler created', {
        deploymentName,
        minReplicas,
        maxReplicas,
        targetCPU,
      });
    } catch (error: any) {
      if (error.response?.statusCode === 409) {
        logger.warn('HPA already exists', { deploymentName });
      } else {
        logger.error('Failed to create HPA', {
          deploymentName,
          error: (error as Error).message,
        });
        throw error;
      }
    }
  }

  /**
   * Generate Deployment manifest
   */
  private _generateDeploymentManifest(config: K8sDeploymentConfig): k8s.V1Deployment {
    const {
      name,
      deploymentId,
      imageTag,
      metadata,
      replicas = 1,
      resources,
      env = {},
    } = config;

    const deploymentName = `mcp-${deploymentId}`;

    // Default resources
    const defaultResources: k8s.V1ResourceRequirements = {
      requests: {
        memory: '256Mi',
        cpu: '250m',
      },
      limits: {
        memory: '512Mi',
        cpu: '500m',
      },
    };

    // Environment variables
    const envVars: k8s.V1EnvVar[] = [
      { name: 'NODE_ENV', value: 'production' },
      { name: 'PORT', value: '3000' },
      ...Object.entries(env).map(([key, value]) => ({ name: key, value })),
    ];

    const deployment: k8s.V1Deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: deploymentName,
        namespace: this._namespace,
        labels: {
          app: 'mcp-server',
          'deployment-id': deploymentId,
          integration: name,
        },
        annotations: {
          'mcp.version': metadata.version || '1.0.0',
          'mcp.description': metadata.description || '',
        },
      },
      spec: {
        replicas,
        selector: {
          matchLabels: {
            app: 'mcp-server',
            'deployment-id': deploymentId,
          },
        },
        template: {
          metadata: {
            labels: {
              app: 'mcp-server',
              'deployment-id': deploymentId,
              integration: name,
            },
          },
          spec: {
            containers: [
              {
                name: 'mcp-server',
                image: imageTag,
                ports: [
                  {
                    containerPort: 3000,
                    name: 'http',
                  },
                ],
                env: envVars,
                resources: resources || defaultResources,
                livenessProbe: {
                  httpGet: {
                    path: '/health',
                    port: 3000 as any,
                  },
                  initialDelaySeconds: 30,
                  periodSeconds: 10,
                  timeoutSeconds: 5,
                  failureThreshold: 3,
                },
                readinessProbe: {
                  httpGet: {
                    path: '/ready',
                    port: 3000 as any,
                  },
                  initialDelaySeconds: 5,
                  periodSeconds: 5,
                  timeoutSeconds: 3,
                  failureThreshold: 3,
                },
                securityContext: {
                  runAsNonRoot: true,
                  runAsUser: 1000,
                  allowPrivilegeEscalation: false,
                  readOnlyRootFilesystem: false,
                },
              },
            ],
            restartPolicy: 'Always',
            securityContext: {
              fsGroup: 1000,
            },
          },
        },
      },
    };

    return deployment;
  }

  /**
   * Generate Service manifest
   */
  private _generateServiceManifest(config: K8sDeploymentConfig): k8s.V1Service {
    const { deploymentId, name } = config;
    const deploymentName = `mcp-${deploymentId}`;
    const serviceName = `${deploymentName}-svc`;

    const service: k8s.V1Service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: {
        name: serviceName,
        namespace: this._namespace,
        labels: {
          app: 'mcp-server',
          'deployment-id': deploymentId,
          integration: name,
        },
      },
      spec: {
        selector: {
          app: 'mcp-server',
          'deployment-id': deploymentId,
        },
        ports: [
          {
            protocol: 'TCP',
            port: 80,
            targetPort: 3000 as any,
            name: 'http',
          },
        ],
        type: 'ClusterIP',
      },
    };

    return service;
  }

  /**
   * Wait for pod to be ready
   */
  private async _waitForPodReady(deploymentName: string, timeout: number): Promise<void> {
    const startTime = Date.now();
    const interval = 5000; // 5 seconds

    while (Date.now() - startTime < timeout) {
      try {
        const deploymentId = deploymentName.replace('mcp-', '');
        const podsResponse = await this._coreApi.listNamespacedPod(
          this._namespace,
          undefined,
          undefined,
          undefined,
          undefined,
          `app=mcp-server,deployment-id=${deploymentId}`
        );

        const pods = podsResponse.body.items;

        if (pods.length === 0) {
          logger.debug('No pods found yet, waiting...', { deploymentName });
          await this._sleep(interval);
          continue;
        }

        const pod = pods[0];
        const podPhase = pod.status?.phase;
        const containerStatuses = pod.status?.containerStatuses;

        logger.debug('Pod status', {
          deploymentName,
          podName: pod.metadata?.name,
          phase: podPhase,
          containerReady: containerStatuses?.[0]?.ready,
        });

        // Check if pod is running and container is ready
        if (podPhase === 'Running' && containerStatuses?.[0]?.ready) {
          logger.info('Pod is ready', {
            deploymentName,
            podName: pod.metadata?.name,
          });
          return;
        }

        // Check for failures
        if (podPhase === 'Failed' || podPhase === 'Unknown') {
          const reason = containerStatuses?.[0]?.state?.waiting?.reason || 'Unknown';
          const message = containerStatuses?.[0]?.state?.waiting?.message || 'Pod failed to start';
          throw new PodNotReadyError(
            `Pod failed to start: ${reason} - ${message}`,
            deploymentName,
            'failed'
          );
        }

        // Wait and retry
        await this._sleep(interval);
      } catch (error) {
        if (error instanceof PodNotReadyError) {
          throw error;
        }

        logger.warn('Error checking pod status, retrying...', {
          deploymentName,
          error: (error as Error).message,
        });
        await this._sleep(interval);
      }
    }

    // Timeout reached
    throw new PodNotReadyError(
      `Pod failed to become ready within ${timeout / 1000} seconds`,
      deploymentName,
      'timeout'
    );
  }

  /**
   * Ensure mcp-servers namespace exists
   */
  private async _ensureNamespace(): Promise<void> {
    try {
      await this._coreApi.readNamespace(this._namespace);
      logger.debug('Namespace already exists', { namespace: this._namespace });
    } catch (error: any) {
      if (error.response?.statusCode === 404) {
        // Create namespace
        const namespace: k8s.V1Namespace = {
          apiVersion: 'v1',
          kind: 'Namespace',
          metadata: {
            name: this._namespace,
            labels: {
              app: 'mcp-gateway',
              purpose: 'custom-mcp-servers',
            },
          },
        };

        await this._coreApi.createNamespace(namespace);
        logger.info('Namespace created', { namespace: this._namespace });
      } else {
        throw error;
      }
    }
  }

  /**
   * Cleanup failed deployment
   */
  private async _cleanupFailedDeployment(deploymentId: string): Promise<void> {
    try {
      const deploymentName = `mcp-${deploymentId}`;
      const serviceName = `${deploymentName}-svc`;

      // Try to delete deployment
      try {
        await this._appsApi.deleteNamespacedDeployment(deploymentName, this._namespace);
        logger.info('Cleaned up failed deployment', { deploymentName });
      } catch (error) {
        // Ignore if not found
      }

      // Try to delete service
      try {
        await this._coreApi.deleteNamespacedService(serviceName, this._namespace);
        logger.info('Cleaned up failed service', { serviceName });
      } catch (error) {
        // Ignore if not found
      }
    } catch (error) {
      logger.error('Failed to cleanup failed deployment', {
        deploymentId,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Ensure deployer is initialized
   */
  private _ensureInitialized(): void {
    if (!this._initialized) {
      throw new K8sConnectionError('K8sDeployer not initialized. Call initialize() first.');
    }
  }

  /**
   * Sleep utility
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
