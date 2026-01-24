const express = require('express');
const { handleAskAIChat } = require('../controllers/askai');
const router = express.Router();

router.post('/chat', handleAskAIChat);

module.exports = router;