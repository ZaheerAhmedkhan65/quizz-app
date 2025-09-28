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

    static async updateCourseProgress(userId, courseId) {
        // Get total lectures of this course
        const [course] = await db.query(
            "SELECT total_lectures FROM courses WHERE id = ?",
            [courseId]
        );
        if (!course.length || !course[0].total_lectures) return 0;
        const totalLectures = course[0].total_lectures;

        // Get all lecture quizzes with >= 50% score
        const [passedLectures] = await db.query(
            `SELECT DISTINCT qa.lecture_id 
         FROM quiz_attempts qa
         WHERE qa.user_id = ? AND qa.course_id = ? AND qa.lecture_id IS NOT NULL AND qa.score >= 50`,
            [userId, courseId]
        );

        const completedCount = passedLectures.length;
        const progress = Math.round((completedCount / totalLectures) * 100);

        // Update user_courses
        await db.query(
            "UPDATE user_courses SET course_progress = ? WHERE user_id = ? AND course_id = ?",
            [progress, userId, courseId]
        );

        return progress;
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
