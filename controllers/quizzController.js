const Quizz = require('../model/Quizz');
const Course = require('../model/Course');
const Question = require('../model/Question');
const Option = require('../model/Option');
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

        const quizData = await Quizz.getQuestionsAndOptions(req.params.id);

        res.status(200).render('quizz', { quizz, title: quizz.title,quizData,course,user:req.user||null });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const create = async (req, res) => {
    try {
        const quizz = await Quizz.create(req.body.title, req.params.id);
        res.status(201).redirect('/api/courses/' + req.params.id);
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
        res.status(200).render('takeQuizz', { quizz, title: quizz.title,quizData,course,user:req.user||null });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
module.exports = { getAll, showQuizz, create, update, deleteQuizz, createQuestion, createOption, takeQuizz };