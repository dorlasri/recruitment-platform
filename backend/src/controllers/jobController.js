const Job = require('../models/Job');
const { parseJobFromEmail } = require('../services/aiService');
const logger = require('../utils/logger');

exports.getJobs = async (req, res) => {
  const { page = 1, limit = 20, search, location, company } = req.query;
  const query = { isActive: true };

  if (search) query.$text = { $search: search };
  if (location) query.location = { $regex: location, $options: 'i' };
  if (company) query.companyName = { $regex: company, $options: 'i' };
  if (req.query.region) query.region = req.query.region;

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('company', 'name logo'),
    Job.countDocuments(query),
  ]);

  res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
};

exports.getJob = async (req, res) => {
  const job = await Job.findById(req.params.id).populate('company', 'name logo contactPerson email');
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json({ job });
};

exports.createJob = async (req, res) => {
  const job = await Job.create(req.body);
  res.status(201).json({ job });
};

exports.updateJob = async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json({ job });
};

exports.deleteJob = async (req, res) => {
  await Job.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Job deactivated' });
};

// Make webhook handler
exports.fromEmail = async (req, res) => {
  const { subject = '', body = '' } = req.body;

  // Verify webhook secret when configured
  const secret = process.env.WEBHOOK_SECRET;
  if (secret) {
    const provided = req.headers['x-webhook-secret'] || req.body.webhookSecret;
    if (provided !== secret) {
      logger.warn('Webhook secret mismatch');
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  if (!body) return res.status(400).json({ message: 'Email body is required' });

  logger.info('Received email webhook', { subject });

  let jobData;
  try {
    jobData = await parseJobFromEmail(subject, body);
  } catch (err) {
    logger.error('AI parsing failed, using fallback', { error: err.message });
    jobData = parseEmailFallback(subject, body);
  }

  if (!jobData.title) jobData.title = subject || 'משרה חדשה';
  if (!jobData.companyName) jobData.companyName = 'לא צוין';
  if (!jobData.location) jobData.location = 'לא צוין';
  if (!jobData.description) jobData.description = body;

  const job = await Job.create({
    ...jobData,
    sourceEmail: req.body.fromEmail || '',
    sourceSubject: subject,
  });

  logger.info('Job created from email', { jobId: job._id, title: job.title });
  res.status(201).json({ job, message: 'Job created successfully' });
};

function parseEmailFallback(subject, body) {
  const lines = body.split('\n').map(l => l.trim()).filter(Boolean);
  const data = { title: subject, description: body, requirements: [], skills: [] };

  for (const line of lines) {
    if (line.includes('מיקום:') || line.toLowerCase().includes('location:')) {
      data.location = line.split(':').slice(1).join(':').trim();
    }
    if (line.includes('שכר:') || line.toLowerCase().includes('salary:')) {
      data.salary = line.split(':').slice(1).join(':').trim();
    }
    if (line.includes('חברה:') || line.toLowerCase().includes('company:')) {
      data.companyName = line.split(':').slice(1).join(':').trim();
    }
  }

  return data;
}
