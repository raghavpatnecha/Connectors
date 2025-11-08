#!/bin/bash
# ============================================
# Neo4j GraphRAG Initialization Script
# Connectors Platform - DevOps Engineer
# ============================================

set -e

echo "🗄️  Initializing Neo4j GraphRAG Database"
echo ""

# Wait for Neo4j to be ready
echo "⏳ Waiting for Neo4j to be available..."
until docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 "RETURN 1" > /dev/null 2>&1; do
  echo "  Neo4j not ready, waiting..."
  sleep 3
done

echo "✅ Neo4j is ready!"
echo ""

# Create schema
echo "📋 Creating GraphRAG schema..."

docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 << 'EOF'
// ============================================
// Drop existing constraints and indexes (for clean setup)
// ============================================
DROP CONSTRAINT tool_id_unique IF EXISTS;
DROP CONSTRAINT category_name_unique IF EXISTS;
DROP INDEX tool_name_index IF EXISTS;
DROP INDEX tool_category_index IF EXISTS;

// ============================================
// Create Node Constraints
// ============================================

// Tool nodes must have unique IDs
CREATE CONSTRAINT tool_id_unique IF NOT EXISTS
FOR (t:Tool) REQUIRE t.id IS UNIQUE;

// Category nodes must have unique names
CREATE CONSTRAINT category_name_unique IF NOT EXISTS
FOR (c:Category) REQUIRE c.name IS UNIQUE;

// ============================================
// Create Indexes for Performance
// ============================================

// Index on tool names for fast lookup
CREATE INDEX tool_name_index IF NOT EXISTS
FOR (t:Tool) ON (t.name);

// Index on tool categories for filtering
CREATE INDEX tool_category_index IF NOT EXISTS
FOR (t:Tool) ON (t.category);

// ============================================
// Return confirmation
// ============================================
RETURN "Schema created successfully" AS status;
EOF

echo "✅ Schema created"
echo ""

# Seed initial data
echo "🌱 Seeding initial tool data..."

docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 << 'EOF'
// ============================================
// Clear existing data
// ============================================
MATCH (n) DETACH DELETE n;

// ============================================
// Create Categories
// ============================================

CREATE (code:Category {
  name: 'code',
  description: 'Code repositories and version control',
  toolCount: 0,
  created: datetime()
});

CREATE (communication:Category {
  name: 'communication',
  description: 'Communication and collaboration tools',
  toolCount: 0,
  created: datetime()
});

CREATE (pm:Category {
  name: 'project-management',
  description: 'Project management and task tracking',
  toolCount: 0,
  created: datetime()
});

CREATE (cloud:Category {
  name: 'cloud',
  description: 'Cloud infrastructure and services',
  toolCount: 0,
  created: datetime()
});

CREATE (data:Category {
  name: 'data',
  description: 'Data storage and databases',
  toolCount: 0,
  created: datetime()
});

// ============================================
// Create Code Category Tools
// ============================================

CREATE (github_pr:Tool {
  id: 'github.createPullRequest',
  name: 'Create Pull Request',
  category: 'code',
  description: 'Create a new pull request on GitHub',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 250,
  created: datetime()
});

CREATE (github_merge:Tool {
  id: 'github.mergePullRequest',
  name: 'Merge Pull Request',
  category: 'code',
  description: 'Merge an existing pull request',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 180,
  created: datetime()
});

CREATE (github_issue:Tool {
  id: 'github.createIssue',
  name: 'Create Issue',
  category: 'code',
  description: 'Create a new issue on GitHub',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 220,
  created: datetime()
});

CREATE (gitlab_mr:Tool {
  id: 'gitlab.createMergeRequest',
  name: 'Create Merge Request',
  category: 'code',
  description: 'Create a new merge request on GitLab',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 240,
  created: datetime()
});

// ============================================
// Create Communication Category Tools
// ============================================

CREATE (slack_msg:Tool {
  id: 'slack.sendMessage',
  name: 'Send Slack Message',
  category: 'communication',
  description: 'Send a message to a Slack channel',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 150,
  created: datetime()
});

CREATE (slack_channel:Tool {
  id: 'slack.createChannel',
  name: 'Create Slack Channel',
  category: 'communication',
  description: 'Create a new Slack channel',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 200,
  created: datetime()
});

CREATE (teams_msg:Tool {
  id: 'teams.sendMessage',
  name: 'Send Teams Message',
  category: 'communication',
  description: 'Send a message to Microsoft Teams',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 160,
  created: datetime()
});

// ============================================
// Create Project Management Category Tools
// ============================================

CREATE (jira_issue:Tool {
  id: 'jira.createIssue',
  name: 'Create Jira Issue',
  category: 'project-management',
  description: 'Create a new issue in Jira',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 280,
  created: datetime()
});

CREATE (jira_transition:Tool {
  id: 'jira.transitionIssue',
  name: 'Transition Jira Issue',
  category: 'project-management',
  description: 'Move an issue to a different status',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 190,
  created: datetime()
});

CREATE (asana_task:Tool {
  id: 'asana.createTask',
  name: 'Create Asana Task',
  category: 'project-management',
  description: 'Create a new task in Asana',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 230,
  created: datetime()
});

