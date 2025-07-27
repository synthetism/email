/**
 * SMTP Email Adapter - Pure SMTP implementation using Node.js built-in modules
 * 
 * Zero external dependencies, follows SYNET Unit Architecture principles
 */

import { createConnection, type Socket } from 'node:net';
import { createSecureContext, connect as tlsConnect, type TLSSocket } from 'node:tls';
import { Buffer } from 'node:buffer';
import type { IEmail, EmailMessage, EmailResult } from './types.js';

/**
 * SMTP provider-specific configuration
 */
export interface SMTPConfig {
  host: string;
  port: number;
  secure?: boolean; // true for SSL (port 465), false for STARTTLS
  auth?: {
    user: string;
    pass: string;
  };
  timeout?: number;
}

/**
 * SMTP Email Adapter - Pure Node.js implementation
 */
export class SMTPEmail implements IEmail {
  private config: SMTPConfig;

  constructor(config: SMTPConfig) {
    this.config = {
      timeout: 30000, // 30 second default timeout
      ...config,
    };
  }

  /**
   * Validate email address format using simple regex
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check SMTP connection
   */
  async checkConnection(): Promise<boolean> {
    try {
      let socket = await this.createConnection();
      await this.sendCommand(socket, 'EHLO localhost');
      
      // Handle STARTTLS for non-secure connections
      if (!this.config.secure && this.config.port !== 465) {
        await this.sendCommand(socket, 'STARTTLS');
        socket = await this.upgradeToTLS(socket);
        await this.sendCommand(socket, 'EHLO localhost');
      }
      
      if (this.config.auth) {
        await this.authenticate(socket);
      }
      
      await this.sendCommand(socket, 'QUIT');
      socket.destroy();
      return true;
    } catch (error) {
      console.error('SMTP Connection Error:', error);
      return false;
    }
  }

