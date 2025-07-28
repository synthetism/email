/**
 * Email Unit Tests - Basic functionality validation
 */

import { describe, it, expect } from "vitest";
import { Email } from "../src/index.js";

describe("Email Unit", () => {
  describe("Unit Creation", () => {
    it("should create SMTP email unit", () => {
      const email = Email.create({
        type: "smtp",
        options: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "test@example.com",
            pass: "password123",
          },
        },
      });

      expect(email.dna.id).toBe("email");
      expect(email.getProviderType()).toBe("smtp");
      expect(email.capabilities()).toContain("send");
      expect(email.capabilities()).toContain("validateEmail");
      expect(email.capabilities()).toContain("checkConnection");
    });

    it("should validate configuration and throw on errors", () => {
      expect(() => {
        Email.create({
          type: "smtp",
          options: {
            host: "",
            port: 587,
            auth: { user: "test", pass: "test" },
          },
        });
      }).toThrow("[email] SMTP requires host, port, and auth configuration");
    });

    it("should implement Unit Architecture patterns", () => {
      const email = Email.create({
        type: "smtp",
        options: {
          host: "smtp.test.com",
          port: 25,
          auth: {
            user: "test",
            pass: "test",
          },
        },
      });

      // Unit Architecture requirements
      expect(email.whoami()).toContain("Email");
      expect(email.dna.id).toBe("email");
      expect(email.capabilities()).toBeInstanceOf(Array);
      expect(typeof email.teach).toBe("function");
      expect(typeof email.help).toBe("function");
      
      // Teaching contract
      const contract = email.teach();
      expect(contract.unitId).toBe("email");
      expect(contract.capabilities).toHaveProperty("send");
      expect(contract.capabilities).toHaveProperty("validateEmail");
    });
  });

  describe("Email Validation", () => {
    const email = Email.create({
      type: "smtp",
      options: {
        host: "localhost",
        port: 25,
        auth: { user: "test", pass: "test" },
      },
    });

    it("should validate correct email addresses", () => {
      expect(email.validateEmail("test@example.com")).toBe(true);
      expect(email.validateEmail("user.name@domain.co.uk")).toBe(true);
      expect(email.validateEmail("user+tag@example.org")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(email.validateEmail("invalid")).toBe(false);
      expect(email.validateEmail("@domain.com")).toBe(false);
      expect(email.validateEmail("user@")).toBe(false);
      expect(email.validateEmail("")).toBe(false);
    });
  });

  describe("Unit Learning", () => {
    it("should teach capabilities to other units", () => {
      const email = Email.create({
        type: "smtp",
        options: {
          host: "localhost",
          port: 25,
          auth: { user: "test", pass: "test" },
        },
      });

      const contract = email.teach();
      
      // Should provide email capabilities
      expect(contract.capabilities.validateEmail).toBeInstanceOf(Function);
      expect(contract.capabilities.send).toBeInstanceOf(Function);
      expect(contract.capabilities.checkConnection).toBeInstanceOf(Function);
      
      // Test validation capability
      const result = contract.capabilities.validateEmail("test@example.com");
      expect(result).toBe(true);
    });
  });

  describe("Configuration", () => {
    it("should hide sensitive information in config", () => {
      const email = Email.create({
        type: "smtp",
        options: {
          host: "smtp.test.com",
          port: 587,
          auth: {
            user: "secret@example.com",
            pass: "supersecret123",
          },
        },
      });

      const config = email.getConfig();
      expect(config.type).toBe("smtp");
      
      if (config.type === "smtp") {
        expect(config.options.auth.pass).toBe("***hidden***");
        expect(config.options.auth.user).toBe("secret@example.com"); // User is not hidden
      }
    });
  });

  describe("Immutable Evolution", () => {
    it("should create new instances instead of mutation", () => {
      const original = Email.create({
        type: "smtp",
        options: {
          host: "smtp1.test.com",
          port: 587,
          auth: { user: "test1", pass: "test1" },
        },
      });

      const evolved = original.withProvider({
        type: "smtp",
        options: {
          host: "smtp2.test.com",
          port: 25,
          auth: { user: "test2", pass: "test2" },
        },
      });

      // Should be different instances
      expect(evolved).not.toBe(original);
      
      const originalConfig = original.getConfig();
      const evolvedConfig = evolved.getConfig();
      
      if (originalConfig.type === "smtp" && evolvedConfig.type === "smtp") {
        expect(originalConfig.options.host).toBe("smtp1.test.com");
        expect(evolvedConfig.options.host).toBe("smtp2.test.com");
      }
    });
  });
});
