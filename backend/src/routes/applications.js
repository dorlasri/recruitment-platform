const router = require('express').Router();
const { apply, getMyApplications, getApplication } = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/job/:jobId', authenticate, authorize('candidate'), upload.single('cv'), apply);
router.get('/my', authenticate, authorize('candidate'), getMyApplications);
router.get('/:id', authenticate, getApplication);

module.exports = router;
