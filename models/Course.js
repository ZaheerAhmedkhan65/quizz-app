const db = require('../config/db');

class Course {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM courses');
        return rows;
    }

    // static async getAllCourses(userId) {
    //     const [rows] = await db.query('SELECT * FROM courses WHERE id IN (SELECT course_id FROM user_courses WHERE user_id = ?)', [userId]);
    //     return rows[0].count;
    // }

    static async getAllCourses(user_id) {
        try {
            const [rows] = await db.execute(`
            SELECT 
                c.id, 
                c.title,
                c.slug,
                c.handout_pdf,
                c.handout_original_filename,
                uc.course_progress 
            FROM courses c
            LEFT JOIN user_courses uc ON c.id = uc.course_id AND uc.user_id = ?
            ORDER BY c.id ASC
        `, [user_id]);
            return rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
        return rows[0];
    }

    static async getTotalLectures(id) {
        const [rows] = await db.query('SELECT total_lectures FROM courses WHERE id = ?', [id]);
        return rows.length ? rows[0].total_lectures : 0; // Ensure it returns a number
    }

    static async findByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM courses WHERE id IN (SELECT course_id FROM user_courses WHERE user_id = ?)', [userId]);
        return rows;
    }

    static async findCourse(userId, courseId) {
        const [rows] = await db.query(`
        SELECT 
            c.id, 
            c.title,
            c.slug,
            c.handout_pdf,
            c.handout_original_filename,
            uc.course_progress 
        FROM courses c
        LEFT JOIN user_courses uc 
            ON c.id = uc.course_id 
           AND uc.user_id = ?
        WHERE c.id = ?
        ORDER BY c.id ASC
    `, [userId, courseId]);

        return rows[0];
    }

    static async create({ title, slug, user_id, handout_pdf = null, handout_original_filename = null }) {
        const [result] = await db.query('INSERT INTO courses (title, slug, handout_pdf, handout_original_filename, created_by) VALUES (?, ?, ?, ?, ?)', [title, slug, handout_pdf, handout_original_filename, user_id]);
        const [course] = await db.query('SELECT * FROM courses WHERE id = ?', [result.insertId]); // Get full course
        return course[0]; // Return course object
        // return result.insertId;
    }

    static async update(id, { title, slug, handout_pdf, handout_original_filename }) {
        const [result] = await db.query('UPDATE courses SET title = ?, slug = ?, handout_pdf = ?, handout_original_filename = ? WHERE id = ?', [title, slug, handout_pdf, handout_original_filename, id]);
        return result.affectedRows;
    }

    static async updateDownloadCount(id) { // Add this method to update the download ount
        const [result] = await db.query('UPDATE courses SET download_count = download_count + 1 WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async updateTotalLectures(id, total_lectures) {
        const [result] = await db.query('UPDATE courses SET total_lectures = ? WHERE id = ?', [total_lectures, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async findByTitle(userId, title) {
        const [rows] = await db.query('SELECT * FROM courses WHERE title = ? AND created_by = ?', [title, userId]);
        return rows[0];
    }

    static async getCourseCount(userId) {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM courses WHERE created_by = ?', [userId]);
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