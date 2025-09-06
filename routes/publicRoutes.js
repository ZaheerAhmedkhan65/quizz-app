const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/courses-list', courseController.getAll);
router.get('/handouts', (req, res)=>{
    res.render('handouts', { 
        title: "Handouts",
        user: req.user || null,
        messages: req.flash(),
        path: req.path
    });
})

module.exports = router;