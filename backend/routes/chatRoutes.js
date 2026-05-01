const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/message', chatController.sendMessage);
router.get('/conversation/:sessionId', chatController.getConversation);
router.post('/clear', chatController.clearConversation);

module.exports = router;