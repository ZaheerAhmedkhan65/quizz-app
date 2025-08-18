const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const {authenticate} = require('../middleware/authenticate');

router.get('/all', courseController.getAll);
router.get('/:id', courseController.showCourse);

router.post('/:id/join', authenticate, courseController.joinCourse);
module.exports = router;