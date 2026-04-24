const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}`);
  } catch (err) {
    logger.error('Email send failed', { error: err.message });
  }
};

const sendApplicationConfirmation = async (candidate, job) => {
  await sendEmail({
    to: candidate.email,
    subject: `Application Received – ${job.title}`,
    html: `
      <div dir="rtl" style="font-family: Arial; padding: 20px;">
        <h2>שלום ${candidate.name},</h2>
        <p>קיבלנו את הגשתך למשרה: <strong>${job.title}</strong> ב${job.companyName}.</p>
        <p>נציג יצור איתך קשר בהקדם.</p>
        <p>תודה,<br/>צוות הגיוס</p>
      </div>
    `,
  });
};

const sendStatusUpdate = async (candidate, job, status) => {
  const statusMap = {
    'in-review': 'בבדיקה',
    'rejected': 'לא התקדמנו',
    'hired': 'התקבלת!',
  };
  await sendEmail({
    to: candidate.email,
    subject: `עדכון סטטוס – ${job.title}`,
    html: `
      <div dir="rtl" style="font-family: Arial; padding: 20px;">
        <h2>שלום ${candidate.name},</h2>
        <p>סטטוס הגשתך למשרה <strong>${job.title}</strong> עודכן ל: <strong>${statusMap[status] || status}</strong>.</p>
        <p>תודה,<br/>צוות הגיוס</p>
      </div>
    `,
  });
};

const sendAdminNewApplication = async (candidate, job) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
  if (!adminEmail) return;
  await sendEmail({
    to: adminEmail,
    subject: `מועמד חדש – ${job.title}`,
    html: `
      <div dir="rtl" style="font-family: Arial; padding: 20px;">
        <h2>מועמד חדש הגיש מועמדות</h2>
        <p><strong>מועמד:</strong> ${candidate.name} (${candidate.email})</p>
        <p><strong>משרה:</strong> ${job.title} – ${job.companyName}</p>
        <p><strong>מיקום:</strong> ${job.location}</p>
        <p>היכנס ללוח הניהול לצפייה בפרטים.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendApplicationConfirmation, sendStatusUpdate, sendAdminNewApplication };
