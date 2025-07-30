/**
 * @synet/email - Zero-dependency, secure email sending library
 * 
 * Main entry point for SYNET Email Unit and adapters
 */

export * from './types.js';
export * from './smtp.js';
export * from './resend.js';
export * from './email.unit.js';

// Main Email Unit
export { Email, VERSION } from "./email.unit.js";

// Types
export type {
  EmailProviderType,
  EmailMessage,
  EmailAttachment,
  EmailResult,
  IEmail,
} from "./types.js";

export type {
  EmailConfig,
  EmailProviderOptions,
} from "./email.unit.js";

// Adapters (for direct use if needed)
export { SMTPEmail, type SMTPConfig } from "./smtp.js";
export { ResendEmail, type ResendConfig } from "./resend.js";
