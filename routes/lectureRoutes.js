const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');



router.get('/lectures/:id/pdf', lectureController.downloadLecturePDF);
router.get('/lectures/pdf', lectureController.generateLecturesPdf);
router.get('/lectures/:id/questions/pdf', lectureController.downloadQuestionPDF);
router.get('/courses/:course_title/lectures/:id', lectureController.show);

module.exports = router;