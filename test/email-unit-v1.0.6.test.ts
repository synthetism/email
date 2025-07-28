/**
 * Email Unit v1.0.6 Test - Tool Schema Integration
 * 
 * Tests the new AI tool schema functionality
 */

import { describe, test, expect } from 'vitest';
import { Email } from '../src/email-unit.js';

describe('Email Unit v1.0.6 - AI Tool Schemas', () => {
  const email = Email.create({
    type: 'smtp',
    options: {
      host: 'localhost',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'password'
      }
    }
  });



  test('should provide teaching contract with tool schemas', () => {
    const contract = email.teach();
    
    expect(contract.unitId).toBe('email');
    expect(contract.capabilities).toBeDefined();
    expect(contract.tools).toBeDefined();
    
    // Check that tools exist for all capabilities
    expect(contract.tools?.validateEmail).toBeDefined();
    expect(contract.tools?.checkConnection).toBeDefined();
    expect(contract.tools?.send).toBeDefined();
  });

  test('should have correct tool schema structure', () => {
    const contract = email.teach();
    const validateEmailSchema = contract.tools?.validateEmail;
    
    expect(validateEmailSchema?.name).toBe('validateEmail');
    expect(validateEmailSchema?.description).toContain('Validate email address');
    expect(validateEmailSchema?.parameters.type).toBe('object');
    expect(validateEmailSchema?.parameters.required).toEqual(['email']);
  });

  test('should have send tool schema with all required parameters', () => {
    const contract = email.teach();
    const sendSchema = contract.tools?.send;
    
    expect(sendSchema?.name).toBe('send');
    expect(sendSchema?.description).toContain('Send email message');
    expect(sendSchema?.parameters.required).toEqual(['to', 'from', 'subject']);
    
    // Check parameter properties
    const props = sendSchema?.parameters.properties;
    expect(props?.to?.type).toBe('string');
    expect(props?.from?.type).toBe('string');
    expect(props?.subject?.type).toBe('string');
    expect(props?.text?.type).toBe('string');
    expect(props?.html?.type).toBe('string');
  });

  test('should have checkConnection tool schema', () => {
    const contract = email.teach();
    const connectionSchema = contract.tools?.checkConnection;
    
    expect(connectionSchema?.name).toBe('checkConnection');
    expect(connectionSchema?.description).toContain('Test connection');
    expect(connectionSchema?.parameters.required).toEqual([]);
  });

  test('should maintain backward compatibility', () => {
    // Capabilities should still work as before
    expect(email.capabilities()).toEqual(['validateEmail', 'checkConnection', 'send']);
    expect(email.validateEmail('test@example.com')).toBe(true);
    expect(email.validateEmail('invalid-email')).toBe(false);
  });

  test('should have updated help documentation', () => {
    // Should not throw when calling help
    expect(() => {
      email.help();
    }).not.toThrow();
  });
});
