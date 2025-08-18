const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const Question = require('../models/Question');
const UserCourse = require('../models/UserCourse');

// const { render } = require('ejs');

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
      handout_pdf: req.file.path.replace('public', ''),
      handout_original_filename: req.file.originalname
    } : {};

    const course = await Course.create({
      title: title,
      user_id: req.user.userId,
      slug: slug,
      ...handoutData
    });

    // await UserCourse.create(req.user.userId, course.id);
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
    const updateData = 
                    { 
                      title: req.body.title,
                      slug: req.body.slug 
                    };
    
    if (req.file) {
      updateData.handout_pdf = req.file.path.replace('public', '');
      updateData.handout_original_filename = req.file.originalname;
      
      // Delete old file if exists
      const oldCourse = await Course.findById(req.params.id);
      if (oldCourse.handout_pdf) {
        const oldPath = path.join(__dirname, '../public', oldCourse.handout_pdf);
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
      const filePath = path.join(__dirname, '../public', course.handout_pdf);
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

module.exports = { getAll, showCourse, create, update, deleteCourse, edit, joinCourse };