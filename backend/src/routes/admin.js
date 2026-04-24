const router = require('express').Router();
const { getStats, getCandidatesForJob, updateApplicationStatus, getAllJobs } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const guard = [authenticate, authorize('admin', 'company')];

router.get('/stats', guard, getStats);
router.get('/jobs', guard, getAllJobs);
router.get('/jobs/:jobId/candidates', guard, getCandidatesForJob);
router.patch('/applications/:id/status', guard, updateApplicationStatus);

module.exports = router;
