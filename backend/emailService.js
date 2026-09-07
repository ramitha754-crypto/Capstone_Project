import sgMail from '@sendgrid/mail';

/**
 * Initializes and verifies SendGrid API configuration.
 * Returns true if properly configured, false otherwise.
 */
function configureSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey || apiKey.startsWith('SG.your_') || apiKey.includes('placeholder')) {
    console.warn('[EmailService] SENDGRID_API_KEY is not configured or contains a placeholder. Email dispatch skipped.');
    return false;
  }

  sgMail.setApiKey(apiKey);
  return true;
}

/**
 * Sends a welcome email to the newly registered user.
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.name - User's full name
 * @param {string} options.username - User's username
 * @param {string} [options.role] - User's role (default: CUSTOMER_REP)
 * @param {string} [options.title] - User's title (e.g. Customer Representative)
 * @returns {Promise<{success: boolean, error?: string, response?: any}>}
 */
export async function sendRegistrationEmail({ to, name, username, role = 'CUSTOMER_REP', title = 'Customer Representative' }) {
  if (!to) {
    console.warn(`[EmailService] No email address provided for user '${username}'. Email dispatch skipped.`);
    return { success: false, error: 'No recipient email provided' };
  }

  const isConfigured = configureSendGrid();
  if (!isConfigured) {
    return { success: false, error: 'SendGrid API key not configured' };
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'ramiramitha41@gmail.com';
  const loginUrl = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

  const subject = `Welcome to Customer Feedback Encapsulation System, ${name}!`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #0f172a;
          color: #e2e8f0;
          margin: 0;
          padding: 30px 15px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #1e293b;
          border-radius: 12px;
          border: 1px solid #334155;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
        }
        .header {
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          padding: 32px 24px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 32px 28px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 16px;
        }
        .card {
          background: #0f172a;
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
          border-left: 4px solid #06b6d4;
        }
        .card-row {
          margin-bottom: 10px;
          font-size: 14px;
        }
        .card-row:last-child {
          margin-bottom: 0;
        }
        .label {
          color: #94a3b8;
          font-weight: 600;
          display: inline-block;
          width: 110px;
        }
        .value {
          color: #38bdf8;
          font-weight: 500;
        }
        .btn-wrapper {
          text-align: center;
          margin: 32px 0 20px;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 600;
          padding: 14px 28px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
        }
        .footer {
          background: #0b1120;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #1e293b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Customer Feedback Portal</h1>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${name} 👋</div>
          <p style="line-height: 1.6; color: #cbd5e1;">
            Your account has been successfully created in the <strong>Customer Feedback Encapsulation &amp; Workflow System</strong>.
          </p>

          <div class="card">
            <div class="card-row"><span class="label">Full Name:</span> <span class="value">${name}</span></div>
            <div class="card-row"><span class="label">Username:</span> <span class="value">${username}</span></div>
            <div class="card-row"><span class="label">Role:</span> <span class="value">${role}</span></div>
            <div class="card-row"><span class="label">Designation:</span> <span class="value">${title}</span></div>
          </div>

          <p style="line-height: 1.6; color: #94a3b8; font-size: 14px;">
            You can now submit customer feedback, track encapsulation pipelines, and monitor feedback processing in real-time.
          </p>

          <div class="btn-wrapper">
            <a href="${loginUrl}" class="btn">Log In to Portal</a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Customer Feedback Encapsulation System. All rights reserved.<br>
          This is an automated notification. Please do not reply directly to this email.
        </div>
      </div>
    </body>
    </html>
  `;

  const msg = {
    to,
    from: fromEmail,
    subject,
    text: `Hello ${name},\n\nWelcome to the Customer Feedback Encapsulation System! Your account (${username}) with role ${role} has been registered successfully.\n\nLog in at: ${loginUrl}`,
    html,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log(`[EmailService] Registration email successfully sent to ${to} (StatusCode: ${response.statusCode})`);
    return { success: true, response };
  } catch (error) {
    const errorDetails = error.response ? error.response.body : error.message;
    console.error(`[EmailService] Failed to send registration email to ${to}:`, errorDetails);
    return { success: false, error: errorDetails };
  }
}
