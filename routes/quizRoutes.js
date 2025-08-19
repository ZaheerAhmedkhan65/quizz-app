const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Start a new quiz (lecture or course)
router.get('/quiz/start/:course_id',  quizController.startQuiz);
router.get('/quiz/start/:course_id/:lecture_id',  quizController.startQuiz);

// Submit quiz answers
router.post('/quiz/submit/:course_id',  quizController.submitQuiz);
router.post('/quiz/submit/:course_id/:lecture_id',  quizController.submitQuiz);

// View quiz results
router.get('/quiz/results/:attempt_id',  quizController.showResults);
// Quiz history
router.get('/quiz/history',  quizController.getQuizHistory);

module.exports = router;