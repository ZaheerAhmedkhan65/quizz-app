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

    static async create(title) {
        const [result] = await db.query('INSERT INTO courses (title) VALUES (?)', [title]);
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

    static async findByTitle(title) {
        const [rows] = await db.query('SELECT * FROM courses WHERE title = ?', [title]);
        return rows[0];
    }
}

module.exports = Course;