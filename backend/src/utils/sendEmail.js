import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a password reset email to the user.
 * @param {string} toEmail - recipient email address
 * @param {string} resetUrl - full reset link including token
 */
export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"FoodLens" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Reset Your FoodLens Password",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Reset Password</title>
        <style>
          body { margin: 0; padding: 0; background: #F5F7F3; font-family: 'Segoe UI', system-ui, sans-serif; }
          .wrapper { max-width: 560px; margin: 40px auto; }
          .card { background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(28,57,39,0.08); }
          .header { background: linear-gradient(135deg, #194C34 0%, #286B48 60%, #438660 100%); padding: 36px 40px; }
          .header-logo { display: flex; align-items: center; gap: 12px; }
          .header-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.15); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
          .header h1 { color: #fff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: -0.025em; }
          .header p { color: rgba(255,255,255,0.65); font-size: 12px; margin: 2px 0 0; }
          .body { padding: 36px 40px; }
          .body h2 { color: #173C29; font-size: 20px; font-weight: 700; margin: 0 0 12px; }
          .body p { color: #77867A; font-size: 15px; line-height: 1.65; margin: 0 0 20px; }
          .btn-wrap { margin: 28px 0; }
          .btn { display: inline-block; background: linear-gradient(135deg, #194C34, #286B48); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; letter-spacing: 0.01em; }
          .notice { background: #EAF2EB; border-radius: 10px; padding: 16px 20px; }
          .notice p { color: #286B48; font-size: 13px; margin: 0; }
          .footer { padding: 20px 40px 32px; text-align: center; }
          .footer p { color: #9AA69B; font-size: 12px; margin: 4px 0; }
          .divider { border: none; border-top: 1px solid #E1E8E0; margin: 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <div class="header">
              <div class="header-logo">
                <div class="header-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2a9 9 0 0 1 9 9c0 4.17-2.84 7.67-6.69 8.69L12 22l-2.31-2.31C5.84 18.67 3 15.17 3 11a9 9 0 0 1 9-9Z"/>
                    <path d="m7 11 3 3 7-7"/>
                  </svg>
                </div>
                <div>
                  <h1>FoodLens</h1>
                  <p>FOOD LABEL INTELLIGENCE</p>
                </div>
              </div>
            </div>

            <div class="body">
              <h2>Reset your password</h2>
              <p>We received a request to reset the password for your FoodLens account. Click the button below to choose a new password.</p>

              <div class="btn-wrap">
                <a href="${resetUrl}" class="btn">Reset Password</a>
              </div>

              <div class="notice">
                <p>⏱ This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your account remains secure.</p>
              </div>

              <p style="margin-top:24px; font-size:13px;">If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${resetUrl}" style="color:#286B48; word-break:break-all;">${resetUrl}</a>
              </p>
            </div>

            <hr class="divider"/>
            <div class="footer">
              <p>© ${new Date().getFullYear()} FoodLens. This email was sent to ${toEmail}.</p>
              <p>Not medical advice. For informational purposes only.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
