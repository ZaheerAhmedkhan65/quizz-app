// courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const {authenticate} = require('../middleware/authenticate');

// PUT SPECIFIC ROUTES FIRST
router.get('/:id/handout/download', courseController.downloadPDF); // This should come first

// THEN GENERAL ROUTES
router.get('/all', courseController.getAll);
router.get('/:id', courseController.showCourse); // This was likely causing the conflict
router.post('/:id/join', authenticate, courseController.joinCourse);

module.exports = router;