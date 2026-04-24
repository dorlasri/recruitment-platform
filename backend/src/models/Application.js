const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['new', 'in-review', 'rejected', 'hired'],
    default: 'new',
  },
  cvUrl: { type: String },
  cvPublicId: { type: String },
  cvText: { type: String },
  aiAnalysis: {
    skills: [String],
    experience: String,
    summary: String,
    matchScore: { type: Number, min: 0, max: 100 },
  },
  score: {
    skillsMatch: { type: Number, default: 0, min: 0, max: 50 },
    experienceMatch: { type: Number, default: 0, min: 0, max: 30 },
    availability: { type: Number, default: 0, min: 0, max: 10 },
    salaryFit: { type: Number, default: 0, min: 0, max: 10 },
    totalScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  questionnaireCompleted: { type: Boolean, default: false },
  notes: { type: String },
}, { timestamps: true });

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
