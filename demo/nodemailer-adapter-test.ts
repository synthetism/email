/**
 * Test the Nodemailer SMTP Adapter directly
 * 
 * Verify production-ready email sending with SYNET patterns
 */

import { NodemailerSMTPEmail } from "../src/index.js";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

async function testNodemailerAdapter() {
  console.log("📧 Nodemailer SMTP Adapter Test");
  console.log("===============================\n");

  try {
    // Load SMTP credentials
    console.log("1. Loading SMTP credentials...");
    const credentialsPath = join(process.cwd(), "private", "smtp.json");
    const credentialsData = await readFile(credentialsPath, "utf-8");
    const credentials = JSON.parse(credentialsData);
    
    console.log(`✅ Loaded credentials for: ${credentials.SMTP_HOST}`);

    // Create nodemailer adapter
    console.log("\n2. Creating Nodemailer SMTP adapter...");
    const adapter = new NodemailerSMTPEmail({
      host: credentials.SMTP_HOST,
      port: credentials.SMTP_PORT,
      secure: credentials.SMTP_PORT === 465, // SSL for 465, STARTTLS for others
      auth: {
        user: credentials.SMTP_USER,
        pass: credentials.SMTP_PASS,
      },
    });

    console.log("✅ Adapter created");

    // Test validation
    console.log("\n3. Testing email validation...");
    const testEmail = "0en@synthetism.com";
    const isValid = adapter.validateEmail(testEmail);
    console.log(`   📧 ${testEmail}: ${isValid ? "✅ Valid" : "❌ Invalid"}`);

    // Test connection
    console.log("\n4. Testing connection...");
    const canConnect = await adapter.checkConnection();
    console.log(`   🔌 Connection: ${canConnect ? "✅ Success" : "❌ Failed"}`);

    if (canConnect) {
      // Send test email
      console.log("\n5. Sending test email...");
      const result = await adapter.send({
        to: testEmail,
        from: credentials.FROM_EMAIL,
        subject: "🧠 SYNET Nodemailer Adapter Test",
        text: `
Hello from SYNET!

This email was sent using our production-ready nodemailer SMTP adapter.

✅ Zero dependencies in core
✅ Unit Architecture compliant  
✅ AWS SES compatible
✅ macOS SSL compatible

Sent at: ${new Date().toISOString()}
From: SYNET Email Unit Development
        `,
        html: `
<h2>🧠 Hello from SYNET!</h2>
<p>This email was sent using our <strong>production-ready nodemailer SMTP adapter</strong>.</p>

<h3>✅ Features:</h3>
<ul>
  <li><strong>Zero dependencies</strong> in core</li>
  <li><strong>Unit Architecture</strong> compliant</li>
  <li><strong>AWS SES</strong> compatible</li>
  <li><strong>macOS SSL</strong> compatible</li>
</ul>

<p><strong>Sent at:</strong> ${new Date().toISOString()}<br>
<strong>From:</strong> SYNET Email Unit Development</p>

<p><em>🎉 If you receive this, our nodemailer adapter is working perfectly!</em></p>
        `,
      });

      if (result.success) {
        console.log("   ✅ Email sent successfully!");
        console.log(`   📬 Message ID: ${result.messageId}`);
      } else {
        console.log("   ❌ Email sending failed:");
        console.log(`   💥 Error: ${result.error}`);
      }
    }

    console.log("\n🎉 Nodemailer adapter test complete!");
    console.log("✨ Ready for production use with SYNET consciousness!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testNodemailerAdapter().catch(console.error);
