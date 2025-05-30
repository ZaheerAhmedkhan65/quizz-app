const db = require('../config/db');

class Course {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM courses');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        return rows[0];
    }

    static async getTotalQuizzes(id) {
        const [rows] = await db.query('SELECT total_quizzes FROM courses WHERE id = ?', [id]);
        return rows.length ? rows[0].total_quizzes : 0; // Ensure it returns a number
    }

    static async findByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM courses WHERE id IN (SELECT course_id FROM user_courses WHERE user_id = ?)', [userId]);
        return rows;
    }

    static async create(title, user_id) {
        const [result] = await db.query('INSERT INTO courses (title, user_id) VALUES (?, ?)', [title, user_id]);
        const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [result.insertId]); // Get full course
        return course[0]; // Return course object
        // return result.insertId;
    }

    static async update(id, title) {
        const [result] = await db.query('UPDATE courses SET title = ? WHERE id = ?', [title, id]);
        return result.affectedRows;
    }

    static async updateTotalQuizzes(id, totalQuizzes) {
        const [result] = await db.query('UPDATE courses SET total_quizzes = ? WHERE id = ?', [totalQuizzes, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async findByTitle(userId, title) {
        const [rows] = await db.query('SELECT * FROM courses WHERE title = ? AND user_id = ?', [title, userId]);
        return rows[0];
    }

    // Course.js - Add these new methods to your Course class

    static async getCourseCount(userId) {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM courses WHERE user_id = ?', [userId]);
        return rows[0].count;
    }

    static async getCompletedCourseCount(userId) {
        const [rows] = await db.query(`
        SELECT COUNT(DISTINCT uc.course_id) as count 
        FROM user_courses uc
        JOIN courses c ON uc.course_id = c.id
        WHERE uc.user_id = ? AND uc.course_progress = 100
    `, [userId]);
        return rows[0].count;
    }
}

module.exports = Course;