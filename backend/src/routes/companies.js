const router = require('express').Router();
const { getCompanies, getCompany, createCompany, updateCompany } = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', authenticate, authorize('admin'), createCompany);
router.put('/:id', authenticate, authorize('admin'), updateCompany);

module.exports = router;
