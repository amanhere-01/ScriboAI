const express = require('express');
const { getAllDocs, getDocById, handleDocSaving } = require('../controllers/docs');
const router = express.Router();


router.get('/', getAllDocs);
router.post('/', handleDocSaving)
router.get('/:docId', getDocById);

module.exports = router;