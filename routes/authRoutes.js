const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication pages
router.get('/create-account', (req, res) => {
    res.render('auth/signup', { 
        title: "Create an account",
        user: req.user || null,
        messages: req.flash(),
        path: req.path 
    });
});

router.get('/login', (req, res) => {
    res.render('auth/signin', { 
        title: "Log in",
        user: req.user || null,
        messages: req.flash(),
        path: req.path 
    });
});

router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', {
        title: "Forgot Password",
        user: req.user || null,
        messages: req.flash(),
        path: req.path 
    });
});

router.get('/reset-password', (req, res) => {
    const { token } = req.query;
    res.render('auth/reset-password', {
        title: "Reset Password",
        token,
        user: req.user || null,
        messages: req.flash(),
        path: req.path
    });
});

// Authentication actions
router.post('/create-account', authController.signup);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.get('/logout', authController.logout);

// Email verification
router.get('/verify-email', authController.verifyEmail);

// Password reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;