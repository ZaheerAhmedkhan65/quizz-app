const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Question = require('../models/Question');
const UserCourse = require('../models/UserCourse');
const path = require('path');
const fs = require('fs');

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
          res.status(200).render('user/course', { course, title: course.title, user:req.user||null,lectures,path: req.path  });
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

const create = async (req, res) => {
  try {
    const { title, slug } = req.body;
    const existingCourse = await Course.findByTitle(req.user.userId, req.body.title);
    if (existingCourse) {
      return res.status(400).json({ message: 'Course already exists' });
    }

    const handoutData = req.file ? {
      // ✅ Save path WITH 'public'
      handout_pdf: req.file.path,
      handout_original_filename: req.file.originalname
    } : {};

    const course = await Course.create({
      title,
      user_id: req.user.userId,
      slug,
      ...handoutData
    });

    res.status(201).redirect('/admin/courses');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



const edit = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.status(200).render('admin/courses/edit', { course, title: "Edit Course", user: req.user || null, path: req.path });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const updateData = { 
      title: req.body.title,
      slug: req.body.slug 
    };
    
    if (req.file) {
      // ✅ Save path WITH 'public'
      updateData.handout_pdf = req.file.path;
      updateData.handout_original_filename = req.file.originalname;

      // Delete old file if exists
      const oldCourse = await Course.findById(req.params.id);
      if (oldCourse.handout_pdf) {
        const oldPath = path.join(__dirname, '..', oldCourse.handout_pdf);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    await Course.update(req.params.id, updateData);
    res.status(200).redirect('/admin/courses/' + req.params.id);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    // Delete associated PDF file if exists
    if (course.handout_pdf) {
      const filePath = path.join(__dirname, '..', course.handout_pdf);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Rest of your delete logic...
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

    // Build remote URL
    const fileUrl = `https://pdf-files-production.up.railway.app${course.handout_pdf}`;
    const fileName = course.handout_original_filename || `${course.slug}-handout.pdf`;

    // Set headers so browser triggers download
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');

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



module.exports = { getAll, showCourse, create, update, deleteCourse, edit, joinCourse, downloadPDF };