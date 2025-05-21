const db = require('../config/db');

class ToDo {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM todos');
        return rows;
    }

    static async findByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM todos WHERE user_id = ?', [userId]);
        return rows; // Return all rows, not just rows[0]
    }

    static async create(userId, content) {
        const [result] = await db.query(
            'INSERT INTO todos (content, user_id, completed) VALUES (?, ?, ?)',
            [content, userId, 0]
        );
        return result.insertId;
    }


    static async update(id, completed) {
        const [result] = await db.query('UPDATE todos SET completed = ? WHERE id = ?', [completed, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM todos WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = ToDo;