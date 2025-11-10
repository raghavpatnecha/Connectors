/**
 * Integration tests for GraphRAG Enhancement
 * Tests: Tool Relationship Discovery, 2-hop Traversal, Confidence Filtering
 */

import { GraphRAGService } from '../../src/graph/graphrag-service';
import { Neo4jConnectionPool } from '../../src/graph/config';
import {
  ToolNode,
  QueryContext,
  RelationshipType,
  CreateRelationshipPayload
} from '../../src/graph/types';

// Mock Neo4j driver
jest.mock('neo4j-driver', () => ({
  driver: jest.fn(),
  auth: {
    basic: jest.fn()
  }
}));

describe('GraphRAG Enhancement Integration Tests', () => {
  let graphRAG: GraphRAGService;
  let mockSession: any;
  let mockDriver: any;

  const mockTools: ToolNode[] = [
    {
      id: 'github.createPullRequest',
      name: 'Create Pull Request',
      category: 'code',
      description: 'Create a new pull request on GitHub',
      usageCount: 1000
    },
    {
      id: 'github.mergePullRequest',
      name: 'Merge Pull Request',
      category: 'code',
      description: 'Merge a pull request on GitHub',
      usageCount: 800
    },
    {
      id: 'github.createIssue',
      name: 'Create Issue',
      category: 'code',
      description: 'Create a new issue on GitHub',
      usageCount: 900
    },
    {
      id: 'slack.sendMessage',
      name: 'Send Slack Message',
      category: 'communication',
      description: 'Send a message to a Slack channel',
      usageCount: 1200
    },
    {
      id: 'jira.createTicket',
      name: 'Create Jira Ticket',
      category: 'project-management',
      description: 'Create a new ticket in Jira',
      usageCount: 700
    }
  ];

  beforeEach(() => {
    // Create mock Neo4j session
    mockSession = {
      run: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined)
    };

    // Create mock Neo4j driver
    mockDriver = {
      session: jest.fn().mockReturnValue(mockSession),
      close: jest.fn().mockResolvedValue(undefined)
    };

    // Mock connection pool
    const mockPool = {
      getSession: jest.fn().mockReturnValue(mockSession),
      close: jest.fn().mockResolvedValue(undefined)
    };

    // Create GraphRAG service with mocked pool
    graphRAG = new GraphRAGService(mockPool as unknown as Neo4jConnectionPool);
  });

  afterEach(async () => {
    await mockSession.close();
  });

  describe('Tool Enhancement with Relationships', () => {
    it('should enhance tools with OFTEN_USED_WITH relationships', async () => {
      // Mock Neo4j query response
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'slack.sendMessage',
                name: 'Send Slack Message',
                category: 'communication',
                description: 'Send a message to a Slack channel',
                usageCount: 1200
              }
            })
          },
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'jira.createTicket',
                name: 'Create Jira Ticket',
                category: 'project-management',
                description: 'Create a new ticket in Jira',
                usageCount: 700
              }
            })
          }
        ]
      });

      const initialTools = [mockTools[0]]; // github.createPullRequest
      const context: QueryContext = {
        allowedCategories: ['code', 'communication', 'project-management'],
        maxRelatedTools: 3,
        minConfidence: 0.5
      };

      const enhanced = await graphRAG.enhanceWithRelationships(initialTools, context);

      // Verify Neo4j query was called
      expect(mockSession.run).toHaveBeenCalled();

      // Verify enhancement added related tools
      expect(enhanced.length).toBeGreaterThan(initialTools.length);
      expect(enhanced.length).toBeLessThanOrEqual(1 + 3); // Original + max 3 related

      // Verify original tool is included
      expect(enhanced.find(t => t.id === 'github.createPullRequest')).toBeDefined();

      // Verify related tools added
      const relatedToolIds = enhanced.slice(1).map(t => t.id);
      expect(relatedToolIds).toContain('slack.sendMessage');
      expect(relatedToolIds).toContain('jira.createTicket');
    });

    it('should respect category filters in enhancement', async () => {
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'github.mergePullRequest',
                name: 'Merge Pull Request',
                category: 'code',
                description: 'Merge a pull request on GitHub',
                usageCount: 800
              }
            })
          }
        ]
      });

      const initialTools = [mockTools[0]];
      const context: QueryContext = {
        allowedCategories: ['code'], // Only code category
        maxRelatedTools: 3,
        minConfidence: 0.5
      };

      const enhanced = await graphRAG.enhanceWithRelationships(initialTools, context);

      // All tools should be from allowed categories
      enhanced.forEach(tool => {
        expect(context.allowedCategories).toContain(tool.category);
      });

      // Verify query parameters
      expect(mockSession.run).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          toolIds: ['github.createPullRequest'],
          categories: ['code'],
          minConfidence: 0.5,
          limit: 3
        })
      );
    });

    it('should handle 2-hop traversal for distant relationships', async () => {
      // github.createPR → github.merge → slack.notify (2 hops)
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'github.mergePullRequest',
                name: 'Merge Pull Request',
                category: 'code',
                description: 'Merge PR',
                usageCount: 800
              }
            })
          },
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'slack.sendMessage',
                name: 'Send Slack Message',
                category: 'communication',
                description: 'Notify team',
                usageCount: 1200
              }
            })
          }
        ]
      });

      const initialTools = [mockTools[0]];
      const context: QueryContext = {
        maxRelatedTools: 5
      };

      const enhanced = await graphRAG.enhanceWithRelationships(initialTools, context);

      expect(enhanced.length).toBeGreaterThan(1);

      // Verify 2-hop parameter was used
      expect(mockSession.run).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          maxHops: 2
        })
      );
    });

    it('should handle graceful degradation on Neo4j failure', async () => {
      // Simulate Neo4j connection failure
      mockSession.run.mockRejectedValue(new Error('Neo4j connection failed'));

      const initialTools = [mockTools[0]];
      const context: QueryContext = {};

      const enhanced = await graphRAG.enhanceWithRelationships(initialTools, context);

      // Should return original tools (graceful degradation)
      expect(enhanced).toEqual(initialTools);
      expect(enhanced.length).toBe(1);
    });

    it('should deduplicate tools when relationships overlap', async () => {
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'github.createPullRequest', // Duplicate
                name: 'Create Pull Request',
                category: 'code',
                description: 'Create PR',
                usageCount: 1000
              }
            })
          },
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'slack.sendMessage',
                name: 'Send Slack Message',
                category: 'communication',
                description: 'Notify',
                usageCount: 1200
              }
            })
          }
        ]
      });

      const initialTools = [mockTools[0]]; // github.createPullRequest
      const enhanced = await graphRAG.enhanceWithRelationships(initialTools, {});

      // Count unique tool IDs
      const uniqueIds = new Set(enhanced.map(t => t.id));
      expect(uniqueIds.size).toBe(enhanced.length); // No duplicates

      // Should still have both tools
      expect(enhanced.find(t => t.id === 'github.createPullRequest')).toBeDefined();
      expect(enhanced.find(t => t.id === 'slack.sendMessage')).toBeDefined();
    });

    it('should return empty array for empty input', async () => {
      const enhanced = await graphRAG.enhanceWithRelationships([], {});

      expect(enhanced).toEqual([]);
      expect(mockSession.run).not.toHaveBeenCalled();
    });
  });

  describe('Tool Relationship Queries', () => {
    it('should get tool with all relationships', async () => {
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: jest.fn((key: string) => {
              if (key === 't') {
                return {
                  properties: {
                    id: 'github.createPullRequest',
                    name: 'Create Pull Request',
                    category: 'code',
                    description: 'Create PR',
                    usageCount: 1000
                  }
                };
              }
              if (key === 'relationships') {
                return [
                  {
                    type: 'OFTEN_USED_WITH',
                    relatedTool: {
                      properties: {
                        id: 'slack.sendMessage',
                        name: 'Send Slack Message',
                        category: 'communication',
                        description: 'Notify',
                        usageCount: 1200
                      }
                    },
                    confidence: 0.85
                  },
                  {
                    type: 'DEPENDS_ON',
                    relatedTool: {
                      properties: {
                        id: 'github.auth',
                        name: 'GitHub Auth',
                        category: 'code',
                        description: 'Authenticate',
                        usageCount: 5000
                      }
                    },
                    confidence: 0.95
                  }
                ];
              }
              return null;
            })
          }
        ]
      });

      const result = await graphRAG.getToolWithRelationships('github.createPullRequest');

      expect(result).not.toBeNull();
      expect(result!.tool.id).toBe('github.createPullRequest');
      expect(result!.relationships).toHaveLength(2);

      // Verify relationship types
      const relTypes = result!.relationships.map(r => r.type);
      expect(relTypes).toContain('OFTEN_USED_WITH');
      expect(relTypes).toContain('DEPENDS_ON');

      // Verify confidence scores
      const oftenUsedWith = result!.relationships.find(r => r.type === 'OFTEN_USED_WITH');
      expect(oftenUsedWith?.confidence).toBe(0.85);
    });

    it('should find alternative tools in same category', async () => {
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'gitlab.createMergeRequest',
                name: 'Create Merge Request',
                category: 'code',
                description: 'GitLab alternative',
                usageCount: 600
              }
            })
          },
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'bitbucket.createPullRequest',
                name: 'Create Bitbucket PR',
                category: 'code',
                description: 'Bitbucket alternative',
                usageCount: 400
              }
            })
          }
        ]
      });

      const alternatives = await graphRAG.findAlternativeTools('github.createPullRequest', 5);

      expect(alternatives.length).toBeGreaterThan(0);

      // All alternatives should be same category
      alternatives.forEach(alt => {
        expect(alt.category).toBe('code');
      });

      expect(alternatives.find(a => a.id === 'gitlab.createMergeRequest')).toBeDefined();
      expect(alternatives.find(a => a.id === 'bitbucket.createPullRequest')).toBeDefined();
    });

    it('should find tool dependencies', async () => {
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: jest.fn().mockReturnValue({
              properties: {
                id: 'github.auth',
                name: 'GitHub Authentication',
                category: 'code',
                description: 'Required for GitHub operations',
                usageCount: 5000
              }
            })
          }
        ]
      });

      const dependencies = await graphRAG.findDependencies('github.createPullRequest');

      expect(dependencies.length).toBeGreaterThan(0);
      expect(dependencies[0].id).toBe('github.auth');
    });
  });

  describe('Graph Statistics and Monitoring', () => {
    it('should get comprehensive graph stats', async () => {
      mockSession.run.mockResolvedValue({
        records: [
          {
            get: jest.fn().mockReturnValue({
              totalTools: 500,
              totalCategories: 5,
              totalRelationships: 1250,
              relationshipsByType: [
                { type: 'OFTEN_USED_WITH', count: 800 },
                { type: 'DEPENDS_ON', count: 300 },
                { type: 'ALTERNATIVE_TO', count: 150 }
              ],
              avgUsageCount: 450,
              topTools: [
                { id: 'github.createPR', usageCount: 5000 },
                { id: 'slack.sendMessage', usageCount: 4500 }
              ]
            })
          }
        ]
      });

      const stats = await graphRAG.getGraphStats();

      expect(stats.totalTools).toBe(500);
      expect(stats.totalCategories).toBe(5);
      expect(stats.totalRelationships).toBe(1250);

      // Verify relationship type breakdown
      expect(stats.relationshipsByType['OFTEN_USED_WITH']).toBe(800);
      expect(stats.relationshipsByType['DEPENDS_ON']).toBe(300);

      // Verify top tools
      expect(stats.topTools.length).toBeGreaterThan(0);
      expect(stats.avgUsageCount).toBe(450);
    });
  });

  describe('Graph Mutations', () => {
    it('should upsert tool node', async () => {
      mockSession.run.mockResolvedValue({ records: [] });

      const tool: ToolNode = {
        id: 'new.tool',
        name: 'New Tool',
        category: 'test',
        description: 'Test tool',
        usageCount: 0
      };

      await graphRAG.upsertTool(tool);

      // Verify tool upsert query
      expect(mockSession.run).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          id: 'new.tool',
          name: 'New Tool',
          category: 'test',
          description: 'Test tool'
        })
      );

      // Verify category link query
      expect(mockSession.run).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          toolId: 'new.tool',
          category: 'test'
        })
      );
    });

    it('should create relationship between tools', async () => {
      mockSession.run.mockResolvedValue({ records: [] });

      const payload: CreateRelationshipPayload = {
        fromToolId: 'github.createPR',
        toToolId: 'slack.sendMessage',
        type: 'OFTEN_USED_WITH' as RelationshipType,
        confidence: 0.85
      };

      await graphRAG.createRelationship(payload);

      expect(mockSession.run).toHaveBeenCalledWith(
        expect.stringContaining('OFTEN_USED_WITH'),
        expect.objectContaining({
          fromToolId: 'github.createPR',
          toToolId: 'slack.sendMessage',
          confidence: 0.85
        })
      );
    });

    it('should update tool usage count', async () => {
      mockSession.run.mockResolvedValue({ records: [] });

      await graphRAG.updateToolUsage({
        toolId: 'github.createPullRequest',
        increment: 1
      });

      expect(mockSession.run).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          toolId: 'github.createPullRequest',
          increment: 1
        })
      );
    });

    it('should update relationship confidence based on co-occurrence', async () => {
      mockSession.run.mockResolvedValue({ records: [] });

      await graphRAG.updateRelationshipConfidence(
        'github.createPR',
        'slack.sendMessage'
      );

      expect(mockSession.run).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          toolId1: 'github.createPR',
          toolId2: 'slack.sendMessage'
        })
      );
    });

    it('should batch upsert multiple tools', async () => {
      mockSession.run.mockResolvedValue({
        records: [{ get: jest.fn().mockReturnValue(mockTools.length) }]
      });

      const createdCount = await graphRAG.batchUpsertTools(mockTools);

      expect(createdCount).toBe(mockTools.length);
      expect(mockSession.run).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          tools: mockTools
        })
      );
    });

    it('should batch create relationships', async () => {
      mockSession.run.mockResolvedValue({
        records: [{ get: jest.fn().mockReturnValue(3) }]
      });

      const relationships = [
        { from: 'github.createPR', to: 'github.merge', confidence: 0.9 },
        { from: 'github.createPR', to: 'slack.notify', confidence: 0.8 },
        { from: 'github.merge', to: 'slack.notify', confidence: 0.85 }
      ];

      const createdCount = await graphRAG.batchCreateRelationships(
        relationships,
        'OFTEN_USED_WITH' as RelationshipType
      );

      expect(createdCount).toBe(3);
      expect(mockSession.run).toHaveBeenCalledWith(
        expect.stringContaining('OFTEN_USED_WITH'),
        expect.objectContaining({
          relationships
        })
      );
    });
  });
});
