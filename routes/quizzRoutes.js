const express = require('express');
const router = express.Router();
const quizzController = require('../controllers/quizzController');

// router.post('/questions/:id/update', quizzController.updateQuestion)
// router.get('/:course_id/quizzes', quizzController.getAll);
// router.post('/:course_id/quizzes', quizzController.create);
// router.get('/:course_id/quizzes/:id', quizzController.showQuizz);
router.get('/:course_id/quizzes/:id/get-quizz-results', quizzController.getQuizzResults);
// router.post('/:course_id/quizzes/:id', quizzController.update);
// router.delete('/:course_id/quizzes/:id/delete', quizzController.deleteQuizz);
router.get('/:course_id/quizzes/:id/take', quizzController.takeQuizz);
router.post('/:course_id/quizzes/:id/quiz_results', quizzController.saveResults);
// router.post('/:course_id/quizzes/:id/questions', quizzController.createQuestion);
// router.delete('/:course_id/quizzes/:quiz_id/questions/:id/delete', quizzController.deleteQuestion);
// router.post('/:course_id/quizzes/:id/questions/:question_id/options', quizzController.createOption);

module.exports = router;