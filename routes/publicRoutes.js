const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.get('/courses-list', courseController.getAll);

module.exports = router;