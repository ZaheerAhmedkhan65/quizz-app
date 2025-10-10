const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/courses-list', courseController.getAll);
router.get('/handouts', (req, res)=>{
    res.render('public/handouts', { 
        title: "Handouts"
    });
})
router.get('/about', (req, res)=>{
    res.render('about', { 
        title: "About Us"
    });
});
router.get('/contact', (req, res)=>{
    res.render('contact', { 
        title: "Contact Us"
    });
});

router.get('/faqs', (req, res)=>{
    res.render('faqs', { 
        title: "FAQs"
    });
});

router.get('/privacy-policy', (req, res)=>{
    res.render('privacyPolicy', { 
        title: "Privacy Policy"
    });
});

router.get('/terms-of-service', (req, res)=>{
    res.render('termsOfService', { 
        title: "Terms of Service"
    });
});

router.get('/features', (req, res)=>{
    res.render('public/features', { 
        title: "Features"
    });
});

module.exports = router;