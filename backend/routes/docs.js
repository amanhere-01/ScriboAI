const express = require('express');
const { createNewDoc, getDocById, updateDocContent, updateDocTitle, deleteDoc, getAllDocs, getDocumentCount } = require('../controllers/docs');
const router = express.Router();


router.get('/', getAllDocs);
router.post('/create-doc', createNewDoc);
router.get('/count', getDocumentCount);

router.get('/:docId', getDocById);
router.put('/:docId', updateDocContent);
router.patch('/:docId/title', updateDocTitle);
router.delete('/:docId', deleteDoc)

module.exports = router;