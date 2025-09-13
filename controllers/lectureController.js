const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const UserCourse = require('../models/UserCourse');
const Question = require('../models/Question');
const path = require('path');

const getAll = async (req, res) => {
    try {
        const lectures = await Lecture.getAll();
        res.status(200).json(lectures);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const show = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        const course = await Course.findById(lecture.course_id);
        const questions = await Lecture.getQuestionsWithDetails(req.params.id);

        if(req.user && req.user.role=='admin'){
            return res.status(200).render('admin/lectures/show', {
                lecture,
                title: lecture.title,
                questions,
                course,
                user: req.user,
                courseId: req.params.course_id,
                lectureId: req.params.id,
                path: req.path,
                token: req.cookies.token
            });
        }

        res.status(200).render('lecture', {
            lecture,
            title: lecture.title,
            questions,
            quizzId: lecture.id,
            course,
            user: req.user || null,
            courseId: req.params.course_id,
            lectureId: req.params.id,
            path: req.path
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { title, course_id, start_page, end_page } = req.body;
        await Lecture.create({ title, courseId: course_id, startPage: start_page, endPage: end_page });
        const lectures = await Lecture.findByCourseId(course_id);
        await Course.updateTotalLectures(course_id, lectures.length);

        // Fetch total quizzes
        const totalLectures = await Course.getTotalLectures(course_id);
        if (!totalLectures) {
            return res.status(400).json({ message: "No lectures available for this course." });
        }

        // Calculate progress
        let courseProgress = (lectures.length / totalLectures) * 100;
        courseProgress = Math.min(courseProgress, 100.00); // Prevent exceeding 100%

        // Update progress in `user_courses`
        await UserCourse.updateProgress(req.user.userId, req.params.course_id, courseProgress);

        res.status(201).redirect('/admin/courses/' + course_id );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const update = async (req, res) => {
    try {
        const { title, start_page, end_page } = req.body;
        const lecture = await Lecture.findById(req.params.id);
        const course_id = req.body.course_id || lecture.course_id; // Fallback to existing value
        
        await Lecture.update(req.params.id, {
            title, 
            courseId: course_id,
            startPage: start_page, 
            endPage: end_page
        });

        res.status(200).redirect('/admin/courses/' + course_id);
    } catch (err) {
        res.status(500).json({ 
            message: err.message 
        });
    }
}


const deleteLecture = async (req, res) => {
    try {
        await Lecture.delete(req.params.id);
        await Question.deleteByLectureId(req.params.id);
        res.status(200).json({ message: "Lecture deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const edit = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    const courses = await Course.getAll();
    res.status(200).render('admin/lectures/edit', { lecture, title: "Edit Lecture", courses, user: req.user || null, path: req.path });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { getAll, show, create, update, deleteLecture, edit };