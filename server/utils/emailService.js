import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a verification email to the user
 * @param {Object} user - User document with email, firstName, lastName
 * @param {string} verificationToken - The verification token
 */
export async function sendVerificationEmail(user, verificationToken) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"Finely" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: "Verify your email address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: #f9fafb; padding: 30px; border-radius: 8px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo img { height: 40px; }
            h1 { color: #111827; font-size: 24px; margin-bottom: 10px; }
            p { color: #4b5563; font-size: 16px; margin-bottom: 20px; }
            .button { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 16px; }
            .button:hover { background: #059669; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h2>Finely</h2>
            </div>
            <h1>Verify your email address</h1>
            <p>Hello ${user.firstName || 'there'},</p>
            <p>Thanks for signing up! Please verify your email address to activate your account.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} Finely. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Verification email sent to ${user.email}: ${info.messageId}`);
  return info;
}

export default { sendVerificationEmail };