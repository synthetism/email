/**
 * Nodemailer-based SMTP Adapter - Proven to work with AWS SES
 * 
 * Uses nodemailer for reliable SMTP handling while maintaining SYNET patterns
 */

import nodemailer from "nodemailer";
import type { IEmail, EmailMessage, EmailResult } from './types.js';

/**
 * Nodemailer SMTP configuration
 */
export interface NodemailerSMTPConfig {
  host: string;
  port: number;
  secure?: boolean; // true for SSL (port 465), false for STARTTLS (587)
  auth?: {
    user: string;
    pass: string;
  };
  timeout?: number;
}

/**
 * Nodemailer-based SMTP Email Adapter - Production ready
 */
export class NodemailerSMTPEmail implements IEmail {
  private config: NodemailerSMTPConfig;
  private transporter: ReturnType<typeof nodemailer.createTransport>;

  constructor(config: NodemailerSMTPConfig) {
    this.config = {
      timeout: 30000, // 30 second default timeout
      ...config,
    };

    // Create nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure, // true for SSL, false for STARTTLS
      auth: this.config.auth,
      connectionTimeout: this.config.timeout,
      greetingTimeout: this.config.timeout,
      socketTimeout: this.config.timeout,
    });
  }

  /**
   * Validate email address format using simple regex
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check SMTP connection using nodemailer's verify
   */
  async checkConnection(): Promise<boolean> {
    try {
      const verified = await new Promise<boolean>((resolve, reject) => {
        this.transporter.verify((error, success) => {
          if (error) {
            reject(error);
          } else {
            resolve(success);
          }
        });
      });
      return verified;
    } catch (error) {
      console.error('Nodemailer SMTP Connection Error:', error);
      return false;
    }
  }

  /**
   * Send email message via nodemailer
   */
  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      // Validate email addresses
      const toEmails = Array.isArray(message.to) ? message.to : [message.to];
      for (const email of toEmails) {
        if (!this.validateEmail(email)) {
          return {
            success: false,
            error: `Invalid email address: ${email}`,
          };
        }
      }

      if (!this.validateEmail(message.from)) {
        return {
          success: false,
          error: `Invalid from email address: ${message.from}`,
        };
      }

      // Prepare nodemailer message
      const mailOptions = {
        from: message.from,
        to: toEmails.join(', '),
        cc: message.cc ? (Array.isArray(message.cc) ? message.cc.join(', ') : message.cc) : undefined,
        bcc: message.bcc ? (Array.isArray(message.bcc) ? message.bcc.join(', ') : message.bcc) : undefined,
        replyTo: message.replyTo,
        subject: message.subject,
        text: message.text,
        html: message.html,
      };

      // Send via nodemailer
      const result = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SMTP error',
      };
    }
  }
}
