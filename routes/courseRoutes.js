// courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');


// THEN GENERAL ROUTES
router.get('/', (req, res)=>{
    res.render('public/courses', { 
        title: "Courses"
    });
});
router.get('/search', courseController.searchCourses);
router.get('/all', courseController.getAll);
router.get('/:id', courseController.showCourse);
router.get('/:id/handout/download', courseController.downloadPDF);

module.exports = router;