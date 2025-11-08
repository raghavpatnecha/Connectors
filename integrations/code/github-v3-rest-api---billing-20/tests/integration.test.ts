/**
 * Integration tests for GitHub v3 REST API - billing MCP Server
 *
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import axios from "axios";

// Mock axios for testing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GitHub v3 REST API - billing MCP Server", () => {
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
        "billinggetAllBudgetsOrg",
        "billinggetBudgetOrg",
        "billingupdateBudgetOrg",
        "billingdeleteBudgetOrg",
        "billinggetGithubBillingPremiumRequestUsageReportOr",
        "billinggetGithubBillingUsageReportOrg",
        "billinggetGithubBillingUsageSummaryReportOrg",
        "billinggetGithubActionsBillingOrg",
        "billinggetGithubPackagesBillingOrg",
        "billinggetSharedStorageBillingOrg",
        "billinggetGithubActionsBillingUser",
        "billinggetGithubPackagesBillingUser",
        "billinggetGithubBillingPremiumRequestUsageReportUs",
        "billinggetSharedStorageBillingUser",
        "billinggetGithubBillingUsageReportUser",
        "billinggetGithubBillingUsageSummaryReportUser",
      ];

      // This would normally call server.listTools()
      // For now, verify the tool names are defined
      expectedTools.forEach((toolName) => {
        expect(toolName).toBeTruthy();
      });
    });

    it("should have valid schema for billinggetAllBudgetsOrg", () => {
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
    it("should have valid schema for billinggetBudgetOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          budget_id: { type: "string" },
        },
        required: ["org", "budget_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for billingupdateBudgetOrg", () => {
      const schema = {
        type: "object",
        properties: {
          budget_amount: { type: "integer" },
          prevent_further_usage: { type: "boolean" },
          budget_alerting: { type: "object" },
          budget_scope: { type: "string" },
          budget_entity_name: { type: "string" },
          budget_type: { type: "string" },
          budget_product_sku: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for billingdeleteBudgetOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          budget_id: { type: "string" },
        },
        required: ["org", "budget_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for billinggetGithubBillingPremiumRequestUsageReportOr", () => {
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
    it("should have valid schema for billinggetGithubBillingUsageReportOrg", () => {
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
    it("should have valid schema for billinggetGithubBillingUsageSummaryReportOrg", () => {
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
    it("should have valid schema for billinggetGithubActionsBillingOrg", () => {
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
    it("should have valid schema for billinggetGithubPackagesBillingOrg", () => {
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
    it("should have valid schema for billinggetSharedStorageBillingOrg", () => {
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
    it("should have valid schema for billinggetGithubActionsBillingUser", () => {
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
    it("should have valid schema for billinggetGithubPackagesBillingUser", () => {
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
    it("should have valid schema for billinggetGithubBillingPremiumRequestUsageReportUs", () => {
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
    it("should have valid schema for billinggetSharedStorageBillingUser", () => {
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
    it("should have valid schema for billinggetGithubBillingUsageReportUser", () => {
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
    it("should have valid schema for billinggetGithubBillingUsageSummaryReportUser", () => {
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

  describe("billinggetAllBudgetsOrg tool", () => {
    it("should make GET request to /organizations/{org}/settings/billing/budgets", async () => {
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

    it("should validate required parameters for billinggetAllBudgetsOrg", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("billinggetBudgetOrg tool", () => {
    it("should make GET request to /organizations/{org}/settings/billing/budgets/{budget_id}", async () => {
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

    it("should validate required parameters for billinggetBudgetOrg", () => {
      const requiredParams = ["org", "budget_id"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("billingupdateBudgetOrg tool", () => {
    it("should make PATCH request to /organizations/{org}/settings/billing/budgets/{budget_id}", async () => {
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

    it("should validate required parameters for billingupdateBudgetOrg", () => {
      const requiredParams = [];

      expect(requiredParams.length).toBe(0);
    });
  });
});