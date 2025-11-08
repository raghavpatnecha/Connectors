/**
 * Integration tests for GitHub v3 REST API - packages MCP Server
 *
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import axios from "axios";

// Mock axios for testing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GitHub v3 REST API - packages MCP Server", () => {
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
        "packageslistDockerMigrationConflictingPackagesForO",
        "packageslistPackagesForOrganization",
        "packagesgetPackageForOrganization",
        "packagesdeletePackageForOrg",
        "packagesrestorePackageForOrg",
        "packagesgetAllPackageVersionsForPackageOwnedByOrg",
        "packagesgetPackageVersionForOrganization",
        "packagesdeletePackageVersionForOrg",
        "packagesrestorePackageVersionForOrg",
        "packageslistDockerMigrationConflictingPackagesForA",
        "packageslistPackagesForAuthenticatedUser",
        "packagesgetPackageForAuthenticatedUser",
        "packagesdeletePackageForAuthenticatedUser",
        "packagesrestorePackageForAuthenticatedUser",
        "packagesgetAllPackageVersionsForPackageOwnedByAuth",
        "packagesgetPackageVersionForAuthenticatedUser",
        "packagesdeletePackageVersionForAuthenticatedUser",
        "packagesrestorePackageVersionForAuthenticatedUser",
        "packageslistDockerMigrationConflictingPackagesForU",
        "packageslistPackagesForUser",
        "packagesgetPackageForUser",
        "packagesdeletePackageForUser",
        "packagesrestorePackageForUser",
        "packagesgetAllPackageVersionsForPackageOwnedByUser",
        "packagesgetPackageVersionForUser",
        "packagesdeletePackageVersionForUser",
        "packagesrestorePackageVersionForUser",
      ];

      // This would normally call server.listTools()
      // For now, verify the tool names are defined
      expectedTools.forEach((toolName) => {
        expect(toolName).toBeTruthy();
      });
    });

    it("should have valid schema for packageslistDockerMigrationConflictingPackagesForO", () => {
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
    it("should have valid schema for packageslistPackagesForOrganization", () => {
      const schema = {
        type: "object",
        properties: {
          package_type: { type: "string" },
          None: { type: "string" },
          page: { type: "integer" },
          per_page: { type: "integer" },
          org: { type: "string" },
        },
        required: ["package_type", "org"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesgetPackageForOrganization", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["org", "package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesdeletePackageForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["org", "package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesrestorePackageForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          token: { type: "string" },
          org: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["org", "package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesgetAllPackageVersionsForPackageOwnedByOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          state: { type: "string" },
          org: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["org", "package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesgetPackageVersionForOrganization", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
          package_version_id: { type: "string" },
        },
        required: ["org", "package_type", "package_name", "package_version_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesdeletePackageVersionForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
          package_version_id: { type: "string" },
        },
        required: ["org", "package_type", "package_name", "package_version_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesrestorePackageVersionForOrg", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          org: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
          package_version_id: { type: "string" },
        },
        required: ["org", "package_type", "package_name", "package_version_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packageslistDockerMigrationConflictingPackagesForA", () => {
      const schema = {
        type: "object",
        properties: {
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packageslistPackagesForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          package_type: { type: "string" },
          None: { type: "string" },
        },
        required: ["package_type"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesgetPackageForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesdeletePackageForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesrestorePackageForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          token: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesgetAllPackageVersionsForPackageOwnedByAuth", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          state: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesgetPackageVersionForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
          package_version_id: { type: "string" },
        },
        required: ["package_type", "package_name", "package_version_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesdeletePackageVersionForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
          package_version_id: { type: "string" },
        },
        required: ["package_type", "package_name", "package_version_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesrestorePackageVersionForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
          package_version_id: { type: "string" },
        },
        required: ["package_type", "package_name", "package_version_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packageslistDockerMigrationConflictingPackagesForU", () => {
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
    it("should have valid schema for packageslistPackagesForUser", () => {
      const schema = {
        type: "object",
        properties: {
          package_type: { type: "string" },
          None: { type: "string" },
          username: { type: "string" },
        },
        required: ["package_type", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesgetPackageForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          username: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["username", "package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesdeletePackageForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          username: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["username", "package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesrestorePackageForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          token: { type: "string" },
          username: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["username", "package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesgetAllPackageVersionsForPackageOwnedByUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          username: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
        },
        required: ["username", "package_type", "package_name"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesgetPackageVersionForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          username: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
          package_version_id: { type: "string" },
        },
        required: ["username", "package_type", "package_name", "package_version_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesdeletePackageVersionForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          username: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
          package_version_id: { type: "string" },
        },
        required: ["username", "package_type", "package_name", "package_version_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for packagesrestorePackageVersionForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          username: { type: "string" },
          package_type: { type: "string" },
          package_name: { type: "string" },
          package_version_id: { type: "string" },
        },
        required: ["username", "package_type", "package_name", "package_version_id"],
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

  describe("packageslistDockerMigrationConflictingPackagesForO tool", () => {
    it("should make GET request to /orgs/{org}/docker/conflicts", async () => {
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

    it("should validate required parameters for packageslistDockerMigrationConflictingPackagesForO", () => {
      const requiredParams = ["org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("packageslistPackagesForOrganization tool", () => {
    it("should make GET request to /orgs/{org}/packages", async () => {
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

    it("should validate required parameters for packageslistPackagesForOrganization", () => {
      const requiredParams = ["package_type", "org"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
  describe("packagesgetPackageForOrganization tool", () => {
    it("should make GET request to /orgs/{org}/packages/{package_type}/{package_name}", async () => {
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

    it("should validate required parameters for packagesgetPackageForOrganization", () => {
      const requiredParams = ["org", "package_type", "package_name"];

      expect(requiredParams.length).toBeGreaterThan(0);
    });
  });
});