  /**
   * Send email message via SMTP
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

      let socket = await this.createConnection();
      
      // SMTP handshake
      await this.sendCommand(socket, 'EHLO localhost');
      
      // Handle STARTTLS for non-secure connections (AWS SES port 587)
      if (!this.config.secure && this.config.port !== 465) {
        await this.sendCommand(socket, 'STARTTLS');
        
        // Upgrade to TLS connection
        socket = await this.upgradeToTLS(socket);
        
        // Send EHLO again after TLS upgrade
        await this.sendCommand(socket, 'EHLO localhost');
      }
      
      // Authentication if required
      if (this.config.auth) {
        await this.authenticate(socket);
      }

      // MAIL FROM
      await this.sendCommand(socket, `MAIL FROM:<${message.from}>`);

      // RCPT TO
      for (const email of toEmails) {
        await this.sendCommand(socket, `RCPT TO:<${email}>`);
      }

      // Handle CC
      if (message.cc) {
        const ccEmails = Array.isArray(message.cc) ? message.cc : [message.cc];
        for (const email of ccEmails) {
          await this.sendCommand(socket, `RCPT TO:<${email}>`);
        }
      }

      // Handle BCC
      if (message.bcc) {
        const bccEmails = Array.isArray(message.bcc) ? message.bcc : [message.bcc];
        for (const email of bccEmails) {
          await this.sendCommand(socket, `RCPT TO:<${email}>`);
        }
      }

      // DATA
      await this.sendCommand(socket, 'DATA');

      // Email headers and body
      const emailContent = this.buildEmailContent(message);
      await this.sendCommand(socket, emailContent + '\r\n.');

      // QUIT
      await this.sendCommand(socket, 'QUIT');
      socket.destroy();

      return {
        success: true,
        messageId: this.generateMessageId(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SMTP error',
      };
    }
  }

  /**
   * Create socket connection (secure or insecure)
   */
  private async createConnection(): Promise<Socket | TLSSocket> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.config.timeout);

      if (this.config.secure) {
        // TLS connection
        const socket = tlsConnect({
          host: this.config.host,
          port: this.config.port,
          secureContext: createSecureContext(),
        });

        socket.on('secureConnect', () => {
          clearTimeout(timeout);
          resolve(socket);
        });

        socket.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      } else {
        // Plain TCP connection
        const socket = createConnection({
          host: this.config.host,
          port: this.config.port,
        });

        socket.on('connect', () => {
          clearTimeout(timeout);
          resolve(socket);
        });

        socket.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      }
    });
  }

  /**
   * Upgrade plain socket to TLS for STARTTLS
   */
  private async upgradeToTLS(plainSocket: Socket): Promise<TLSSocket> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('TLS upgrade timeout'));
      }, this.config.timeout);

      // Create TLS socket by wrapping the existing plain socket
      const tlsSocket = tlsConnect({
        socket: plainSocket,
        host: this.config.host,
        servername: this.config.host, // SNI support
        rejectUnauthorized: false, // For development - should be true in production
      });

      tlsSocket.on('secureConnect', () => {
        clearTimeout(timeout);
        console.log('TLS upgrade successful');
        resolve(tlsSocket);
      });

      tlsSocket.on('error', (error) => {
        clearTimeout(timeout);
        console.error('TLS upgrade failed:', error);
        reject(error);
      });
    });
  }

  /**
   * Send SMTP command and wait for response
   */
  private async sendCommand(socket: Socket | TLSSocket, command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let response = '';

      const onData = (data: Buffer) => {
        response += data.toString();
        
        // Check if response is complete (ends with \r\n)
        if (response.endsWith('\r\n')) {
          socket.off('data', onData);
          
          // Check for SMTP error codes (4xx, 5xx)
          const code = parseInt(response.substring(0, 3));
          if (code >= 400) {
            reject(new Error(`SMTP Error ${code}: ${response.trim()}`));
          } else {
            resolve(response.trim());
          }
        }
      };

      socket.on('data', onData);
      socket.write(command + '\r\n');

      // Timeout for command response
      setTimeout(() => {
        socket.off('data', onData);
        reject(new Error(`Command timeout: ${command}`));
      }, this.config.timeout);
    });
  }

  /**
   * Authenticate with SMTP server
   */
  private async authenticate(socket: Socket | TLSSocket): Promise<void> {
    if (!this.config.auth) {
      throw new Error('Authentication requested but no auth config provided');
    }
    
    await this.sendCommand(socket, 'AUTH LOGIN');
    
    const userB64 = Buffer.from(this.config.auth.user).toString('base64');
    await this.sendCommand(socket, userB64);
    
    const passB64 = Buffer.from(this.config.auth.pass).toString('base64');
    await this.sendCommand(socket, passB64);
  }

  /**
   * Build RFC 5322 compliant email content
   */
  private buildEmailContent(message: EmailMessage): string {
    const lines: string[] = [];

    // Headers
    lines.push(`From: ${message.from}`);
    
    const toEmails = Array.isArray(message.to) ? message.to.join(', ') : message.to;
    lines.push(`To: ${toEmails}`);
    
    if (message.cc) {
      const ccEmails = Array.isArray(message.cc) ? message.cc.join(', ') : message.cc;
      lines.push(`Cc: ${ccEmails}`);
    }
    
    if (message.replyTo) {
      lines.push(`Reply-To: ${message.replyTo}`);
    }
    
    lines.push(`Subject: ${message.subject}`);
    lines.push(`Date: ${new Date().toUTCString()}`);
    lines.push(`Message-ID: <${this.generateMessageId()}>`);
    
    // Content type
    if (message.html) {
      lines.push('MIME-Version: 1.0');
      lines.push('Content-Type: text/html; charset=utf-8');
    } else {
      lines.push('Content-Type: text/plain; charset=utf-8');
    }
    
    lines.push(''); // Empty line before body
    
    // Body
    if (message.html) {
      lines.push(message.html);
    } else if (message.text) {
      lines.push(message.text);
    }

    return lines.join('\r\n');
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}.${random}@synet.email`;
  }
}
