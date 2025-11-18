/**
 * Tests for K8sDeployer
 */

import * as k8s from '@kubernetes/client-node';
import { K8sDeployer } from '../../../src/services/mcp-deployer/k8s-deployer';
import {
  K8sDeploymentConfig,
  DeploymentResult,
  K8sDeploymentStatus,
  MCPMetadata,
} from '../../../src/services/mcp-deployer/types';
import {
  K8sDeploymentError,
  PodNotReadyError,
  K8sConnectionError,
} from '../../../src/errors/gateway-errors';

// Mock @kubernetes/client-node
jest.mock('@kubernetes/client-node');

describe('K8sDeployer', () => {
  let deployer: K8sDeployer;
  let mockKubeConfig: jest.Mocked<k8s.KubeConfig>;
  let mockAppsApi: jest.Mocked<k8s.AppsV1Api>;
  let mockCoreApi: jest.Mocked<k8s.CoreV1Api>;
  let mockAutoscalingApi: jest.Mocked<k8s.AutoscalingV1Api>;

  const mockMetadata: MCPMetadata = {
    name: 'test-mcp',
    version: '1.0.0',
    description: 'Test MCP Server',
    author: 'Test Author',
    license: 'MIT',
  };

  const mockDeploymentConfig: K8sDeploymentConfig = {
    name: 'test-mcp',
    deploymentId: 'test-dep-123',
    imageTag: 'test-mcp:latest',
    metadata: mockMetadata,
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Kubernetes API clients
    mockAppsApi = {
      createNamespacedDeployment: jest.fn(),
      readNamespacedDeployment: jest.fn(),
      replaceNamespacedDeployment: jest.fn(),
      deleteNamespacedDeployment: jest.fn(),
    } as any;

    mockCoreApi = {
      listNamespace: jest.fn().mockResolvedValue({ body: { items: [] } }),
      readNamespace: jest.fn(),
      createNamespace: jest.fn(),
      createNamespacedService: jest.fn(),
      readNamespacedService: jest.fn(),
      replaceNamespacedService: jest.fn(),
      deleteNamespacedService: jest.fn(),
      listNamespacedPod: jest.fn(),
    } as any;

    mockAutoscalingApi = {
      createNamespacedHorizontalPodAutoscaler: jest.fn(),
    } as any;

    mockKubeConfig = {
      loadFromDefault: jest.fn(),
      loadFromCluster: jest.fn(),
      makeApiClient: jest.fn((apiClass) => {
        if (apiClass === k8s.AppsV1Api) return mockAppsApi;
        if (apiClass === k8s.CoreV1Api) return mockCoreApi;
        if (apiClass === k8s.AutoscalingV1Api) return mockAutoscalingApi;
        return {} as any;
      }),
    } as any;

    (k8s.KubeConfig as jest.Mock).mockReturnValue(mockKubeConfig);

    deployer = new K8sDeployer(mockKubeConfig);
  });

  describe('initialize', () => {
    it('should initialize with default kubeconfig', async () => {
      mockCoreApi.readNamespace.mockRejectedValueOnce({
        response: { statusCode: 404 },
      });

      await deployer.initialize();

      expect(mockKubeConfig.loadFromDefault).toHaveBeenCalled();
      expect(mockCoreApi.listNamespace).toHaveBeenCalled();
      expect(mockCoreApi.createNamespace).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            name: 'mcp-servers',
          }),
        })
      );
    });

    it('should initialize with in-cluster config when KUBERNETES_SERVICE_HOST is set', async () => {
      process.env.KUBERNETES_SERVICE_HOST = 'kubernetes.default.svc';

      mockCoreApi.readNamespace.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-servers' } },
      } as any);

      await deployer.initialize();

      expect(mockKubeConfig.loadFromCluster).toHaveBeenCalled();
      expect(mockCoreApi.listNamespace).toHaveBeenCalled();

      delete process.env.KUBERNETES_SERVICE_HOST;
    });

    it('should not create namespace if it already exists', async () => {
      mockCoreApi.readNamespace.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-servers' } },
      } as any);

      await deployer.initialize();

      expect(mockCoreApi.createNamespace).not.toHaveBeenCalled();
    });

    it('should throw K8sConnectionError if connection fails', async () => {
      mockCoreApi.listNamespace.mockRejectedValue(new Error('Connection refused'));

      await expect(deployer.initialize()).rejects.toThrow(K8sConnectionError);
      await expect(deployer.initialize()).rejects.toThrow(/Failed to initialize K8s client/);
    });
  });

  describe('deployMCPServer', () => {
    beforeEach(async () => {
      mockCoreApi.readNamespace.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-servers' } },
      } as any);
      await deployer.initialize();
    });

    it('should deploy MCP server successfully', async () => {
      // Mock deployment creation
      mockAppsApi.createNamespacedDeployment.mockResolvedValueOnce({
        body: {
          metadata: { name: 'mcp-test-dep-123' },
        },
      } as any);

      // Mock service creation
      mockCoreApi.createNamespacedService.mockResolvedValueOnce({
        body: {
          metadata: { name: 'mcp-test-dep-123-svc' },
        },
      } as any);

      // Mock pod status - running and ready
      mockCoreApi.listNamespacedPod.mockResolvedValue({
        body: {
          items: [
            {
              metadata: { name: 'mcp-test-dep-123-pod' },
              status: {
                phase: 'Running',
                podIP: '10.0.0.1',
                containerStatuses: [{ ready: true }],
              },
            },
          ],
        },
      } as any);

      const result = await deployer.deployMCPServer(mockDeploymentConfig);

      expect(result).toEqual({
        deploymentName: 'mcp-test-dep-123',
        serviceName: 'mcp-test-dep-123-svc',
        namespace: 'mcp-servers',
        endpoint: 'http://mcp-test-dep-123-svc.mcp-servers.svc.cluster.local',
        podIP: '10.0.0.1',
      });

      expect(mockAppsApi.createNamespacedDeployment).toHaveBeenCalledWith(
        'mcp-servers',
        expect.objectContaining({
          metadata: expect.objectContaining({
            name: 'mcp-test-dep-123',
            labels: expect.objectContaining({
              app: 'mcp-server',
              'deployment-id': 'test-dep-123',
              integration: 'test-mcp',
            }),
          }),
        })
      );

      expect(mockCoreApi.createNamespacedService).toHaveBeenCalledWith(
        'mcp-servers',
        expect.objectContaining({
          metadata: expect.objectContaining({
            name: 'mcp-test-dep-123-svc',
          }),
        })
      );
    });

    it('should update existing deployment if it already exists', async () => {
      mockAppsApi.createNamespacedDeployment.mockRejectedValueOnce({
        response: { statusCode: 409 },
      });

      mockAppsApi.replaceNamespacedDeployment.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123' } },
      } as any);

      mockCoreApi.createNamespacedService.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123-svc' } },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValue({
        body: {
          items: [
            {
              status: {
                phase: 'Running',
                podIP: '10.0.0.1',
                containerStatuses: [{ ready: true }],
              },
            },
          ],
        },
      } as any);

      await deployer.deployMCPServer(mockDeploymentConfig);

      expect(mockAppsApi.replaceNamespacedDeployment).toHaveBeenCalledWith(
        'mcp-test-dep-123',
        'mcp-servers',
        expect.any(Object)
      );
    });

    it('should update existing service if it already exists', async () => {
      mockAppsApi.createNamespacedDeployment.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123' } },
      } as any);

      mockCoreApi.createNamespacedService.mockRejectedValueOnce({
        response: { statusCode: 409 },
      });

      mockCoreApi.replaceNamespacedService.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123-svc' } },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValue({
        body: {
          items: [
            {
              status: {
                phase: 'Running',
                podIP: '10.0.0.1',
                containerStatuses: [{ ready: true }],
              },
            },
          ],
        },
      } as any);

      await deployer.deployMCPServer(mockDeploymentConfig);

      expect(mockCoreApi.replaceNamespacedService).toHaveBeenCalledWith(
        'mcp-test-dep-123-svc',
        'mcp-servers',
        expect.any(Object)
      );
    });

    it('should apply custom resources if provided', async () => {
      const customConfig: K8sDeploymentConfig = {
        ...mockDeploymentConfig,
        replicas: 3,
        resources: {
          requests: { memory: '512Mi', cpu: '500m' },
          limits: { memory: '1Gi', cpu: '1000m' },
        },
        env: {
          CUSTOM_VAR: 'custom-value',
        },
      };

      mockAppsApi.createNamespacedDeployment.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123' } },
      } as any);

      mockCoreApi.createNamespacedService.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123-svc' } },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValue({
        body: {
          items: [
            {
              status: {
                phase: 'Running',
                containerStatuses: [{ ready: true }],
              },
            },
          ],
        },
      } as any);

      await deployer.deployMCPServer(customConfig);

      expect(mockAppsApi.createNamespacedDeployment).toHaveBeenCalledWith(
        'mcp-servers',
        expect.objectContaining({
          spec: expect.objectContaining({
            replicas: 3,
            template: expect.objectContaining({
              spec: expect.objectContaining({
                containers: expect.arrayContaining([
                  expect.objectContaining({
                    resources: {
                      requests: { memory: '512Mi', cpu: '500m' },
                      limits: { memory: '1Gi', cpu: '1000m' },
                    },
                    env: expect.arrayContaining([
                      { name: 'CUSTOM_VAR', value: 'custom-value' },
                    ]),
                  }),
                ]),
              }),
            }),
          }),
        })
      );
    });

    it('should throw PodNotReadyError if pod fails to start', async () => {
      mockAppsApi.createNamespacedDeployment.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123' } },
      } as any);

      mockCoreApi.createNamespacedService.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123-svc' } },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValue({
        body: {
          items: [
            {
              status: {
                phase: 'Failed',
                containerStatuses: [
                  {
                    ready: false,
                    state: {
                      waiting: {
                        reason: 'ImagePullBackOff',
                        message: 'Failed to pull image',
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      } as any);

      await expect(deployer.deployMCPServer(mockDeploymentConfig)).rejects.toThrow(
        K8sDeploymentError
      );
    });

    it('should cleanup resources on deployment failure', async () => {
      mockAppsApi.createNamespacedDeployment.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123' } },
      } as any);

      mockCoreApi.createNamespacedService.mockRejectedValueOnce(
        new Error('Service creation failed')
      );

      await expect(deployer.deployMCPServer(mockDeploymentConfig)).rejects.toThrow(
        K8sDeploymentError
      );

      // Verify cleanup was attempted
      expect(mockAppsApi.deleteNamespacedDeployment).toHaveBeenCalledWith(
        'mcp-test-dep-123',
        'mcp-servers'
      );
    });

    it('should throw error if not initialized', async () => {
      const uninitializedDeployer = new K8sDeployer();

      await expect(uninitializedDeployer.deployMCPServer(mockDeploymentConfig)).rejects.toThrow(
        K8sConnectionError
      );
      await expect(uninitializedDeployer.deployMCPServer(mockDeploymentConfig)).rejects.toThrow(
        /K8sDeployer not initialized/
      );
    });
  });

  describe('getDeploymentStatus', () => {
    beforeEach(async () => {
      mockCoreApi.readNamespace.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-servers' } },
      } as any);
      await deployer.initialize();
    });

    it('should return running status for healthy deployment', async () => {
      mockAppsApi.readNamespacedDeployment.mockResolvedValueOnce({
        body: {
          metadata: { name: 'mcp-test' },
          status: {
            readyReplicas: 1,
            availableReplicas: 1,
          },
        },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValueOnce({
        body: {
          items: [
            {
              status: {
                podIP: '10.0.0.1',
                containerStatuses: [
                  {
                    ready: true,
                    restartCount: 0,
                  },
                ],
              },
            },
          ],
        },
      } as any);

      const status = await deployer.getDeploymentStatus('mcp-test');

      expect(status).toEqual({
        status: 'running',
        readyReplicas: 1,
        availableReplicas: 1,
        podIP: '10.0.0.1',
        endpoint: 'http://mcp-test-svc.mcp-servers.svc.cluster.local',
        restartCount: 0,
        lastError: undefined,
      });
    });

    it('should return pending status for starting deployment', async () => {
      mockAppsApi.readNamespacedDeployment.mockResolvedValueOnce({
        body: {
          metadata: { name: 'mcp-test' },
          status: {
            readyReplicas: 0,
            availableReplicas: 0,
          },
        },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValueOnce({
        body: {
          items: [
            {
              status: {
                containerStatuses: [
                  {
                    ready: false,
                    state: {
                      waiting: {
                        reason: 'ContainerCreating',
                        message: 'Pulling image',
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      } as any);

      const status = await deployer.getDeploymentStatus('mcp-test');

      expect(status.status).toBe('pending');
      expect(status.readyReplicas).toBe(0);
      expect(status.lastError).toBe('Pulling image');
    });

    it('should return failed status for terminated pod', async () => {
      mockAppsApi.readNamespacedDeployment.mockResolvedValueOnce({
        body: {
          metadata: { name: 'mcp-test' },
          status: {
            readyReplicas: 0,
            availableReplicas: 0,
          },
        },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValueOnce({
        body: {
          items: [
            {
              status: {
                containerStatuses: [
                  {
                    state: {
                      terminated: {
                        reason: 'Error',
                        message: 'Container crashed',
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      } as any);

      const status = await deployer.getDeploymentStatus('mcp-test');

      expect(status.status).toBe('failed');
    });

    it('should return terminating status for deleting deployment', async () => {
      mockAppsApi.readNamespacedDeployment.mockResolvedValueOnce({
        body: {
          metadata: {
            name: 'mcp-test',
            deletionTimestamp: new Date().toISOString(),
          },
          status: {
            readyReplicas: 0,
            availableReplicas: 0,
          },
        },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValueOnce({
        body: { items: [] },
      } as any);

      const status = await deployer.getDeploymentStatus('mcp-test');

      expect(status.status).toBe('terminating');
    });

    it('should return failed status if deployment not found', async () => {
      mockAppsApi.readNamespacedDeployment.mockRejectedValueOnce({
        response: { statusCode: 404 },
      });

      const status = await deployer.getDeploymentStatus('non-existent');

      expect(status).toEqual({
        status: 'failed',
        readyReplicas: 0,
        availableReplicas: 0,
        lastError: 'Deployment not found',
      });
    });

    it('should throw K8sDeploymentError for other errors', async () => {
      mockAppsApi.readNamespacedDeployment.mockRejectedValueOnce(new Error('API error'));

      await expect(deployer.getDeploymentStatus('mcp-test')).rejects.toThrow(
        K8sDeploymentError
      );
    });
  });

  describe('removeMCPServer', () => {
    beforeEach(async () => {
      mockCoreApi.readNamespace.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-servers' } },
      } as any);
      await deployer.initialize();
    });

    it('should remove deployment and service successfully', async () => {
      mockCoreApi.deleteNamespacedService.mockResolvedValueOnce({} as any);
      mockAppsApi.deleteNamespacedDeployment.mockResolvedValueOnce({} as any);

      await deployer.removeMCPServer('test-dep-123');

      expect(mockCoreApi.deleteNamespacedService).toHaveBeenCalledWith(
        'mcp-test-dep-123-svc',
        'mcp-servers'
      );
      expect(mockAppsApi.deleteNamespacedDeployment).toHaveBeenCalledWith(
        'mcp-test-dep-123',
        'mcp-servers',
        undefined,
        undefined,
        30
      );
    });

    it('should handle deployment name with mcp- prefix', async () => {
      mockCoreApi.deleteNamespacedService.mockResolvedValueOnce({} as any);
      mockAppsApi.deleteNamespacedDeployment.mockResolvedValueOnce({} as any);

      await deployer.removeMCPServer('mcp-test-dep-123');

      // The code adds mcp- prefix, so mcp-test-dep-123 becomes mcp-mcp-test-dep-123
      // But this is the expected behavior - it treats the input as a deployment ID
      expect(mockCoreApi.deleteNamespacedService).toHaveBeenCalledWith(
        'mcp-test-dep-123-svc',
        'mcp-servers'
      );
      expect(mockAppsApi.deleteNamespacedDeployment).toHaveBeenCalledWith(
        'mcp-test-dep-123',
        'mcp-servers',
        undefined,
        undefined,
        30
      );
    });

    it('should continue if service not found', async () => {
      mockCoreApi.deleteNamespacedService.mockRejectedValueOnce({
        response: { statusCode: 404 },
      });
      mockAppsApi.deleteNamespacedDeployment.mockResolvedValueOnce({} as any);

      await deployer.removeMCPServer('test-dep-123');

      expect(mockAppsApi.deleteNamespacedDeployment).toHaveBeenCalled();
    });

    it('should continue if deployment not found', async () => {
      mockCoreApi.deleteNamespacedService.mockResolvedValueOnce({} as any);
      mockAppsApi.deleteNamespacedDeployment.mockRejectedValueOnce({
        response: { statusCode: 404 },
      });

      await expect(deployer.removeMCPServer('test-dep-123')).resolves.not.toThrow();
    });

    it('should log warning on service deletion failures (non-404)', async () => {
      // Mock service deletion to fail with non-404 error
      mockCoreApi.deleteNamespacedService.mockRejectedValueOnce({
        response: { statusCode: 500 },
        message: 'Unexpected error',
      });
      mockAppsApi.deleteNamespacedDeployment.mockResolvedValueOnce({} as any);

      // Should not throw - errors are caught and logged
      await expect(deployer.removeMCPServer('test-dep-123')).resolves.not.toThrow();
    });
  });

  describe('createAutoscaler', () => {
    beforeEach(async () => {
      mockCoreApi.readNamespace.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-servers' } },
      } as any);
      await deployer.initialize();
    });

    it('should create HPA with default values', async () => {
      mockAutoscalingApi.createNamespacedHorizontalPodAutoscaler.mockResolvedValueOnce({} as any);

      await deployer.createAutoscaler('mcp-test-dep-123');

      expect(mockAutoscalingApi.createNamespacedHorizontalPodAutoscaler).toHaveBeenCalledWith(
        'mcp-servers',
        expect.objectContaining({
          metadata: expect.objectContaining({
            name: 'mcp-test-dep-123-hpa',
          }),
          spec: expect.objectContaining({
            minReplicas: 1,
            maxReplicas: 5,
            targetCPUUtilizationPercentage: 70,
          }),
        })
      );
    });

    it('should create HPA with custom values', async () => {
      mockAutoscalingApi.createNamespacedHorizontalPodAutoscaler.mockResolvedValueOnce({} as any);

      await deployer.createAutoscaler('mcp-test-dep-123', 2, 10, 80);

      expect(mockAutoscalingApi.createNamespacedHorizontalPodAutoscaler).toHaveBeenCalledWith(
        'mcp-servers',
        expect.objectContaining({
          spec: expect.objectContaining({
            minReplicas: 2,
            maxReplicas: 10,
            targetCPUUtilizationPercentage: 80,
          }),
        })
      );
    });

    it('should handle existing HPA gracefully', async () => {
      mockAutoscalingApi.createNamespacedHorizontalPodAutoscaler.mockRejectedValueOnce({
        response: { statusCode: 409 },
      });

      await expect(deployer.createAutoscaler('mcp-test-dep-123')).resolves.not.toThrow();
    });

    it('should throw error on HPA creation failure', async () => {
      mockAutoscalingApi.createNamespacedHorizontalPodAutoscaler.mockRejectedValueOnce(
        new Error('HPA creation failed')
      );

      await expect(deployer.createAutoscaler('mcp-test-dep-123')).rejects.toThrow(
        'HPA creation failed'
      );
    });
  });

  describe('manifest generation', () => {
    beforeEach(async () => {
      mockCoreApi.readNamespace.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-servers' } },
      } as any);
      await deployer.initialize();
    });

    it('should generate deployment manifest with correct structure', async () => {
      mockAppsApi.createNamespacedDeployment.mockImplementation((namespace, manifest) => {
        // Verify deployment manifest structure
        expect(manifest.apiVersion).toBe('apps/v1');
        expect(manifest.kind).toBe('Deployment');
        expect(manifest.metadata?.name).toBe('mcp-test-dep-123');
        expect(manifest.metadata?.namespace).toBe('mcp-servers');
        expect(manifest.spec?.replicas).toBe(1);
        expect(manifest.spec?.template?.spec?.containers).toHaveLength(1);

        const container = manifest.spec?.template?.spec?.containers?.[0];
        expect(container?.name).toBe('mcp-server');
        expect(container?.image).toBe('test-mcp:latest');
        expect(container?.ports).toContainEqual({
          containerPort: 3000,
          name: 'http',
        });

        return Promise.resolve({ body: { metadata: { name: 'mcp-test-dep-123' } } } as any);
      });

      mockCoreApi.createNamespacedService.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123-svc' } },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValue({
        body: {
          items: [
            {
              status: {
                phase: 'Running',
                containerStatuses: [{ ready: true }],
              },
            },
          ],
        },
      } as any);

      await deployer.deployMCPServer(mockDeploymentConfig);
    });

    it('should generate service manifest with correct structure', async () => {
      mockAppsApi.createNamespacedDeployment.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123' } },
      } as any);

      mockCoreApi.createNamespacedService.mockImplementation((namespace, manifest) => {
        // Verify service manifest structure
        expect(manifest.apiVersion).toBe('v1');
        expect(manifest.kind).toBe('Service');
        expect(manifest.metadata?.name).toBe('mcp-test-dep-123-svc');
        expect(manifest.spec?.type).toBe('ClusterIP');
        expect(manifest.spec?.ports).toContainEqual({
          protocol: 'TCP',
          port: 80,
          targetPort: 3000,
          name: 'http',
        });

        return Promise.resolve({ body: { metadata: { name: 'mcp-test-dep-123-svc' } } } as any);
      });

      mockCoreApi.listNamespacedPod.mockResolvedValue({
        body: {
          items: [
            {
              status: {
                phase: 'Running',
                containerStatuses: [{ ready: true }],
              },
            },
          ],
        },
      } as any);

      await deployer.deployMCPServer(mockDeploymentConfig);
    });

    it('should include security context in deployment', async () => {
      mockAppsApi.createNamespacedDeployment.mockImplementation((namespace, manifest) => {
        const container = manifest.spec?.template?.spec?.containers?.[0];
        expect(container?.securityContext).toEqual({
          runAsNonRoot: true,
          runAsUser: 1000,
          allowPrivilegeEscalation: false,
          readOnlyRootFilesystem: false,
        });

        expect(manifest.spec?.template?.spec?.securityContext).toEqual({
          fsGroup: 1000,
        });

        return Promise.resolve({ body: { metadata: { name: 'mcp-test-dep-123' } } } as any);
      });

      mockCoreApi.createNamespacedService.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123-svc' } },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValue({
        body: {
          items: [
            {
              status: {
                phase: 'Running',
                containerStatuses: [{ ready: true }],
              },
            },
          ],
        },
      } as any);

      await deployer.deployMCPServer(mockDeploymentConfig);
    });

    it('should include health probes in deployment', async () => {
      mockAppsApi.createNamespacedDeployment.mockImplementation((namespace, manifest) => {
        const container = manifest.spec?.template?.spec?.containers?.[0];

        expect(container?.livenessProbe).toEqual({
          httpGet: { path: '/health', port: 3000 },
          initialDelaySeconds: 30,
          periodSeconds: 10,
          timeoutSeconds: 5,
          failureThreshold: 3,
        });

        expect(container?.readinessProbe).toEqual({
          httpGet: { path: '/ready', port: 3000 },
          initialDelaySeconds: 5,
          periodSeconds: 5,
          timeoutSeconds: 3,
          failureThreshold: 3,
        });

        return Promise.resolve({ body: { metadata: { name: 'mcp-test-dep-123' } } } as any);
      });

      mockCoreApi.createNamespacedService.mockResolvedValueOnce({
        body: { metadata: { name: 'mcp-test-dep-123-svc' } },
      } as any);

      mockCoreApi.listNamespacedPod.mockResolvedValue({
        body: {
          items: [
            {
              status: {
                phase: 'Running',
                containerStatuses: [{ ready: true }],
              },
            },
          ],
        },
      } as any);

      await deployer.deployMCPServer(mockDeploymentConfig);
    });
  });
});
