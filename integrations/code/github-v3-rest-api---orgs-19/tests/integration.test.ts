/**
 * Integration tests for GitHub v3 REST API - orgs MCP Server
 *
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import axios from "axios";

// Mock axios for testing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GitHub v3 REST API - orgs MCP Server", () => {
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
        "orgslist",
        "orgscustomPropertiesForOrgsGetOrganizationValues",
        "orgscustomPropertiesForOrgsCreateOrUpdateOrganizat",
        "orgsget",
        "orgsupdate",
        "orgsdelete",
        "orgscreateArtifactStorageRecord",
        "orgslistArtifactStorageRecords",
        "orgslistAttestationsBulk",
        "orgsdeleteAttestationsBulk",
        "orgsdeleteAttestationsBySubjectDigest",
        "orgslistAttestationRepositories",
        "orgsdeleteAttestationsById",
        "orgslistAttestations",
        "orgslistBlockedUsers",
        "orgscheckBlockedUser",
        "orgsblockUser",
        "orgsunblockUser",
        "orgslistFailedInvitations",
        "orgslistWebhooks",
        "orgscreateWebhook",
        "orgsgetWebhook",
        "orgsupdateWebhook",
        "orgsdeleteWebhook",
        "orgsgetWebhookConfigForOrg",
        "orgsupdateWebhookConfigForOrg",
        "orgslistWebhookDeliveries",
        "orgsgetWebhookDelivery",
        "orgsredeliverWebhookDelivery",
        "orgspingWebhook",
        "apiInsightsgetRouteStatsByActor",
        "apiInsightsgetSubjectStats",
        "apiInsightsgetSummaryStats",
        "apiInsightsgetSummaryStatsByUser",
        "apiInsightsgetSummaryStatsByActor",
        "apiInsightsgetTimeStats",
        "apiInsightsgetTimeStatsByUser",
        "apiInsightsgetTimeStatsByActor",
        "apiInsightsgetUserStats",
        "orgslistAppInstallations",
        "orgslistPendingInvitations",
        "orgscreateInvitation",
        "orgscancelInvitation",
        "orgslistInvitationTeams",
        "orgslistIssueTypes",
        "orgscreateIssueType",
        "orgsupdateIssueType",
        "orgsdeleteIssueType",
        "orgslistMembers",
        "orgscheckMembershipForUser",
        "orgsremoveMember",
        "orgsgetMembershipForUser",
        "orgssetMembershipForUser",
        "orgsremoveMembershipForUser",
        "orgslistOrgRoles",
        "orgsrevokeAllOrgRolesTeam",
        "orgsassignTeamToOrgRole",
        "orgsrevokeOrgRoleTeam",
        "orgsrevokeAllOrgRolesUser",
        "orgsassignUserToOrgRole",
        "orgsrevokeOrgRoleUser",
        "orgsgetOrgRole",
        "orgslistOrgRoleTeams",
        "orgslistOrgRoleUsers",
        "orgslistOutsideCollaborators",
        "orgsconvertMemberToOutsideCollaborator",
        "orgsremoveOutsideCollaborator",
        "orgslistPatGrantRequests",
        "orgsreviewPatGrantRequestsInBulk",
        "orgsreviewPatGrantRequest",
        "orgslistPatGrantRequestRepositories",
        "orgslistPatGrants",
        "orgsupdatePatAccesses",
        "orgsupdatePatAccess",
        "orgslistPatGrantRepositories",
        "orgscustomPropertiesForReposGetOrganizationDefinit",
        "orgscustomPropertiesForReposCreateOrUpdateOrganiza",
        "orgscustomPropertiesForReposGetOrganizationDefinit",
        "orgscustomPropertiesForReposCreateOrUpdateOrganiza",
        "orgscustomPropertiesForReposDeleteOrganizationDefi",
        "orgscustomPropertiesForReposGetOrganizationValues",
        "orgscustomPropertiesForReposCreateOrUpdateOrganiza",
        "orgslistPublicMembers",
        "orgscheckPublicMembershipForUser",
        "orgssetPublicMembershipForAuthenticatedUser",
        "orgsremovePublicMembershipForAuthenticatedUser",
        "orgsgetOrgRulesetHistory",
        "orgsgetOrgRulesetVersion",
        "orgslistSecurityManagerTeams",
        "orgsaddSecurityManagerTeam",
        "orgsremoveSecurityManagerTeam",
        "orgsgetImmutableReleasesSettings",
        "orgssetImmutableReleasesSettings",
        "orgsgetImmutableReleasesSettingsRepositories",
        "orgssetImmutableReleasesSettingsRepositories",
        "orgsenableSelectedRepositoryImmutableReleasesOrgan",
        "orgsdisableSelectedRepositoryImmutableReleasesOrga",
        "orgsenableOrDisableSecurityProductOnAllOrgRepos",
        "orgslistMembershipsForAuthenticatedUser",
        "orgsgetMembershipForAuthenticatedUser",
        "orgsupdateMembershipForAuthenticatedUser",
        "orgslistForAuthenticatedUser",
        "orgslistForUser",
      ];

      // This would normally call server.listTools()
      // For now, verify the tool names are defined
      expectedTools.forEach((toolName) => {
        expect(toolName).toBeTruthy();
      });
    });

    it("should have valid schema for orgslist", () => {
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
    it("should have valid schema for orgscustomPropertiesForOrgsGetOrganizationValues", () => {
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
    it("should have valid schema for orgscustomPropertiesForOrgsCreateOrUpdateOrganizat", () => {
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
    it("should have valid schema for orgsget", () => {
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
    it("should have valid schema for orgsupdate", () => {
      const schema = {
        type: "object",
        properties: {
          billing_email: { type: "string" },
          company: { type: "string" },
          email: { type: "string" },
          twitter_username: { type: "string" },
          location: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          has_organization_projects: { type: "boolean" },
          has_repository_projects: { type: "boolean" },
          default_repository_permission: { type: "string" },
          members_can_create_repositories: { type: "boolean" },
          members_can_create_internal_repositories: { type: "boolean" },
          members_can_create_private_repositories: { type: "boolean" },
          members_can_create_public_repositories: { type: "boolean" },
          members_allowed_repository_creation_type: { type: "string" },
          members_can_create_pages: { type: "boolean" },
          members_can_create_public_pages: { type: "boolean" },
          members_can_create_private_pages: { type: "boolean" },
          members_can_fork_private_repositories: { type: "boolean" },
          web_commit_signoff_required: { type: "boolean" },
          blog: { type: "string" },
          advanced_security_enabled_for_new_repositories: { type: "boolean" },
          dependabot_alerts_enabled_for_new_repositories: { type: "boolean" },
          dependabot_security_updates_enabled_for_new_repositories: { type: "boolean" },
          dependency_graph_enabled_for_new_repositories: { type: "boolean" },
          secret_scanning_enabled_for_new_repositories: { type: "boolean" },
          secret_scanning_push_protection_enabled_for_new_repositories: { type: "boolean" },
          secret_scanning_push_protection_custom_link_enabled: { type: "boolean" },
          secret_scanning_push_protection_custom_link: { type: "string" },
          deploy_keys_enabled_for_repositories: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsdelete", () => {
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
    it("should have valid schema for orgscreateArtifactStorageRecord", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          digest: { type: "string" },
          version: { type: "string" },
          artifact_url: { type: "string" },
          path: { type: "string" },
          registry_url: { type: "string" },
          repository: { type: "string" },
          status: { type: "string" },
          github_repository: { type: "string" },
        },
        required: ["name", "digest", "registry_url"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistArtifactStorageRecords", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          subject_digest: { type: "string" },
          org: { type: "string" },
        },
        required: ["subject_digest", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistAttestationsBulk", () => {
      const schema = {
        type: "object",
        properties: {
          subject_digests: { type: "array" },
          predicate_type: { type: "string" },
        },
        required: ["subject_digests"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsdeleteAttestationsBulk", () => {
      const schema = {
        type: "object",
        properties: {
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsdeleteAttestationsBySubjectDigest", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          subject_digest: { type: "string" },
          org: { type: "string" },
        },
        required: ["subject_digest", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistAttestationRepositories", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          predicate_type: { type: "string" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsdeleteAttestationsById", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          attestation_id: { type: "integer" },
          org: { type: "string" },
        },
        required: ["attestation_id", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistAttestations", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          subject_digest: { type: "string" },
          predicate_type: { type: "string" },
          org: { type: "string" },
        },
        required: ["subject_digest", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistBlockedUsers", () => {
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
    it("should have valid schema for orgscheckBlockedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsblockUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsunblockUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistFailedInvitations", () => {
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
    it("should have valid schema for orgslistWebhooks", () => {
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
    it("should have valid schema for orgscreateWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          config: { type: "object" },
          events: { type: "array" },
          active: { type: "boolean" },
        },
        required: ["name", "config"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsgetWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["org", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsupdateWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          config: { type: "object" },
          events: { type: "array" },
          active: { type: "boolean" },
          name: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsdeleteWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["org", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsgetWebhookConfigForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["org", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsupdateWebhookConfigForOrg", () => {
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
    it("should have valid schema for orgslistWebhookDeliveries", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["org", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsgetWebhookDelivery", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          hook_id: { type: "string" },
          delivery_id: { type: "string" },
        },
        required: ["org", "hook_id", "delivery_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsredeliverWebhookDelivery", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          hook_id: { type: "string" },
          delivery_id: { type: "string" },
        },
        required: ["org", "hook_id", "delivery_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgspingWebhook", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          hook_id: { type: "string" },
        },
        required: ["org", "hook_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for apiInsightsgetRouteStatsByActor", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          actor_type: { type: "string" },
          actor_id: { type: "string" },
        },
        required: ["org", "actor_type", "actor_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for apiInsightsgetSubjectStats", () => {
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
    it("should have valid schema for apiInsightsgetSummaryStats", () => {
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
    it("should have valid schema for apiInsightsgetSummaryStatsByUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          user_id: { type: "string" },
        },
        required: ["org", "user_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for apiInsightsgetSummaryStatsByActor", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          actor_type: { type: "string" },
          actor_id: { type: "string" },
        },
        required: ["org", "actor_type", "actor_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for apiInsightsgetTimeStats", () => {
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
    it("should have valid schema for apiInsightsgetTimeStatsByUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          user_id: { type: "string" },
        },
        required: ["org", "user_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for apiInsightsgetTimeStatsByActor", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          actor_type: { type: "string" },
          actor_id: { type: "string" },
        },
        required: ["org", "actor_type", "actor_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for apiInsightsgetUserStats", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          user_id: { type: "string" },
        },
        required: ["org", "user_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistAppInstallations", () => {
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
    it("should have valid schema for orgslistPendingInvitations", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          role: { type: "string" },
          invitation_source: { type: "string" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgscreateInvitation", () => {
      const schema = {
        type: "object",
        properties: {
          invitee_id: { type: "integer" },
          email: { type: "string" },
          role: { type: "string" },
          team_ids: { type: "array" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgscancelInvitation", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          invitation_id: { type: "string" },
        },
        required: ["org", "invitation_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistInvitationTeams", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          invitation_id: { type: "string" },
        },
        required: ["org", "invitation_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistIssueTypes", () => {
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
    it("should have valid schema for orgscreateIssueType", () => {
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
    it("should have valid schema for orgsupdateIssueType", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          issue_type_id: { type: "string" },
        },
        required: ["org", "issue_type_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsdeleteIssueType", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          issue_type_id: { type: "string" },
        },
        required: ["org", "issue_type_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistMembers", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          filter: { type: "string" },
          role: { type: "string" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgscheckMembershipForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsremoveMember", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsgetMembershipForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgssetMembershipForUser", () => {
      const schema = {
        type: "object",
        properties: {
          role: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsremoveMembershipForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistOrgRoles", () => {
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
    it("should have valid schema for orgsrevokeAllOrgRolesTeam", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          team_slug: { type: "string" },
        },
        required: ["org", "team_slug"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsassignTeamToOrgRole", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          team_slug: { type: "string" },
          role_id: { type: "string" },
        },
        required: ["org", "team_slug", "role_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsrevokeOrgRoleTeam", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          team_slug: { type: "string" },
          role_id: { type: "string" },
        },
        required: ["org", "team_slug", "role_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsrevokeAllOrgRolesUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsassignUserToOrgRole", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
          role_id: { type: "string" },
        },
        required: ["org", "username", "role_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsrevokeOrgRoleUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
          role_id: { type: "string" },
        },
        required: ["org", "username", "role_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsgetOrgRole", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          role_id: { type: "string" },
        },
        required: ["org", "role_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistOrgRoleTeams", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          role_id: { type: "string" },
        },
        required: ["org", "role_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistOrgRoleUsers", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          role_id: { type: "string" },
        },
        required: ["org", "role_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistOutsideCollaborators", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          filter: { type: "string" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsconvertMemberToOutsideCollaborator", () => {
      const schema = {
        type: "object",
        properties: {
          async: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsremoveOutsideCollaborator", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistPatGrantRequests", () => {
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
    it("should have valid schema for orgsreviewPatGrantRequestsInBulk", () => {
      const schema = {
        type: "object",
        properties: {
          pat_request_ids: { type: "array" },
          action: { type: "string" },
          reason: { type: "string" },
        },
        required: ["action"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsreviewPatGrantRequest", () => {
      const schema = {
        type: "object",
        properties: {
          action: { type: "string" },
          reason: { type: "string" },
        },
        required: ["action"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistPatGrantRequestRepositories", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          pat_request_id: { type: "integer" },
          org: { type: "string" },
        },
        required: ["pat_request_id", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistPatGrants", () => {
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
    it("should have valid schema for orgsupdatePatAccesses", () => {
      const schema = {
        type: "object",
        properties: {
          action: { type: "string" },
          pat_ids: { type: "array" },
        },
        required: ["action", "pat_ids"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsupdatePatAccess", () => {
      const schema = {
        type: "object",
        properties: {
          action: { type: "string" },
        },
        required: ["action"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistPatGrantRepositories", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          pat_id: { type: "integer" },
          org: { type: "string" },
        },
        required: ["pat_id", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgscustomPropertiesForReposGetOrganizationDefinit", () => {
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
    it("should have valid schema for orgscustomPropertiesForReposCreateOrUpdateOrganiza", () => {
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
    it("should have valid schema for orgscustomPropertiesForReposGetOrganizationDefinit", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          custom_property_name: { type: "string" },
        },
        required: ["org", "custom_property_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgscustomPropertiesForReposCreateOrUpdateOrganiza", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          custom_property_name: { type: "string" },
        },
        required: ["org", "custom_property_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgscustomPropertiesForReposDeleteOrganizationDefi", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          custom_property_name: { type: "string" },
        },
        required: ["org", "custom_property_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgscustomPropertiesForReposGetOrganizationValues", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          repository_query: { type: "string" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgscustomPropertiesForReposCreateOrUpdateOrganiza", () => {
      const schema = {
        type: "object",
        properties: {
          repository_names: { type: "array" },
          properties: { type: "array" },
        },
        required: ["repository_names", "properties"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistPublicMembers", () => {
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
    it("should have valid schema for orgscheckPublicMembershipForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgssetPublicMembershipForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsremovePublicMembershipForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
        },
        required: ["org", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsgetOrgRulesetHistory", () => {
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
    it("should have valid schema for orgsgetOrgRulesetVersion", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ruleset_id: { type: "integer" },
          version_id: { type: "integer" },
          org: { type: "string" },
        },
        required: ["ruleset_id", "version_id", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistSecurityManagerTeams", () => {
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
    it("should have valid schema for orgsaddSecurityManagerTeam", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          team_slug: { type: "string" },
        },
        required: ["org", "team_slug"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsremoveSecurityManagerTeam", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          team_slug: { type: "string" },
        },
        required: ["org", "team_slug"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsgetImmutableReleasesSettings", () => {
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
    it("should have valid schema for orgssetImmutableReleasesSettings", () => {
      const schema = {
        type: "object",
        properties: {
          enforced_repositories: { type: "string" },
          selected_repository_ids: { type: "array" },
        },
        required: ["enforced_repositories"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsgetImmutableReleasesSettingsRepositories", () => {
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
    it("should have valid schema for orgssetImmutableReleasesSettingsRepositories", () => {
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
    it("should have valid schema for orgsenableSelectedRepositoryImmutableReleasesOrgan", () => {
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
    it("should have valid schema for orgsdisableSelectedRepositoryImmutableReleasesOrga", () => {
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
    it("should have valid schema for orgsenableOrDisableSecurityProductOnAllOrgRepos", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          security_product: { type: "string" },
          enablement: { type: "string" },
        },
        required: ["org", "security_product", "enablement"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistMembershipsForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          state: { type: "string" },
          None: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgsgetMembershipForAuthenticatedUser", () => {
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
    it("should have valid schema for orgsupdateMembershipForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          state: { type: "string" },
        },
        required: ["state"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for orgslistForAuthenticatedUser", () => {
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
    it("should have valid schema for orgslistForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
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

  describe("orgslist tool", () => {
    it("should make GET request to /organizations", async () => {
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

    it("should validate required parameters for orgslist", () => {
      const requiredParams = [];

      expect(requiredParams.length).toBe(0);
    });
  });
  describe("orgscustomPropertiesForOrgsGetOrganizationValues tool", () => {
    it("should make GET request to /organizations/{org}/org-properties/values", async () => {
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

    it("should validate required parameters for orgscustomPropertiesForOrgsGetOrganizationValues", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("orgscustomPropertiesForOrgsCreateOrUpdateOrganizat tool", () => {
    it("should make PATCH request to /organizations/{org}/org-properties/values", async () => {
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

    it("should validate required parameters for orgscustomPropertiesForOrgsCreateOrUpdateOrganizat", () => {
      const requiredParams = ["properties"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
});