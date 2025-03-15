const Quizz = require('../model/Quizz');
const Course = require('../model/Course');
const Question = require('../model/Question');
const Option = require('../model/Option');
const QuizResult = require('../model/QuizResult');
let user = null;

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

        console.log("quiz id",req.params.id);
        console.log("course id",req.params.course_id);

        const quizData = await Quizz.getQuestionsAndOptions(req.params.id);

        const quizResults = await QuizResult.findByQuizId(req.params.id);

        console.log(quizResults);
        let questions = [];
        let answers = [];
        let questionText;
        let answerText;
        let percentage = 0;
        if(quizResults != null){
            percentage = (quizResults.score / quizResults.total_marks * 100).toFixed(2);
            for(let question in quizResults.answers){
                questionText = await Question.findById(question);
                answerText = await Option.findById(quizResults.answers[question])
                questions.push(questionText);
                answers.push(answerText);
            }
        }
        
        res.status(200).render('quizz', { quizz, title: quizz.title,quizData,quizResults,course,user:req.user,questions,answers,percentage });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const create = async (req, res) => {
    try {
        console.log(req.params.course_id);
        console.log(req.body.title);
        const quizz = await Quizz.create(req.body.title, req.params.course_id);
        res.status(201).redirect('/api/courses/' + req.params.course_id);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const update = async (req, res) => {
    try {
        const quizz = await Quizz.update(req.params.id, req.body.title, req.body.totalQuestions);
        res.status(200).json(quizz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const deleteQuizz = async (req, res) => {
    try {
        const quizz = await Quizz.delete(req.params.id);
        res.status(200).json(quizz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const createQuestion = async (req, res) => {
    try{
        await Question.create(req.body.question_text, req.params.id);
        res.status(201).redirect("/api/courses/" + req.params.course_id + "/quizzes/" + req.params.id);
    } catch(err){
        res.status(500).json({ message: err.message });
    }
}

const createOption = async (req, res) => {
    try {
        await Option.create(req.body.option_text,req.params.question_id, req.body.is_correct);
        res.status(201).redirect("/api/courses/" + req.params.course_id + "/quizzes/" + req.params.id);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const takeQuizz = async (req, res) => {
    try {
        const quizz = await Quizz.findById(req.params.id);
        const course = await Course.findById(req.params.course_id);
        const quizData = await Quizz.getQuestionsAndOptions(req.params.id);
        console.log("user",req.user);
        res.status(200).render('takeQuizz', { quizz, title: quizz.title,quizData,course,user:req.user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const saveResults = async (req, res) => {
    try {
        const { user_id, course_id, quiz_id, total_marks, score, answers } = req.body;

        // Log the received data for debugging
        console.log("Received quiz results:", req.body);

        // Save the results to the database
        const quizResult = await QuizResult.create(user_id, course_id, quiz_id, total_marks, score, answers);

        // Send a success response
        res.status(200).json({
            success: true,
            message: "Quiz results saved successfully",
            data: quizResult
        });
    } catch (err) {
        console.error("Error saving quiz results:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
module.exports = { getAll, showQuizz, create, update, deleteQuizz, createQuestion, createOption, takeQuizz, saveResults };