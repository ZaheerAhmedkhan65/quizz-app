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

    static async quizzesAttempted(userId, courseId) {
        const [rows] = await db.query(
            "SELECT COUNT(DISTINCT quiz_id) AS quizzes_attempted FROM quiz_results WHERE user_id = ? AND course_id = ?",
            [userId, courseId]
        );
        return rows.length ? rows[0].quizzes_attempted : 0; // Ensure it returns an integer
    }

}

module.exports = QuizResult;