const router = require('express').Router();
const { submit, getByApplication } = require('../controllers/questionnaireController');
const { authenticate } = require('../middleware/auth');

router.post('/application/:applicationId', authenticate, submit);
router.get('/application/:applicationId', authenticate, getByApplication);

module.exports = router;
