/**
 * Email Unit - Simple, robust email sending following SYNET Unit Architecture v1.0.7
 * 
 * Enhanced with consciousness trinity pattern for intelligent email operations.
 * Following Doctrine v1.0.7: Consciousness trinity (Capabilities + Schema + Validator)
 */

import {
  type TeachingContract,
  Unit,
  type UnitCore,
  type UnitProps,
  createUnitSchema,
  Capabilities,
  Schema,
  Validator
} from "@synet/unit";
import type { IEmail, EmailMessage, EmailResult, EmailProviderType } from "./types.js";
import { SMTPEmail, type SMTPConfig } from "./smtp.js";
import { ResendEmail, type ResendConfig } from "./resend.js";


export const VERSION = '1.0.2'
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
        version: VERSION,
      }),
      provider,
      providerType: config.type,
      providerOptions: config.options,
    };

    return new Email(props);
  }

  // ==========================================
  // CONSCIOUSNESS TRINITY (v1.0.7)
  // ==========================================

  /**
   * Build consciousness trinity - creates living instances once
   */
  protected build(): UnitCore {
    const capabilities = Capabilities.create(this.dna.id, {
      validateEmail: (...args: unknown[]) => this.validateEmail(args[0] as string),
      checkConnection: (...args: unknown[]) => this.checkConnection(),
      send: (...args: unknown[]) => this.send(args[0] as EmailMessage)
    });

    const schema = Schema.create(this.dna.id, {
      validateEmail: {
        name: 'validateEmail',
        description: 'Validate email address format',
        parameters: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Email address to validate (e.g., "user@example.com")'
            }
          },
          required: ['email']
        },
        response: { type: 'boolean' }
      },
      checkConnection: {
        name: 'checkConnection',
        description: 'Test connection to email provider',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        response: { type: 'boolean' }
      },
      send: {
        name: 'send',
        description: 'Send email message via configured provider',
        parameters: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address or comma-separated list'
            },
            from: {
              type: 'string', 
              description: 'Sender email address'
            },
            subject: {
              type: 'string',
              description: 'Email subject line'
            },
            text: {
              type: 'string',
              description: 'Plain text email content (optional)'
            },
            html: {
              type: 'string',
              description: 'HTML email content (optional)'
            },
            cc: {
              type: 'string',
              description: 'CC recipients (optional)'
            },
            bcc: {
              type: 'string',
              description: 'BCC recipients (optional)'
            },
            replyTo: {
              type: 'string',
              description: 'Reply-to email address (optional)'
            }
          },
          required: ['to', 'from', 'subject']
        },
        response: { type: 'object' }
      }
    });

    const validator = Validator.create({
      unitId: this.dna.id,
      capabilities,
      schema,
      strictMode: false
    });

    return { capabilities, schema, validator };
  }

  /**
   * Get capabilities consciousness - returns living instance
   */
  capabilities(): Capabilities {
    return this._unit.capabilities;
  }

  /**
   * Get schema consciousness - returns living instance
   */
  schema(): Schema {
    return this._unit.schema;
  }

  /**
   * Get validator consciousness - returns living instance
   */
  validator(): Validator {
    return this._unit.validator;
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
   * TEACH - Provide email capabilities to other units with consciousness trinity (v1.0.7)
   */
  teach(): TeachingContract {
    return {
      unitId: this.props.dna.id,
      capabilities: this._unit.capabilities,
      schema: this._unit.schema,
      validator: this._unit.validator
    };
  }

  whoami(): string {
    return `Email[${this.props.dna.id}] via ${this.props.providerType}`;
  }

  help(): void {
    console.log(`
📧 Email Unit - Simple, robust email sending (v1.0.7)

Provider: ${this.props.providerType}
Native Capabilities:
  • validateEmail - Validate email address format
  • checkConnection - Test provider connection  
  • send - Send email message

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

Unit Architecture v1.0.7 (consciousness trinity):
  otherUnit.learn([email.teach()]);
  await otherUnit.execute('${this.props.dna.id}.send', emailMessage);

AI Integration via consciousness trinity:
  const ai = AI.create({ type: 'openai', options: { apiKey: 'sk-...' } });
  ai.learn([email.teach()]);
  
  // AI can now send emails using learned tool schemas
  const response = await ai.call('Send a welcome email to user@example.com', {
    useTools: true
  });
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
