const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

let user = null;
router.get('/signup', (req, res) => {
    res.render('signup',{title:"Sign up",user:req.user||null});
})

router.get('/signin', (req, res) => {
    res.render('signin',{title:"Sign in",user:req.user||null});
})
router.post('/signup', authController.signup);
router.post('/signin', authController.login);
router.get('/logout', authController.logout);

module.exports = router;