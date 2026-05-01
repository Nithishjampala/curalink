const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');

router.post('/fetch', researchController.fetchResearch);
router.get('/publication', researchController.getPublicationDetails);

module.exports = router;