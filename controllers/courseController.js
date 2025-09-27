const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Question = require('../models/Question');
const UserCourse = require('../models/UserCourse');
const path = require('path');
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

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
      return res.status(404).send("Handout not found");
    }

    const fileId = course.handout_pdf;
    const fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    const fileName =
      course.handout_original_filename || `${course.slug}-handout.pdf`;

    // Set headers so browser downloads it with correct name
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

    // Fetch from Google Drive
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return res.status(404).send("File not found on Google Drive");
    }

    await Course.updateDownloadCount(req.params.id);

    // Pipe response to client
    response.body.pipe(res);
  } catch (err) {
    console.error("Error serving handout:", err);
    res.status(500).send("Server error while downloading handout");
  }
};

const create = async (req, res) => {
  try {
    const { title, slug, handout_pdf,pdfUrl, handout_original_filename } = req.body;
    const existingCourse = await Course.findByTitle(req.user.userId, req.body.title);
    if (existingCourse) {
      return res.status(400).json({ message: 'Course already exists' });
    }

    console.log(req.body);

    const course = await Course.create({
      title,
      user_id: req.user.userId,
      slug,
      handout_pdf: handout_pdf || pdfUrl,
      handout_original_filename
    });

    res.status(201).json(course, { message: 'Course created successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const update = async (req, res) => {
  try {
    const { title, slug, handout_pdf,pdfUrl, handout_original_filename } = req.body;
    console.log(title, slug, handout_pdf,pdfUrl, handout_original_filename);
    const course = await Course.findById(req.params.id);
    if(!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    await Course.update(req.params.id, { title, slug, handout_pdf: handout_pdf || pdfUrl, handout_original_filename });
    res.status(200).json({ message: 'Course updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const lectures = await Lecture.findByCourseId(req.params.id);
    if (lectures.length > 0) {
      lectures.forEach(async (lecture) => {
        await Question.deleteByLectureId(lecture.id);
      });
    }

    await Course.delete(req.params.id);
    await Lecture.deleteByCourseId(req.params.id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, showCourse, edit, joinCourse, downloadPDF, create, update, deleteCourse };