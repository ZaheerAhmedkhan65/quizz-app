const db = require('../config/db');

class QuizAttempt {
    static async create({ user_id, course_id, lecture_id = null, total_questions, correct_answers, score }) {
        const [result] = await db.query(
            'INSERT INTO quiz_attempts (user_id, course_id, lecture_id, total_questions, correct_answers, score) VALUES (?, ?, ?, ?, ?, ?)',
            [user_id, course_id, lecture_id, total_questions, correct_answers, score]
        );
        return result.insertId;
    }

    static async findByUser(user_id) {
        const [rows] = await db.query(
            `SELECT qa.*, 
                c.title AS course_title, 
                l.title AS lecture_title
         FROM quiz_attempts qa
         LEFT JOIN courses c ON qa.course_id = c.id
         LEFT JOIN lectures l ON qa.lecture_id = l.id
         WHERE qa.user_id = ?
         ORDER BY qa.created_at DESC`,
            [user_id]
        );
        return rows;
    }


    static async findByUserAndCourse(user_id, course_id) {
        const [rows] = await db.query(
            `SELECT qa.*, 
                c.title AS course_title
         FROM quiz_attempts qa
         LEFT JOIN courses c ON qa.course_id = c.id
         WHERE qa.user_id = ? AND qa.course_id = ?
         ORDER BY qa.created_at DESC`,
            [user_id, course_id]
        );
        return rows;
    }

    static async findByUserAndLecture(user_id, lecture_id) {
        const [rows] = await db.query(
            `SELECT qa.*, 
                l.title AS lecture_title
         FROM quiz_attempts qa
         LEFT JOIN lectures l ON qa.lecture_id = l.id
         WHERE qa.user_id = ? AND qa.lecture_id = ?
         ORDER BY qa.created_at DESC`,
            [user_id, lecture_id]
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM quiz_attempts WHERE id = ?', [id]);
        return rows[0] || null;
    }
}

module.exports = QuizAttempt;