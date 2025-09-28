// courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/:id/join', courseController.joinCourse);
router.post('/:id/leave', courseController.leaveCourse);

module.exports = router;