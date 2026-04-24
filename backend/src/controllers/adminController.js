const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Questionnaire = require('../models/Questionnaire');
const { sendStatusUpdate } = require('../services/emailService');

exports.getStats = async (req, res) => {
  const [totalJobs, totalApplications, totalCandidates, recentApplications] = await Promise.all([
    Job.countDocuments({ isActive: true }),
    Application.countDocuments(),
    User.countDocuments({ role: 'candidate' }),
    Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('job', 'title companyName')
      .populate('candidate', 'name email'),
  ]);

  const statusBreakdown = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ totalJobs, totalApplications, totalCandidates, recentApplications, statusBreakdown });
};

exports.getCandidatesForJob = async (req, res) => {
  const { jobId } = req.params;
  const { sortBy = 'score', status } = req.query;

  const query = { job: jobId };
  if (status) query.status = status;

  const sortMap = {
    score: { 'score.totalScore': -1 },
    date: { createdAt: -1 },
  };

  const applications = await Application.find(query)
    .sort(sortMap[sortBy] || sortMap.score)
    .populate('candidate', 'name email')
    .populate('job', 'title companyName');

  // Attach questionnaires
  const appIds = applications.map(a => a._id);
  const questionnaires = await Questionnaire.find({ application: { $in: appIds } });
  const qMap = Object.fromEntries(questionnaires.map(q => [q.application.toString(), q]));

  const enriched = applications.map(app => ({
    ...app.toObject(),
    questionnaire: qMap[app._id.toString()] || null,
  }));

  res.json({ applications: enriched });
};

exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const application = await Application.findByIdAndUpdate(
    id,
    { status, notes },
    { new: true }
  ).populate('candidate', 'name email').populate('job', 'title');

  if (!application) return res.status(404).json({ message: 'Application not found' });

  if (['in-review', 'rejected', 'hired'].includes(status)) {
    sendStatusUpdate(application.candidate, application.job, status).catch(() => {});
  }

  res.json({ application });
};

exports.getAllJobs = async (req, res) => {
  const { company, page = 1, limit = 20 } = req.query;
  const query = {};
  if (company) query.companyName = { $regex: company, $options: 'i' };

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('company', 'name'),
    Job.countDocuments(query),
  ]);

  res.json({ jobs, total });
};
