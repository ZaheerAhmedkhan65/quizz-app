// courseRoutes.js
const express = require('express');
const router = express.Router();

// THEN GENERAL ROUTES
router.get('/', (req, res)=>{
    res.render('public/gdb', { 
        title: "GDB's"
    });
});

module.exports = router;