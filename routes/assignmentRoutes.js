// courseRoutes.js
const express = require('express');
const router = express.Router();

// THEN GENERAL ROUTES
router.get('/', (req, res)=>{
    res.render('public/assignments', { 
        title: "Assignments"
    });
});

module.exports = router;