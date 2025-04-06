const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

let user = null;
router.get('/create-account', (req, res) => {
    res.render('signup',{title:"Create an account",user:req.user||null});
})

router.get('/login', (req, res) => {
    res.render('signin',{title:"Log in",user:req.user||null});
})
router.post('/create-account', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

module.exports = router;