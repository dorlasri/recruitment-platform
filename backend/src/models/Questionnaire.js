const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  fullName: { type: String, required: true },
  idNumber: { type: String, required: true },
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
  residence: { type: String },
  clientName: { type: String },
  jobTitle: { type: String },
  jobLocation: { type: String },
  clientContact: { type: String },
  clientEmail: { type: String },
  roleExplained: { type: Boolean, default: false },
  hasSkills: { type: Boolean, default: false },
  missingSkills: { type: String },
  workHoursExplained: { type: String },
  locationExplained: { type: String },
  salaryExpectation: { type: String },
  availability: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Questionnaire', questionnaireSchema);
