/**
 * Quick Nodemailer Test - Compare with our SMTP implementation
 * 
 * Tests AWS SES with the same credentials to see if nodemailer works
 */

import nodemailer from "nodemailer";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

async function testNodemailer() {
  console.log("📧 Nodemailer AWS SES Test");
  console.log("==========================\n");

  try {
    // Load SMTP credentials
    console.log("1. Loading SMTP credentials...");
    const credentialsPath = join(process.cwd(), "private", "smtp.json");
    const credentialsData = await readFile(credentialsPath, "utf-8");
    const credentials = JSON.parse(credentialsData);
    
    console.log(`✅ Loaded credentials for: ${credentials.SMTP_HOST}`);
    console.log(`📧 Port: ${credentials.SMTP_PORT}, Secure: ${credentials.SMTP_SECURE}`);

    // Create transporter exactly like the working email.server.ts
    console.log("\n2. Creating nodemailer transporter...");
    const transporter = nodemailer.createTransport({
      host: credentials.SMTP_HOST,
      port: Number(credentials.SMTP_PORT),
      secure: Number(credentials.SMTP_PORT) === 465, // true for SSL (465), false for STARTTLS (587)
      auth: {
        user: credentials.SMTP_USER,
        pass: credentials.SMTP_PASS,
      },
    });

    console.log("✅ Transporter created");

    // Test connection
    console.log("\n3. Testing connection...");
    try {
      const verified = await new Promise((resolve, reject) => {
        transporter.verify((error, success) => {
          if (error) {
            reject(error);
          } else {
            resolve(success);
          }
        });
      });
      console.log("✅ Connection verified successfully!");
    } catch (error) {
      console.log("❌ Connection verification failed:");
      console.error(error);
      return;
    }

    // Send test email
    console.log("\n4. Sending test email...");
    try {
      const result = await transporter.sendMail({
        from: `"SYNET Test" <${credentials.FROM_EMAIL}>`,
        to: "0en@synthetism.com",
        subject: "🧠 SYNET Email Test via Nodemailer",
        text: `
Hello from SYNET!

This is a test email sent via nodemailer to verify AWS SES connectivity.

Sent at: ${new Date().toISOString()}
From: SYNET Email Unit Development
        `,
        html: `
<h2>🧠 Hello from SYNET!</h2>
<p>This is a test email sent via <strong>nodemailer</strong> to verify AWS SES connectivity.</p>
<ul>
  <li><strong>Sent at:</strong> ${new Date().toISOString()}</li>
  <li><strong>From:</strong> SYNET Email Unit Development</li>
  <li><strong>Purpose:</strong> Validate SMTP configuration</li>
</ul>
<p><em>If you receive this, nodemailer is working correctly with AWS SES!</em></p>
        `,
      });

      console.log("✅ Email sent successfully!");
      console.log(`📬 Message ID: ${result.messageId}`);
      console.log(`📤 Response: ${result.response}`);

    } catch (error) {
      console.log("❌ Email sending failed:");
      console.error(error);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testNodemailer().catch(console.error);
