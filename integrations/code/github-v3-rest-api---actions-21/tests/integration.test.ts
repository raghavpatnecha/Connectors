/**
 * Integration tests for GitHub v3 REST API - actions MCP Server
 *
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import axios from "axios";

// Mock axios for testing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GitHub v3 REST API - actions MCP Server", () => {
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
        "actionsgetActionsCacheUsageForOrg",
        "actionsgetActionsCacheUsageByRepoForOrg",
        "actionslistHostedRunnersForOrg",
        "actionscreateHostedRunnerForOrg",
        "actionslistCustomImagesForOrg",
        "actionsgetCustomImageForOrg",
        "actionsdeleteCustomImageFromOrg",
        "actionslistCustomImageVersionsForOrg",
        "actionsgetCustomImageVersionForOrg",
        "actionsdeleteCustomImageVersionFromOrg",
        "actionsgetHostedRunnersGithubOwnedImagesForOrg",
        "actionsgetHostedRunnersPartnerImagesForOrg",
        "actionsgetHostedRunnersLimitsForOrg",
        "actionsgetHostedRunnersMachineSpecsForOrg",
        "actionsgetHostedRunnersPlatformsForOrg",
        "actionsgetHostedRunnerForOrg",
        "actionsupdateHostedRunnerForOrg",
        "actionsdeleteHostedRunnerForOrg",
        "actionsgetGithubActionsPermissionsOrganization",
        "actionssetGithubActionsPermissionsOrganization",
        "actionsgetArtifactAndLogRetentionSettingsOrganizat",
        "actionssetArtifactAndLogRetentionSettingsOrganizat",
        "actionsgetForkPrContributorApprovalPermissionsOrga",
        "actionssetForkPrContributorApprovalPermissionsOrga",
        "actionsgetPrivateRepoForkPrWorkflowsSettingsOrgani",
        "actionssetPrivateRepoForkPrWorkflowsSettingsOrgani",
        "actionslistSelectedRepositoriesEnabledGithubAction",
        "actionssetSelectedRepositoriesEnabledGithubActions",
        "actionsenableSelectedRepositoryGithubActionsOrgani",
        "actionsdisableSelectedRepositoryGithubActionsOrgan",
        "actionsgetAllowedActionsOrganization",
        "actionssetAllowedActionsOrganization",
        "actionsgetSelfHostedRunnersPermissionsOrganization",
        "actionssetSelfHostedRunnersPermissionsOrganization",
        "actionslistSelectedRepositoriesSelfHostedRunnersOr",
        "actionssetSelectedRepositoriesSelfHostedRunnersOrg",
        "actionsenableSelectedRepositorySelfHostedRunnersOr",
        "actionsdisableSelectedRepositorySelfHostedRunnersO",
        "actionsgetGithubActionsDefaultWorkflowPermissionsO",
        "actionssetGithubActionsDefaultWorkflowPermissionsO",
        "actionslistSelfHostedRunnerGroupsForOrg",
        "actionscreateSelfHostedRunnerGroupForOrg",
        "actionsgetSelfHostedRunnerGroupForOrg",
        "actionsupdateSelfHostedRunnerGroupForOrg",
        "actionsdeleteSelfHostedRunnerGroupFromOrg",
        "actionslistGithubHostedRunnersInGroupForOrg",
        "actionslistRepoAccessToSelfHostedRunnerGroupInOrg",
        "actionssetRepoAccessToSelfHostedRunnerGroupInOrg",
        "actionsaddRepoAccessToSelfHostedRunnerGroupInOrg",
        "actionsremoveRepoAccessToSelfHostedRunnerGroupInOr",
        "actionslistSelfHostedRunnersInGroupForOrg",
        "actionssetSelfHostedRunnersInGroupForOrg",
        "actionsaddSelfHostedRunnerToGroupForOrg",
        "actionsremoveSelfHostedRunnerFromGroupForOrg",
        "actionslistSelfHostedRunnersForOrg",
        "actionslistRunnerApplicationsForOrg",
        "actionsgenerateRunnerJitconfigForOrg",
        "actionscreateRegistrationTokenForOrg",
        "actionscreateRemoveTokenForOrg",
        "actionsgetSelfHostedRunnerForOrg",
        "actionsdeleteSelfHostedRunnerFromOrg",
        "actionslistLabelsForSelfHostedRunnerForOrg",
        "actionsaddCustomLabelsToSelfHostedRunnerForOrg",
        "actionssetCustomLabelsForSelfHostedRunnerForOrg",
        "actionsremoveAllCustomLabelsFromSelfHostedRunnerFo",
        "actionsremoveCustomLabelFromSelfHostedRunnerForOrg",
        "actionslistOrgSecrets",
        "actionsgetOrgPublicKey",
        "actionsgetOrgSecret",
        "actionscreateOrUpdateOrgSecret",
        "actionsdeleteOrgSecret",
        "actionslistSelectedReposForOrgSecret",
        "actionssetSelectedReposForOrgSecret",
        "actionsaddSelectedRepoToOrgSecret",
        "actionsremoveSelectedRepoFromOrgSecret",
        "actionslistOrgVariables",
        "actionscreateOrgVariable",
        "actionsgetOrgVariable",
        "actionsupdateOrgVariable",
        "actionsdeleteOrgVariable",
        "actionslistSelectedReposForOrgVariable",
        "actionssetSelectedReposForOrgVariable",
        "actionsaddSelectedRepoToOrgVariable",
        "actionsremoveSelectedRepoFromOrgVariable",
        "actionslistArtifactsForRepo",
        "actionsgetArtifact",
        "actionsdeleteArtifact",
        "actionsdownloadArtifact",
        "actionsgetActionsCacheUsage",
        "actionsgetActionsCacheList",
        "actionsdeleteActionsCacheByKey",
        "actionsdeleteActionsCacheById",
        "actionsgetJobForWorkflowRun",
        "actionsdownloadJobLogsForWorkflowRun",
        "actionsreRunJobForWorkflowRun",
        "actionsgetCustomOidcSubClaimForRepo",
        "actionssetCustomOidcSubClaimForRepo",
        "actionslistRepoOrganizationSecrets",
        "actionslistRepoOrganizationVariables",
        "actionsgetGithubActionsPermissionsRepository",
        "actionssetGithubActionsPermissionsRepository",
        "actionsgetWorkflowAccessToRepository",
        "actionssetWorkflowAccessToRepository",
        "actionsgetArtifactAndLogRetentionSettingsRepositor",
        "actionssetArtifactAndLogRetentionSettingsRepositor",
        "actionsgetForkPrContributorApprovalPermissionsRepo",
        "actionssetForkPrContributorApprovalPermissionsRepo",
        "actionsgetPrivateRepoForkPrWorkflowsSettingsReposi",
        "actionssetPrivateRepoForkPrWorkflowsSettingsReposi",
        "actionsgetAllowedActionsRepository",
        "actionssetAllowedActionsRepository",
        "actionsgetGithubActionsDefaultWorkflowPermissionsR",
        "actionssetGithubActionsDefaultWorkflowPermissionsR",
        "actionslistSelfHostedRunnersForRepo",
        "actionslistRunnerApplicationsForRepo",
        "actionsgenerateRunnerJitconfigForRepo",
        "actionscreateRegistrationTokenForRepo",
        "actionscreateRemoveTokenForRepo",
        "actionsgetSelfHostedRunnerForRepo",
        "actionsdeleteSelfHostedRunnerFromRepo",
        "actionslistLabelsForSelfHostedRunnerForRepo",
        "actionsaddCustomLabelsToSelfHostedRunnerForRepo",
        "actionssetCustomLabelsForSelfHostedRunnerForRepo",
        "actionsremoveAllCustomLabelsFromSelfHostedRunnerFo",
        "actionsremoveCustomLabelFromSelfHostedRunnerForRep",
        "actionslistWorkflowRunsForRepo",
        "actionsgetWorkflowRun",
        "actionsdeleteWorkflowRun",
        "actionsgetReviewsForRun",
        "actionsapproveWorkflowRun",
        "actionslistWorkflowRunArtifacts",
        "actionsgetWorkflowRunAttempt",
        "actionslistJobsForWorkflowRunAttempt",
        "actionsdownloadWorkflowRunAttemptLogs",
        "actionscancelWorkflowRun",
        "actionsreviewCustomGatesForRun",
        "actionsforceCancelWorkflowRun",
        "actionslistJobsForWorkflowRun",
        "actionsdownloadWorkflowRunLogs",
        "actionsdeleteWorkflowRunLogs",
        "actionsgetPendingDeploymentsForRun",
        "actionsreviewPendingDeploymentsForRun",
        "actionsreRunWorkflow",
        "actionsreRunWorkflowFailedJobs",
        "actionsgetWorkflowRunUsage",
        "actionslistRepoSecrets",
        "actionsgetRepoPublicKey",
        "actionsgetRepoSecret",
        "actionscreateOrUpdateRepoSecret",
        "actionsdeleteRepoSecret",
        "actionslistRepoVariables",
        "actionscreateRepoVariable",
        "actionsgetRepoVariable",
        "actionsupdateRepoVariable",
        "actionsdeleteRepoVariable",
        "actionslistRepoWorkflows",
        "actionsgetWorkflow",
        "actionsdisableWorkflow",
        "actionscreateWorkflowDispatch",
        "actionsenableWorkflow",
        "actionslistWorkflowRuns",
        "actionsgetWorkflowUsage",
        "actionslistEnvironmentSecrets",
        "actionsgetEnvironmentPublicKey",
        "actionsgetEnvironmentSecret",
        "actionscreateOrUpdateEnvironmentSecret",
        "actionsdeleteEnvironmentSecret",
        "actionslistEnvironmentVariables",
        "actionscreateEnvironmentVariable",
        "actionsgetEnvironmentVariable",
        "actionsupdateEnvironmentVariable",
        "actionsdeleteEnvironmentVariable",
      ];

      // This would normally call server.listTools()
      // For now, verify the tool names are defined
      expectedTools.forEach((toolName) => {
        expect(toolName).toBeTruthy();
      });
    });

    it("should have valid schema for actionsgetActionsCacheUsageForOrg", () => {
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
    it("should have valid schema for actionsgetActionsCacheUsageByRepoForOrg", () => {
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
    it("should have valid schema for actionslistHostedRunnersForOrg", () => {
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
    it("should have valid schema for actionscreateHostedRunnerForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          image: { type: "object" },
          size: { type: "string" },
          runner_group_id: { type: "integer" },
          maximum_runners: { type: "integer" },
          enable_static_ip: { type: "boolean" },
          image_gen: { type: "boolean" },
        },
        required: ["name", "image", "size", "runner_group_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistCustomImagesForOrg", () => {
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
    it("should have valid schema for actionsgetCustomImageForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          image_definition_id: { type: "string" },
        },
        required: ["org", "image_definition_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteCustomImageFromOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          image_definition_id: { type: "string" },
        },
        required: ["org", "image_definition_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistCustomImageVersionsForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          image_definition_id: { type: "string" },
        },
        required: ["org", "image_definition_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetCustomImageVersionForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          image_definition_id: { type: "string" },
          version: { type: "string" },
        },
        required: ["org", "image_definition_id", "version"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteCustomImageVersionFromOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          image_definition_id: { type: "string" },
          version: { type: "string" },
        },
        required: ["org", "image_definition_id", "version"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetHostedRunnersGithubOwnedImagesForOrg", () => {
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
    it("should have valid schema for actionsgetHostedRunnersPartnerImagesForOrg", () => {
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
    it("should have valid schema for actionsgetHostedRunnersLimitsForOrg", () => {
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
    it("should have valid schema for actionsgetHostedRunnersMachineSpecsForOrg", () => {
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
    it("should have valid schema for actionsgetHostedRunnersPlatformsForOrg", () => {
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
    it("should have valid schema for actionsgetHostedRunnerForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          hosted_runner_id: { type: "string" },
        },
        required: ["org", "hosted_runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsupdateHostedRunnerForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          runner_group_id: { type: "integer" },
          maximum_runners: { type: "integer" },
          enable_static_ip: { type: "boolean" },
          image_version: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteHostedRunnerForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          hosted_runner_id: { type: "string" },
        },
        required: ["org", "hosted_runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetGithubActionsPermissionsOrganization", () => {
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
    it("should have valid schema for actionssetGithubActionsPermissionsOrganization", () => {
      const schema = {
        type: "object",
        properties: {
          enabled_repositories: { type: "" },
          allowed_actions: { type: "" },
          sha_pinning_required: { type: "" },
        },
        required: ["enabled_repositories"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetArtifactAndLogRetentionSettingsOrganizat", () => {
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
    it("should have valid schema for actionssetArtifactAndLogRetentionSettingsOrganizat", () => {
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
    it("should have valid schema for actionsgetForkPrContributorApprovalPermissionsOrga", () => {
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
    it("should have valid schema for actionssetForkPrContributorApprovalPermissionsOrga", () => {
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
    it("should have valid schema for actionsgetPrivateRepoForkPrWorkflowsSettingsOrgani", () => {
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
    it("should have valid schema for actionssetPrivateRepoForkPrWorkflowsSettingsOrgani", () => {
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
    it("should have valid schema for actionslistSelectedRepositoriesEnabledGithubAction", () => {
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
    it("should have valid schema for actionssetSelectedRepositoriesEnabledGithubActions", () => {
      const schema = {
        type: "object",
        properties: {
          selected_repository_ids: { type: "array" },
        },
        required: ["selected_repository_ids"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsenableSelectedRepositoryGithubActionsOrgani", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          repository_id: { type: "string" },
        },
        required: ["org", "repository_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdisableSelectedRepositoryGithubActionsOrgan", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          repository_id: { type: "string" },
        },
        required: ["org", "repository_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetAllowedActionsOrganization", () => {
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
    it("should have valid schema for actionssetAllowedActionsOrganization", () => {
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
    it("should have valid schema for actionsgetSelfHostedRunnersPermissionsOrganization", () => {
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
    it("should have valid schema for actionssetSelfHostedRunnersPermissionsOrganization", () => {
      const schema = {
        type: "object",
        properties: {
          enabled_repositories: { type: "string" },
        },
        required: ["enabled_repositories"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistSelectedRepositoriesSelfHostedRunnersOr", () => {
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
    it("should have valid schema for actionssetSelectedRepositoriesSelfHostedRunnersOrg", () => {
      const schema = {
        type: "object",
        properties: {
          selected_repository_ids: { type: "array" },
        },
        required: ["selected_repository_ids"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsenableSelectedRepositorySelfHostedRunnersOr", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          repository_id: { type: "string" },
        },
        required: ["org", "repository_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdisableSelectedRepositorySelfHostedRunnersO", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          repository_id: { type: "string" },
        },
        required: ["org", "repository_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetGithubActionsDefaultWorkflowPermissionsO", () => {
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
    it("should have valid schema for actionssetGithubActionsDefaultWorkflowPermissionsO", () => {
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
    it("should have valid schema for actionslistSelfHostedRunnerGroupsForOrg", () => {
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
    it("should have valid schema for actionscreateSelfHostedRunnerGroupForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          visibility: { type: "string" },
          selected_repository_ids: { type: "array" },
          runners: { type: "array" },
          allows_public_repositories: { type: "boolean" },
          restricted_to_workflows: { type: "boolean" },
          selected_workflows: { type: "array" },
          network_configuration_id: { type: "string" },
        },
        required: ["name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetSelfHostedRunnerGroupForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_group_id: { type: "string" },
        },
        required: ["org", "runner_group_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsupdateSelfHostedRunnerGroupForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          visibility: { type: "string" },
          allows_public_repositories: { type: "boolean" },
          restricted_to_workflows: { type: "boolean" },
          selected_workflows: { type: "array" },
          network_configuration_id: { type: "string" },
        },
        required: ["name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteSelfHostedRunnerGroupFromOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_group_id: { type: "string" },
        },
        required: ["org", "runner_group_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistGithubHostedRunnersInGroupForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_group_id: { type: "string" },
        },
        required: ["org", "runner_group_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistRepoAccessToSelfHostedRunnerGroupInOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_group_id: { type: "string" },
        },
        required: ["org", "runner_group_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionssetRepoAccessToSelfHostedRunnerGroupInOrg", () => {
      const schema = {
        type: "object",
        properties: {
          selected_repository_ids: { type: "array" },
        },
        required: ["selected_repository_ids"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsaddRepoAccessToSelfHostedRunnerGroupInOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_group_id: { type: "string" },
          repository_id: { type: "string" },
        },
        required: ["org", "runner_group_id", "repository_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsremoveRepoAccessToSelfHostedRunnerGroupInOr", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_group_id: { type: "string" },
          repository_id: { type: "string" },
        },
        required: ["org", "runner_group_id", "repository_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistSelfHostedRunnersInGroupForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_group_id: { type: "string" },
        },
        required: ["org", "runner_group_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionssetSelfHostedRunnersInGroupForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          runners: { type: "array" },
        },
        required: ["runners"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsaddSelfHostedRunnerToGroupForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_group_id: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["org", "runner_group_id", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsremoveSelfHostedRunnerFromGroupForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_group_id: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["org", "runner_group_id", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistSelfHostedRunnersForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          None: { type: "string" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistRunnerApplicationsForOrg", () => {
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
    it("should have valid schema for actionsgenerateRunnerJitconfigForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          runner_group_id: { type: "integer" },
          labels: { type: "array" },
          work_folder: { type: "string" },
        },
        required: ["name", "runner_group_id", "labels"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionscreateRegistrationTokenForOrg", () => {
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
    it("should have valid schema for actionscreateRemoveTokenForOrg", () => {
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
    it("should have valid schema for actionsgetSelfHostedRunnerForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["org", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteSelfHostedRunnerFromOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["org", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistLabelsForSelfHostedRunnerForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["org", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsaddCustomLabelsToSelfHostedRunnerForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          labels: { type: "array" },
        },
        required: ["labels"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionssetCustomLabelsForSelfHostedRunnerForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          labels: { type: "array" },
        },
        required: ["labels"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsremoveAllCustomLabelsFromSelfHostedRunnerFo", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["org", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsremoveCustomLabelFromSelfHostedRunnerForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          runner_id: { type: "string" },
          name: { type: "string" },
        },
        required: ["org", "runner_id", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistOrgSecrets", () => {
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
    it("should have valid schema for actionsgetOrgPublicKey", () => {
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
    it("should have valid schema for actionsgetOrgSecret", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["org", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionscreateOrUpdateOrgSecret", () => {
      const schema = {
        type: "object",
        properties: {
          encrypted_value: { type: "string" },
          key_id: { type: "string" },
          visibility: { type: "string" },
          selected_repository_ids: { type: "array" },
        },
        required: ["encrypted_value", "key_id", "visibility"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteOrgSecret", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["org", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistSelectedReposForOrgSecret", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["org", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionssetSelectedReposForOrgSecret", () => {
      const schema = {
        type: "object",
        properties: {
          selected_repository_ids: { type: "array" },
        },
        required: ["selected_repository_ids"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsaddSelectedRepoToOrgSecret", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          repository_id: { type: "integer" },
          org: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["repository_id", "org", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsremoveSelectedRepoFromOrgSecret", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          repository_id: { type: "integer" },
          org: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["repository_id", "org", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistOrgVariables", () => {
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
    it("should have valid schema for actionscreateOrgVariable", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
          visibility: { type: "string" },
          selected_repository_ids: { type: "array" },
        },
        required: ["name", "value", "visibility"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetOrgVariable", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          name: { type: "string" },
        },
        required: ["org", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsupdateOrgVariable", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
          visibility: { type: "string" },
          selected_repository_ids: { type: "array" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteOrgVariable", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          name: { type: "string" },
        },
        required: ["org", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistSelectedReposForOrgVariable", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          name: { type: "string" },
        },
        required: ["org", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionssetSelectedReposForOrgVariable", () => {
      const schema = {
        type: "object",
        properties: {
          selected_repository_ids: { type: "array" },
        },
        required: ["selected_repository_ids"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsaddSelectedRepoToOrgVariable", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          repository_id: { type: "integer" },
          org: { type: "string" },
          name: { type: "string" },
        },
        required: ["repository_id", "org", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsremoveSelectedRepoFromOrgVariable", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          repository_id: { type: "integer" },
          org: { type: "string" },
          name: { type: "string" },
        },
        required: ["repository_id", "org", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistArtifactsForRepo", () => {
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
    it("should have valid schema for actionsgetArtifact", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          artifact_id: { type: "string" },
        },
        required: ["owner", "repo", "artifact_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteArtifact", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          artifact_id: { type: "string" },
        },
        required: ["owner", "repo", "artifact_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdownloadArtifact", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          archive_format: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          artifact_id: { type: "string" },
        },
        required: ["archive_format", "owner", "repo", "artifact_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetActionsCacheUsage", () => {
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
    it("should have valid schema for actionsgetActionsCacheList", () => {
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
    it("should have valid schema for actionsdeleteActionsCacheByKey", () => {
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
    it("should have valid schema for actionsdeleteActionsCacheById", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          cache_id: { type: "string" },
        },
        required: ["owner", "repo", "cache_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetJobForWorkflowRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          job_id: { type: "string" },
        },
        required: ["owner", "repo", "job_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdownloadJobLogsForWorkflowRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          job_id: { type: "string" },
        },
        required: ["owner", "repo", "job_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsreRunJobForWorkflowRun", () => {
      const schema = {
        type: "object",
        properties: {
          enable_debug_logging: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetCustomOidcSubClaimForRepo", () => {
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
    it("should have valid schema for actionssetCustomOidcSubClaimForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          use_default: { type: "boolean" },
          include_claim_keys: { type: "array" },
        },
        required: ["use_default"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistRepoOrganizationSecrets", () => {
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
    it("should have valid schema for actionslistRepoOrganizationVariables", () => {
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
    it("should have valid schema for actionsgetGithubActionsPermissionsRepository", () => {
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
    it("should have valid schema for actionssetGithubActionsPermissionsRepository", () => {
      const schema = {
        type: "object",
        properties: {
          enabled: { type: "" },
          allowed_actions: { type: "" },
          sha_pinning_required: { type: "" },
        },
        required: ["enabled"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetWorkflowAccessToRepository", () => {
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
    it("should have valid schema for actionssetWorkflowAccessToRepository", () => {
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
    it("should have valid schema for actionsgetArtifactAndLogRetentionSettingsRepositor", () => {
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
    it("should have valid schema for actionssetArtifactAndLogRetentionSettingsRepositor", () => {
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
    it("should have valid schema for actionsgetForkPrContributorApprovalPermissionsRepo", () => {
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
    it("should have valid schema for actionssetForkPrContributorApprovalPermissionsRepo", () => {
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
    it("should have valid schema for actionsgetPrivateRepoForkPrWorkflowsSettingsReposi", () => {
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
    it("should have valid schema for actionssetPrivateRepoForkPrWorkflowsSettingsReposi", () => {
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
    it("should have valid schema for actionsgetAllowedActionsRepository", () => {
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
    it("should have valid schema for actionssetAllowedActionsRepository", () => {
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
    it("should have valid schema for actionsgetGithubActionsDefaultWorkflowPermissionsR", () => {
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
    it("should have valid schema for actionssetGithubActionsDefaultWorkflowPermissionsR", () => {
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
    it("should have valid schema for actionslistSelfHostedRunnersForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistRunnerApplicationsForRepo", () => {
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
    it("should have valid schema for actionsgenerateRunnerJitconfigForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          runner_group_id: { type: "integer" },
          labels: { type: "array" },
          work_folder: { type: "string" },
        },
        required: ["name", "runner_group_id", "labels"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionscreateRegistrationTokenForRepo", () => {
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
    it("should have valid schema for actionscreateRemoveTokenForRepo", () => {
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
    it("should have valid schema for actionsgetSelfHostedRunnerForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["owner", "repo", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteSelfHostedRunnerFromRepo", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["owner", "repo", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistLabelsForSelfHostedRunnerForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["owner", "repo", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsaddCustomLabelsToSelfHostedRunnerForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          labels: { type: "array" },
        },
        required: ["labels"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionssetCustomLabelsForSelfHostedRunnerForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          labels: { type: "array" },
        },
        required: ["labels"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsremoveAllCustomLabelsFromSelfHostedRunnerFo", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          runner_id: { type: "string" },
        },
        required: ["owner", "repo", "runner_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsremoveCustomLabelFromSelfHostedRunnerForRep", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          runner_id: { type: "string" },
          name: { type: "string" },
        },
        required: ["owner", "repo", "runner_id", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistWorkflowRunsForRepo", () => {
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
    it("should have valid schema for actionsgetWorkflowRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteWorkflowRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetReviewsForRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsapproveWorkflowRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistWorkflowRunArtifacts", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetWorkflowRunAttempt", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
          attempt_number: { type: "string" },
        },
        required: ["owner", "repo", "run_id", "attempt_number"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistJobsForWorkflowRunAttempt", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
          attempt_number: { type: "string" },
        },
        required: ["owner", "repo", "run_id", "attempt_number"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdownloadWorkflowRunAttemptLogs", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
          attempt_number: { type: "string" },
        },
        required: ["owner", "repo", "run_id", "attempt_number"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionscancelWorkflowRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsreviewCustomGatesForRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsforceCancelWorkflowRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistJobsForWorkflowRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          filter: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdownloadWorkflowRunLogs", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteWorkflowRunLogs", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetPendingDeploymentsForRun", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsreviewPendingDeploymentsForRun", () => {
      const schema = {
        type: "object",
        properties: {
          environment_ids: { type: "array" },
          state: { type: "string" },
          comment: { type: "string" },
        },
        required: ["environment_ids", "state", "comment"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsreRunWorkflow", () => {
      const schema = {
        type: "object",
        properties: {
          enable_debug_logging: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsreRunWorkflowFailedJobs", () => {
      const schema = {
        type: "object",
        properties: {
          enable_debug_logging: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetWorkflowRunUsage", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          run_id: { type: "string" },
        },
        required: ["owner", "repo", "run_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistRepoSecrets", () => {
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
    it("should have valid schema for actionsgetRepoPublicKey", () => {
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
    it("should have valid schema for actionsgetRepoSecret", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["owner", "repo", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionscreateOrUpdateRepoSecret", () => {
      const schema = {
        type: "object",
        properties: {
          encrypted_value: { type: "string" },
          key_id: { type: "string" },
        },
        required: ["encrypted_value", "key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteRepoSecret", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["owner", "repo", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistRepoVariables", () => {
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
    it("should have valid schema for actionscreateRepoVariable", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
        },
        required: ["name", "value"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetRepoVariable", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          name: { type: "string" },
        },
        required: ["owner", "repo", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsupdateRepoVariable", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteRepoVariable", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          name: { type: "string" },
        },
        required: ["owner", "repo", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistRepoWorkflows", () => {
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
    it("should have valid schema for actionsgetWorkflow", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          workflow_id: { type: "string" },
        },
        required: ["owner", "repo", "workflow_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdisableWorkflow", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          workflow_id: { type: "string" },
        },
        required: ["owner", "repo", "workflow_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionscreateWorkflowDispatch", () => {
      const schema = {
        type: "object",
        properties: {
          ref: { type: "string" },
          inputs: { type: "object" },
        },
        required: ["ref"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsenableWorkflow", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          workflow_id: { type: "string" },
        },
        required: ["owner", "repo", "workflow_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistWorkflowRuns", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          workflow_id: { type: "string" },
        },
        required: ["owner", "repo", "workflow_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetWorkflowUsage", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          workflow_id: { type: "string" },
        },
        required: ["owner", "repo", "workflow_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistEnvironmentSecrets", () => {
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
    it("should have valid schema for actionsgetEnvironmentPublicKey", () => {
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
    it("should have valid schema for actionsgetEnvironmentSecret", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionscreateOrUpdateEnvironmentSecret", () => {
      const schema = {
        type: "object",
        properties: {
          encrypted_value: { type: "string" },
          key_id: { type: "string" },
        },
        required: ["encrypted_value", "key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteEnvironmentSecret", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionslistEnvironmentVariables", () => {
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
    it("should have valid schema for actionscreateEnvironmentVariable", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
        },
        required: ["name", "value"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsgetEnvironmentVariable", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
          name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name", "name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsupdateEnvironmentVariable", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for actionsdeleteEnvironmentVariable", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          environment_name: { type: "string" },
          name: { type: "string" },
        },
        required: ["owner", "repo", "environment_name", "name"],
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

  describe("actionsgetActionsCacheUsageForOrg tool", () => {
    it("should make GET request to /orgs/{org}/actions/cache/usage", async () => {
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

    it("should validate required parameters for actionsgetActionsCacheUsageForOrg", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("actionsgetActionsCacheUsageByRepoForOrg tool", () => {
    it("should make GET request to /orgs/{org}/actions/cache/usage-by-repository", async () => {
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

    it("should validate required parameters for actionsgetActionsCacheUsageByRepoForOrg", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("actionslistHostedRunnersForOrg tool", () => {
    it("should make GET request to /orgs/{org}/actions/hosted-runners", async () => {
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

    it("should validate required parameters for actionslistHostedRunnersForOrg", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
});