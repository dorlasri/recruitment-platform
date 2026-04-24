const Questionnaire = require('../models/Questionnaire');
const Application = require('../models/Application');
const { calculateScore } = require('../services/scoringService');

exports.submit = async (req, res) => {
  const { applicationId } = req.params;

  const application = await Application.findById(applicationId).populate('job');
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const isOwner = application.candidate.toString() === req.user._id.toString();
  if (!isOwner) return res.status(403).json({ message: 'Access denied' });

  const existing = await Questionnaire.findOne({ application: applicationId });
  if (existing) return res.status(409).json({ message: 'Questionnaire already submitted', questionnaire: existing });

  const questionnaire = await Questionnaire.create({
    ...req.body,
    application: applicationId,
    candidate: req.user._id,
    job: application.job._id,
  });

  // Recalculate score with questionnaire data
  const score = calculateScore(application, questionnaire);
  await Application.findByIdAndUpdate(applicationId, {
    score,
    questionnaireCompleted: true,
    status: 'in-review',
  });

  res.status(201).json({ questionnaire, score });
};

exports.getByApplication = async (req, res) => {
  const { applicationId } = req.params;
  const application = await Application.findById(applicationId);
  if (!application) return res.status(404).json({ message: 'Application not found' });

  const isOwner = application.candidate.toString() === req.user._id.toString();
  const isStaff = ['admin', 'company'].includes(req.user.role);
  if (!isOwner && !isStaff) return res.status(403).json({ message: 'Access denied' });

  const questionnaire = await Questionnaire.findOne({ application: applicationId });
  if (!questionnaire) return res.status(404).json({ message: 'Questionnaire not found' });

  res.json({ questionnaire });
};
