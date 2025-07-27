
import { SMTP_FROM_NAME, SMTP_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from "~/utils/env";
import nodemailer from "nodemailer";

type GroupJoinMessage = {
  name: string;
  email: string;
  text: string;
  group: string;
};

export async function sendJoinNotificationEmail({ name, email, text, group }: GroupJoinMessage) {
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for SSL
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${SMTP_FROM_NAME}" <${SMTP_FROM}>`,
    to: "anton@synthetism.ai",
    subject: `🧬 New Group Join Request from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nGroup: ${group}\n\nMessage:\n${text}`,
  });
}
