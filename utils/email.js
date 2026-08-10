import nodemailer from 'nodemailer';

/**
 * Sends a password reset OTP to the specified administrator email.
 * Falls back to console log if SMTP is not configured.
 * 
 * @param {string} email - Destination email address
 * @param {string} otp - 6-digit One-Time Password
 * @returns {Promise<boolean>}
 */
export const sendOtpEmail = async (email, otp) => {
  console.log(`\n==================================================`);
  console.log(`[OTP GENERATED] OTP for ${email}: ${otp}`);
  console.log(`==================================================\n`);

  // Check if SMTP is configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[EMAIL SERVICE] SMTP settings are missing in .env. Displaying OTP in server console only.`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || `"PUP Wayfinder" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'PUP Wayfinder - Admin Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #800000; text-align: center;">PUP Wayfinder Admin Password Reset</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your PUP Wayfinder administrator account. Please use the following One-Time Password (OTP) to proceed with resetting your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #800000; background-color: #f9f9f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #800000;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes and can only be used once. If you did not initiate this request, please secure your account immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} PUP Wayfinder. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL SERVICE] Error sending mail via SMTP:`, error.message);
    throw new Error('Failed to send OTP email via SMTP, but OTP was printed to server console for testing.');
  }
};
