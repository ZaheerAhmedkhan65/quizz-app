const express = require('express');
const Course = require('../models/Course');
const router = express.Router();



router.get('/mid-term', async (req, res) => {
    res.render("public/pastpaper", {
        title: "Mid Term Past Papers"
    })
});

router.get('/final-term', async (req, res) => {
    res.render("public/pastpaper", {
        title: "Final Term Past Papers"
    })
});

module.exports = router;