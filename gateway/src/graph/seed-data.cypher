// =====================================================
// Seed Data for Tool Relationship Graph
// Initial tools and relationships for testing GraphRAG
// =====================================================

// =====================================================
// CATEGORIES
// =====================================================

MERGE (code:Category {name: 'code'})
SET code.description = 'Code collaboration and version control tools';

MERGE (comm:Category {name: 'communication'})
SET comm.description = 'Communication and messaging tools';

MERGE (pm:Category {name: 'project-management'})
SET pm.description = 'Project management and task tracking tools';

MERGE (cloud:Category {name: 'cloud'})
SET cloud.description = 'Cloud infrastructure and deployment tools';

MERGE (data:Category {name: 'data'})
SET data.description = 'Data storage and analytics tools';

// =====================================================
// CODE CATEGORY TOOLS (GitHub, GitLab, Bitbucket)
// =====================================================

// GitHub Tools
MERGE (gh_auth:Tool {id: 'github.authenticate'})
SET gh_auth.name = 'GitHub Authenticate',
    gh_auth.category = 'code',
    gh_auth.description = 'Authenticate with GitHub using OAuth',
    gh_auth.usageCount = 1000;

MERGE (gh_create_pr:Tool {id: 'github.createPullRequest'})
SET gh_create_pr.name = 'GitHub Create Pull Request',
    gh_create_pr.category = 'code',
    gh_create_pr.description = 'Create a new pull request on GitHub repository',
    gh_create_pr.usageCount = 850;

MERGE (gh_merge_pr:Tool {id: 'github.mergePullRequest'})
SET gh_merge_pr.name = 'GitHub Merge Pull Request',
    gh_merge_pr.category = 'code',
    gh_merge_pr.description = 'Merge an approved pull request',
    gh_merge_pr.usageCount = 720;

MERGE (gh_list_prs:Tool {id: 'github.listPullRequests'})
SET gh_list_prs.name = 'GitHub List Pull Requests',
    gh_list_prs.category = 'code',
    gh_list_prs.description = 'List all pull requests in a repository',
    gh_list_prs.usageCount = 950;

MERGE (gh_create_issue:Tool {id: 'github.createIssue'})
SET gh_create_issue.name = 'GitHub Create Issue',
    gh_create_issue.category = 'code',
    gh_create_issue.description = 'Create a new issue on GitHub',
    gh_create_issue.usageCount = 680;

MERGE (gh_create_branch:Tool {id: 'github.createBranch'})
SET gh_create_branch.name = 'GitHub Create Branch',
    gh_create_branch.category = 'code',
    gh_create_branch.description = 'Create a new branch in repository',
    gh_create_branch.usageCount = 550;

// GitLab Tools
MERGE (gl_create_mr:Tool {id: 'gitlab.createMergeRequest'})
SET gl_create_mr.name = 'GitLab Create Merge Request',
    gl_create_mr.category = 'code',
    gl_create_mr.description = 'Create a new merge request on GitLab',
    gl_create_mr.usageCount = 420;

MERGE (gl_merge_mr:Tool {id: 'gitlab.mergeMergeRequest'})
SET gl_merge_mr.name = 'GitLab Merge Request',
    gl_merge_mr.category = 'code',
    gl_merge_mr.description = 'Merge an approved merge request',
    gl_merge_mr.usageCount = 380;

// Link code tools to category
MATCH (t:Tool {category: 'code'}), (c:Category {name: 'code'})
MERGE (t)-[:BELONGS_TO]->(c);

// =====================================================
// COMMUNICATION TOOLS (Slack, Discord, Teams)
// =====================================================

MERGE (slack_send:Tool {id: 'slack.sendMessage'})
SET slack_send.name = 'Slack Send Message',
    slack_send.category = 'communication',
    slack_send.description = 'Send a message to Slack channel',
    slack_send.usageCount = 1200;

MERGE (slack_create_channel:Tool {id: 'slack.createChannel'})
SET slack_create_channel.name = 'Slack Create Channel',
    slack_create_channel.category = 'communication',
    slack_create_channel.description = 'Create a new Slack channel',
    slack_create_channel.usageCount = 300;

MERGE (teams_send:Tool {id: 'teams.sendMessage'})
SET teams_send.name = 'Teams Send Message',
    teams_send.category = 'communication',
    teams_send.description = 'Send a message to Microsoft Teams',
    teams_send.usageCount = 650;

