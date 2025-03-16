const db = require('../config/db');

class Notes {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM notes');
        return rows;
    }

    static async findByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM notes WHERE user_id = ?', [userId]);
        return rows[0];
    }

    static async create(title, content) {
        const [result] = await db.query('INSERT INTO notes (title, content) VALUES (?, ?)', [title, content]);
        return result.insertId;
    }

    static async update(id, title, content) {
        const [result] = await db.query('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM notes WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Notes;