const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const UserCourse = require('../models/UserCourse');
const pdf = require('html-pdf');
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
                path: req.path
            });
        }

        res.status(200).render('user/lecture', {
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
        const { title, course_id } = req.body;
        await Lecture.create({ title, courseId: course_id });
        const lectures = await Lecture.findByCourseId(course_id);
        await Course.updateTotalQuizzes(course_id, lectures.length);

        // Fetch total quizzes
        const totalQuizzes = await Course.getTotalQuizzes(course_id);
        if (!totalQuizzes) {
            return res.status(400).json({ message: "No quizzes available for this course." });
        }

        // Fetch quizzes attempted
        // const quizzesAttempted = await QuizResult.quizzesAttempted(req.user.userId, req.params.course_id);

        // Calculate progress
        let courseProgress = (lectures.length / totalQuizzes) * 100;
        courseProgress = Math.min(courseProgress, 100.00); // Prevent exceeding 100%

        // Update progress in `user_courses`
        await UserCourse.updateProgress(req.user.userId, req.params.course_id, courseProgress);

        res.status(201).redirect('/api/courses/' + req.params.course_id);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const update = async (req, res) => {
    try {
        const { title, start_page, end_page } = req.body;
        const lecture = await Lecture.findById(req.params.id);
        const course_id = req.body.course_id || lecture.course_id; // Fallback to existing value
        
        if (!req.file && !lecture.handout_path) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded and no existing handout' 
            });
        }

        const handoutPath = req.file ? req.file.path.replace('public/', '') : lecture.handout_path;
        
        await Lecture.update(req.params.id, {
            title, 
            courseId: course_id, // Make sure this matches your model parameter name
            handoutPath, 
            startPage: start_page, 
            endPage: end_page
        });

        res.status(200).json({ 
            message: "Lecture updated successfully", 
            title: title 
        });
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
    res.status(200).render('admin/lectures/edit', { lecture, title: "Edit Lecture", user: req.user || null, path: req.path });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload and assign handout to lecture
const uploadLectureHandout = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const { startPage, endPage } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const handoutPath = req.file.path.replace('public/', '');
        await Lecture.updateHandoutInfo(lectureId, {
            handoutPath,
            startPage: parseInt(startPage),
            endPage: parseInt(endPage)
        });

        res.status(200).json({ 
            success: true, 
            message: 'Handout uploaded successfully',
            handoutPath
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get lecture with extracted content
const getLectureWithContent = async (req, res) => {
    try {
        const lecture = await Lecture.getLectureWithContent(req.params.id);
        if (!lecture) {
            return res.status(404).json({ success: false, message: 'Lecture not found' });
        }

        res.status(200).json({ success: true, lecture });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const downloadPDF = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) {
            return res.status(404).json({ message: 'Lecture not found' });
        }

        const questions = await Lecture.getQuestionsWithDetails(req.params.id);
        const course = await Course.findById(lecture.course_id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Render the EJS template to HTML
        const html = await new Promise((resolve, reject) => {
            res.render('pdf/lecture-questions', {
                lecture,
                questions,
                course,
                layout: false
            }, (err, html) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });

        if (!html || typeof html !== 'string' || html.trim().length === 0) {
            throw new Error('Generated HTML is empty');
        }

        // PDF options
        const options = {
            format: 'A4',
            border: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            },
            header: {
                height: '15mm',
                contents: `<div style="text-align: center; font-size: 14px;">${course.title} - ${lecture.title}</div>`
            },
            footer: {
                height: '15mm',
                contents: {
                    default: `<div style="text-align: center; font-size: 14px; color: #666;">Page {{page}} of {{pages}}</div>`
                }
            }
        };

        // Generate PDF
        const pdfStream = await new Promise((resolve, reject) => {
            pdf.create(html, options).toStream((err, stream) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(stream);
                }
            });
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${lecture.title}-questions.pdf"`);
        pdfStream.pipe(res);

    } catch (err) {
        console.error('PDF generation error:', err);
        if (!res.headersSent) {
            res.status(500).json({ 
                message: 'Failed to generate PDF',
                error: err.message 
            });
        }
    }
};

module.exports = { getAll, show, create, update, deleteLecture, edit, uploadLectureHandout, getLectureWithContent, downloadPDF };