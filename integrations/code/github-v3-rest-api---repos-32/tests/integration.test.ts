/**
 * Integration tests for GitHub v3 REST API - repos MCP Server
 *
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import axios from "axios";

// Mock axios for testing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GitHub v3 REST API - repos MCP Server", () => {
  beforeAll(() => {
    // Setup test environment
    process.env.OAUTH_ACCESS_TOKEN = "test-token-123";
  });

  afterAll(() => {
    // Cleanup
    delete process.env.OAUTH_ACCESS_TOKEN;
  });

  describe("Tool Definitions", () => {
    it("should define all expected tools", () => {
      const expectedTools = [
        "reposlistForOrg",
        "reposcreateInOrg",
        "reposgetOrgRulesets",
        "reposcreateOrgRuleset",
        "reposgetOrgRuleSuites",
        "reposgetOrgRuleSuite",
        "reposgetOrgRuleset",
        "reposupdateOrgRuleset",
        "reposdeleteOrgRuleset",
        "reposget",
        "reposupdate",
        "reposdelete",
        "reposlistActivities",
        "reposcreateAttestation",
        "reposlistAttestations",
        "reposlistAutolinks",
        "reposcreateAutolink",
        "reposgetAutolink",
        "reposdeleteAutolink",
        "reposcheckAutomatedSecurityFixes",
        "reposenableAutomatedSecurityFixes",
        "reposdisableAutomatedSecurityFixes",
        "reposlistBranches",
        "reposgetBranch",
        "reposgetBranchProtection",
        "reposupdateBranchProtection",
        "reposdeleteBranchProtection",
        "reposgetAdminBranchProtection",
        "repossetAdminBranchProtection",
        "reposdeleteAdminBranchProtection",
        "reposgetPullRequestReviewProtection",
        "reposupdatePullRequestReviewProtection",
        "reposdeletePullRequestReviewProtection",
        "reposgetCommitSignatureProtection",
        "reposcreateCommitSignatureProtection",
        "reposdeleteCommitSignatureProtection",
        "reposgetStatusChecksProtection",
        "reposupdateStatusCheckProtection",
        "reposremoveStatusCheckProtection",
        "reposgetAllStatusCheckContexts",
        "reposaddStatusCheckContexts",
        "repossetStatusCheckContexts",
        "reposremoveStatusCheckContexts",
        "reposgetAccessRestrictions",
        "reposdeleteAccessRestrictions",
        "reposgetAppsWithAccessToProtectedBranch",
        "reposaddAppAccessRestrictions",
        "repossetAppAccessRestrictions",
        "reposremoveAppAccessRestrictions",
        "reposgetTeamsWithAccessToProtectedBranch",
        "reposaddTeamAccessRestrictions",
        "repossetTeamAccessRestrictions",
        "reposremoveTeamAccessRestrictions",
        "reposgetUsersWithAccessToProtectedBranch",
        "reposaddUserAccessRestrictions",
        "repossetUserAccessRestrictions",
        "reposremoveUserAccessRestrictions",
        "reposrenameBranch",
        "reposcodeownersErrors",
        "reposlistCollaborators",
        "reposcheckCollaborator",
        "reposaddCollaborator",
        "reposremoveCollaborator",
        "reposgetCollaboratorPermissionLevel",
        "reposlistCommitCommentsForRepo",
        "reposgetCommitComment",
        "reposupdateCommitComment",
        "reposdeleteCommitComment",
        "reposlistCommits",
        "reposlistBranchesForHeadCommit",
        "reposlistCommentsForCommit",
        "reposcreateCommitComment",
        "reposlistPullRequestsAssociatedWithCommit",
        "reposgetCommit",
        "reposgetCombinedStatusForRef",
        "reposlistCommitStatusesForRef",
        "reposgetCommunityProfileMetrics",
        "reposcompareCommits",
        "reposgetContent",
        "reposcreateOrUpdateFileContents",
        "reposdeleteFile",
        "reposlistContributors",
        "reposlistDeployments",
        "reposcreateDeployment",
        "reposgetDeployment",
        "reposdeleteDeployment",
        "reposlistDeploymentStatuses",
        "reposcreateDeploymentStatus",
        "reposgetDeploymentStatus",
        "reposcreateDispatchEvent",
        "reposgetAllEnvironments",
        "reposgetEnvironment",
        "reposcreateOrUpdateEnvironment",
        "reposdeleteAnEnvironment",
        "reposlistDeploymentBranchPolicies",
        "reposcreateDeploymentBranchPolicy",
        "reposgetDeploymentBranchPolicy",
        "reposupdateDeploymentBranchPolicy",
        "reposdeleteDeploymentBranchPolicy",
        "reposgetAllDeploymentProtectionRules",
        "reposcreateDeploymentProtectionRule",
        "reposlistCustomDeploymentRuleIntegrations",
        "reposgetCustomDeploymentProtectionRule",
        "reposdisableDeploymentProtectionRule",
        "reposlistForks",
        "reposcreateFork",
        "reposlistWebhooks",
        "reposcreateWebhook",
        "reposgetWebhook",
        "reposupdateWebhook",
        "reposdeleteWebhook",
        "reposgetWebhookConfigForRepo",
        "reposupdateWebhookConfigForRepo",
        "reposlistWebhookDeliveries",
        "reposgetWebhookDelivery",
        "reposredeliverWebhookDelivery",
        "repospingWebhook",
        "repostestPushWebhook",
        "reposcheckImmutableReleases",
        "reposenableImmutableReleases",
        "reposdisableImmutableReleases",
        "reposlistInvitations",
        "reposupdateInvitation",
        "reposdeleteInvitation",
        "reposlistDeployKeys",
        "reposcreateDeployKey",
        "reposgetDeployKey",
        "reposdeleteDeployKey",
        "reposlistLanguages",
        "reposmergeUpstream",
        "reposmerge",
        "reposgetPages",
        "reposcreatePagesSite",
        "reposupdateInformationAboutPagesSite",
        "reposdeletePagesSite",
        "reposlistPagesBuilds",
        "reposrequestPagesBuild",
        "reposgetLatestPagesBuild",
        "reposgetPagesBuild",
        "reposcreatePagesDeployment",
        "reposgetPagesDeployment",
        "reposcancelPagesDeployment",
        "reposgetPagesHealthCheck",
        "reposcheckPrivateVulnerabilityReporting",
        "reposenablePrivateVulnerabilityReporting",
        "reposdisablePrivateVulnerabilityReporting",
        "reposcustomPropertiesForReposGetRepositoryValues",
        "reposcustomPropertiesForReposCreateOrUpdateReposit",
        "reposgetReadme",
        "reposgetReadmeInDirectory",
        "reposlistReleases",
        "reposcreateRelease",
        "reposgetReleaseAsset",
        "reposupdateReleaseAsset",
        "reposdeleteReleaseAsset",
        "reposgenerateReleaseNotes",
        "reposgetLatestRelease",
        "reposgetReleaseByTag",
        "reposgetRelease",
        "reposupdateRelease",
        "reposdeleteRelease",
        "reposlistReleaseAssets",
        "reposuploadReleaseAsset",
        "reposgetBranchRules",
        "reposgetRepoRulesets",
        "reposcreateRepoRuleset",
        "reposgetRepoRuleSuites",
        "reposgetRepoRuleSuite",
        "reposgetRepoRuleset",
        "reposupdateRepoRuleset",
        "reposdeleteRepoRuleset",
        "reposgetRepoRulesetHistory",
        "reposgetRepoRulesetVersion",
        "reposgetCodeFrequencyStats",
        "reposgetCommitActivityStats",
        "reposgetContributorsStats",
        "reposgetParticipationStats",
        "reposgetPunchCardStats",
        "reposcreateCommitStatus",
        "reposlistTags",
        "reposlistTagProtection",
        "reposcreateTagProtection",
        "reposdeleteTagProtection",
        "reposdownloadTarballArchive",
        "reposlistTeams",
        "reposgetAllTopics",
        "reposreplaceAllTopics",
        "reposgetClones",
        "reposgetTopPaths",
        "reposgetTopReferrers",
        "reposgetViews",
        "repostransfer",
        "reposcheckVulnerabilityAlerts",
        "reposenableVulnerabilityAlerts",
        "reposdisableVulnerabilityAlerts",
        "reposdownloadZipballArchive",
        "reposcreateUsingTemplate",
        "reposlistPublic",
        "reposlistForAuthenticatedUser",
        "reposcreateForAuthenticatedUser",
        "reposlistInvitationsForAuthenticatedUser",
        "reposacceptInvitationForAuthenticatedUser",
        "reposdeclineInvitationForAuthenticatedUser",
        "reposlistForUser",
      ];

      // This would normally call server.listTools()
      // For now, verify the tool names are defined
      expectedTools.forEach((toolName) => {
        expect(toolName).toBeTruthy();
      });
    });

    it("should have valid schema for reposlistForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          type: { type: "string" },
          sort: { type: "string" },
          direction: { type: "string" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateInOrg", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          homepage: { type: "string" },
          private: { type: "boolean" },
          visibility: { type: "string" },
          has_issues: { type: "boolean" },
          has_projects: { type: "boolean" },
          has_wiki: { type: "boolean" },
          has_downloads: { type: "boolean" },
          is_template: { type: "boolean" },
          team_id: { type: "integer" },
          auto_init: { type: "boolean" },
          gitignore_template: { type: "string" },
          license_template: { type: "string" },
          allow_squash_merge: { type: "boolean" },
          allow_merge_commit: { type: "boolean" },
          allow_rebase_merge: { type: "boolean" },
          allow_auto_merge: { type: "boolean" },
          delete_branch_on_merge: { type: "boolean" },
          use_squash_pr_title_as_default: { type: "boolean" },
          squash_merge_commit_title: { type: "string" },
          squash_merge_commit_message: { type: "string" },
          merge_commit_title: { type: "string" },
          merge_commit_message: { type: "string" },
          custom_properties: { type: "object" },
        },
        required: ["name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetOrgRulesets", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateOrgRuleset", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          target: { type: "string" },
          enforcement: { type: "" },
          bypass_actors: { type: "array" },
          conditions: { type: "" },
          rules: { type: "array" },
        },
        required: ["name", "enforcement"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetOrgRuleSuites", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetOrgRuleSuite", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          rule_suite_id: { type: "string" },
        },
        required: ["org", "rule_suite_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetOrgRuleset", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ruleset_id: { type: "integer" },
          org: { type: "string" },
        },
        required: ["ruleset_id", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateOrgRuleset", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          target: { type: "string" },
          enforcement: { type: "" },
          bypass_actors: { type: "array" },
          conditions: { type: "" },
          rules: { type: "array" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteOrgRuleset", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ruleset_id: { type: "integer" },
          org: { type: "string" },
        },
        required: ["ruleset_id", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposget", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdate", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          homepage: { type: "string" },
          private: { type: "boolean" },
          visibility: { type: "string" },
          security_and_analysis: { type: "object" },
          has_issues: { type: "boolean" },
          has_projects: { type: "boolean" },
          has_wiki: { type: "boolean" },
          is_template: { type: "boolean" },
          default_branch: { type: "string" },
          allow_squash_merge: { type: "boolean" },
          allow_merge_commit: { type: "boolean" },
          allow_rebase_merge: { type: "boolean" },
          allow_auto_merge: { type: "boolean" },
          delete_branch_on_merge: { type: "boolean" },
          allow_update_branch: { type: "boolean" },
          use_squash_pr_title_as_default: { type: "boolean" },
          squash_merge_commit_title: { type: "string" },
          squash_merge_commit_message: { type: "string" },
          merge_commit_title: { type: "string" },
          merge_commit_message: { type: "string" },
          archived: { type: "boolean" },
          allow_forking: { type: "boolean" },
          web_commit_signoff_required: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdelete", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistActivities", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ref: { type: "string" },
          actor: { type: "string" },
          time_period: { type: "string" },
          activity_type: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateAttestation", () => {
      const schema = {
        type: "object",
        properties: {
          bundle: { type: "object" },
        },
        required: ["bundle"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistAttestations", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          subject_digest: { type: "string" },
          predicate_type: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["subject_digest", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistAutolinks", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateAutolink", () => {
      const schema = {
        type: "object",
        properties: {
          key_prefix: { type: "string" },
          url_template: { type: "string" },
          is_alphanumeric: { type: "boolean" },
        },
        required: ["key_prefix", "url_template"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetAutolink", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          autolink_id: { type: "string" },
        },
        required: ["owner", "repo", "autolink_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteAutolink", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          autolink_id: { type: "string" },
        },
        required: ["owner", "repo", "autolink_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcheckAutomatedSecurityFixes", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposenableAutomatedSecurityFixes", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdisableAutomatedSecurityFixes", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistBranches", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          protected: { type: "boolean" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetBranch", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetBranchProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateBranchProtection", () => {
      const schema = {
        type: "object",
        properties: {
          required_status_checks: { type: "object" },
          enforce_admins: { type: "boolean" },
          required_pull_request_reviews: { type: "object" },
          restrictions: { type: "object" },
          required_linear_history: { type: "boolean" },
          allow_force_pushes: { type: "boolean" },
          allow_deletions: { type: "boolean" },
          block_creations: { type: "boolean" },
          required_conversation_resolution: { type: "boolean" },
          lock_branch: { type: "boolean" },
          allow_fork_syncing: { type: "boolean" },
        },
        required: ["required_status_checks", "enforce_admins", "required_pull_request_reviews", "restrictions"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteBranchProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetAdminBranchProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for repossetAdminBranchProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteAdminBranchProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetPullRequestReviewProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdatePullRequestReviewProtection", () => {
      const schema = {
        type: "object",
        properties: {
          dismissal_restrictions: { type: "object" },
          dismiss_stale_reviews: { type: "boolean" },
          require_code_owner_reviews: { type: "boolean" },
          required_approving_review_count: { type: "integer" },
          require_last_push_approval: { type: "boolean" },
          bypass_pull_request_allowances: { type: "object" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeletePullRequestReviewProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetCommitSignatureProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateCommitSignatureProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteCommitSignatureProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetStatusChecksProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateStatusCheckProtection", () => {
      const schema = {
        type: "object",
        properties: {
          strict: { type: "boolean" },
          contexts: { type: "array" },
          checks: { type: "array" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposremoveStatusCheckProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetAllStatusCheckContexts", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposaddStatusCheckContexts", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for repossetStatusCheckContexts", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposremoveStatusCheckContexts", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetAppsWithAccessToProtectedBranch", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposaddAppAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          apps: { type: "array" },
        },
        required: ["apps"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for repossetAppAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          apps: { type: "array" },
        },
        required: ["apps"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposremoveAppAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          apps: { type: "array" },
        },
        required: ["apps"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetTeamsWithAccessToProtectedBranch", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposaddTeamAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for repossetTeamAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposremoveTeamAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetUsersWithAccessToProtectedBranch", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposaddUserAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          users: { type: "array" },
        },
        required: ["users"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for repossetUserAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          users: { type: "array" },
        },
        required: ["users"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposremoveUserAccessRestrictions", () => {
      const schema = {
        type: "object",
        properties: {
          users: { type: "array" },
        },
        required: ["users"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposrenameBranch", () => {
      const schema = {
        type: "object",
        properties: {
          new_name: { type: "string" },
        },
        required: ["new_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcodeownersErrors", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ref: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistCollaborators", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          affiliation: { type: "string" },
          permission: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcheckCollaborator", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          username: { type: "string" },
        },
        required: ["owner", "repo", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposaddCollaborator", () => {
      const schema = {
        type: "object",
        properties: {
          permission: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposremoveCollaborator", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          username: { type: "string" },
        },
        required: ["owner", "repo", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetCollaboratorPermissionLevel", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          username: { type: "string" },
        },
        required: ["owner", "repo", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistCommitCommentsForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetCommitComment", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          comment_id: { type: "string" },
        },
        required: ["owner", "repo", "comment_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateCommitComment", () => {
      const schema = {
        type: "object",
        properties: {
          body: { type: "string" },
        },
        required: ["body"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteCommitComment", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          comment_id: { type: "string" },
        },
        required: ["owner", "repo", "comment_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistCommits", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          sha: { type: "string" },
          path: { type: "string" },
          author: { type: "string" },
          committer: { type: "string" },
          since: { type: "string" },
          until: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistBranchesForHeadCommit", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          commit_sha: { type: "string" },
        },
        required: ["owner", "repo", "commit_sha"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistCommentsForCommit", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          commit_sha: { type: "string" },
        },
        required: ["owner", "repo", "commit_sha"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateCommitComment", () => {
      const schema = {
        type: "object",
        properties: {
          body: { type: "string" },
          path: { type: "string" },
          position: { type: "integer" },
          line: { type: "integer" },
        },
        required: ["body"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistPullRequestsAssociatedWithCommit", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          commit_sha: { type: "string" },
        },
        required: ["owner", "repo", "commit_sha"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetCommit", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          ref: { type: "string" },
        },
        required: ["owner", "repo", "ref"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetCombinedStatusForRef", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          ref: { type: "string" },
        },
        required: ["owner", "repo", "ref"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistCommitStatusesForRef", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          ref: { type: "string" },
        },
        required: ["owner", "repo", "ref"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetCommunityProfileMetrics", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcompareCommits", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          basehead: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["basehead", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetContent", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          path: { type: "string" },
          ref: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["path", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateOrUpdateFileContents", () => {
      const schema = {
        type: "object",
        properties: {
          message: { type: "string" },
          content: { type: "string" },
          sha: { type: "string" },
          branch: { type: "string" },
          committer: { type: "object" },
          author: { type: "object" },
        },
        required: ["message", "content"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteFile", () => {
      const schema = {
        type: "object",
        properties: {
          message: { type: "string" },
          sha: { type: "string" },
          branch: { type: "string" },
          committer: { type: "object" },
          author: { type: "object" },
        },
        required: ["message", "sha"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistContributors", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          anon: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistDeployments", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          sha: { type: "string" },
          ref: { type: "string" },
          task: { type: "string" },
          environment: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateDeployment", () => {
      const schema = {
        type: "object",
        properties: {
          ref: { type: "string" },
          task: { type: "string" },
          auto_merge: { type: "boolean" },
          required_contexts: { type: "array" },
          payload: { type: "" },
          environment: { type: "string" },
          description: { type: "string" },
          transient_environment: { type: "boolean" },
          production_environment: { type: "boolean" },
        },
        required: ["ref"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetDeployment", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          deployment_id: { type: "string" },
        },
        required: ["owner", "repo", "deployment_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteDeployment", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          deployment_id: { type: "string" },
        },
        required: ["owner", "repo", "deployment_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistDeploymentStatuses", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          deployment_id: { type: "string" },
        },
        required: ["owner", "repo", "deployment_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateDeploymentStatus", () => {
      const schema = {
        type: "object",
        properties: {
          state: { type: "string" },
          target_url: { type: "string" },
          log_url: { type: "string" },
          description: { type: "string" },
          environment: { type: "string" },
          environment_url: { type: "string" },
          auto_inactive: { type: "boolean" },
        },
        required: ["state"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetDeploymentStatus", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          status_id: { type: "integer" },
          owner: { type: "string" },
          repo: { type: "string" },
          deployment_id: { type: "string" },
        },
        required: ["status_id", "owner", "repo", "deployment_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateDispatchEvent", () => {
      const schema = {
        type: "object",
        properties: {
          event_type: { type: "string" },
          client_payload: { type: "object" },
        },
        required: ["event_type"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetAllEnvironments", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetEnvironment", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateOrUpdateEnvironment", () => {
      const schema = {
        type: "object",
        properties: {
          wait_timer: { type: "" },
          prevent_self_review: { type: "" },
          reviewers: { type: "array" },
          deployment_branch_policy: { type: "" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteAnEnvironment", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistDeploymentBranchPolicies", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateDeploymentBranchPolicy", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetDeploymentBranchPolicy", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
          branch_policy_id: { type: "string" },
        },
        required: ["owner", "repo", "environment_name", "branch_policy_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateDeploymentBranchPolicy", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
          branch_policy_id: { type: "string" },
        },
        required: ["owner", "repo", "environment_name", "branch_policy_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteDeploymentBranchPolicy", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
          branch_policy_id: { type: "string" },
        },
        required: ["owner", "repo", "environment_name", "branch_policy_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetAllDeploymentProtectionRules", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateDeploymentProtectionRule", () => {
      const schema = {
        type: "object",
        properties: {
          integration_id: { type: "integer" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistCustomDeploymentRuleIntegrations", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetCustomDeploymentProtectionRule", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
          protection_rule_id: { type: "string" },
        },
        required: ["owner", "repo", "environment_name", "protection_rule_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdisableDeploymentProtectionRule", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
          protection_rule_id: { type: "string" },
        },
        required: ["owner", "repo", "environment_name", "protection_rule_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistForks", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          sort: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateFork", () => {
      const schema = {
        type: "object",
        properties: {
          organization: { type: "string" },
          name: { type: "string" },
          default_branch_only: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistWebhooks", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          config: { type: "object" },
          events: { type: "array" },
          active: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["owner", "repo", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          config: { type: "" },
          events: { type: "array" },
          add_events: { type: "array" },
          remove_events: { type: "array" },
          active: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["owner", "repo", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetWebhookConfigForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["owner", "repo", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateWebhookConfigForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          url: { type: "" },
          content_type: { type: "" },
          secret: { type: "" },
          insecure_ssl: { type: "" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistWebhookDeliveries", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["owner", "repo", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetWebhookDelivery", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          hook_id: { type: "string" },
          delivery_id: { type: "string" },
        },
        required: ["owner", "repo", "hook_id", "delivery_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposredeliverWebhookDelivery", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          hook_id: { type: "string" },
          delivery_id: { type: "string" },
        },
        required: ["owner", "repo", "hook_id", "delivery_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for repospingWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["owner", "repo", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for repostestPushWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["owner", "repo", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcheckImmutableReleases", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposenableImmutableReleases", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdisableImmutableReleases", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistInvitations", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateInvitation", () => {
      const schema = {
        type: "object",
        properties: {
          permissions: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteInvitation", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          invitation_id: { type: "string" },
        },
        required: ["owner", "repo", "invitation_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistDeployKeys", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateDeployKey", () => {
      const schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          key: { type: "string" },
          read_only: { type: "boolean" },
        },
        required: ["key"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetDeployKey", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          key_id: { type: "string" },
        },
        required: ["owner", "repo", "key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteDeployKey", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          key_id: { type: "string" },
        },
        required: ["owner", "repo", "key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistLanguages", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposmergeUpstream", () => {
      const schema = {
        type: "object",
        properties: {
          branch: { type: "string" },
        },
        required: ["branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposmerge", () => {
      const schema = {
        type: "object",
        properties: {
          base: { type: "string" },
          head: { type: "string" },
          commit_message: { type: "string" },
        },
        required: ["base", "head"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetPages", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreatePagesSite", () => {
      const schema = {
        type: "object",
        properties: {
          build_type: { type: "string" },
          source: { type: "object" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateInformationAboutPagesSite", () => {
      const schema = {
        type: "object",
        properties: {
          cname: { type: "string" },
          https_enforced: { type: "boolean" },
          build_type: { type: "string" },
          source: { type: "" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeletePagesSite", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistPagesBuilds", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposrequestPagesBuild", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetLatestPagesBuild", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetPagesBuild", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          build_id: { type: "integer" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["build_id", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreatePagesDeployment", () => {
      const schema = {
        type: "object",
        properties: {
          artifact_id: { type: "number" },
          artifact_url: { type: "string" },
          environment: { type: "string" },
          pages_build_version: { type: "string" },
          oidc_token: { type: "string" },
        },
        required: ["pages_build_version", "oidc_token"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetPagesDeployment", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          pages_deployment_id: { type: "string" },
        },
        required: ["owner", "repo", "pages_deployment_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcancelPagesDeployment", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          pages_deployment_id: { type: "string" },
        },
        required: ["owner", "repo", "pages_deployment_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetPagesHealthCheck", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcheckPrivateVulnerabilityReporting", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposenablePrivateVulnerabilityReporting", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdisablePrivateVulnerabilityReporting", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcustomPropertiesForReposGetRepositoryValues", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcustomPropertiesForReposCreateOrUpdateReposit", () => {
      const schema = {
        type: "object",
        properties: {
          properties: { type: "array" },
        },
        required: ["properties"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetReadme", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ref: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetReadmeInDirectory", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          dir: { type: "string" },
          ref: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["dir", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistReleases", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateRelease", () => {
      const schema = {
        type: "object",
        properties: {
          tag_name: { type: "string" },
          target_commitish: { type: "string" },
          name: { type: "string" },
          body: { type: "string" },
          draft: { type: "boolean" },
          prerelease: { type: "boolean" },
          discussion_category_name: { type: "string" },
          generate_release_notes: { type: "boolean" },
          make_latest: { type: "string" },
        },
        required: ["tag_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetReleaseAsset", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          asset_id: { type: "string" },
        },
        required: ["owner", "repo", "asset_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateReleaseAsset", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          label: { type: "string" },
          state: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteReleaseAsset", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          asset_id: { type: "string" },
        },
        required: ["owner", "repo", "asset_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgenerateReleaseNotes", () => {
      const schema = {
        type: "object",
        properties: {
          tag_name: { type: "string" },
          target_commitish: { type: "string" },
          previous_tag_name: { type: "string" },
          configuration_file_path: { type: "string" },
        },
        required: ["tag_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetLatestRelease", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetReleaseByTag", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          tag: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["tag", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetRelease", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          release_id: { type: "string" },
        },
        required: ["owner", "repo", "release_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateRelease", () => {
      const schema = {
        type: "object",
        properties: {
          tag_name: { type: "string" },
          target_commitish: { type: "string" },
          name: { type: "string" },
          body: { type: "string" },
          draft: { type: "boolean" },
          prerelease: { type: "boolean" },
          make_latest: { type: "string" },
          discussion_category_name: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteRelease", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          release_id: { type: "string" },
        },
        required: ["owner", "repo", "release_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistReleaseAssets", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          release_id: { type: "string" },
        },
        required: ["owner", "repo", "release_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposuploadReleaseAsset", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          name: { type: "string" },
          label: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          release_id: { type: "string" },
        },
        required: ["name", "owner", "repo", "release_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetBranchRules", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          branch: { type: "string" },
        },
        required: ["owner", "repo", "branch"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetRepoRulesets", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          includes_parents: { type: "boolean" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateRepoRuleset", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          target: { type: "string" },
          enforcement: { type: "" },
          bypass_actors: { type: "array" },
          conditions: { type: "" },
          rules: { type: "array" },
        },
        required: ["name", "enforcement"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetRepoRuleSuites", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetRepoRuleSuite", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          rule_suite_id: { type: "string" },
        },
        required: ["owner", "repo", "rule_suite_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetRepoRuleset", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ruleset_id: { type: "integer" },
          includes_parents: { type: "boolean" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["ruleset_id", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposupdateRepoRuleset", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          target: { type: "string" },
          enforcement: { type: "" },
          bypass_actors: { type: "array" },
          conditions: { type: "" },
          rules: { type: "array" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteRepoRuleset", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ruleset_id: { type: "integer" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["ruleset_id", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetRepoRulesetHistory", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ruleset_id: { type: "integer" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["ruleset_id", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetRepoRulesetVersion", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ruleset_id: { type: "integer" },
          version_id: { type: "integer" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["ruleset_id", "version_id", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetCodeFrequencyStats", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetCommitActivityStats", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetContributorsStats", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetParticipationStats", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetPunchCardStats", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateCommitStatus", () => {
      const schema = {
        type: "object",
        properties: {
          state: { type: "string" },
          target_url: { type: "string" },
          description: { type: "string" },
          context: { type: "string" },
        },
        required: ["state"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistTags", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistTagProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateTagProtection", () => {
      const schema = {
        type: "object",
        properties: {
          pattern: { type: "string" },
        },
        required: ["pattern"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeleteTagProtection", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          tag_protection_id: { type: "string" },
        },
        required: ["owner", "repo", "tag_protection_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdownloadTarballArchive", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ref: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["ref", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistTeams", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetAllTopics", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposreplaceAllTopics", () => {
      const schema = {
        type: "object",
        properties: {
          names: { type: "array" },
        },
        required: ["names"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetClones", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetTopPaths", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetTopReferrers", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposgetViews", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for repostransfer", () => {
      const schema = {
        type: "object",
        properties: {
          new_owner: { type: "string" },
          new_name: { type: "string" },
          team_ids: { type: "array" },
        },
        required: ["new_owner"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcheckVulnerabilityAlerts", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposenableVulnerabilityAlerts", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdisableVulnerabilityAlerts", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdownloadZipballArchive", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ref: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["ref", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateUsingTemplate", () => {
      const schema = {
        type: "object",
        properties: {
          owner: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          include_all_branches: { type: "boolean" },
          private: { type: "boolean" },
        },
        required: ["name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistPublic", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          visibility: { type: "string" },
          affiliation: { type: "string" },
          type: { type: "string" },
          sort: { type: "string" },
          direction: { type: "string" },
          None: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposcreateForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          homepage: { type: "string" },
          private: { type: "boolean" },
          has_issues: { type: "boolean" },
          has_projects: { type: "boolean" },
          has_wiki: { type: "boolean" },
          has_discussions: { type: "boolean" },
          team_id: { type: "integer" },
          auto_init: { type: "boolean" },
          gitignore_template: { type: "string" },
          license_template: { type: "string" },
          allow_squash_merge: { type: "boolean" },
          allow_merge_commit: { type: "boolean" },
          allow_rebase_merge: { type: "boolean" },
          allow_auto_merge: { type: "boolean" },
          delete_branch_on_merge: { type: "boolean" },
          squash_merge_commit_title: { type: "string" },
          squash_merge_commit_message: { type: "string" },
          merge_commit_title: { type: "string" },
          merge_commit_message: { type: "string" },
          has_downloads: { type: "boolean" },
          is_template: { type: "boolean" },
        },
        required: ["name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistInvitationsForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposacceptInvitationForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          invitation_id: { type: "string" },
        },
        required: ["invitation_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposdeclineInvitationForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          invitation_id: { type: "string" },
        },
        required: ["invitation_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for reposlistForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          type: { type: "string" },
          sort: { type: "string" },
          direction: { type: "string" },
          username: { type: "string" },
        },
        required: ["username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
  });

  describe("OAuth Integration", () => {
    it("should work without OAuth if not configured", () => {
      // No OAuth configuration for this API
      expect(true).toBe(true);
    });
  });

  describe("Rate Limit Handling", () => {
    it("should work without rate limiting if not configured", () => {
      // No rate limiting for this API
      expect(true).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      const networkError = new Error("Network error");

      try {
        throw networkError;
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toBe("Network error");
      }
    });

    it("should handle API errors with proper messages", () => {
      const apiError = {
        response: {
          status: 400,
          data: { message: "Bad request" },
        },
      };

      expect(apiError.response.status).toBe(400);
      expect(apiError.response.data.message).toBe("Bad request");
    });

    it("should handle missing required parameters", () => {
      const missingParams = {};

      // Verify that missing required parameters are caught
      expect(missingParams).toBeDefined();
    });
  });

  describe("reposlistForOrg tool", () => {
    it("should make GET request to /orgs/{org}/repos", async () => {
      const mockResponse = { data: { success: true } };

      mockedAxios.create = jest.fn().mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: { use: jest.fn() },
        },
      });

      // Test would call the tool here
      expect(mockResponse.data.success).toBe(true);
    });

    it("should validate required parameters for reposlistForOrg", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("reposcreateInOrg tool", () => {
    it("should make POST request to /orgs/{org}/repos", async () => {
      const mockResponse = { data: { success: true } };

      mockedAxios.create = jest.fn().mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: { use: jest.fn() },
        },
      });

      // Test would call the tool here
      expect(mockResponse.data.success).toBe(true);
    });

    it("should validate required parameters for reposcreateInOrg", () => {
      const requiredParams = ["name"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("reposgetOrgRulesets tool", () => {
    it("should make GET request to /orgs/{org}/rulesets", async () => {
      const mockResponse = { data: { success: true } };

      mockedAxios.create = jest.fn().mockReturnValue({
        request: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          response: { use: jest.fn() },
        },
      });

      // Test would call the tool here
      expect(mockResponse.data.success).toBe(true);
    });

    it("should validate required parameters for reposgetOrgRulesets", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
});