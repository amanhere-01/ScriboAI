const express = require('express');
const { createNewDoc, getDocById, updateDocContent, updateDocTitle, deleteDoc, getAllDocs } = require('../controllers/docs');
const router = express.Router();

router.post('/create-doc', createNewDoc);
router.get('/:docId', getDocById);
router.put('/:docId', updateDocContent);
router.patch('/:docId/title', updateDocTitle);
router.delete('/:docId', deleteDoc)
router.get('/', getAllDocs);

module.exports = router;