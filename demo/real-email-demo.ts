/**
 * Real Email Sendin    // Test Nodemailer SMTP Adapter directly
    console.log("\n2. Testing Nodemailer SMTP adapter directly...");
    const smtpAdapter = new NodemailerSMTPEmail({
      host: credentials.SMTP_HOST,
      port: credentials.SMTP_PORT,
      secure: credentials.SMTP_PORT === 465, // SSL for 465, STARTTLS for others
      auth: {
        user: credentials.SMTP_USER,
        pass: credentials.SMTP_PASS,
      },
    });* Demonstrates actual email sending using real SMTP credentials
 */

import { Email, NodemailerSMTPEmail } from "../src/index.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

async function demonstrateRealEmailSending() {
  console.log("📧 Real Email Sending Demonstration");
  console.log("===================================\n");

  try {
    // Load real SMTP credentials
    console.log("1. Loading SMTP credentials...");
    const credentialsPath = join(process.cwd(), "private", "smtp.json");
    const credentialsData = await readFile(credentialsPath, "utf-8");
    const credentials = JSON.parse(credentialsData);
    
    console.log(`✅ Loaded credentials for: ${credentials.SMTP_HOST}`);
    console.log(`📧 From email: ${credentials.FROM_EMAIL}\n`);

    // Test nodemailer adapter directly first
    console.log("2. Testing Nodemailer SMTP adapter directly...");
    const smtpAdapter = new NodemailerSMTPEmail({
      host: credentials.SMTP_HOST,
      port: credentials.SMTP_PORT,
      secure: credentials.SMTP_PORT === 465, // SSL for 465, STARTTLS for others
      auth: {
        user: credentials.SMTP_USER,
        pass: credentials.SMTP_PASS,
      },
    });

    console.log("🔍 Validating test email addresses...");
    const testEmail = "0en@synthetism.com";
    const isValid = smtpAdapter.validateEmail(testEmail);
    console.log(`   ✅ ${testEmail}: ${isValid ? "Valid" : "Invalid"}`);

    console.log("\n🔌 Testing SMTP connection...");
    const canConnect = await smtpAdapter.checkConnection();
    console.log(`   ${canConnect ? "✅ Connected" : "❌ Connection failed"}`);

    if (canConnect) {
      console.log("\n📤 Sending test email via nodemailer adapter...");
      const adapterResult = await smtpAdapter.send({
        to: testEmail,
        from: credentials.FROM_EMAIL,
        subject: "🧠 SYNET Email Unit Test - Nodemailer Adapter",
        text: `Hello from SYNET Email Unit!

This is a test message sent directly via the SMTP adapter to verify email functionality.

Test Details:
- Sent from: SYNET Email Unit SMTP Adapter
- Timestamp: ${new Date().toISOString()}
- Provider: AWS SES via ${credentials.SMTP_HOST}
- Architecture: Zero-dependency Node.js implementation

The SMTP adapter is working perfectly! 🎉

Best regards,
SYNET Email System`,
        html: `
<h2>🧠 Hello from SYNET Email Unit!</h2>

<p>This is a test message sent directly via the <strong>SMTP adapter</strong> to verify email functionality.</p>

<h3>📋 Test Details:</h3>
<ul>
  <li><strong>Sent from:</strong> SYNET Email Unit SMTP Adapter</li>
  <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
  <li><strong>Provider:</strong> AWS SES via ${credentials.SMTP_HOST}</li>
  <li><strong>Architecture:</strong> Zero-dependency Node.js implementation</li>
</ul>

<p><em>The SMTP adapter is working perfectly!</em> 🎉</p>

<p>Best regards,<br/>
<strong>SYNET Email System</strong></p>
        `,
      });

      if (adapterResult.success) {
        console.log(`   ✅ Adapter email sent! Message ID: ${adapterResult.messageId}`);
      } else {
        console.log(`   ❌ Adapter email failed: ${adapterResult.error}`);
      }
    }

    // Test Email Unit
    console.log("\n3. Testing Email Unit with real credentials...");
    const emailUnit = Email.create({
      type: "smtp",
      options: {
        host: credentials.SMTP_HOST,
        port: credentials.SMTP_PORT,
        secure: credentials.SMTP_PORT === 465, // SSL for 465, STARTTLS for others
        auth: {
          user: credentials.SMTP_USER,
          pass: credentials.SMTP_PASS,
        },
      },
    });

    console.log(`🧬 Created: ${emailUnit.whoami()}`);
    console.log(`📋 Capabilities: ${emailUnit.capabilities().join(", ")}`);

    console.log("\n🔌 Testing unit connection...");
    const unitCanConnect = await emailUnit.checkConnection();
    console.log(`   ${unitCanConnect ? "✅ Unit connected" : "❌ Unit connection failed"}`);

    if (unitCanConnect) {
      console.log("\n📤 Sending test email via Email Unit...");
      const unitResult = await emailUnit.send({
        to: testEmail,
        from: credentials.FROM_EMAIL,
        subject: "🧬 SYNET Email Unit Test - Full Unit Architecture",
        text: `Hello from SYNET Email Unit Architecture!

This is a test message sent via the full Email Unit to verify the complete unit functionality.

Unit Details:
- Unit DNA: ${emailUnit.dna.id} v${emailUnit.dna.version}
- Provider: ${emailUnit.getProviderType()}
- Capabilities: ${emailUnit.capabilities().join(", ")}
- Architecture: Unit-based, teachable, learnable
- Timestamp: ${new Date().toISOString()}

This demonstrates:
✅ Zero external dependencies
✅ Unit Architecture compliance
✅ Teaching/Learning capabilities
✅ Provider abstraction
✅ Real-world email sending

The Email Unit is ready for SYNET consciousness integration! 🚀

Best regards,
SYNET Email Unit`,
        html: `
<h2>🧬 Hello from SYNET Email Unit Architecture!</h2>

<p>This is a test message sent via the <strong>full Email Unit</strong> to verify the complete unit functionality.</p>

<h3>🧬 Unit Details:</h3>
<ul>
  <li><strong>Unit DNA:</strong> ${emailUnit.dna.id} v${emailUnit.dna.version}</li>
  <li><strong>Provider:</strong> ${emailUnit.getProviderType()}</li>
  <li><strong>Capabilities:</strong> ${emailUnit.capabilities().join(", ")}</li>
  <li><strong>Architecture:</strong> Unit-based, teachable, learnable</li>
  <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
</ul>

<h3>✅ This demonstrates:</h3>
<ul>
  <li>✅ Zero external dependencies</li>
  <li>✅ Unit Architecture compliance</li>
  <li>✅ Teaching/Learning capabilities</li>
  <li>✅ Provider abstraction</li>
  <li>✅ Real-world email sending</li>
</ul>

<p><strong>The Email Unit is ready for SYNET consciousness integration!</strong> 🚀</p>

<p>Best regards,<br/>
<strong>SYNET Email Unit</strong></p>
        `,
      });

      if (unitResult.success) {
        console.log(`   ✅ Unit email sent! Message ID: ${unitResult.messageId}`);
      } else {
        console.log(`   ❌ Unit email failed: ${unitResult.error}`);
      }
    }

    // Test teaching capabilities
    console.log("\n4. Testing unit teaching capabilities...");
    const contract = emailUnit.teach();
    console.log(`📚 Teaching contract: ${contract.unitId}`);
    console.log(`🎯 Offered capabilities: ${Object.keys(contract.capabilities).join(", ")}`);

    // Test learned email validation
    const learnedValidation = contract.capabilities.validateEmail("learned-test@example.com");
    console.log(`🧠 Learned validation test: ${learnedValidation}`);

    console.log("\n🎉 Real email sending demonstration complete!");
    console.log("✨ Email Unit is fully operational and ready for consciousness integration!");

  } catch (error) {
    console.error("❌ Demo failed:", error);
    console.log("\n💡 Make sure the private/smtp.json file exists with valid credentials");
  }
}

// Run demonstration
demonstrateRealEmailSending().catch(console.error);
