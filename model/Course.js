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

    static async delete(id) {
        const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async findByTitle(userId, title) {
        const [rows] = await db.query('SELECT * FROM courses WHERE title = ? AND user_id = ?', [title , userId]);
        return rows[0];
    }
}

module.exports = Course;