const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middleware/authenticate');

router.get('/',authenticate,courseController.getAll);
router.get('/:id',authenticate,courseController.showCourse);
router.post('/',authenticate,courseController.create);
router.post('/:id',authenticate,courseController.update);
router.delete('/:id/delete',authenticate,courseController.deleteCourse);

module.exports = router;