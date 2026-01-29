const express = require('express');
const { createNewFolder, getAllFolder, getAllDocsInFolder } = require('../controllers/folder');
const router = express.Router();

router.get('/', getAllFolder);
router.post('/create-folder', createNewFolder);
router.get('/:folderId', getAllDocsInFolder);
module.exports = router;