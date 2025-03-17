const Course = require('../model/Course');
const UserCourse = require('../model/UserCourse');
const Quizz = require('../model/Quizz');
const User = require('../model/User');

const { render } = require('ejs');

const getAll = async (req, res) => {
    try {
        const courses = await Course.getAll();
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const showCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        const progress = await UserCourse.findByUserIdAndCourseId(req.user.userId, req.params.id);
        const quizzs = await Quizz.findByCourseId(req.params.id);
        console.log("quizzes",quizzs);
        res.status(200).render('course', { course, progress, title: course.title, user:req.user||null,quizzs });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        
        const existingCourse = await Course.findByTitle(req.user.userId, req.body.title);
        if (existingCourse) {
            return res.status(400).json({ message: 'Course already exists' });
        }
        const course = await Course.create(req.body.title, req.user.userId);
        await UserCourse.create(req.user.userId, course.id);
        res.status(201).redirect('/api/dashboard');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const update = async (req, res) => {
    try {
        await Course.update(req.params.id, req.body.title);
        res.status(200).redirect('/api/dashboard');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const course = await Course.delete(req.params.id);
        res.status(200).redirect('/api/dashboard');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAll, showCourse, create, update, deleteCourse };