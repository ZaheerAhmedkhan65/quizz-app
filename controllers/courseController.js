const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Question = require('../models/Question');
const UserCourse = require('../models/UserCourse');
const Semester = require('../models/Semester');
const path = require('path');
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
// controllers/courseController.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // cache for 5 minutes

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const offset = (page - 1) * limit;
    const cacheKey = `courses_${req.user ? req.user.userId : 'public'}_${page}_${limit}`;

    // Check cache first
    if (cache.has(cacheKey)) {
      return res.status(200).json(cache.get(cacheKey));
    }

    let courses;
    if (req.user) {
      courses = await Course.getAllCourses(req.user.userId, limit, offset);
    } else {
      courses = await Course.getAll(limit, offset);
    }

    // Store in cache
    cache.set(cacheKey, courses);

    res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const searchCourses = async (req, res) => {
  try {
    const query = req.query.query || '';
    console.log("Search query:", query);
    if (!query.trim()) {
      return res.status(400).json({ message: 'Search query cannot be empty' });
    }
    const courses = await Course.search(query);
    console.log("Search results:", courses);
    res.status(200).json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


const showCourse = async (req, res) => {
  try {
      let course;
      let lectures;
      
      course = await Course.findById(req.params.id);
      
      if ((!course.handout_pdf || course.handout_pdf === '') && (!req.user || req.user.role !== 'admin')) {
          return res.redirect('back');
      }
      
      if (req.user && req.user.role === 'admin') {
          lectures = await Lecture.findByCourseId(req.params.id);
          return res.status(200).render('admin/courses/show', { 
              course, 
              title: course.title, 
              user: req.user || null, 
              lectures, 
              path: req.path  
          });
      } else if (req.user) {
          course = await Course.findCourse(req.user.userId, req.params.id);
          lectures = await Lecture.getLecturesByUserCourse(req.user.userId, req.params.id);
          return res.status(200).render('public/course', { 
              course, 
              title: course.title, 
              user: req.user || null, 
              lectures, 
              path: req.path  
          });
      }
      
      // For non-logged in users (but course has handout_pdf)
      lectures = await Lecture.findByCourseId(req.params.id);
      res.status(200).render('public/course', { 
          course, 
          title: course.title, 
          user: req.user || null, 
          lectures, 
          path: req.path  
      });
      
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};

const joinCourse = async (req, res) => {
  try {
    const currentSemester = await Semester.findByStatus('active');
    console.log(currentSemester);
    if(!currentSemester) {
      return res.status(500).render('error', { message: "Error Joining Course", error: "Error Joining Course" });
    }
    const userCourse = await UserCourse.findByUserIdAndCourseId(req.user.userId, req.params.id, currentSemester.id);
    if(userCourse) {
      req.flash('success', 'You are already enrolled in this course!');
      return res.status(400).redirect('/dashboard');
    }
    await UserCourse.create(req.user.userId, req.params.id, currentSemester.id);
    req.flash('success', 'You have joined the course successfully!');
    res.status(200).redirect('/dashboard');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const leaveCourse = async (req, res) => {
  try {
    await UserCourse.delete(req.user.userId, req.params.id);
    req.flash('success', 'You have left the course successfully!');
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

// const https = require('https');
// const pipeline = require('stream').pipeline;
// const promisify = require('util').promisify;

// const streamPipeline = promisify(pipeline);


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
    const { title, slug, handout_pdf, pdfUrl, handout_original_filename } = req.body;
    const existingCourse = await Course.findByTitle(req.user.userId, req.body.title);
    if (existingCourse) {
      return res.status(400).json({ message: 'Course already exists' });
    }
    
    const course = await Course.create({
      title,
      user_id: req.user.userId,
      slug,
      handout_pdf: handout_pdf || pdfUrl || null,
      handout_original_filename: handout_original_filename||null
    });

    res.json({ message: 'Course created successfully', course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const update = async (req, res) => {
  try {
    const { title, slug, handout_pdf,pdfUrl, handout_original_filename } = req.body;
    const course = await Course.findById(req.params.id);
    if(!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    await Course.update(req.params.id, { title, slug, handout_pdf: handout_pdf || pdfUrl, handout_original_filename });
    res.status(200).json({ message: 'Course updated successfully', course });
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

module.exports = { getAll, showCourse, edit, joinCourse, leaveCourse, downloadPDF, create, update, deleteCourse, searchCourses };