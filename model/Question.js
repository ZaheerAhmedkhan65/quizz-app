const db = require('../config/db');

class Question {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM questions');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByQuizzId(quizzId) {
        const [rows] = await db.query('SELECT * FROM questions WHERE quiz_id = ?', [quizzId]);
        return rows;
    }

    static async create(question_text, quizzId) {
        const [result] = await db.query('INSERT INTO questions (question_text, quiz_id) VALUES (?, ?)', [question_text, quizzId]);
        const [question] = await db.query('SELECT * FROM questions WHERE id = ?', [result.insertId]); // Get full question
        return question[0]; // Return question object
        // return result.insertId;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM questions WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async deleteByQuizzId(quizzId) {
        const [result] = await db.query('DELETE FROM questions WHERE quiz_id = ?', [quizzId]);
        return result.affectedRows;
    }

    static async update(id, question_text) {
        const [result] = await db.query('UPDATE questions SET question_text = ? WHERE id = ?', [question_text, id]);
        return result.affectedRows;
    }

}

module.exports = Question;