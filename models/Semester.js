const db = require('../config/db');

class Semester {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM semesters ORDER BY id ASC');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM semesters WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByStatus(status='active') {
        const [rows] = await db.query('SELECT * FROM semesters WHERE status = ?', [status]);
        return rows[0];
    }

    static async create({ title, start_date, end_date }) {
        const [result] = await db.query(
            'INSERT INTO semesters (title, start_date, end_date) VALUES (?, ?, ?)',
            [title, start_date, end_date]
        );
        const [semester] = await db.query('SELECT * FROM semesters WHERE id = ?', [result.insertId]);
        return semester[0];
    }

    static async update(id, { title, start_date, end_date, status }) {
        const [result] = await db.query(
            'UPDATE semesters SET title = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
            [title, start_date, end_date, status, id]
        );
        return result.affectedRows;
    }   

    static async delete(id) {
        const [result] = await db.query('DELETE FROM semesters WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Semester;