const express = require('express');
const Course = require('../models/Course');
const router = express.Router();



router.get('/mid-term', async (req, res) => {
    const courses = await Course.getAll();
    res.render("pastpaper", {
        title: "Mid Term Past Papers",
        user: req.user || null,
        path: req.path,
        courses
    })
});

router.get('/final-term', async (req, res) => {
    const courses = await Course.getAll();
    res.render("pastpaper", {
        title: "Final Term Past Papers",
        user: req.user || null,
        path: req.path,
        courses
    })
});

module.exports = router;