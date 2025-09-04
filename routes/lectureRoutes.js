const express = require('express');
const router = express.Router();
const lectureController = require('../controllers/lectureController');


router.get('/lectures/:id/content', lectureController.getLectureWithContent);
router.get('/lectures/:id/pdf', lectureController.downloadLecturePDF);
router.get('/courses/:course_title/lectures/:id', lectureController.show);

module.exports = router;