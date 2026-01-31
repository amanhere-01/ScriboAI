const express = require('express');
const { createNewFolder, getAllFolder, getFolderCount, getAllDocsInFolder, updateFolderName, deleteFolder } = require('../controllers/folder');
const router = express.Router();

router.get('/', getAllFolder);
router.post('/create-folder', createNewFolder);
router.get('/count', getFolderCount);
router.get('/:folderId', getAllDocsInFolder);
router.patch('/:folderId/title', updateFolderName);
router.delete('/:folderId', deleteFolder);


module.exports = router;