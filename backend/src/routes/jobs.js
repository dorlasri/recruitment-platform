const router = require('express').Router();
const { getJobs, getJob, createJob, updateJob, deleteJob, fromEmail } = require('../controllers/jobController');
const { authenticate, authorize } = require('../middleware/auth');

// Make webhook — no auth required (secured by webhook secret)
router.post('/from-email', fromEmail);

router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/', authenticate, authorize('admin'), createJob);
router.put('/:id', authenticate, authorize('admin'), updateJob);
router.delete('/:id', authenticate, authorize('admin'), deleteJob);

module.exports = router;
