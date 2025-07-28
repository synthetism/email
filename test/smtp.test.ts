/**
 * SMTP Adapter Tests
 * 
 * Tests for the production-ready SMTP email adapter
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SMTPEmail, type SMTPConfig } from "../src/smtp.js";

describe("SMTPEmail", () => {
  let smtpConfig: SMTPConfig;
  let smtpEmail: SMTPEmail;

  beforeEach(() => {
    smtpConfig = {
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: "test@example.com",
        pass: "password123",
      },
    };
    smtpEmail = new SMTPEmail(smtpConfig);
  });

  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(smtpEmail.validateEmail("test@example.com")).toBe(true);
      expect(smtpEmail.validateEmail("user.name+tag@domain.co.uk")).toBe(true);
      expect(smtpEmail.validateEmail("user@sub.domain.com")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(smtpEmail.validateEmail("invalid")).toBe(false);
      expect(smtpEmail.validateEmail("@example.com")).toBe(false);
      expect(smtpEmail.validateEmail("test@")).toBe(false);
      expect(smtpEmail.validateEmail("test@.com")).toBe(false);
      expect(smtpEmail.validateEmail("")).toBe(false);
    });
  });

  describe("constructor", () => {
    it("should create SMTP adapter with default timeout", () => {
      const adapter = new SMTPEmail(smtpConfig);
      expect(adapter).toBeInstanceOf(SMTPEmail);
    });

    it("should accept custom timeout", () => {
      const configWithTimeout: SMTPConfig = {
        ...smtpConfig,
        timeout: 5000,
      };
      const adapter = new SMTPEmail(configWithTimeout);
      expect(adapter).toBeInstanceOf(SMTPEmail);
    });

    it("should work without auth for testing", () => {
      const configNoAuth: SMTPConfig = {
        host: "localhost",
        port: 587,
        secure: false,
      };
      const adapter = new SMTPEmail(configNoAuth);
      expect(adapter).toBeInstanceOf(SMTPEmail);
    });
  });

  describe("send", () => {
    it("should reject invalid from email", async () => {
      const result = await smtpEmail.send({
        from: "invalid-email",
        to: "test@example.com",
        subject: "Test",
        text: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid from email address");
    });

    it("should reject invalid to email", async () => {
      const result = await smtpEmail.send({
        from: "test@example.com",
        to: "invalid-email",
        subject: "Test",
        text: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email address");
    });

    it("should handle array of recipients", async () => {
      const result = await smtpEmail.send({
        from: "test@example.com",
        to: ["valid@example.com", "invalid-email"],
        subject: "Test",
        text: "Test message",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid email address");
    });

    it("should handle CC and BCC validation", async () => {
      const result = await smtpEmail.send({
        from: "test@example.com",
        to: "valid@example.com",
        cc: "invalid-cc",
        bcc: "valid@example.com",
        subject: "Test",
        text: "Test message",
      });

      // This should fail during email sending, not validation
      // since CC/BCC validation happens during the SMTP conversation
      expect(result.success).toBe(false);
    });
  });

  describe("configuration", () => {
    it("should handle SSL configuration (port 465)", () => {
      const sslConfig: SMTPConfig = {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "test@gmail.com",
          pass: "password",
        },
      };
      const adapter = new SMTPEmail(sslConfig);
      expect(adapter).toBeInstanceOf(SMTPEmail);
    });

    it("should handle STARTTLS configuration (port 587)", () => {
      const starttlsConfig: SMTPConfig = {
        host: "smtp.office365.com",
        port: 587,
        secure: false,
        auth: {
          user: "test@outlook.com",
          pass: "password",
        },
      };
      const adapter = new SMTPEmail(starttlsConfig);
      expect(adapter).toBeInstanceOf(SMTPEmail);
    });

    it("should handle AWS SES configuration", () => {
      const sesConfig: SMTPConfig = {
        host: "email-smtp.eu-west-1.amazonaws.com",
        port: 587,
        secure: false,
        auth: {
          user: "AKIA...",
          pass: "BIG...",
        },
      };
      const adapter = new SMTPEmail(sesConfig);
      expect(adapter).toBeInstanceOf(SMTPEmail);
    });
  });
});
