/**
 * Resend Email Adapter - SMTP implementation for Resend.com
 * 
 * Uses Resend's SMTP service for reliable email delivery
 * This is essentially the same as SMTP but with Resend-specific defaults
 */

import { SMTPEmail, type SMTPConfig } from './smtp.js';
import type { IEmail, EmailMessage, EmailResult } from './types.js';

/**
 * Resend configuration - simplified SMTP config for Resend
 */
export interface ResendConfig {
  apiKey: string;        // Resend API key (used as SMTP password)
  from?: string;         // Default from address (optional)
  timeout?: number;      // Connection timeout
}

/**
 * Resend Email Adapter - SMTP implementation using Resend's SMTP service
 * 
 * This adapter is a thin wrapper around SMTPEmail with Resend-specific defaults
 */
export class ResendEmail implements IEmail {
  private smtpAdapter: SMTPEmail;
  private config: ResendConfig;

  constructor(config: ResendConfig) {
    this.config = config;
    
    // Create SMTP adapter with Resend-specific configuration
    const smtpConfig: SMTPConfig = {
      host: 'smtp.resend.com',
      port: 465,
      secure: true, // Resend uses SSL on port 465
      auth: {
        user: 'resend',
        pass: config.apiKey, // Resend uses API key as SMTP password
      },
      timeout: config.timeout,
    };

    this.smtpAdapter = new SMTPEmail(smtpConfig);
  }

  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean {
    return this.smtpAdapter.validateEmail(email);
  }

  /**
   * Check Resend SMTP connection
   */
  async checkConnection(): Promise<boolean> {
    return this.smtpAdapter.checkConnection();
  }

  /**
   * Send email message via Resend SMTP
   */
  async send(message: EmailMessage): Promise<EmailResult> {
    // Use default from address if provided and not specified in message
    const emailMessage: EmailMessage = {
      ...message,
      from: message.from || this.config.from || message.from,
    };

    return this.smtpAdapter.send(emailMessage);
  }
}
