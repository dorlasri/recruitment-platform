const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  companyName: { type: String, required: true, trim: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  location: { type: String, required: true },
  salary: { type: String },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  skills: [{ type: String }],
  region: {
    type: String,
    enum: ['צפון', 'מרכז', 'גוש דן', 'ירושלים', 'דרום', 'שרון', 'אחר'],
    default: 'אחר',
    index: true,
  },
  sourceEmail: { type: String },
  sourceSubject: { type: String },
  isActive: { type: Boolean, default: true },
  applicationsCount: { type: Number, default: 0 },
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', companyName: 'text' });

module.exports = mongoose.model('Job', jobSchema);