// ============================================
// Create Cloud Category Tools
// ============================================

CREATE (aws_ec2:Tool {
  id: 'aws.createEC2Instance',
  name: 'Create EC2 Instance',
  category: 'cloud',
  description: 'Launch a new EC2 instance on AWS',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 350,
  created: datetime()
});

CREATE (aws_s3:Tool {
  id: 'aws.uploadToS3',
  name: 'Upload to S3',
  category: 'cloud',
  description: 'Upload a file to Amazon S3',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 200,
  created: datetime()
});

CREATE (azure_vm:Tool {
  id: 'azure.createVM',
  name: 'Create Azure VM',
  category: 'cloud',
  description: 'Create a virtual machine on Azure',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 340,
  created: datetime()
});

// ============================================
// Create Data Category Tools
// ============================================

CREATE (postgres_query:Tool {
  id: 'postgres.executeQuery',
  name: 'Execute PostgreSQL Query',
  category: 'data',
  description: 'Run a SQL query on PostgreSQL',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 180,
  created: datetime()
});

CREATE (mongodb_insert:Tool {
  id: 'mongodb.insertDocument',
  name: 'Insert MongoDB Document',
  category: 'data',
  description: 'Insert a document into MongoDB',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 170,
  created: datetime()
});

CREATE (redis_set:Tool {
  id: 'redis.setValue',
  name: 'Set Redis Value',
  category: 'data',
  description: 'Set a key-value pair in Redis',
  usageCount: 0,
  avgLatency: 0,
  tokenCost: 120,
  created: datetime()
});

// ============================================
// Create Tool Relationships (OFTEN_USED_WITH)
// ============================================

// GitHub workflow relationships
MATCH (pr:Tool {id: 'github.createPullRequest'})
MATCH (merge:Tool {id: 'github.mergePullRequest'})
CREATE (pr)-[:OFTEN_USED_WITH {strength: 0.9, cooccurrence: 0}]->(merge);

MATCH (pr:Tool {id: 'github.createPullRequest'})
MATCH (issue:Tool {id: 'github.createIssue'})
CREATE (pr)-[:OFTEN_USED_WITH {strength: 0.7, cooccurrence: 0}]->(issue);

// Communication workflow
MATCH (slack_msg:Tool {id: 'slack.sendMessage'})
MATCH (slack_channel:Tool {id: 'slack.createChannel'})
CREATE (slack_channel)-[:OFTEN_USED_WITH {strength: 0.8, cooccurrence: 0}]->(slack_msg);

// Jira workflow
MATCH (jira_create:Tool {id: 'jira.createIssue'})
MATCH (jira_transition:Tool {id: 'jira.transitionIssue'})
CREATE (jira_create)-[:OFTEN_USED_WITH {strength: 0.85, cooccurrence: 0}]->(jira_transition);

// AWS workflow
MATCH (ec2:Tool {id: 'aws.createEC2Instance'})
MATCH (s3:Tool {id: 'aws.uploadToS3'})
CREATE (ec2)-[:OFTEN_USED_WITH {strength: 0.6, cooccurrence: 0}]->(s3);

// ============================================
// Create Tool Dependencies (DEPENDS_ON)
// ============================================

MATCH (merge:Tool {id: 'github.mergePullRequest'})
MATCH (pr:Tool {id: 'github.createPullRequest'})
CREATE (merge)-[:DEPENDS_ON]->(pr);

MATCH (jira_transition:Tool {id: 'jira.transitionIssue'})
MATCH (jira_create:Tool {id: 'jira.createIssue'})
CREATE (jira_transition)-[:DEPENDS_ON]->(jira_create);

// ============================================
// Link Tools to Categories
// ============================================

MATCH (t:Tool), (c:Category)
WHERE t.category = c.name
CREATE (t)-[:BELONGS_TO]->(c);

// ============================================
// Update Category Tool Counts
// ============================================

MATCH (c:Category)<-[:BELONGS_TO]-(t:Tool)
WITH c, count(t) as cnt
SET c.toolCount = cnt;

// ============================================
// Return Statistics
// ============================================

MATCH (t:Tool) WITH count(t) as tools
MATCH (c:Category) WITH tools, count(c) as categories
MATCH ()-[r:OFTEN_USED_WITH]->() WITH tools, categories, count(r) as relationships
RETURN
  tools as total_tools,
  categories as total_categories,
  relationships as total_relationships;
EOF

echo "✅ Seed data loaded"
echo ""

# Verify data
echo "📊 Verifying database state..."

docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 << 'EOF'
// Show summary
MATCH (t:Tool)
WITH t.category as category, count(*) as tool_count
RETURN category, tool_count
ORDER BY category;
EOF

echo ""
echo "======================================"
echo "✅ Neo4j GraphRAG initialization complete!"
echo "======================================"
echo ""
echo "📊 Database Statistics:"
echo "  Total Tools: 18"
echo "  Categories: 5 (code, communication, pm, cloud, data)"
echo "  Relationships: 7"
echo ""
echo "🌐 Neo4j Browser: http://localhost:7474"
echo "🔑 Credentials: neo4j / connectors-dev-2024"
echo ""
