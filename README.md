# @synet/email

```bash
 _______ .___  ___.      ___       __   __      
|   ____||   \/   |     /   \     |  | |  |     
|  |__   |  \  /  |    /  ^  \    |  | |  |     
|   __|  |  |\/|  |   /  /_\  \   |  | |  |     
|  |____ |  |  |  |  /  _____  \  |  | |  `----.
|_______||__|  |__| /__/     \__\ |__| |_______|
                                                
    __    __  .__   __.  __  .___________.      
   |  |  |  | |  \ |  | |  | |           |      
   |  |  |  | |   \|  | |  | `---|  |----`      
   |  |  |  | |  . `  | |  |     |  |           
   |  `--'  | |  |\   | |  |     |  |           
    \______/  |__| \__| |__|     |__|           
                                                
version: 1.0.0                                   
```

Zero-dependency, secure email sending library following Unit Architecture principles.

## 🚀 Quick Start

```typescript
import { Email } from "@synet/email";

// Create email unit
const email = Email.create({
  type: "smtp",
  options: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "your-email@gmail.com",
      pass: "your-app-password",
    },
  },
});

// Send email
const result = await email.send({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Hello from SYNET!",
  text: "This is a test email from the SYNET Email Unit.",
  html: "<h1>Hello from SYNET!</h1><p>This is a <strong>test email</strong> from the SYNET Email Unit.</p>",
});

if (result.success) {
  console.log("Email sent! Message ID:", result.messageId);
} else {
  console.error("Failed to send:", result.error);
}
```

## 📧 Email Adapters

The library provides multiple email adapters for different providers and use cases.

### SMTP Adapter

Production-ready SMTP implementation using nodemailer for reliable email delivery.

```typescript
import { SMTPEmail } from "@synet/email";

const smtp = new SMTPEmail({
  host: "email-smtp.eu-west-1.amazonaws.com", // AWS SES
  port: 587,
  secure: false, // false for STARTTLS, true for SSL
  auth: {
    user: "AKIA...", // AWS SES SMTP username
    pass: "BIG...",  // AWS SES SMTP password
  },
});

// Test connection
const canConnect = await smtp.checkConnection();
console.log("Can connect:", canConnect);

// Send email
const result = await smtp.send({
  from: "noreply@yourapp.com",
  to: "user@example.com",
  subject: "Welcome!",
  text: "Welcome to our service!",
});
```

#### Supported SMTP Providers

- **AWS SES**: `email-smtp.{region}.amazonaws.com:587`
- **Gmail**: `smtp.gmail.com:587` (requires app password)
- **Outlook/Office365**: `smtp.office365.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Resend**: `smtp.resend.com:587`
- **Custom SMTP**: Any RFC-compliant SMTP server

### Resend Adapter

HTTP API implementation for Resend.com transactional email service.

```typescript
import { ResendEmail } from "@synet/email";

const resend = new ResendEmail({
  apiKey: "re_your_api_key_here",
});

// Test connection
const canConnect = await resend.checkConnection();

// Send email
const result = await resend.send({
  from: "onboarding@yourapp.com",
  to: "user@example.com",
  subject: "Welcome to our platform!",
  html: "<h1>Welcome!</h1><p>Thanks for joining us.</p>",
});
```

## 🧠 Unit Architecture

SYNET Email follows the Unit Architecture pattern - conscious software components that can teach capabilities to other units and learn from them.

### Basic Unit Usage

```typescript
import { Email } from "@synet/email";

// Create email unit
const emailUnit = Email.create({
  type: "smtp",
  options: {
    host: "smtp.resend.com",
    port: 587,
    secure: false,
    auth: {
      user: "resend",
      pass: "your-api-key",
    },
  },
});

// Unit information
console.log("Unit identity:", emailUnit.whoami());
console.log("Capabilities:", emailUnit.capabilities());
console.log("Can send emails:", emailUnit.capableOf("send"));

// Test capabilities
const isValid = await emailUnit.validateEmail("test@example.com");
const canConnect = await emailUnit.checkConnection();
```

### Teaching and Learning

Email units can teach their capabilities to other units in the SYNET consciousness network:

```typescript
// Get teaching contract
const contract = emailUnit.teach();
console.log("Teaching contract:", contract);

// Example teaching contract:
// {
//   unitId: "email",
//   capabilities: {
//     validateEmail: [Function],
//     checkConnection: [Function],
//     send: [Function]
//   }
// }

// Another unit can learn from this contract
const learnerUnit = SomeOtherUnit.create().learn([contract]);

// Now the learner can execute email capabilities
const result = await learnerUnit.execute("email.send", {
  from: "system@app.com",
  to: "user@example.com",
  subject: "Automated notification",
  text: "This email was sent by a unit that learned email capabilities!"
});
```

