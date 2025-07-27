/**
 * Email provider types supported by the Email Unit
 */
export type EmailProviderType = "smtp" | "resend";

/**
 * Email message structure
 */
export interface EmailMessage {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/**
 * Email attachment structure
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

/**
 * Email sending result
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Core Email interface that all adapters must implement
 */
export interface IEmail {
  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean;

  /**
   * Check connection to email provider
   */
  checkConnection(): Promise<boolean>;

  /**
   * Send email message
   */
  send(message: EmailMessage): Promise<EmailResult>;
}