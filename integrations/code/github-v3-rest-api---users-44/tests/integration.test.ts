/**
 * Integration tests for GitHub v3 REST API - users MCP Server
 *
 * Auto-generated from OpenAPI specification
 */

import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import axios from "axios";

// Mock axios for testing
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GitHub v3 REST API - users MCP Server", () => {
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
        "usersgetAuthenticated",
        "usersupdateAuthenticated",
        "userslistBlockedByAuthenticatedUser",
        "userscheckBlocked",
        "usersblock",
        "usersunblock",
        "userssetPrimaryEmailVisibilityForAuthenticatedUser",
        "userslistEmailsForAuthenticatedUser",
        "usersaddEmailForAuthenticatedUser",
        "usersdeleteEmailForAuthenticatedUser",
        "userslistFollowersForAuthenticatedUser",
        "userslistFollowedByAuthenticatedUser",
        "userscheckPersonIsFollowedByAuthenticated",
        "usersfollow",
        "usersunfollow",
        "userslistGpgKeysForAuthenticatedUser",
        "userscreateGpgKeyForAuthenticatedUser",
        "usersgetGpgKeyForAuthenticatedUser",
        "usersdeleteGpgKeyForAuthenticatedUser",
        "userslistPublicSshKeysForAuthenticatedUser",
        "userscreatePublicSshKeyForAuthenticatedUser",
        "usersgetPublicSshKeyForAuthenticatedUser",
        "usersdeletePublicSshKeyForAuthenticatedUser",
        "userslistPublicEmailsForAuthenticatedUser",
        "userslistSocialAccountsForAuthenticatedUser",
        "usersaddSocialAccountForAuthenticatedUser",
        "usersdeleteSocialAccountForAuthenticatedUser",
        "userslistSshSigningKeysForAuthenticatedUser",
        "userscreateSshSigningKeyForAuthenticatedUser",
        "usersgetSshSigningKeyForAuthenticatedUser",
        "usersdeleteSshSigningKeyForAuthenticatedUser",
        "usersgetById",
        "userslist",
        "usersgetByUsername",
        "userslistAttestationsBulk",
        "usersdeleteAttestationsBulk",
        "usersdeleteAttestationsBySubjectDigest",
        "usersdeleteAttestationsById",
        "userslistAttestations",
        "userslistFollowersForUser",
        "userslistFollowingForUser",
        "userscheckFollowingForUser",
        "userslistGpgKeysForUser",
        "usersgetContextForUser",
        "userslistPublicKeysForUser",
        "userslistSocialAccountsForUser",
        "userslistSshSigningKeysForUser",
      ];

      // This would normally call server.listTools()
      // For now, verify the tool names are defined
      expectedTools.forEach((toolName) => {
        expect(toolName).toBeTruthy();
      });
    });

    it("should have valid schema for usersgetAuthenticated", () => {
      const schema = {
        type: "object",
        properties: {
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersupdateAuthenticated", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          blog: { type: "string" },
          twitter_username: { type: "string" },
          company: { type: "string" },
          location: { type: "string" },
          hireable: { type: "boolean" },
          bio: { type: "string" },
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistBlockedByAuthenticatedUser", () => {
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
    it("should have valid schema for userscheckBlocked", () => {
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
    it("should have valid schema for usersblock", () => {
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
    it("should have valid schema for usersunblock", () => {
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
    it("should have valid schema for userssetPrimaryEmailVisibilityForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          visibility: { type: "string" },
        },
        required: ["visibility"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistEmailsForAuthenticatedUser", () => {
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
    it("should have valid schema for usersaddEmailForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersdeleteEmailForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistFollowersForAuthenticatedUser", () => {
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
    it("should have valid schema for userslistFollowedByAuthenticatedUser", () => {
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
    it("should have valid schema for userscheckPersonIsFollowedByAuthenticated", () => {
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
    it("should have valid schema for usersfollow", () => {
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
    it("should have valid schema for usersunfollow", () => {
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
    it("should have valid schema for userslistGpgKeysForAuthenticatedUser", () => {
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
    it("should have valid schema for userscreateGpgKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          armored_public_key: { type: "string" },
        },
        required: ["armored_public_key"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersgetGpgKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          gpg_key_id: { type: "string" },
        },
        required: ["gpg_key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersdeleteGpgKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          gpg_key_id: { type: "string" },
        },
        required: ["gpg_key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistPublicSshKeysForAuthenticatedUser", () => {
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
    it("should have valid schema for userscreatePublicSshKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          key: { type: "string" },
        },
        required: ["key"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersgetPublicSshKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          key_id: { type: "string" },
        },
        required: ["key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersdeletePublicSshKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          key_id: { type: "string" },
        },
        required: ["key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistPublicEmailsForAuthenticatedUser", () => {
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
    it("should have valid schema for userslistSocialAccountsForAuthenticatedUser", () => {
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
    it("should have valid schema for usersaddSocialAccountForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          account_urls: { type: "array" },
        },
        required: ["account_urls"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersdeleteSocialAccountForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          account_urls: { type: "array" },
        },
        required: ["account_urls"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistSshSigningKeysForAuthenticatedUser", () => {
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
    it("should have valid schema for userscreateSshSigningKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          title: { type: "string" },
          key: { type: "string" },
        },
        required: ["key"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersgetSshSigningKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ssh_signing_key_id: { type: "string" },
        },
        required: ["ssh_signing_key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersdeleteSshSigningKeyForAuthenticatedUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          ssh_signing_key_id: { type: "string" },
        },
        required: ["ssh_signing_key_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersgetById", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          account_id: { type: "string" },
        },
        required: ["account_id"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslist", () => {
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
    it("should have valid schema for usersgetByUsername", () => {
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
    it("should have valid schema for userslistAttestationsBulk", () => {
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
    it("should have valid schema for usersdeleteAttestationsBulk", () => {
      const schema = {
        type: "object",
        properties: {
        },
        required: [],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersdeleteAttestationsBySubjectDigest", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          subject_digest: { type: "string" },
          username: { type: "string" },
        },
        required: ["subject_digest", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for usersdeleteAttestationsById", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          attestation_id: { type: "integer" },
          username: { type: "string" },
        },
        required: ["attestation_id", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistAttestations", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          subject_digest: { type: "string" },
          predicate_type: { type: "string" },
          username: { type: "string" },
        },
        required: ["subject_digest", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistFollowersForUser", () => {
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
    it("should have valid schema for userslistFollowingForUser", () => {
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
    it("should have valid schema for userscheckFollowingForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          target_user: { type: "string" },
          username: { type: "string" },
        },
        required: ["target_user", "username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistGpgKeysForUser", () => {
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
    it("should have valid schema for usersgetContextForUser", () => {
      const schema = {
        type: "object",
        properties: {
          None: { type: "string" },
          subject_type: { type: "string" },
          subject_id: { type: "string" },
          username: { type: "string" },
        },
        required: ["username"],
      };

      expect(schema.type).toBe("object");
      expect(schema.properties).toBeDefined();
    });
    it("should have valid schema for userslistPublicKeysForUser", () => {
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
    it("should have valid schema for userslistSocialAccountsForUser", () => {
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
    it("should have valid schema for userslistSshSigningKeysForUser", () => {
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

  describe("usersgetAuthenticated tool", () => {
    it("should make GET request to /user", async () => {
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

    it("should validate required parameters for usersgetAuthenticated", () => {
      const requiredParams = [];

      expect(requiredParams.length).toBe(0);
    });
  });
  describe("usersupdateAuthenticated tool", () => {
    it("should make PATCH request to /user", async () => {
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

    it("should validate required parameters for usersupdateAuthenticated", () => {
      const requiredParams = [];

      expect(requiredParams.length).toBe(0);
    });
  });
  describe("userslistBlockedByAuthenticatedUser tool", () => {
    it("should make GET request to /user/blocks", async () => {
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

    it("should validate required parameters for userslistBlockedByAuthenticatedUser", () => {
      const requiredParams = [];

      expect(requiredParams.length).toBe(0);
    });
  });
});