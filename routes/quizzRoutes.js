const express = require('express');
const router = express.Router();
const quizzController = require('../controllers/quizzController');
const authenticate = require('../middleware/authenticate');

router.get('/:course_id/quizzes',authenticate,quizzController.getAll);
router.get('/:course_id/quizzes/:id',authenticate,quizzController.showQuizz);
router.post('/:course_id/quizzes/:id',authenticate,quizzController.create);
router.put('/:course_id/quizzes/:id',authenticate,quizzController.update);
// router.delete('/:id',authenticate,quizzController.deleteQuizz);

router.get('/:course_id/quizzes/:id/take',authenticate,quizzController.takeQuizz);


router.post('/:course_id/quizzes/:id/quiz_results',authenticate,quizzController.saveResults);

router.post('/:course_id/quizzes/:id/questions',authenticate,quizzController.createQuestion);
//http://localhost:3000/api/quizzes/1/questions
router.post('/:course_id/quizzes/:id/questions/:question_id/options',authenticate,quizzController.createOption);

module.exports = router;