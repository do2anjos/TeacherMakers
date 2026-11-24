const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const diagnosticController = require('../controllers/diagnosticController');

const router = express.Router();
router.use(authMiddleware);
router.get('/', diagnosticController.get);
router.post('/submit', diagnosticController.submit);

module.exports = router;
