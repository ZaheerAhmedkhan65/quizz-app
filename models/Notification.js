const db = require('../config/db');

class Notification {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                notifications.*, 
                users.username,
                users.avatar,
                users.email
            FROM notifications
            JOIN users ON notifications.user_id = users.id
        `);
        return rows;
    }

    static async markAsRead(id) {
        const [result] = await db.query('UPDATE notifications SET status = "read", updated_at = NOW() WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async markAllRead(userId) {
        const [result] = await db.query('UPDATE notifications SET status = "read", updated_at = NOW() WHERE user_id = ?', [userId]);
        return result.affectedRows;
    }
    

    static async findByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM notifications WHERE user_id = ?', [userId]);
        return rows;
    }

    static async create(title, notification_text, userId) {
        const [result] = await db.query('INSERT INTO notifications (title, notification_text, user_id, created_at) VALUES (?, ?, ?, NOW())', [title, notification_text, userId]);
        return result.insertId;
    }

    static async update(id, status) {
        const [result] = await db.query('UPDATE notifications SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM notifications WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Notification;