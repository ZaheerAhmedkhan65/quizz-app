const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const courseController = require('../controllers/courseController');
const lectureController = require('../controllers/lectureController');
const questionController = require('../controllers/questionController');
const Course = require('../models/Course');
const { uploadHandout, handleUploadErrors, uploadQuestionImage, uploadOptionImage, handleImageUploadErrors } = require('../middleware/upload');

router.get('/dashboard', userController.adminDashboard);

// Courses
router.get('/courses', (req, res)=>{
    res.render('admin/courses/index', { 
        title: "Courses",
        user: req.user || null,
        messages: req.flash(),
        path: req.path 
    });
});
router.post('/courses/create', uploadHandout, handleUploadErrors, courseController.create);
router.get('/courses/new', (req, res)=>{
    res.render('admin/courses/new', { 
        title: "New Course",
        user: req.user || null,
        messages: req.flash(),
        path: req.path 
    });
});
router.get('/courses/:id', courseController.showCourse);
router.get('/courses/:id/edit', courseController.edit);
router.post('/courses/:id/update', uploadHandout, handleUploadErrors, courseController.update);
router.post('/courses/:id/delete', courseController.deleteCourse);

// Lectures
router.get('/lectures/new', async (req, res)=>{
    const courses = await Course.getAll();
    res.render('admin/lectures/new', { 
        title: "New Lecture",
        user: req.user || null,
        courses,
        messages: req.flash(),
        path: req.path 
    });
});
router.post('/lectures/create', lectureController.create);
router.get('/lectures/:id', lectureController.show);
router.get('/lectures/:id/edit', lectureController.edit);
router.post('/lectures/:id/update', lectureController.update);
router.delete('/lectures/:id/delete', lectureController.deleteLecture);

// Questions
router.get('/questions', (req, res)=>{
    res.render('admin/questions/index', { 
        title: "Questions",
        user: req.user || null,
        messages: req.flash(),
        path: req.path 
    });
});
router.post('/questions/create', uploadQuestionImage, handleImageUploadErrors, questionController.createQuestion);
router.post('/questions/:id/update', uploadQuestionImage, handleImageUploadErrors, questionController.updateQuestion);
router.delete('/questions/:id/delete', questionController.deleteQuestion);

// Options
router.post('/questions/:question_id/options/create', uploadOptionImage, handleImageUploadErrors, questionController.createOption);
router.post('/options/:id/update', uploadOptionImage, handleImageUploadErrors, questionController.updateOption);
router.delete('/options/:id/delete', questionController.deleteOption);

// Users
router.post('/users/:id/:action', userController.updateUserStatus);

module.exports = router;