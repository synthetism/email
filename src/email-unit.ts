/**
 * Email Unit - Simple, robust email sending following SYNET Unit Architecture
 * 
 * Following Doctrine v1.0.5: Props contain everything, zero dependencies, teach/learn paradigm
 */

import {
  type TeachingContract,
  Unit,
  type UnitProps,
  createUnitSchema,
} from "@synet/unit";
import type { IEmail, EmailMessage, EmailResult, EmailProviderType } from "./types.js";
import { SMTPEmail, type SMTPConfig } from "./smtp.js";
import { ResendEmail, type ResendConfig } from "./resend.js";

/**
 * Email provider configuration union
 */
export type EmailProviderOptions = {
  smtp: SMTPConfig;
  resend: ResendConfig;
};

/**
 * Email provider configuration - external input to static create()
 */
export interface EmailConfig<T extends EmailProviderType = EmailProviderType> {
  type: T;
  options: EmailProviderOptions[T];
}

/**
 * Email Unit properties - internal state after validation (Doctrine 3: PROPS CONTAIN EVERYTHING)
 */
interface EmailProps extends UnitProps {
  provider: IEmail;
  providerType: EmailProviderType;
  providerOptions: EmailProviderOptions[EmailProviderType];
}

/**
 * Email Unit - Simple, robust email sending with provider abstraction
 */
export class Email extends Unit<EmailProps> implements IEmail {
  protected constructor(props: EmailProps) {
    super(props);
  }

  /**
   * CREATE - Create a new Email Unit with specified provider
   * Throws on validation errors (Doctrine 14: ERROR BOUNDARY CLARITY)
   */
  static create<T extends EmailProviderType>(
    config: EmailConfig<T>,
  ): Email {
    // Basic validation (rely on types for most validation)
    if (!config.type) {
      throw new Error('[email] Provider type is required');
    }
    
    if (!config.options) {
      throw new Error('[email] Provider options are required');
    }

    // Validate provider-specific config
    if (config.type === 'smtp') {
      const smtpOptions = config.options as SMTPConfig;
      if (!smtpOptions.host || !smtpOptions.port || !smtpOptions.auth) {
        throw new Error('[email] SMTP requires host, port, and auth configuration');
      }
    }

    const provider = Email.createProvider(config);

    const props: EmailProps = {
      dna: createUnitSchema({
        id: "email",
        version: "1.0.0",
      }),
      provider,
      providerType: config.type,
      providerOptions: config.options,
    };

    return new Email(props);
  }

  // ==========================================
  // NATIVE EMAIL METHODS (Doctrine 6: Direct methods for native operations)
  // ==========================================

  /**
   * Validate email address format
   */
  validateEmail(email: string): boolean {
    try {
      return this.props.provider.validateEmail(email);
    } catch (error) {
      return false;
    }
  }

  /**
   * Check connection to email provider
   */
  async checkConnection(): Promise<boolean> {
    try {
      return await this.props.provider.checkConnection();
    } catch (error) {
      return false;
    }
  }

  /**
   * Send email message
   */
  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      return await this.props.provider.send(message);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ==========================================
  // UNIT CAPABILITIES (Doctrine 9: ALWAYS TEACH)
  // ==========================================

  /**
   * TEACH - Provide email capabilities to other units (Doctrine 19: Only native capabilities)
   */
  teach(): TeachingContract {
    return {
      unitId: this.props.dna.id,
      capabilities: {
        validateEmail: (...args: unknown[]) =>
          this.validateEmail(args[0] as string),
        checkConnection: () => this.checkConnection(),
        send: (...args: unknown[]) =>
          this.send(args[0] as EmailMessage),
      },
    };
  }

  whoami(): string {
    return `Email[${this.props.dna.id}] via ${this.props.providerType}`;
  }

  capabilities(): string[] {
    return ["validateEmail", "checkConnection", "send"];
  }

  help(): void {
    console.log(`
Email Unit - Simple, robust email sending

Provider: ${this.props.providerType}
Capabilities:
  validateEmail - Validate email address format
  checkConnection - Test provider connection
  send - Send email message

Usage:
  const email = Email.create(config);
  const isValid = email.validateEmail('test@example.com');
  const result = await email.send({
    to: 'recipient@example.com',
    from: 'sender@example.com',
    subject: 'Hello World',
    text: 'Plain text message',
    html: '<h1>HTML message</h1>'
  });

When learned by other units:
  otherUnit.execute('${this.props.dna.id}.send', emailMessage);
`);
  }

  // ==========================================
  // UNIT METADATA & UTILITIES
  // ==========================================

  /**
   * Get provider type
   */
  getProviderType(): EmailProviderType {
    return this.props.providerType;
  }

  /**
   * Get configuration (without sensitive data) - following Doctrine 15: Enhanced Error Messages
   */
  getConfig(): EmailConfig | undefined {
    if (this.props.providerType === 'smtp') {
      const smtpOptions = this.props.providerOptions as SMTPConfig;
      return {
        type: 'smtp',
        options: {
          ...smtpOptions,
          auth: smtpOptions.auth ? {
            user: smtpOptions.auth.user,
            pass: '***hidden***',
          } : undefined,
        },
      };
    } 
     if (this.props.providerType === 'resend') {
      return {
        type: 'resend',
        options: {
          apiKey: '***hidden***',
          from: (this.props.providerOptions as ResendConfig).from,
        },
      };
    }  
  }

  /**
   * Get direct access to the provider (escape hatch)
   */
  getProvider(): IEmail {
    return this.props.provider;
  }

  /**
   * Create a new Email unit with different provider configuration
   * Unit Architecture pattern: create new instance instead of mutation (Doctrine 18: IMMUTABLE EVOLUTION)
   */
  withProvider<T extends EmailProviderType>(
    config: EmailConfig<T>,
  ): Email {
    return Email.create(config);
  }

  /**
   * Create specific email provider
   */
  private static createProvider<T extends EmailProviderType>(
    config: EmailConfig<T>,
  ): IEmail {
    const { type, options } = config;

    switch (type) {
      case "smtp":
        return new SMTPEmail(options as SMTPConfig);

      case "resend":
        return new ResendEmail(options as ResendConfig);

      default:
        throw new Error(`[email] Unsupported email provider: ${type}. Available: smtp, resend`);
    }
  }
}
