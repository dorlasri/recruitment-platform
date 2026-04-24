const Company = require('../models/Company');
const Job = require('../models/Job');

exports.getCompanies = async (req, res) => {
  const companies = await Company.find({ isActive: true }).sort({ name: 1 });
  res.json({ companies });
};

exports.getCompany = async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  const jobs = await Job.find({ company: company._id, isActive: true }).sort({ createdAt: -1 });
  res.json({ company, jobs });
};

exports.createCompany = async (req, res) => {
  const company = await Company.create(req.body);
  res.status(201).json({ company });
};

exports.updateCompany = async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) return res.status(404).json({ message: 'Company not found' });
  res.json({ company });
};
