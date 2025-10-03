const express = require('express');
const { checkAuthorization } = require('../middlewares/authorization');
const { getAllUser, getUserById, getUserDocs, getUserProfile } = require('../controllers/user');
const router = express.Router();

// User role routes
router.get('/profile', getUserProfile);

router.get("/", checkAuthorization('admin'), getAllUser);
router.get('/:userId', checkAuthorization('admin'), getUserById);
router.get('/:userId/docs', checkAuthorization('admin'), getUserDocs);





module.exports = router;