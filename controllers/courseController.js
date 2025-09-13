const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Question = require('../models/Question');
const UserCourse = require('../models/UserCourse');
const path = require('path');

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
          const lectures = await Lecture.findByCourseId(req.params.id);
          if(req.user && req.user.role=='admin'){
            return res.status(200).render('admin/courses/show', { course, title: course.title, user:req.user||null,lectures,path: req.path  });
          }
          res.status(200).render('course', { course, title: course.title, user:req.user||null,lectures,path: req.path  });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const joinCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    await UserCourse.create(req.user.userId, course.id);
    res.status(200).redirect('/dashboard');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const edit = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.status(200).render('admin/courses/edit', { course, title: "Edit Course", user: req.user || null, path: req.path, token: req.cookies.token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const https = require('https');
const pipeline = require('stream').pipeline;
const promisify = require('util').promisify;

const streamPipeline = promisify(pipeline);

const downloadPDF = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.handout_pdf) {
      return res.status(404).send('Handout not found');
    }
console.log(course.handout_pdf)
    // Build remote URL
    const fileUrl = `https://pdf-files-production.up.railway.app${course.handout_pdf}`;
    const fileName = course.handout_original_filename || `${course.slug}-handout.pdf`;

    // Set headers so browser triggers download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // Stream file from remote URL to response
    https.get(fileUrl, (fileStream) => {
      if (fileStream.statusCode !== 200) {
        return res.status(404).send('File not found on remote server');
      }
      fileStream.pipe(res);
    }).on('error', (err) => {
      console.error('Error fetching remote PDF:', err);
      res.status(500).send('Error downloading PDF');
    });

  } catch (err) {
    console.error('Error serving handout:', err);
    res.status(500).send('Server error while downloading handout');
  }
};

module.exports = { getAll, showCourse, edit, joinCourse, downloadPDF };