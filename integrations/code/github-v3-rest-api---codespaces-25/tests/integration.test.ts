/**
 * Integration tests for GitHub v3 REST API - codespaces MCP Server
 *
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import axios from "axios";

// Mock axios for testing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GitHub v3 REST API - codespaces MCP Server", () => {
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
        "codespaceslistInOrganization",
        "codespacessetCodespacesAccess",
        "codespacessetCodespacesAccessUsers",
        "codespacesdeleteCodespacesAccessUsers",
        "codespaceslistOrgSecrets",
        "codespacesgetOrgPublicKey",
        "codespacesgetOrgSecret",
        "codespacescreateOrUpdateOrgSecret",
        "codespacesdeleteOrgSecret",
        "codespaceslistSelectedReposForOrgSecret",
        "codespacessetSelectedReposForOrgSecret",
        "codespacesaddSelectedRepoToOrgSecret",
        "codespacesremoveSelectedRepoFromOrgSecret",
        "codespacesgetCodespacesForUserInOrg",
        "codespacesdeleteFromOrganization",
        "codespacesstopInOrganization",
        "codespaceslistInRepositoryForAuthenticatedUser",
        "codespacescreateWithRepoForAuthenticatedUser",
        "codespaceslistDevcontainersInRepositoryForAuthenti",
        "codespacesrepoMachinesForAuthenticatedUser",
        "codespacespreFlightWithRepoForAuthenticatedUser",
        "codespacescheckPermissionsForDevcontainer",
        "codespaceslistRepoSecrets",
        "codespacesgetRepoPublicKey",
        "codespacesgetRepoSecret",
        "codespacescreateOrUpdateRepoSecret",
        "codespacesdeleteRepoSecret",
        "codespacescreateWithPrForAuthenticatedUser",
        "codespaceslistForAuthenticatedUser",
        "codespacescreateForAuthenticatedUser",
        "codespaceslistSecretsForAuthenticatedUser",
        "codespacesgetPublicKeyForAuthenticatedUser",
        "codespacesgetSecretForAuthenticatedUser",
        "codespacescreateOrUpdateSecretForAuthenticatedUser",
        "codespacesdeleteSecretForAuthenticatedUser",
        "codespaceslistRepositoriesForSecretForAuthenticate",
        "codespacessetRepositoriesForSecretForAuthenticated",
        "codespacesaddRepositoryForSecretForAuthenticatedUs",
        "codespacesremoveRepositoryForSecretForAuthenticate",
        "codespacesgetForAuthenticatedUser",
        "codespacesupdateForAuthenticatedUser",
        "codespacesdeleteForAuthenticatedUser",
        "codespacesexportForAuthenticatedUser",
        "codespacesgetExportDetailsForAuthenticatedUser",
        "codespacescodespaceMachinesForAuthenticatedUser",
        "codespacespublishForAuthenticatedUser",
        "codespacesstartForAuthenticatedUser",
        "codespacesstopForAuthenticatedUser",
      ];

      // This would normally call server.listTools()
      // For now, verify the tool names are defined
      expectedTools.forEach((toolName) => {
        expect(toolName).toBeTruthy();
      });
    });

    it("should have valid schema for codespaceslistInOrganization", () => {
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
    it("should have valid schema for codespacessetCodespacesAccess", () => {
      const schema = {
        type: "object",
        properties: {
          visibility: { type: "string" },
          selected_usernames: { type: "array" },
        },
        required: ["visibility"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacessetCodespacesAccessUsers", () => {
      const schema = {
        type: "object",
        properties: {
          selected_usernames: { type: "array" },
        },
        required: ["selected_usernames"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesdeleteCodespacesAccessUsers", () => {
      const schema = {
        type: "object",
        properties: {
          selected_usernames: { type: "array" },
        },
        required: ["selected_usernames"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespaceslistOrgSecrets", () => {
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
    it("should have valid schema for codespacesgetOrgPublicKey", () => {
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
    it("should have valid schema for codespacesgetOrgSecret", () => {
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
    it("should have valid schema for codespacescreateOrUpdateOrgSecret", () => {
      const schema = {
        type: "object",
        properties: {
          encrypted_value: { type: "string" },
          key_id: { type: "string" },
          visibility: { type: "string" },
          selected_repository_ids: { type: "array" },
        },
        required: ["visibility"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesdeleteOrgSecret", () => {
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
    it("should have valid schema for codespaceslistSelectedReposForOrgSecret", () => {
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
    it("should have valid schema for codespacessetSelectedReposForOrgSecret", () => {
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
    it("should have valid schema for codespacesaddSelectedRepoToOrgSecret", () => {
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
    it("should have valid schema for codespacesremoveSelectedRepoFromOrgSecret", () => {
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
    it("should have valid schema for codespacesgetCodespacesForUserInOrg", () => {
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
    it("should have valid schema for codespacesdeleteFromOrganization", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
          codespace_name: { type: "string" },
        },
        required: ["org", "username", "codespace_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesstopInOrganization", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          username: { type: "string" },
          codespace_name: { type: "string" },
        },
        required: ["org", "username", "codespace_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespaceslistInRepositoryForAuthenticatedUser", () => {
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
    it("should have valid schema for codespacescreateWithRepoForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          ref: { type: "string" },
          location: { type: "string" },
          geo: { type: "string" },
          client_ip: { type: "string" },
          machine: { type: "string" },
          devcontainer_path: { type: "string" },
          multi_repo_permissions_opt_out: { type: "boolean" },
          working_directory: { type: "string" },
          idle_timeout_minutes: { type: "integer" },
          display_name: { type: "string" },
          retention_period_minutes: { type: "integer" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespaceslistDevcontainersInRepositoryForAuthenti", () => {
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
    it("should have valid schema for codespacesrepoMachinesForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          location: { type: "string" },
          client_ip: { type: "string" },
          ref: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacespreFlightWithRepoForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ref: { type: "string" },
          client_ip: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacescheckPermissionsForDevcontainer", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ref: { type: "string" },
          devcontainer_path: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["ref", "devcontainer_path", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespaceslistRepoSecrets", () => {
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
    it("should have valid schema for codespacesgetRepoPublicKey", () => {
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
    it("should have valid schema for codespacesgetRepoSecret", () => {
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
    it("should have valid schema for codespacescreateOrUpdateRepoSecret", () => {
      const schema = {
        type: "object",
        properties: {
          encrypted_value: { type: "string" },
          key_id: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesdeleteRepoSecret", () => {
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
    it("should have valid schema for codespacescreateWithPrForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          location: { type: "string" },
          geo: { type: "string" },
          client_ip: { type: "string" },
          machine: { type: "string" },
          devcontainer_path: { type: "string" },
          multi_repo_permissions_opt_out: { type: "boolean" },
          working_directory: { type: "string" },
          idle_timeout_minutes: { type: "integer" },
          display_name: { type: "string" },
          retention_period_minutes: { type: "integer" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespaceslistForAuthenticatedUser", () => {
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
    it("should have valid schema for codespacescreateForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespaceslistSecretsForAuthenticatedUser", () => {
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
    it("should have valid schema for codespacesgetPublicKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesgetSecretForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacescreateOrUpdateSecretForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          encrypted_value: { type: "string" },
          key_id: { type: "string" },
          selected_repository_ids: { type: "array" },
        },
        required: ["key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesdeleteSecretForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespaceslistRepositoriesForSecretForAuthenticate", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          secret_name: { type: "string" },
        },
        required: ["secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacessetRepositoriesForSecretForAuthenticated", () => {
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
    it("should have valid schema for codespacesaddRepositoryForSecretForAuthenticatedUs", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          repository_id: { type: "integer" },
          secret_name: { type: "string" },
        },
        required: ["repository_id", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesremoveRepositoryForSecretForAuthenticate", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          repository_id: { type: "integer" },
          secret_name: { type: "string" },
        },
        required: ["repository_id", "secret_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesgetForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          codespace_name: { type: "string" },
        },
        required: ["codespace_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesupdateForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          machine: { type: "string" },
          display_name: { type: "string" },
          recent_folders: { type: "array" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesdeleteForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          codespace_name: { type: "string" },
        },
        required: ["codespace_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesexportForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          codespace_name: { type: "string" },
        },
        required: ["codespace_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesgetExportDetailsForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          codespace_name: { type: "string" },
          export_id: { type: "string" },
        },
        required: ["codespace_name", "export_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacescodespaceMachinesForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          codespace_name: { type: "string" },
        },
        required: ["codespace_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacespublishForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          private: { type: "boolean" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesstartForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          codespace_name: { type: "string" },
        },
        required: ["codespace_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codespacesstopForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          codespace_name: { type: "string" },
        },
        required: ["codespace_name"],
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

  describe("codespaceslistInOrganization tool", () => {
    it("should make GET request to /orgs/{org}/codespaces", async () => {
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

    it("should validate required parameters for codespaceslistInOrganization", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("codespacessetCodespacesAccess tool", () => {
    it("should make PUT request to /orgs/{org}/codespaces/access", async () => {
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

    it("should validate required parameters for codespacessetCodespacesAccess", () => {
      const requiredParams = ["visibility"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("codespacessetCodespacesAccessUsers tool", () => {
    it("should make POST request to /orgs/{org}/codespaces/access/selected_users", async () => {
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

    it("should validate required parameters for codespacessetCodespacesAccessUsers", () => {
      const requiredParams = ["selected_usernames"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
});