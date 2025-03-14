const db = require('../config/db');

class User {
    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(username,email,password) {
        const [result] = await db.query('INSERT INTO users (username, email,password) VALUES (?, ?, ?)', [username, email, password]);
        return result.insertId;
    }

    static async update(id, username, password) {
        const [result] = await db.query('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, password, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    }

    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }
}

module.exports = User;
