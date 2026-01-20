const express = require('express');
const { handleUserSignUp, handleUserSignIn, handleGoogleAuth, handleAuthMe } = require('../controllers/auth');
const passport = require('../configs/googleAuth');
const router = express.Router();


// LOCAL Auth
router.post('/signup', handleUserSignUp);
router.post('/signin', handleUserSignIn);
router.get('/me', handleAuthMe);

// Google Auth
router.get('/google', 
    passport.authenticate("google", {
        scope : ["profile", "email"]
    })
);

router.get('/google/callback', passport.authenticate("google", {session: false}), handleGoogleAuth);


module.exports = router;
