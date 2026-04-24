const axios = require('axios');
const logger = require('../utils/logger');

const sendToSheets = async ({ name, email, role, createdAt }) => {
  const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, {
      name,
      email,
      role: role === 'candidate' ? 'מועמד' : 'חברה',
      registeredAt: new Date(createdAt).toLocaleString('he-IL'),
    });
    logger.info(`Sheets webhook sent for ${email}`);
  } catch (err) {
    logger.warn('Sheets webhook failed', { error: err.message });
  }
};

module.exports = { sendToSheets };