// Link communication tools to category
MATCH (t:Tool {category: 'communication'}), (c:Category {name: 'communication'})
MERGE (t)-[:BELONGS_TO]->(c);

// =====================================================
// PROJECT MANAGEMENT TOOLS (Jira, Linear, Asana)
// =====================================================

MERGE (jira_create:Tool {id: 'jira.createIssue'})
SET jira_create.name = 'Jira Create Issue',
    jira_create.category = 'project-management',
    jira_create.description = 'Create a new Jira issue',
    jira_create.usageCount = 890;

MERGE (jira_transition:Tool {id: 'jira.transitionIssue'})
SET jira_transition.name = 'Jira Transition Issue',
    jira_transition.category = 'project-management',
    jira_transition.description = 'Transition Jira issue to different status',
    jira_transition.usageCount = 760;

MERGE (linear_create:Tool {id: 'linear.createIssue'})
SET linear_create.name = 'Linear Create Issue',
    linear_create.category = 'project-management',
    linear_create.description = 'Create a new Linear issue',
    linear_create.usageCount = 520;

// Link PM tools to category
MATCH (t:Tool {category: 'project-management'}), (c:Category {name: 'project-management'})
MERGE (t)-[:BELONGS_TO]->(c);

// =====================================================
// CLOUD TOOLS (AWS, GCP, Azure)
// =====================================================

MERGE (aws_deploy:Tool {id: 'aws.deployLambda'})
SET aws_deploy.name = 'AWS Deploy Lambda',
    aws_deploy.category = 'cloud',
    aws_deploy.description = 'Deploy AWS Lambda function',
    aws_deploy.usageCount = 450;

MERGE (aws_s3_upload:Tool {id: 'aws.s3Upload'})
SET aws_s3_upload.name = 'AWS S3 Upload',
    aws_s3_upload.category = 'cloud',
    aws_s3_upload.description = 'Upload file to AWS S3 bucket',
    aws_s3_upload.usageCount = 620;

// Link cloud tools to category
MATCH (t:Tool {category: 'cloud'}), (c:Category {name: 'cloud'})
MERGE (t)-[:BELONGS_TO]->(c);

// =====================================================
// RELATIONSHIPS - OFTEN_USED_WITH
// =====================================================

// GitHub workflow relationships
MATCH (branch:Tool {id: 'github.createBranch'}), (pr:Tool {id: 'github.createPullRequest'})
MERGE (branch)-[r1:OFTEN_USED_WITH]->(pr)
SET r1.confidence = 0.95, r1.coOccurrences = 850;

MATCH (pr:Tool {id: 'github.createPullRequest'}), (merge:Tool {id: 'github.mergePullRequest'})
MERGE (pr)-[r2:OFTEN_USED_WITH]->(merge)
SET r2.confidence = 0.92, r2.coOccurrences = 720;

MATCH (pr:Tool {id: 'github.createPullRequest'}), (list:Tool {id: 'github.listPullRequests'})
MERGE (pr)-[r3:OFTEN_USED_WITH]->(list)
SET r3.confidence = 0.78, r3.coOccurrences = 650;

// GitHub + Slack notification workflow
MATCH (merge:Tool {id: 'github.mergePullRequest'}), (slack:Tool {id: 'slack.sendMessage'})
MERGE (merge)-[r4:OFTEN_USED_WITH]->(slack)
SET r4.confidence = 0.85, r4.coOccurrences = 600;

// GitHub + Jira integration
MATCH (gh_issue:Tool {id: 'github.createIssue'}), (jira:Tool {id: 'jira.createIssue'})
MERGE (gh_issue)-[r5:OFTEN_USED_WITH]->(jira)
SET r5.confidence = 0.72, r5.coOccurrences = 450;

// PR creation + Jira transition
MATCH (pr:Tool {id: 'github.createPullRequest'}), (jira_trans:Tool {id: 'jira.transitionIssue'})
MERGE (pr)-[r6:OFTEN_USED_WITH]->(jira_trans)
SET r6.confidence = 0.68, r6.coOccurrences = 420;

// Jira workflow
MATCH (create:Tool {id: 'jira.createIssue'}), (trans:Tool {id: 'jira.transitionIssue'})
MERGE (create)-[r7:OFTEN_USED_WITH]->(trans)
SET r7.confidence = 0.88, r7.coOccurrences = 750;

