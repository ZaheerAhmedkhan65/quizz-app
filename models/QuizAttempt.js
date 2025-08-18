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
            'SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC',
            [user_id]
        );
        return rows;
    }

    static async findByUserAndCourse(user_id, course_id) {
        const [rows] = await db.query(
            'SELECT * FROM quiz_attempts WHERE user_id = ? AND course_id = ? ORDER BY created_at DESC',
            [user_id, course_id]
        );
        return rows;
    }

    static async findByUserAndLecture(user_id, lecture_id) {
        const [rows] = await db.query(
            'SELECT * FROM quiz_attempts WHERE user_id = ? AND lecture_id = ? ORDER BY created_at DESC',
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