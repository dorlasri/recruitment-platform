const pdfParse = require('pdf-parse');
const axios = require('axios');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { analyzeCV } = require('../services/aiService');
const { calculateScore } = require('../services/scoringService');
const { sendApplicationConfirmation, sendAdminNewApplication } = require('../services/emailService');
const logger = require('../utils/logger');

exports.apply = async (req, res) => {
  const { jobId } = req.params;

  const job = await Job.findById(jobId);
  if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found' });

  const existing = await Application.findOne({ job: jobId, candidate: req.user._id });
  if (existing) return res.status(409).json({ message: 'Already applied', applicationId: existing._id });

  if (!req.file) return res.status(400).json({ message: 'CV (PDF) is required' });

  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    cvUrl: req.file.path,
    cvPublicId: req.file.filename,
    status: 'new',
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

  // Extract text and run AI analysis in background
  extractAndAnalyze(application, req.file, job).catch(err =>
    logger.error('CV analysis error', { error: err.message, applicationId: application._id })
  );

  // Send confirmation to candidate and notification to admin
  sendApplicationConfirmation(req.user, job).catch(() => {});
  sendAdminNewApplication(req.user, job).catch(() => {});

  res.status(201).json({ application, message: 'Application submitted' });
};

async function extractAndAnalyze(application, file, job) {
  let cvText = '';
  try {
    const response = await axios.get(file.path, { responseType: 'arraybuffer' });
    const data = await pdfParse(Buffer.from(response.data));
    cvText = data.text;
  } catch (err) {
    logger.warn('PDF text extraction failed', { error: err.message });
  }

  let aiAnalysis = { skills: [], experience: '', summary: '', matchScore: 0 };
  try {
    aiAnalysis = await analyzeCV(cvText, job.description);
  } catch (err) {
    logger.error('OpenAI analysis failed', { error: err.message });
  }

  const score = calculateScore({ aiAnalysis }, null);

  await Application.findByIdAndUpdate(application._id, { cvText, aiAnalysis, score });
}

exports.getMyApplications = async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate('job', 'title companyName location salary')
    .sort({ createdAt: -1 });
  res.json({ applications });
};

exports.getApplication = async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('job')
    .populate('candidate', 'name email');
  if (!application) return res.status(404).json({ message: 'Application not found' });

  // Only owner or admin/company can view
  const isOwner = application.candidate._id.toString() === req.user._id.toString();
  const isStaff = ['admin', 'company'].includes(req.user.role);
  if (!isOwner && !isStaff) return res.status(403).json({ message: 'Access denied' });

  res.json({ application });
};
