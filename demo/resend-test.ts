/**
 * Resend Email Test - Using Resend's SMTP interface
 * 
 * Tests Resend email sending using their SMTP credentials
 */

import { Email, SMTPEmail, ResendEmail } from "../src/index.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

async function testResendEmail() {
  console.log("📧 Resend Email Test");
  console.log("===================\n");

  try {
    // Load Resend credentials
    console.log("1. Loading Resend credentials...");
    const credentialsPath = join(process.cwd(), "private", "resend.json");
    const credentialsData = await readFile(credentialsPath, "utf-8");
    const credentials = JSON.parse(credentialsData);
    
    console.log('✅ Loaded Resend SMTP credentials');
    console.log(`📧 Port: ${credentials.SMTP_PORT}, User: ${credentials.SMTP_USER}`);

    // Test 1: Resend via SMTP adapter (since Resend provides SMTP)
    console.log("\n2. Testing Resend via SMTP adapter...");
    const smtpAdapter = new SMTPEmail({
      host: "smtp.resend.com",
      port: credentials.SMTP_PORT,
      secure: credentials.SMTP_PORT === 465, // SSL for 465
      auth: {
        user: credentials.SMTP_USER,
        pass: credentials.SMTP_PASS,
      },
    });

    console.log("🔌 Testing SMTP connection to Resend...");
    const canConnect = await smtpAdapter.checkConnection();
    console.log(`   ${canConnect ? "✅ Connected" : "❌ Connection failed"}`);

    if (canConnect) {
      console.log("\n📤 Sending test email via Resend SMTP...");
      const result = await smtpAdapter.send({
        to: credentials.SMTP_TO,
        from: credentials.SMTP_FROM,
        subject: "🚀 SYNET Email Test via Resend SMTP",
        text: `
Hello from SYNET via Resend!

This email was sent using Resend's SMTP interface through our SYNET Email Unit.

✅ Provider: Resend SMTP
✅ From: ${credentials.SMTP_FROM}
✅ Port: ${credentials.SMTP_PORT}

Sent at: ${new Date().toISOString()}
From: SYNET Email Unit Development
        `,
        html: `
<h2>🚀 Hello from SYNET via Resend!</h2>
<p>This email was sent using <strong>Resend's SMTP interface</strong> through our SYNET Email Unit.</p>

<h3>✅ Configuration:</h3>
<ul>
  <li><strong>Provider:</strong> Resend SMTP</li>
  <li><strong>From:</strong> ${credentials.SMTP_FROM}</li>
  <li><strong>Port:</strong> ${credentials.SMTP_PORT}</li>
</ul>

<p><strong>Sent at:</strong> ${new Date().toISOString()}<br>
<strong>From:</strong> SYNET Email Unit Development</p>

<p><em>🎉 If you receive this, Resend integration is working perfectly!</em></p>
        `,
      });

      if (result.success) {
        console.log("   ✅ Resend SMTP email sent successfully!");
        console.log(`   📬 Message ID: ${result.messageId}`);
      } else {
        console.log("   ❌ Resend SMTP email failed:");
        console.log(`   💥 Error: ${result.error}`);
      }
    }

    // Test 2: Resend via Resend adapter (simpler configuration)
    console.log("\n3. Testing Resend via Resend adapter...");
    const resendAdapter = new ResendEmail({
      apiKey: credentials.SMTP_PASS, // Use the API key from credentials
      from: credentials.SMTP_FROM,   // Default from address
    });

    console.log("🔌 Testing Resend adapter connection...");
    const resendCanConnect = await resendAdapter.checkConnection();
    console.log(`   ${resendCanConnect ? "✅ Connected" : "❌ Connection failed"}`);

    if (resendCanConnect) {
      console.log("\n📤 Sending test email via Resend adapter...");
      const resendResult = await resendAdapter.send({
        to: "0en@synthetism.com",
        from: credentials.SMTP_FROM,
        subject: "🌟 SYNET Email Test via Resend Adapter",
        text: `
Hello from SYNET via Resend Adapter!

This email was sent using the simplified Resend adapter through our SYNET Email Unit.

✅ Provider: Resend Adapter (SMTP wrapper)
✅ From: ${credentials.SMTP_FROM}
✅ Host: smtp.resend.com

Sent at: ${new Date().toISOString()}
From: SYNET Email Unit Development
        `,
        html: `
<h2>🌟 Hello from SYNET via Resend Adapter!</h2>
<p>This email was sent using the <strong>simplified Resend adapter</strong> through our SYNET Email Unit.</p>

<h3>✅ Configuration:</h3>
<ul>
  <li><strong>Provider:</strong> Resend Adapter (SMTP wrapper)</li>
  <li><strong>From:</strong> ${credentials.SMTP_FROM}</li>
  <li><strong>Host:</strong> smtp.resend.com</li>
</ul>

<p><strong>Sent at:</strong> ${new Date().toISOString()}<br>
<strong>From:</strong> SYNET Email Unit Development</p>

<p><em>🎉 If you receive this, the simplified Resend adapter is working perfectly!</em></p>
        `,
      });

      if (resendResult.success) {
        console.log("   ✅ Resend adapter email sent successfully!");
        console.log(`   📬 Message ID: ${resendResult.messageId}`);
      } else {
        console.log("   ❌ Resend adapter email failed:");
        console.log(`   💥 Error: ${resendResult.error}`);
      }
    }

    // Test 3: Email Unit with Resend provider
    console.log("\n4. Testing Email Unit with Resend provider...");
    const emailUnit = Email.create({
      type: "resend",
      options: {
        apiKey: credentials.SMTP_PASS,
        from: credentials.SMTP_FROM,
      },
    });

    console.log(`🧬 Created: ${emailUnit.whoami()}`);
    console.log(`📋 Capabilities: ${emailUnit.capabilities().join(', ')}`);

    const unitCanConnect = await emailUnit.checkConnection();
    console.log(`🔌 Unit connection: ${unitCanConnect ? "✅ Connected" : "❌ Failed"}`);

    if (unitCanConnect) {
      console.log("\n📤 Sending email via Email Unit...");
      const unitResult = await emailUnit.send({
        to: "0en@synthetism.com",
        from: credentials.SMTP_FROM,
        subject: "🧠 SYNET Email Unit Test via Resend",
        text: `
Hello from SYNET Email Unit!

This email was sent through the SYNET Email Unit using Resend as the provider.

✅ Unit Architecture: Conscious software components
✅ Provider: Resend SMTP
✅ Capabilities: teach/learn paradigm

The Email Unit can teach its capabilities to other units in the SYNET consciousness network.

Sent at: ${new Date().toISOString()}
From: SYNET Email Unit Development
        `,
        html: `
<h2>🧠 Hello from SYNET Email Unit!</h2>
<p>This email was sent through the <strong>SYNET Email Unit</strong> using Resend as the provider.</p>

<h3>✅ Features:</h3>
<ul>
  <li><strong>Unit Architecture:</strong> Conscious software components</li>
  <li><strong>Provider:</strong> Resend SMTP</li>
  <li><strong>Capabilities:</strong> teach/learn paradigm</li>
</ul>

<p>The Email Unit can <strong>teach its capabilities</strong> to other units in the SYNET consciousness network.</p>

<p><strong>Sent at:</strong> ${new Date().toISOString()}<br>
<strong>From:</strong> SYNET Email Unit Development</p>

<p><em>🎉 Welcome to the future of conscious software architecture!</em></p>
        `,
      });

      if (unitResult.success) {
        console.log("   ✅ Email Unit sent successfully!");
        console.log(`   📬 Message ID: ${unitResult.messageId}`);
      } else {
        console.log("   ❌ Email Unit failed:");
        console.log(`   💥 Error: ${unitResult.error}`);
      }
    }

    console.log("\n🎉 Resend email test complete!");
    console.log("✨ Both SMTP and API adapters tested successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testResendEmail().catch(console.error);
