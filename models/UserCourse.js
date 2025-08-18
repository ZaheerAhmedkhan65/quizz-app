const db = require('../config/db');

class UserCourse {
    static async getProgressByUserId(userId) {
        const [result] = await db.query(`
            SELECT 
                u.id AS user_id,
                u.username,
                c.id AS course_id,
                c.title AS course_title,
                uc.course_progress
            FROM user_courses uc
            JOIN users u ON uc.user_id = u.id
            JOIN courses c ON uc.course_id = c.id
            WHERE u.id = ?`,
            [userId]
        );
        return result; // Return the full array of results
    }

    static async create(userId, courseId) {
        const [result] = await db.query('INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)', [userId, courseId]);
        return result.insertId;
    }

    static async updateProgress(userId, courseId, courseProgress) {
        const [result] = await db.query('UPDATE user_courses SET course_progress = ? WHERE user_id = ? AND course_id = ?', [courseProgress, userId, courseId]);
        return result.affectedRows;
    }

    static async delete(userId, courseId) {
        const [result] = await db.query('DELETE FROM user_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
        return result.affectedRows;
    }

    static async findByUserIdAndCourseId(userId, courseId) {
        const [result] = await db.query('SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
        return result[0];
    }

    // UserCourse.js - Add these new methods to your UserCourse class

    static async getAverageProgress(userId) {
        const [rows] = await db.query(`
        SELECT AVG(course_progress) as average 
        FROM user_courses 
        WHERE user_id = ?
    `, [userId]);
        return rows[0].average || 0;
    }

    static async getCompletedCourses(userId) {
        const [rows] = await db.query(`
        SELECT c.* 
        FROM user_courses uc
        JOIN courses c ON uc.course_id = c.id
        WHERE uc.user_id = ? AND uc.course_progress = 100
    `, [userId]);
        return rows;
    }
}

module.exports = UserCourse;
