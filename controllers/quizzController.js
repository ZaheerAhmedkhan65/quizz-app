const Quizz = require('../model/Quizz');
const Course = require('../model/Course');
const Question = require('../model/Question');
const Option = require('../model/Option');
const QuizResult = require('../model/QuizResult');
const UserCourse = require('../model/UserCourse');
const ChatHistory = require("../model/ChatHistory");


const getAll = async (req, res) => {
    try {
        const quizzs = await Quizz.getAll();
        res.status(200).json(quizzs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const showQuizz = async (req, res) => {
    try {
        const quizz = await Quizz.findById(req.params.id);
        const course = await Course.findById(req.params.course_id);

        const quizData = await Quizz.getQuestionsAndOptions(req.params.id);
        const quizResults = await QuizResult.findByQuizId(req.params.id);
        console.log(quizz);
        let questions = [];
        let answers = [];
        let percentage = 0;

        if (quizResults && quizResults.length > 0) {
            for (const result of quizResults) {

                for (const questionId in result.answers) {
                    
                    let questionText = await Question.findById(questionId);
                    let answerText = await Option.findById(result.answers[questionId]);

                    questions.push(questionText);
                    answers.push(answerText);
                }
            }

            // Calculate percentage if needed
            percentage = ((quizResults.reduce((sum, res) => sum + res.score, 0) / 
                           quizResults.reduce((sum, res) => sum + res.total_marks, 0)) * 100).toFixed(2);
        }

        console.log(percentage)

        let sessionId = req.cookies.sessionId;

        let chatHistory = await ChatHistory.getUserChatHistory(req.user.userId);

        res.status(200).render('quizz', { 
            quizz, 
            title: quizz.title, 
            quizData,
            quizResults, 
            course, 
            user: req.user, 
            questions, 
            answers, 
            percentage,
            sessionId,
            chatHistory
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const create = async (req, res) => {
    try {
        await Quizz.create(req.body.title, req.params.course_id);
        const quizzes = await Quizz.findByCourseId(req.params.course_id);
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
        console.log("updateing quizz")
        console.log(req.params.id);
        console.log(req.body.title);
        await Quizz.update(req.params.id, req.body.title);
        res.status(200).json({ message: "Quizz updated successfully", title: req.body.title });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const deleteQuizz = async (req, res) => {
    try {
        await Quizz.delete(req.params.id);
        await Question.deleteByQuizzId(req.params.id);
        res.status(200).json({ message: "Quizz deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body.question_text, req.params.id);
        const questions = await Question.findByQuizzId(req.params.id);
        await Quizz.updateQuizzTotalQuestions(req.params.id, questions.length);
        const questionIndex = questions.findIndex(q => q.id === question.id) + 1;

        res.status(201).json({
            success: true,
            question: { id: question.id, index:questionIndex, question_text: question.question_text },
            courseId: req.params.course_id,
            quizzId: req.params.id
            
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const updateQuestion =  async (req, res) => {
    try{
        await Question.update(req.body.question_id, req.body.question_text);
        res.status(201).json({newText: req.body.question_text})
    } catch (err){
        res.status(500).json({message: err.message});
    }
}

const deleteQuestion = async (req, res) => {
    try {
        console.log("callled delete question");
        console.log(req.body.id);
        await Question.delete(req.body.id);
        await Option.deleteByQuestionId(req.body.id);
        res.status(200).json({ success: true, message: "Question deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const createOption = async (req, res) => {
    try {

        console.log("create option",req.body);
        console.log("question id",req.params.question_id);
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
        const quizz = await Quizz.findById(req.params.id);
        const course = await Course.findById(req.params.course_id);
        const quizData = await Quizz.getQuestionsAndOptions(req.params.id);
        console.log("quizz in take quizzz: ",quizz)
        res.status(200).render('takeQuizz', { quizz, title: quizz.title,quizData,course,user:req.user });
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

module.exports = { getAll, showQuizz, create, update, deleteQuizz, createQuestion, updateQuestion,deleteQuestion, createOption, takeQuizz, saveResults };