// AWS deployment workflow
MATCH (lambda:Tool {id: 'aws.deployLambda'}), (s3:Tool {id: 'aws.s3Upload'})
MERGE (lambda)-[r8:OFTEN_USED_WITH]->(s3)
SET r8.confidence = 0.65, r8.coOccurrences = 380;

// =====================================================
// RELATIONSHIPS - DEPENDS_ON
// =====================================================

// GitHub PR depends on authentication
MATCH (pr:Tool {id: 'github.createPullRequest'}), (auth:Tool {id: 'github.authenticate'})
MERGE (pr)-[d1:DEPENDS_ON]->(auth)
SET d1.required = true;

MATCH (merge:Tool {id: 'github.mergePullRequest'}), (auth:Tool {id: 'github.authenticate'})
MERGE (merge)-[d2:DEPENDS_ON]->(auth)
SET d2.required = true;

MATCH (issue:Tool {id: 'github.createIssue'}), (auth:Tool {id: 'github.authenticate'})
MERGE (issue)-[d3:DEPENDS_ON]->(auth)
SET d3.required = true;

// =====================================================
// RELATIONSHIPS - ALTERNATIVE_TO
// =====================================================

// GitHub vs GitLab (similar tools)
MATCH (gh:Tool {id: 'github.createPullRequest'}), (gl:Tool {id: 'gitlab.createMergeRequest'})
MERGE (gh)-[a1:ALTERNATIVE_TO]->(gl)
SET a1.confidence = 0.90, a1.reason = 'Similar PR/MR functionality';

MATCH (gh_merge:Tool {id: 'github.mergePullRequest'}), (gl_merge:Tool {id: 'gitlab.mergeMergeRequest'})
MERGE (gh_merge)-[a2:ALTERNATIVE_TO]->(gl_merge)
SET a2.confidence = 0.90, a2.reason = 'Similar merge functionality';

// Jira vs Linear (alternative PM tools)
MATCH (jira:Tool {id: 'jira.createIssue'}), (linear:Tool {id: 'linear.createIssue'})
MERGE (jira)-[a3:ALTERNATIVE_TO]->(linear)
SET a3.confidence = 0.75, a3.reason = 'Alternative issue tracking platforms';

// Slack vs Teams (alternative communication)
MATCH (slack:Tool {id: 'slack.sendMessage'}), (teams:Tool {id: 'teams.sendMessage'})
MERGE (slack)-[a4:ALTERNATIVE_TO]->(teams)
SET a4.confidence = 0.80, a4.reason = 'Alternative team communication platforms';

// =====================================================
// RELATIONSHIPS - PRECEDES
// =====================================================

// Typical workflow sequences
MATCH (branch:Tool {id: 'github.createBranch'}), (pr:Tool {id: 'github.createPullRequest'})
MERGE (branch)-[p1:PRECEDES]->(pr)
SET p1.confidence = 0.93, p1.avgTimeBetween = 3600; // 1 hour

MATCH (pr:Tool {id: 'github.createPullRequest'}), (merge:Tool {id: 'github.mergePullRequest'})
MERGE (pr)-[p2:PRECEDES]->(merge)
SET p2.confidence = 0.88, p2.avgTimeBetween = 7200; // 2 hours

MATCH (jira_create:Tool {id: 'jira.createIssue'}), (gh_branch:Tool {id: 'github.createBranch'})
MERGE (jira_create)-[p3:PRECEDES]->(gh_branch)
SET p3.confidence = 0.75, p3.avgTimeBetween = 1800; // 30 minutes

// =====================================================
// VERIFICATION QUERIES
// =====================================================

// Count nodes by label
// MATCH (t:Tool) RETURN count(t) AS tools;
// MATCH (c:Category) RETURN count(c) AS categories;

// Count relationships by type
// MATCH ()-[r:OFTEN_USED_WITH]->() RETURN count(r) AS oftenUsedWith;
// MATCH ()-[r:DEPENDS_ON]->() RETURN count(r) AS dependsOn;
// MATCH ()-[r:ALTERNATIVE_TO]->() RETURN count(r) AS alternativeTo;
// MATCH ()-[r:PRECEDES]->() RETURN count(r) AS precedes;

// Find most connected tools
// MATCH (t:Tool)-[r]-()
// RETURN t.name, t.id, count(r) AS connections
// ORDER BY connections DESC
// LIMIT 10;
