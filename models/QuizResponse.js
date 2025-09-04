const db = require('../config/db');

class QuizResponse {
    static async create({ attempt_id, question_id, option_id = null, is_correct }) {
        const [result] = await db.query(
            'INSERT INTO quiz_responses (attempt_id, question_id, option_id, is_correct) VALUES (?, ?, ?, ?)',
            [attempt_id, question_id, option_id, is_correct]
        );
        return result.insertId;
    }

    static async findByAttempt(attempt_id) {
        const [rows] = await db.query(
            'SELECT * FROM quiz_responses WHERE attempt_id = ?',
            [attempt_id]
        );
        return rows;
    }

    static async getAttemptResults(attempt_id) {
        const [rows] = await db.query(
            `SELECT qr.*, 
                q.question_text, 
                uo.option_text AS user_option_text,
                co.option_text AS correct_option_text
         FROM quiz_responses qr
         JOIN questions q ON qr.question_id = q.id
         LEFT JOIN options uo ON qr.option_id = uo.id
         LEFT JOIN options co ON co.question_id = q.id AND co.is_correct = 1
         WHERE qr.attempt_id = ?`,
            [attempt_id]
        );
        return rows;
    }

}

module.exports = QuizResponse;