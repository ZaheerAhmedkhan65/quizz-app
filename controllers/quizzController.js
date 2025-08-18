const Lecture = require('../models/Lecture');
const Course = require('../models/Course');
const Question = require('../models/Question');
const Option = require('../models/Option');
const QuizResult = require('../models/QuizResult');
const UserCourse = require('../models/UserCourse');


const getAll = async (req, res) => {
    try {
        const lectures = await Lecture.getAll();
        res.status(200).json(lectures);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const showLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);
        const course = await Course.findById(req.params.course_id);

        const quizData = await Lecture.getQuestionsAndOptions(req.params.id);

        let sessionId = req.cookies.sessionId;

        res.status(200).render('user/quizz', {
            lecture,
            title: quizz.title,
            quizData,
            course,
            user: req.user,
            sessionId,
            courseId: req.params.course_id,
            lectureId: req.params.id,
            path: req.path
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getQuizzResults = async (req, res) => {
    try {
        const quizResults = await QuizResult.findByQuizId(req.params.id);

        let questionIds = new Set();
        let optionIds = new Set();

        if (quizResults?.length) {
            for (const result of quizResults) {
                for (const questionId in result.answers) {
                    questionIds.add(questionId);
                    optionIds.add(result.answers[questionId]);
                }
            }
        }

        // Convert sets to arrays
        const questionIdArray = Array.from(questionIds);
        const optionIdArray = Array.from(optionIds);

        // Batch fetch questions and options
        const questionsList = await Question.findByIds(questionIdArray);
        const optionsList = await Option.findByIds(optionIdArray);

        // Create maps for quick lookup
        const questionMap = Object.fromEntries(questionsList.map(q => [q.id, q]));
        const optionMap = Object.fromEntries(optionsList.map(o => [o.id, o]));

        let questions = [];
        let answers = [];

        if (quizResults?.length) {
            for (const result of quizResults) {
                for (const questionId in result.answers) {
                    questions.push(questionMap[questionId]);
                    answers.push(optionMap[result.answers[questionId]]);
                }
            }
        }

        res.status(200).json({ quizResults, questions, answers });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const create = async (req, res) => {
    try {
        await Lecture.create(req.body.title, req.params.course_id);
        const lectures = await Lecture.findByCourseId(req.params.course_id);
        await Course.updateTotalQuizzes(req.params.course_id, quizzes.length);

        // Fetch total quizzes
        const totalQuizzes = await Course.getTotalQuizzes(req.params.course_id);
        if (!totalQuizzes) {
            return res.status(400).json({ message: "No quizzes available for this course." });
        }

        // Fetch quizzes attempted
        const quizzesAttempted = await QuizResult.quizzesAttempted(req.user.userId, req.params.course_id);

        // Calculate progress
        let courseProgress = (quizzesAttempted / totalQuizzes) * 100;
        courseProgress = Math.min(courseProgress, 100.00); // Prevent exceeding 100%

        // Update progress in `user_courses`
        await UserCourse.updateProgress(req.user.userId, req.params.course_id, courseProgress);

        res.status(201).redirect('/api/courses/' + req.params.course_id);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const update = async (req, res) => {
    try {
        await Lecture.update(req.params.id, req.body.title);
        res.status(200).json({ message: "Lecture updated successfully", title: req.body.title });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const deleteLecture = async (req, res) => {
    try {
        await Lecture.delete(req.params.id);
        await Question.deleteByLectureId(req.params.id);
        res.status(200).json({ message: "Lecture deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body.question_text, req.params.id);
        const questions = await Question.findByLectureId(req.params.id);
        await Lecture.updateLectureTotalQuestions(req.params.id, questions.length);
        const questionIndex = questions.findIndex(q => q.id === question.id) + 1;

        res.status(201).json({
            success: true,
            question: { id: question.id, index: questionIndex, question_text: question.question_text },
            courseId: req.params.course_id,
            quizzId: req.params.id

        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const updateQuestion = async (req, res) => {
    try {
        await Question.update(req.body.question_id, req.body.question_text);
        res.status(201).json({ newText: req.body.question_text })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const deleteQuestion = async (req, res) => {
    try {
        await Question.delete(req.body.id);
        await Option.deleteByQuestionId(req.body.id);
        res.status(200).json({ success: true, message: "Question deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const createOption = async (req, res) => {
    try {
        const option = await Option.create(
            req.body.option_text,
            req.params.question_id,
            req.body.is_correct
        );

        res.status(201).json({
            success: true,
            option: {
                id: option.id,
                option_text: option.option_text,
                is_correct: option.is_correct,
                question_id: option.question_id
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const takeQuizz = async (req, res) => {
    try {
        const quizz = await Lecture.findById(req.params.id);
        const course = await Course.findById(req.params.course_id);
        const quizData = await Lecture.getQuestionsAndOptions(req.params.id);
        res.status(200).render('user/takeQuizz', { quizz, title: quizz.title, quizData, course, user: req.user,path: req.path  });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const saveResults = async (req, res) => {
    try {
        const { user_id, course_id, quiz_id, total_marks, score, answers } = req.body;

        // Save the quiz result
        const quizResult = await QuizResult.create(user_id, course_id, quiz_id, total_marks, score, answers);
        if (!quizResult) throw new Error("Failed to save quiz result.");

        // Fetch total quizzes
        const totalQuizzes = await Course.getTotalQuizzes(course_id);
        if (!totalQuizzes) {
            return res.status(400).json({ message: "No quizzes available for this course." });
        }

        // Fetch quizzes attempted
        const quizzesAttempted = await QuizResult.quizzesAttempted(user_id, course_id);


        // Calculate progress
        let courseProgress = (quizzesAttempted / totalQuizzes) * 100;
        courseProgress = Math.min(courseProgress, 100.00); // Prevent exceeding 100%

        // Update progress in `user_courses`
        await UserCourse.updateProgress(user_id, course_id, courseProgress);

        await Quizz.updateQuizzProgressBasedOnAttempts(quiz_id);

        return res.status(200).json({
            success: true,
            message: "Quiz results saved successfully",
            data: quizResult
        });

    } catch (err) {
        console.error("Error saving quiz results:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { takeQuizz, saveResults, getQuizzResults };