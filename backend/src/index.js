require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
};

start().catch(err => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
