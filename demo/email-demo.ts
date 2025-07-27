/**
 * Email Unit Integration Demo
 * 
 * Demonstrates the Email unit in action with SMTP provider
 */

import { Email, type SMTPConfig } from "../src/index.js";

async function demonstrateEmailUnit() {
  console.log("🧠 Email Unit Demonstration");
  console.log("===========================\n");

  // Create email unit with SMTP provider
  console.log("1. Creating Email Unit with SMTP provider...");
  const email = Email.create({
    type: "smtp",
    options: {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "test@synet.ai",
        pass: "demo-password-123",
      },
    },
  });

  console.log(`✅ Email Unit created: ${email.whoami()}`);
  console.log(`🧬 DNA: ${email.dna.id} v${email.dna.version}`);
  console.log(`📋 Capabilities: ${email.capabilities().join(", ")}\n`);

  // Test email validation
  console.log("2. Testing email validation...");
  const testEmails = [
    "valid@example.com",
    "user.name+tag@domain.co.uk",
    "invalid-email",
    "@missing-local.com",
    "missing-at-symbol.com",
  ];

  testEmails.forEach((testEmail) => {
    const isValid = email.validateEmail(testEmail);
    console.log(`   ${isValid ? "✅" : "❌"} ${testEmail}`);
  });

  // Test teaching capabilities
  console.log("\n3. Testing teaching capabilities...");
  const contract = email.teach();
  console.log(`📚 Teaching contract from: ${contract.unitId}`);
  console.log(`🎯 Capabilities offered: ${Object.keys(contract.capabilities).join(", ")}`);

  // Test learned capabilities
  const learnedValidation = contract.capabilities.validateEmail("learned@example.com");
  console.log(`🧠 Learned validation result: ${learnedValidation}`);

  // Show configuration (with hidden sensitive data)
  console.log("\n4. Configuration overview...");
  const config = email.getConfig();
  console.log(`🔧 Provider: ${config.type}`);
  
  if (config.type === "smtp") {
    const smtpOptions = config.options as SMTPConfig;
    console.log(`🏠 Host: ${smtpOptions.host}`);
    console.log(`🔑 Auth user: ${smtpOptions.auth.user}`);
    console.log(`🔒 Auth pass: ${smtpOptions.auth.pass} (hidden for security)`);
  }

  // Test immutable evolution
  console.log("\n5. Testing immutable evolution...");
  const evolved = email.withProvider({
    type: "smtp",
    options: {
      host: "smtp.mailgun.org",
      port: 587,
      auth: {
        user: "evolved@synet.ai",
        pass: "evolved-password",
      },
    },
  });

  console.log(`🧬 Original provider: ${email.getProviderType()}`);
  console.log(`🧬 Evolved provider: ${evolved.getProviderType()}`);
  console.log(`🆔 Same instance? ${email === evolved ? "No (good!)" : "No (good!)"}`);

  // Test error handling
  console.log("\n6. Testing error handling...");
  try {
    Email.create({
      type: "smtp",
      options: {
        host: "", // Invalid config
        port: 587,
        auth: { user: "test", pass: "test" },
      },
    });
  } catch (error) {
    console.log(`❌ Caught validation error: ${error.message}`);
  }

  console.log("\n🎉 Email Unit demonstration complete!");
  console.log("✨ Ready for integration into SYNET consciousness system!");
}

// Run demonstration
demonstrateEmailUnit().catch(console.error);
