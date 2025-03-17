const db = require('../config/db');

class Quizz {
    static async create(title,courseId) {
        const [result] = await db.query('INSERT INTO quizzes (title, course_id) VALUES (? , ?)', [title,courseId]);
        const [quizz] = await db.query('SELECT * FROM quizzes WHERE id = ?', [result.insertId]); // Get full quizz
        return quizz[0]; // Return quizz object
        // return result.insertId;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM quizzes WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async update(id, title) {
        const [result] = await db.query('UPDATE quizzes SET title = ? WHERE id = ?', [title, id]);
        return result.affectedRows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM quizzes');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM quizzes WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByCourseId(courseId) {
        const [rows] = await db.query('SELECT * FROM quizzes WHERE course_id = ?', [courseId]);
        return rows;
    }
   
    static async updateQuizzTotalQuestions(quizzId, totalQuestions) {
        const [result] = await db.query('UPDATE quizzes SET total_questions = ? WHERE id = ?', [totalQuestions, quizzId]);
        return result.affectedRows;
    }

    static async getQuestionsAndOptions(quizzId) {
        const [rows] = await db.query(`
            SELECT q.id AS question_id, q.question_text, 
                   o.id AS option_id, o.option_text, o.is_correct
            FROM questions q
            LEFT JOIN options o ON q.id = o.question_id
            WHERE q.quiz_id = ?`, 
            [quizzId]
        );
        const questionsMap = new Map();
    
        rows.forEach(row => {
            if (!questionsMap.has(row.question_id)) {
                questionsMap.set(row.question_id, {
                    id: row.question_id,
                    question_text: row.question_text,
                    options: []
                });
            }
    
            if (row.option_id) {  // Only add options if they exist
                questionsMap.get(row.question_id).options.push({
                    id: row.option_id,
                    option_text: row.option_text,
                    is_correct: row.is_correct
                });
            }
        });
    
        return Array.from(questionsMap.values());
    }
    
    
}

module.exports = Quizz;