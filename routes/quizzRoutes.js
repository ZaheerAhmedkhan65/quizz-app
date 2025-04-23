const express = require('express');
const router = express.Router();
const quizzController = require('../controllers/quizzController');
const authenticate = require('../middleware/authenticate');


router.post('/questions/:id/update', authenticate, quizzController.updateQuestion)
router.get('/:course_id/quizzes', authenticate, quizzController.getAll);
router.post('/:course_id/quizzes', authenticate, quizzController.create);
router.get('/:course_id/quizzes/:id', authenticate, quizzController.showQuizz);
router.get('/:course_id/quizzes/:id/get-quizz-results', authenticate, quizzController.getQuizzResults);
router.post('/:course_id/quizzes/:id', authenticate, quizzController.update);
router.delete('/:course_id/quizzes/:id/delete', authenticate, quizzController.deleteQuizz);
router.get('/:course_id/quizzes/:id/take', authenticate, quizzController.takeQuizz);
router.post('/:course_id/quizzes/:id/quiz_results', authenticate, quizzController.saveResults);
router.post('/:course_id/quizzes/:id/questions', authenticate, quizzController.createQuestion);
router.delete('/:course_id/quizzes/:quiz_id/questions/:id/delete', authenticate, quizzController.deleteQuestion);
router.post('/:course_id/quizzes/:id/questions/:question_id/options', authenticate, quizzController.createOption);

module.exports = router;