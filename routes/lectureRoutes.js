const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');



router.get('/:id/pdf', lectureController.downloadLecturePDF);
router.get('/pdf', lectureController.generateLecturesPdf);
router.get('/:id/questions/pdf', lectureController.downloadQuestionPDF);
router.get('/courses/:course_title/:id', lectureController.show);

module.exports = router;