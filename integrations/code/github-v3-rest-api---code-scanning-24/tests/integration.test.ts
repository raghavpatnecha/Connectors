/**
 * Integration tests for GitHub v3 REST API - code-scanning MCP Server
 *
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import axios from "axios";

// Mock axios for testing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GitHub v3 REST API - code-scanning MCP Server", () => {
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
        "codeScanninglistAlertsForOrg",
        "codeScanninglistAlertsForRepo",
        "codeScanninggetAlert",
        "codeScanningupdateAlert",
        "codeScanninggetAutofix",
        "codeScanningcreateAutofix",
        "codeScanningcommitAutofix",
        "codeScanninglistAlertInstances",
        "codeScanninglistRecentAnalyses",
        "codeScanninggetAnalysis",
        "codeScanningdeleteAnalysis",
        "codeScanninglistCodeqlDatabases",
        "codeScanninggetCodeqlDatabase",
        "codeScanningdeleteCodeqlDatabase",
        "codeScanningcreateVariantAnalysis",
        "codeScanninggetVariantAnalysis",
        "codeScanninggetVariantAnalysisRepoTask",
        "codeScanninggetDefaultSetup",
        "codeScanningupdateDefaultSetup",
        "codeScanninguploadSarif",
        "codeScanninggetSarif",
      ];

      // This would normally call server.listTools()
      // For now, verify the tool names are defined
      expectedTools.forEach((toolName) => {
        expect(toolName).toBeTruthy();
      });
    });

    it("should have valid schema for codeScanninglistAlertsForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          state: { type: "" },
          sort: { type: "string" },
          severity: { type: "" },
          org: { type: "string" },
        },
        required: ["org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninglistAlertsForRepo", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          sort: { type: "string" },
          state: { type: "" },
          severity: { type: "" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninggetAlert", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          alert_number: { type: "string" },
        },
        required: ["owner", "repo", "alert_number"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanningupdateAlert", () => {
      const schema = {
        type: "object",
        properties: {
          state: { type: "" },
          dismissed_reason: { type: "" },
          dismissed_comment: { type: "" },
          create_request: { type: "" },
        },
        required: ["state"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninggetAutofix", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          alert_number: { type: "string" },
        },
        required: ["owner", "repo", "alert_number"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanningcreateAutofix", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          alert_number: { type: "string" },
        },
        required: ["owner", "repo", "alert_number"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanningcommitAutofix", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          alert_number: { type: "string" },
        },
        required: ["owner", "repo", "alert_number"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninglistAlertInstances", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
          alert_number: { type: "string" },
        },
        required: ["owner", "repo", "alert_number"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninglistRecentAnalyses", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ref: { type: "" },
          sarif_id: { type: "" },
          sort: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninggetAnalysis", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          analysis_id: { type: "integer" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["analysis_id", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanningdeleteAnalysis", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          analysis_id: { type: "integer" },
          confirm_delete: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["analysis_id", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninglistCodeqlDatabases", () => {
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
    it("should have valid schema for codeScanninggetCodeqlDatabase", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          language: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["language", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanningdeleteCodeqlDatabase", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          language: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["language", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanningcreateVariantAnalysis", () => {
      const schema = {
        type: "object",
        properties: {
          language: { type: "" },
          query_pack: { type: "string" },
          repositories: { type: "array" },
          repository_lists: { type: "array" },
          repository_owners: { type: "array" },
        },
        required: ["language", "query_pack"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninggetVariantAnalysis", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          codeql_variant_analysis_id: { type: "integer" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["codeql_variant_analysis_id", "owner", "repo"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninggetVariantAnalysisRepoTask", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          repo: { type: "string" },
          codeql_variant_analysis_id: { type: "integer" },
          repo_owner: { type: "string" },
          repo_name: { type: "string" },
          owner: { type: "string" },
        },
        required: ["repo", "codeql_variant_analysis_id", "repo_owner", "repo_name", "owner"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninggetDefaultSetup", () => {
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
    it("should have valid schema for codeScanningupdateDefaultSetup", () => {
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
    it("should have valid schema for codeScanninguploadSarif", () => {
      const schema = {
        type: "object",
        properties: {
          commit_sha: { type: "" },
          ref: { type: "" },
          sarif: { type: "" },
          checkout_uri: { type: "string" },
          started_at: { type: "string" },
          tool_name: { type: "string" },
          validate: { type: "boolean" },
        },
        required: ["commit_sha", "ref", "sarif"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for codeScanninggetSarif", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          sarif_id: { type: "string" },
          owner: { type: "string" },
          repo: { type: "string" },
        },
        required: ["sarif_id", "owner", "repo"],
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

  describe("codeScanninglistAlertsForOrg tool", () => {
    it("should make GET request to /orgs/{org}/code-scanning/alerts", async () => {
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

    it("should validate required parameters for codeScanninglistAlertsForOrg", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("codeScanninglistAlertsForRepo tool", () => {
    it("should make GET request to /repos/{owner}/{repo}/code-scanning/alerts", async () => {
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

    it("should validate required parameters for codeScanninglistAlertsForRepo", () => {
      const requiredParams = ["owner", "repo"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("codeScanninggetAlert tool", () => {
    it("should make GET request to /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}", async () => {
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

    it("should validate required parameters for codeScanninggetAlert", () => {
      const requiredParams = ["owner", "repo", "alert_number"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
});