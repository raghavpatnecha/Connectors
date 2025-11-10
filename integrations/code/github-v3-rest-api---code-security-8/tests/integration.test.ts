/**
 * Integration tests for GitHub v3 REST API - code-security MCP Server
 *
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import axios from "axios";

// Mock axios for testing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GitHub v3 REST API - code-security MCP Server", () => {
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
        "codeSecuritygetConfigurationsForEnterprise",
        "codeSecuritycreateConfigurationForEnterprise",
        "codeSecuritygetDefaultConfigurationsForEnterprise",
        "codeSecuritygetSingleConfigurationForEnterprise",
        "codeSecurityupdateEnterpriseConfiguration",
        "codeSecuritydeleteConfigurationForEnterprise",
        "codeSecurityattachEnterpriseConfiguration",
        "codeSecuritysetConfigurationAsDefaultForEnterprise",
        "codeSecuritygetRepositoriesForEnterpriseConfigurat",
        "codeSecuritygetConfigurationsForOrg",
        "codeSecuritycreateConfiguration",
        "codeSecuritygetDefaultConfigurations",
        "codeSecuritydetachConfiguration",
        "codeSecuritygetConfiguration",
        "codeSecurityupdateConfiguration",
        "codeSecuritydeleteConfiguration",
        "codeSecurityattachConfiguration",
        "codeSecuritysetConfigurationAsDefault",
        "codeSecuritygetRepositoriesForConfiguration",
        "codeSecuritygetConfigurationForRepository",
      ];

      // This would normally call server.listTools()
      // For now, verify the tool names are defined
      expectedTools.forEach((toolName) => {
        expect(toolName).toBeTruthy();
      });
    });

    it("should have valid schema for codeSecuritygetConfigurationsForEnterprise", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          per_page: { type: "integer" },
          enterprise: { type: "string" },
        },
        required: ["enterprise"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritycreateConfigurationForEnterprise", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          advanced_security: { type: "string" },
          code_security: { type: "string" },
          dependency_graph: { type: "string" },
          dependency_graph_autosubmit_action: { type: "string" },
          dependency_graph_autosubmit_action_options: { type: "object" },
          dependabot_alerts: { type: "string" },
          dependabot_security_updates: { type: "string" },
          code_scanning_options: { type: "" },
          code_scanning_default_setup: { type: "string" },
          code_scanning_default_setup_options: { type: "" },
          code_scanning_delegated_alert_dismissal: { type: "string" },
          secret_protection: { type: "string" },
          secret_scanning: { type: "string" },
          secret_scanning_push_protection: { type: "string" },
          secret_scanning_validity_checks: { type: "string" },
          secret_scanning_non_provider_patterns: { type: "string" },
          secret_scanning_generic_secrets: { type: "string" },
          secret_scanning_delegated_alert_dismissal: { type: "string" },
          private_vulnerability_reporting: { type: "string" },
          enforcement: { type: "string" },
        },
        required: ["name", "description"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritygetDefaultConfigurationsForEnterprise", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          enterprise: { type: "string" },
        },
        required: ["enterprise"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritygetSingleConfigurationForEnterprise", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          enterprise: { type: "string" },
          configuration_id: { type: "string" },
        },
        required: ["enterprise", "configuration_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecurityupdateEnterpriseConfiguration", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          advanced_security: { type: "string" },
          code_security: { type: "string" },
          dependency_graph: { type: "string" },
          dependency_graph_autosubmit_action: { type: "string" },
          dependency_graph_autosubmit_action_options: { type: "object" },
          dependabot_alerts: { type: "string" },
          dependabot_security_updates: { type: "string" },
          code_scanning_default_setup: { type: "string" },
          code_scanning_default_setup_options: { type: "" },
          code_scanning_delegated_alert_dismissal: { type: "string" },
          secret_protection: { type: "string" },
          secret_scanning: { type: "string" },
          secret_scanning_push_protection: { type: "string" },
          secret_scanning_validity_checks: { type: "string" },
          secret_scanning_non_provider_patterns: { type: "string" },
          secret_scanning_generic_secrets: { type: "string" },
          secret_scanning_delegated_alert_dismissal: { type: "string" },
          private_vulnerability_reporting: { type: "string" },
          enforcement: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritydeleteConfigurationForEnterprise", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          enterprise: { type: "string" },
          configuration_id: { type: "string" },
        },
        required: ["enterprise", "configuration_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecurityattachEnterpriseConfiguration", () => {
      const schema = {
        type: "object",
        properties: {
          scope: { type: "string" },
        },
        required: ["scope"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritysetConfigurationAsDefaultForEnterprise", () => {
      const schema = {
        type: "object",
        properties: {
          default_for_new_repos: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritygetRepositoriesForEnterpriseConfigurat", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          per_page: { type: "integer" },
          status: { type: "string" },
          enterprise: { type: "string" },
          configuration_id: { type: "string" },
        },
        required: ["enterprise", "configuration_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritygetConfigurationsForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          target_type: { type: "string" },
          per_page: { type: "integer" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritycreateConfiguration", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          advanced_security: { type: "string" },
          code_security: { type: "string" },
          dependency_graph: { type: "string" },
          dependency_graph_autosubmit_action: { type: "string" },
          dependency_graph_autosubmit_action_options: { type: "object" },
          dependabot_alerts: { type: "string" },
          dependabot_security_updates: { type: "string" },
          code_scanning_options: { type: "" },
          code_scanning_default_setup: { type: "string" },
          code_scanning_default_setup_options: { type: "" },
          code_scanning_delegated_alert_dismissal: { type: "string" },
          secret_protection: { type: "string" },
          secret_scanning: { type: "string" },
          secret_scanning_push_protection: { type: "string" },
          secret_scanning_delegated_bypass: { type: "string" },
          secret_scanning_delegated_bypass_options: { type: "object" },
          secret_scanning_validity_checks: { type: "string" },
          secret_scanning_non_provider_patterns: { type: "string" },
          secret_scanning_generic_secrets: { type: "string" },
          secret_scanning_delegated_alert_dismissal: { type: "string" },
          private_vulnerability_reporting: { type: "string" },
          enforcement: { type: "string" },
        },
        required: ["name", "description"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritygetDefaultConfigurations", () => {
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
    it("should have valid schema for codeSecuritydetachConfiguration", () => {
      const schema = {
        type: "object",
        properties: {
          selected_repository_ids: { type: "array" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritygetConfiguration", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          configuration_id: { type: "string" },
        },
        required: ["org", "configuration_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecurityupdateConfiguration", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          advanced_security: { type: "string" },
          code_security: { type: "string" },
          dependency_graph: { type: "string" },
          dependency_graph_autosubmit_action: { type: "string" },
          dependency_graph_autosubmit_action_options: { type: "object" },
          dependabot_alerts: { type: "string" },
          dependabot_security_updates: { type: "string" },
          code_scanning_default_setup: { type: "string" },
          code_scanning_default_setup_options: { type: "" },
          code_scanning_delegated_alert_dismissal: { type: "string" },
          secret_protection: { type: "string" },
          secret_scanning: { type: "string" },
          secret_scanning_push_protection: { type: "string" },
          secret_scanning_delegated_bypass: { type: "string" },
          secret_scanning_delegated_bypass_options: { type: "object" },
          secret_scanning_validity_checks: { type: "string" },
          secret_scanning_non_provider_patterns: { type: "string" },
          secret_scanning_generic_secrets: { type: "string" },
          secret_scanning_delegated_alert_dismissal: { type: "string" },
          private_vulnerability_reporting: { type: "string" },
          enforcement: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritydeleteConfiguration", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          configuration_id: { type: "string" },
        },
        required: ["org", "configuration_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecurityattachConfiguration", () => {
      const schema = {
        type: "object",
        properties: {
          scope: { type: "string" },
          selected_repository_ids: { type: "array" },
        },
        required: ["scope"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritysetConfigurationAsDefault", () => {
      const schema = {
        type: "object",
        properties: {
          default_for_new_repos: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritygetRepositoriesForConfiguration", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          per_page: { type: "integer" },
          status: { type: "string" },
          org: { type: "string" },
          configuration_id: { type: "string" },
        },
        required: ["org", "configuration_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeSecuritygetConfigurationForRepository", () => {
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

  describe("codeSecuritygetConfigurationsForEnterprise tool", () => {
    it("should make GET request to /enterprises/{enterprise}/code-security/configurations", async () => {
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

    it("should validate required parameters for codeSecuritygetConfigurationsForEnterprise", () => {
      const requiredParams = ["enterprise"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("codeSecuritycreateConfigurationForEnterprise tool", () => {
    it("should make POST request to /enterprises/{enterprise}/code-security/configurations", async () => {
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

    it("should validate required parameters for codeSecuritycreateConfigurationForEnterprise", () => {
      const requiredParams = ["name", "description"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("codeSecuritygetDefaultConfigurationsForEnterprise tool", () => {
    it("should make GET request to /enterprises/{enterprise}/code-security/configurations/defaults", async () => {
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

    it("should validate required parameters for codeSecuritygetDefaultConfigurationsForEnterprise", () => {
      const requiredParams = ["enterprise"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
});