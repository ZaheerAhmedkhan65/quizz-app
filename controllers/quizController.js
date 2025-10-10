const Question = require('../models/Question');
const Option = require('../models/Option');
const QuizAttempt = require('../models/QuizAttempt');
const QuizResponse = require('../models/QuizResponse');
const UserCourse = require('../models/UserCourse');
const { formateCreatedAt } = require('../utils/dateFormat');
const db = require('../config/db');

// Start a new quiz (lecture or course)
const startQuiz = async (req, res) => {
    try {
        const { course_id, lecture_id } = req.params;
        const user_id = req.user.id;

        // 🔹 Build a session key for uniqueness (per user per quiz)
        const sessionKey = `quiz_${course_id}_${lecture_id || "course"}`;
        // If we already stored questions, reuse them
        if (req.session[sessionKey]) {
            const savedQuestions = req.session[sessionKey];
            return res.render("quiz/start", {
                questions: savedQuestions,
                course_id,
                lecture_id: lecture_id || null,
                title: "Start Quiz",
            });
        }

        let questions;

        if (lecture_id) {
            questions = await Question.findByLectureId(lecture_id);
        } else {
            const [lectures] = await db.query(
                "SELECT id FROM lectures WHERE course_id = ?",
                [course_id]
            );

            if (!lectures.length) {
                return res.status(404).json({ message: "No lectures found for this course" });
            }

            const [allQuestions] = await db.query(
                "SELECT * FROM questions WHERE lecture_id IN (?)",
                [lectures.map((l) => l.id)]
            );

            const maxQuestions = Math.min(allQuestions.length, 20);
            questions = allQuestions
                .sort(() => 0.5 - Math.random())
                .slice(0, maxQuestions);
        }

        if (!questions.length) {
            return res.status(404).json({ message: "No questions found" });
        }

        const questionIds = questions.map((q) => q.id);
        const [options] = await db.query("SELECT * FROM options WHERE question_id IN (?)", [questionIds]);

        const questionsWithOptions = questions.map((question) => ({
            ...question,
            options: options.filter((opt) => opt.question_id === question.id),
        }));

        // 🔹 Save this set in session so refresh keeps it same
        req.session[sessionKey] = questionsWithOptions;

        res.render("quiz/start", {
            questions: questionsWithOptions,
            course_id,
            lecture_id: lecture_id || null,
            title: "Start Quiz",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// Submit quiz answers
const submitQuiz = async (req, res) => {
    try {
        const { course_id, lecture_id } = req.params;
        const user_id = req.user.userId;
        const { answers } = req.body; // { question_id: selected_option_id }
        // Get all questions for this quiz (to verify correct answers)
        let questions;
        if (lecture_id) {
            questions = await Question.findByLectureId(lecture_id);
        } else {
            // For course quiz, we need to get all questions that were in the quiz
            const questionIds = Object.keys(answers).map(id => parseInt(id));
            questions = await Question.findByIds(questionIds);
        }

        const questionIds = questions.map(q => q.id);

        // Get all correct options for these questions
        const [correctOptions] = await db.query(
            `SELECT o.question_id, o.id as option_id 
                 FROM options o 
                 WHERE o.question_id IN (?) AND o.is_correct = 1`,
            [questionIds]
        );

        // Create a map of correct answers { question_id: correct_option_id }
        const correctAnswersMap = {};
        correctOptions.forEach(opt => {
            correctAnswersMap[opt.question_id] = opt.option_id;
        });

        // Calculate score
        let correctCount = 0;
        const responses = [];

        for (const questionId in answers) {
            const selectedOptionId = answers[questionId];
            const isCorrect = correctAnswersMap[questionId] == selectedOptionId;

            if (isCorrect) {
                correctCount++;
            }

            responses.push({
                question_id: parseInt(questionId),
                option_id: selectedOptionId,
                is_correct: isCorrect
            });
        }

        const totalQuestions = questionIds.length;
        const score = (correctCount / totalQuestions) * 100;

        // Save quiz attempt
        const attemptId = await QuizAttempt.create({
            user_id,
            course_id,
            lecture_id: lecture_id || null,
            total_questions: totalQuestions,
            correct_answers: correctCount,
            score
        });

        // Save all responses
        for (const response of responses) {
            await QuizResponse.create({
                attempt_id: attemptId,
                ...response
            });
        }
        await UserCourse.updateCourseProgress(user_id, course_id);
        delete req.session[`quiz_${course_id}_${lecture_id || "course"}`];

        req.flash('success', 'The quiz has been submitted successfully!');
        // Redirect to results page
        res.redirect(`/quiz/results/${attemptId}`);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Show quiz results
const showResults = async (req, res) => {
    try {
        const { attempt_id } = req.params;
        const user_id = req.user.userId;

        // Get the attempt
        let attempt = await QuizAttempt.findById(attempt_id);

        if (!attempt || attempt.user_id !== user_id) {
            return res.status(404).render('error', { message: 'Quiz attempt not found' });
        }

        attempt.score = Math.round(attempt.score);
        attempt.created_at = formateCreatedAt(attempt.created_at);

        // Get all responses with question and option details
        const responses = await QuizResponse.getAttemptResults(attempt_id);
        // Get all attempts for this lecture (progress graph)
        const lectureAttempts = await QuizAttempt.findByUserAndLecture(user_id, attempt.lecture_id);
        res.render('quiz/results', {
            attempt,
            responses,
            lectureAttempts,
            course_id: attempt.course_id,
            lecture_id: attempt.lecture_id,
            title: 'Quiz Results'
        });

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Server error' });
    }
};

// Get user's quiz history
const getQuizHistory = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const { course_id, lecture_id } = req.query;
        
        let attempts;

        if (lecture_id) {
            attempts = await QuizAttempt.findByUserAndLecture(user_id, lecture_id);
        } else if (course_id) {
            attempts = await QuizAttempt.findByUserAndCourse(user_id, course_id);
        } else {
            attempts = await QuizAttempt.findByUser(user_id);
        }        

         // Group by course and lecture
        const groupedAttempts = attempts.reduce((acc, attempt) => {
            if (!acc[attempt.course_id]) {
                acc[attempt.course_id] = { lectures: {}, attempts: [] };
            }
            acc[attempt.course_id].attempts.push(attempt);

            if (attempt.lecture_id) {
                if (!acc[attempt.course_id].lectures[attempt.lecture_id]) {
                    acc[attempt.course_id].lectures[attempt.lecture_id] = [];
                }
                acc[attempt.course_id].lectures[attempt.lecture_id].push(attempt);
            }

            return acc;
        }, {});

        res.render('quiz/history', { attempts, groupedAttempts, title: 'Quiz History' });

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Server error' });
    }
}

module.exports = {
    startQuiz,
    submitQuiz,
    showResults,
    getQuizHistory
};