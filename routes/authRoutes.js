const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require("passport");

// Authentication pages
router.get('/create-account', (req, res) => {
    res.render('auth/signup', { 
        title: "Create an account"
    });
});

router.get('/login', (req, res) => {
    res.render('auth/signin', { 
        title: "Log in" 
    });
});

router.get('/forgot-password', (req, res) => {
    res.render('auth/forgot-password', {
        title: "Forgot Password"
    });
});

router.get('/reset-password', (req, res) => {
    const { token } = req.query;
    res.render('auth/reset-password', {
        title: "Reset Password",
        token
    });
});

// Google OAuth login route
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
  // Google OAuth callback route
  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/login", failureFlash: true }),
    async (req, res) => {
      // Generate JWT like normal login
      const user = req.user;
  
      const jwt = require("jsonwebtoken");
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
        },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );
  
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      req.flash("success", "Login successful using Google!");

      if (user.role === "admin") {
        return res.redirect("/admin/dashboard");
      } else {
        return res.redirect("/dashboard");
      }
    }
  );
  

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