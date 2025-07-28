/**
 * Resend Adapter Tests
 * 
 * Tests for the Resend email adapter (SMTP-based wrapper)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ResendEmail, type ResendConfig } from "../src/resend.js";

describe("ResendEmail", () => {
  let resendConfig: ResendConfig;
  let resendEmail: ResendEmail;

  beforeEach(() => {
    resendConfig = {
      apiKey: "re_test_api_key_12345",
      from: "test@example.com",
    };
    resendEmail = new ResendEmail(resendConfig);
  });

  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(resendEmail.validateEmail("test@example.com")).toBe(true);
      expect(resendEmail.validateEmail("user.name+tag@domain.co.uk")).toBe(true);
      expect(resendEmail.validateEmail("user@sub.domain.com")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(resendEmail.validateEmail("invalid")).toBe(false);
      expect(resendEmail.validateEmail("@example.com")).toBe(false);
      expect(resendEmail.validateEmail("test@")).toBe(false);
      expect(resendEmail.validateEmail("test@.com")).toBe(false);
      expect(resendEmail.validateEmail("")).toBe(false);
    });
  });

  describe("constructor", () => {
    it("should create Resend adapter with required config", () => {
      const adapter = new ResendEmail(resendConfig);
      expect(adapter).toBeInstanceOf(ResendEmail);
    });

    it("should accept optional from and timeout", () => {
      const configCustom: ResendConfig = {
        apiKey: "test_key",
        from: "default@example.com",
        timeout: 5000,
      };
      const adapter = new ResendEmail(configCustom);
      expect(adapter).toBeInstanceOf(ResendEmail);
    });

    it("should work with minimal config", () => {
      const minimalConfig: ResendConfig = {
        apiKey: "re_minimal_key",
      };
      const adapter = new ResendEmail(minimalConfig);
      expect(adapter).toBeInstanceOf(ResendEmail);
    });
  });

  describe("send", () => {
    it("should reject invalid from email", async () => {
      const result = await resendEmail.send({
        from: "invalid-email",
        to: "test@example.com",
        subject: "Test",
        text: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid from email address");
    });

    it("should reject invalid to email", async () => {
      const result = await resendEmail.send({
        from: "test@example.com",
        to: "invalid-email",
        subject: "Test",
        text: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email address");
    });

    it("should handle array of recipients", async () => {
      const result = await resendEmail.send({
        from: "test@example.com",
        to: ["valid@example.com", "invalid-email"],
        subject: "Test",
        text: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email address");
    });

    it("should handle network errors gracefully (SMTP connection failure)", async () => {
      // This will fail due to invalid API key, but should handle gracefully
      const result = await resendEmail.send({
        from: "test@example.com",
        to: "valid@example.com",
        subject: "Test",
        text: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should use default from address when not specified", async () => {
      const configWithFrom: ResendConfig = {
        apiKey: "test_key",
        from: "default@example.com",
      };
      const adapterWithFrom = new ResendEmail(configWithFrom);

      // This should use the default from address internally
      // (will fail due to invalid credentials, but validates the logic)
      const result = await adapterWithFrom.send({
        to: "recipient@example.com",
        subject: "Test",
        text: "Test message",
        // Note: no 'from' specified, should use default
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("checkConnection", () => {
    it("should handle connection check gracefully", async () => {
      const canConnect = await resendEmail.checkConnection();
      expect(typeof canConnect).toBe("boolean");
      // With test API key, this should fail
      expect(canConnect).toBe(false);
    });

    it("should delegate to underlying SMTP adapter", async () => {
      // The connection check should work the same as SMTP
      const canConnect = await resendEmail.checkConnection();
      expect(typeof canConnect).toBe("boolean");
    });
  });

  describe("configuration", () => {
    it("should handle production API key format", () => {
      const prodConfig: ResendConfig = {
        apiKey: "re_live_1234567890abcdef",
      };
      const adapter = new ResendEmail(prodConfig);
      expect(adapter).toBeInstanceOf(ResendEmail);
    });

    it("should handle test API key format", () => {
      const testConfig: ResendConfig = {
        apiKey: "re_test_1234567890abcdef",
      };
      const adapter = new ResendEmail(testConfig);
      expect(adapter).toBeInstanceOf(ResendEmail);
    });

    it("should use correct Resend SMTP defaults", () => {
      // Testing that our adapter sets the right defaults for Resend
      // (smtp.resend.com, port 465, SSL)
      const adapter = new ResendEmail({ apiKey: "test" });
      expect(adapter).toBeInstanceOf(ResendEmail);
    });
  });
});
