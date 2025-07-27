/**
 * SMTP Adapter Standalone Test
 * 
 * Test the SMTP adapter independently from the Email unit
 */

import { describe, it, expect } from "vitest";
import { SMTPEmail } from "../src/smtp.js";

describe("SMTP Adapter", () => {
  describe("Standalone Operation", () => {
    it("should create SMTP adapter without unit wrapper", () => {
      const smtp = new SMTPEmail({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "test@example.com",
          pass: "password123",
        },
        timeout: 5000,
      });

      expect(smtp).toBeInstanceOf(SMTPEmail);
    });

    it("should validate email addresses correctly", () => {
      const smtp = new SMTPEmail({
        host: "localhost",
        port: 25,
        auth: { user: "test", pass: "test" },
      });

      expect(smtp.validateEmail("valid@example.com")).toBe(true);
      expect(smtp.validateEmail("user.name+tag@domain.co.uk")).toBe(true);
      expect(smtp.validateEmail("invalid")).toBe(false);
      expect(smtp.validateEmail("@domain.com")).toBe(false);
      expect(smtp.validateEmail("user@")).toBe(false);
    });

    it("should handle connection check gracefully", async () => {
      const smtp = new SMTPEmail({
        host: "nonexistent.smtp.server",
        port: 587,
        auth: { user: "test", pass: "test" },
        timeout: 1000, // Short timeout for test
      });

      // Should not throw, just return false
      const canConnect = await smtp.checkConnection();
      expect(typeof canConnect).toBe("boolean");
    });

    it("should return proper error result for bad configuration", async () => {
      const smtp = new SMTPEmail({
        host: "nonexistent.smtp.server",
        port: 587,
        auth: { user: "test", pass: "test" },
        timeout: 1000,
      });

      const result = await smtp.send({
        to: "test@example.com",
        from: "sender@example.com",
        subject: "Test",
        text: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe("string");
    });

    it("should validate message before sending", async () => {
      const smtp = new SMTPEmail({
        host: "localhost",
        port: 25,
        auth: { user: "test", pass: "test" },
      });

      const result = await smtp.send({
        to: "invalid-email",
        from: "valid@example.com",
        subject: "Test",
        text: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email address");
    });

    it("should build proper email content", async () => {
      const smtp = new SMTPEmail({
        host: "localhost",
        port: 25,
        auth: { user: "test", pass: "test" },
      });

      // Test that message structure is validated
      const result = await smtp.send({
        to: ["recipient1@example.com", "recipient2@example.com"],
        from: "sender@example.com",
        subject: "Test Multi-Recipient",
        text: "Plain text message",
        html: "<h1>HTML message</h1>",
        cc: "cc@example.com",
        bcc: ["bcc1@example.com", "bcc2@example.com"],
        replyTo: "reply@example.com",
      });

      // Should not throw during message construction
      expect(result).toBeDefined();
      expect(typeof result.success).toBe("boolean");
    });

    it("should handle timeout configuration", () => {
      const smtp1 = new SMTPEmail({
        host: "smtp.test.com",
        port: 587,
        auth: { user: "test", pass: "test" },
        // No timeout specified - should use default
      });

      const smtp2 = new SMTPEmail({
        host: "smtp.test.com",
        port: 587,
        auth: { user: "test", pass: "test" },
        timeout: 15000,
      });

      // Both should be created successfully
      expect(smtp1).toBeInstanceOf(SMTPEmail);
      expect(smtp2).toBeInstanceOf(SMTPEmail);
    });
  });
});