### Unit Evolution

Units are immutable but can evolve to new versions:

```typescript
// Evolve unit with new configuration
const evolvedUnit = emailUnit.evolve({
  type: "resend",
  options: {
    apiKey: "new-resend-api-key",
  },
});

// Original unit unchanged, evolved unit has new config
console.log("Original provider:", emailUnit.getConfig().type); // "smtp"
console.log("Evolved provider:", evolvedUnit.getConfig().type); // "resend"
```

### Multi-Provider Setup

```typescript
// Create multiple email units for different purposes
const transactionalEmail = Email.create({
  type: "resend",
  options: { apiKey: "re_..." },
});

const marketingEmail = Email.create({
  type: "smtp",
  options: {
    host: "smtp.sendgrid.net",
    port: 587,
    auth: { user: "apikey", pass: "SG...." },
  },
});

// Use appropriate unit for each use case
await transactionalEmail.send({
  from: "noreply@app.com",
  to: "user@example.com",
  subject: "Password Reset",
  // ...
});

await marketingEmail.send({
  from: "newsletter@app.com",
  to: "subscribers@example.com",
  subject: "Weekly Newsletter",
  // ...
});
```

## 📝 API Reference

### Email Unit

#### `Email.create(config)`

Creates a new email unit with the specified provider configuration.

**Parameters:**
- `config.type`: `"smtp" | "resend"` - Email provider type
- `config.options`: Provider-specific configuration object

**Returns:** `Email` unit instance

#### Instance Methods

- `send(message)`: Send an email message
- `validateEmail(email)`: Validate email address format
- `checkConnection()`: Test connection to email provider
- `teach()`: Get teaching contract with capabilities
- `learn(contracts)`: Learn capabilities from other units
- `evolve(config)`: Create evolved unit with new configuration

### Email Message

```typescript
interface EmailMessage {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailAttachment[];
}
```

### Email Result

```typescript
interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

## 🔧 Configuration

### SMTP Configuration

```typescript
interface SMTPConfig {
  host: string;          // SMTP server hostname
  port: number;          // SMTP port (587 for STARTTLS, 465 for SSL)
  secure?: boolean;      // true for SSL, false for STARTTLS
  auth?: {
    user: string;        // SMTP username
    pass: string;        // SMTP password or API key
  };
  timeout?: number;      // Connection timeout in milliseconds
}
```

### Resend Configuration

```typescript
interface ResendConfig {
  apiKey: string;        // Resend API key
  baseUrl?: string;      // API base URL (default: https://api.resend.com)
  timeout?: number;      // Request timeout in milliseconds
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🎯 Examples

### AWS SES Example

```typescript
const email = Email.create({
  type: "smtp",
  options: {
    host: "email-smtp.eu-west-1.amazonaws.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.AWS_SES_SMTP_USER,
      pass: process.env.AWS_SES_SMTP_PASS,
    },
  },
});
```

### Gmail Example

```typescript
const email = Email.create({
  type: "smtp",
  options: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "your-email@gmail.com",
      pass: "your-app-password", // Generate in Google Account settings
    },
  },
});
```

### Resend Example

```typescript
const email = Email.create({
  type: "resend",
  options: {
    apiKey: process.env.RESEND_API_KEY,
  },
});
```

## 🏗️ Architecture

This library follows the SYNET Unit Architecture principles:

- **Zero Dependencies**: Core units have no external dependencies (nodemailer is used for SMTP reliability)
- **Teach/Learn Paradigm**: Units can teach capabilities to other units
- **Props Contain Everything**: No private field duplication, props are single source of truth
- **Immutable Evolution**: Units evolve to new versions rather than mutating
- **Capability-Based Composition**: Acquire capabilities through learning, not inheritance

## 📋 Requirements

- Node.js ≥ 18.0.0
- TypeScript ≥ 5.0.0 (for development)

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 🔗 Related

- [@synet/unit](https://github.com/synthetism/unit) - Core Unit Architecture framework
- [@synet/fs](https://github.com/synthetism/fs) - File system operations with Unit Architecture
- [SYNET Documentation](https://docs.synthetism.ai) - Complete SYNET ecosystem documentation
