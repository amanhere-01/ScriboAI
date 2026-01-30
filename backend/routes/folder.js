const express = require('express');
const { createNewFolder, getAllFolder, getAllDocsInFolder, updateFolderTitle, deleteFolder } = require('../controllers/folder');
const router = express.Router();

router.get('/', getAllFolder);
router.post('/create-folder', createNewFolder);
router.get('/:folderId', getAllDocsInFolder);
router.patch('/:folderId/title', updateFolderTitle);
router.delete('/:folderId', deleteFolder);


module.exports = router;