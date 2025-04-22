const db = require('../config/db');

class User {
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findByVerificationToken(token) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE verification_token = ? AND verification_token_expires > NOW()',
            [token]
        );
        return rows[0];
    }

    static async findByResetToken(token) {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW()',
            [token]
        );
        return rows[0];
    }

    static async create({ username, email, password, role = 'user', verificationToken, verificationTokenExpires }) {
        const [result] = await db.query(
            `INSERT INTO users 
            (username, email, password, role, verification_token, verification_token_expires, email_verified, is_online) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username,
                email,
                password,
                role,
                verificationToken,
                verificationTokenExpires,
                false, // email_verified starts as false
                0      // is_online starts as 0 (offline)
            ]
        );
        
        return this.findById(result.insertId);
    }

    static async verifyEmail(userId) {
        await db.query(
            'UPDATE users SET email_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
            [userId]
        );
        return this.findById(userId);
    }

    static async updatePassword(userId, newPassword) {
        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?',
            [newPassword, userId]
        );
        return this.findById(userId);
    }

    static async setResetToken(email, resetToken, resetTokenExpires) {
        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE email = ?',
            [resetToken, resetTokenExpires, email]
        );
        return this.findByEmail(email);
    }

    static async updateUser(id, updates) {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updates)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        values.push(id);
        
        await db.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return this.findById(id);
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT id, username, email, role, is_online FROM users');
        return rows;
    }

    static async updateOnlineStatus(userId, isOnline) {
        await db.query('UPDATE users SET is_online = ? WHERE id = ?', [isOnline, userId]);
        return this.findById(userId);
    }
}

module.exports = User;