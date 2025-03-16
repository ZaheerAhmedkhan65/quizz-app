const db = require('../config/db');

class QuizResult {
    static async create(userId, courseId, quizzId, totalMarks, score, answers) {
        const [result] = await db.query(
            'INSERT INTO quiz_results (user_id, course_id, quiz_id, total_marks, score, answers) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, courseId, quizzId, totalMarks, score, JSON.stringify(answers)]
        );
        const [quiz_result] = await db.query("SELECT * FROM quiz_results WHERE id = ?", [result.insertId]);
        return quiz_result[0];
    }

    static async findByQuizId(quizzId) {
        const [quiz_result] = await db.query("SELECT * FROM quiz_results WHERE quiz_id = ?", [quizzId]);
        return quiz_result;
    }
}

module.exports = QuizResult;