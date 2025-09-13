const db = require('../config/db');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

class Lecture {
    static async create({ title, courseId, startPage, endPage }) {
        const [result] = await db.query(
            'INSERT INTO lectures (title, course_id, start_page, end_page) VALUES (?, ?, ?, ?)',
            [title, courseId, startPage, endPage]
        );
        return this.findById(result.insertId);
    }

    static async delete(id) {
        const [result] = await db.query(
            'DELETE FROM lectures WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    }

    static async update(id, { title, courseId, startPage, endPage }) {
        const [result] = await db.query(
            'UPDATE lectures SET title = ?, course_id = ?, start_page = ?, end_page = ? WHERE id = ?',
            [title, courseId, startPage, endPage, id]
        );
        return result.affectedRows;
    }

    static async getCourse(id) {
        const [rows] = await db.query(
            'SELECT * FROM courses WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async getLectureWithContent(lectureId) {
        const lecture = await this.findById(lectureId);
        if (!lecture) return null;

        const lecturePdf = await this.extractLecturePDF(lecture);

        return {
            ...lecture,
            pdf: lecturePdf
        };
    }

    static async updateHandoutInfo(id, { handoutPath, startPage, endPage }) {
        const [result] = await db.query(
            'UPDATE lectures SET handout_path = ?, start_page = ?, end_page = ? WHERE id = ?',
            [handoutPath, startPage, endPage, id]
        );
        return result.affectedRows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM lectures');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM lectures WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCourseId(courseId) {
        const [rows] = await db.query(
            'SELECT * FROM lectures WHERE course_id = ?',
            [courseId]
        );
        return rows;
    }

    static async deleteByCourseId(courseId) {
        const [result] = await db.query(
            'DELETE FROM lectures WHERE course_id = ?',
            [courseId]
        );
        return result.affectedRows;
    }

    static async getQuizAttemptCount(lectureId) {
        const [rows] = await db.query(
            "SELECT COUNT(*) AS attempt_count FROM quiz_results WHERE quiz_id = ?",
            [lectureId]
        );
        return rows.length ? rows[0].attempt_count : 0;
    }

    static async updateLectureTotalQuestions(lectureId, totalQuestions) {
        const [result] = await db.query(
            'UPDATE lectures SET total_questions = ? WHERE id = ?',
            [totalQuestions, lectureId]
        );
        return result.affectedRows;
    }

    static async getQuestionsWithDetails(lectureId) {
        // Get all questions with their options and answers
        const [questions] = await db.query(`
            SELECT 
                q.id AS question_id, 
                q.question_text, 
                q.question_type,
                q.question_image,
                a.correct_answer,
                a.max_length
            FROM questions q
            LEFT JOIN answers a ON q.id = a.question_id
            WHERE q.lecture_id = ?`,
            [lectureId]
        );

        // Get all options for these questions
        const [options] = await db.query(`
            SELECT 
                id, 
                question_id, 
                option_text, 
                option_image, 
                is_correct 
            FROM options 
            WHERE question_id IN (
                SELECT id FROM questions WHERE lecture_id = ?
            )`,
            [lectureId]
        );

        // Organize the data
        const questionsMap = new Map();

        questions.forEach(question => {
            questionsMap.set(question.question_id, {
                id: question.question_id,
                question_text: question.question_text,
                question_type: question.question_type,
                question_image: question.question_image,
                correct_answer: question.correct_answer,
                max_length: question.max_length,
                options: []
            });
        });

        options.forEach(option => {
            if (questionsMap.has(option.question_id)) {
                questionsMap.get(option.question_id).options.push({
                    id: option.id,
                    option_text: option.option_text,
                    option_image: option.option_image,
                    is_correct: option.is_correct
                });
            }
        });

        return Array.from(questionsMap.values());
    }

    static async getLectureWithFullDetails(lectureId) {
        const lecture = await this.findById(lectureId);
        if (!lecture) return null;

        const questions = await this.getQuestionsWithDetails(lectureId);
        return {
            ...lecture,
            questions
        };
    }
}

module.exports = Lecture;