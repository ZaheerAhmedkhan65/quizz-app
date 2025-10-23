const db = require('../config/db');

class Notification {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT 
                n.*, 
                u.username,
                u.avatar,
                u.email,
                CASE WHEN nr.notification_id IS NOT NULL THEN 1 ELSE 0 END as is_read
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = n.user_id
        `);
        return rows;
    }

    static async markAsRead(notificationId, userId) {
        // Check if already read
        const [existing] = await db.query(
            'SELECT id FROM notification_reads WHERE notification_id = ? AND user_id = ?',
            [notificationId, userId]
        );

        if (existing.length === 0) {
            // Insert into notification_reads table
            const [result] = await db.query(
                'INSERT INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
                [notificationId, userId]
            );
            
            return result.affectedRows || result.insertId;
        }
        
        return 0; // Already read
    }

    static async markAllRead(userId) {
        // Get all unread notifications for user
        const [unreadNotifications] = await db.query(`
            SELECT id FROM notifications 
            WHERE (user_id = ? OR type = 'global') 
            AND id NOT IN (
                SELECT notification_id FROM notification_reads WHERE user_id = ?
            )
        `, [userId, userId]);

        // Mark each as read
        for (const notification of unreadNotifications) {
            await this.markAsRead(notification.id, userId);
        }

        return unreadNotifications.length;
    }

    static async findByUserId(userId, includeRead = true) {
        const query = `
          SELECT 
              n.*,
              u.username,
              u.avatar,
              u.email,
              CASE WHEN nr.notification_id IS NOT NULL THEN 1 ELSE 0 END as is_read
          FROM notifications n
          LEFT JOIN users u ON n.user_id = u.id
          LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
          WHERE (n.user_id = ? OR n.type = 'global')
          ${includeRead ? '' : 'AND nr.notification_id IS NULL'}
          ORDER BY n.created_at DESC
        `;
        const [rows] = await db.query(query, [userId, userId]);
        return rows;
      }

    static async getUnreadCount(userId) {
        const [rows] = await db.query(`
            SELECT COUNT(*) as unread_count
            FROM notifications n
            LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
            WHERE (n.user_id = ? OR n.type = 'global') AND nr.notification_id IS NULL
        `, [userId, userId]);
        
        return rows[0].unread_count;
    }

    static async create(title, subtitle, notification_text, userId, type = 'user') {
        const [result] = await db.query(
            'INSERT INTO notifications (title, subtitle, notification_text, user_id, type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [title, subtitle, notification_text, userId, type]
        );
        return result.insertId;
    }

    static async createGlobal(title, subtitle, notification_text) {
        const [result] = await db.query(
            'INSERT INTO notifications (title, subtitle, notification_text, type, created_at) VALUES (?, ?, ?, "global", NOW())',
            [title, subtitle, notification_text]
        );
        return result.insertId;
    }

    static async update(id, updates) {
        const allowedFields = ['title', 'subtitle', 'notification_text', 'user_id', 'type'];
        const fields = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });

        if (fields.length === 0) {
            return 0;
        }

        values.push(id);
        const [result] = await db.query(
            `UPDATE notifications SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
            values
        );
        return result.affectedRows;
    }

    static async delete(id) {
        // First delete from notification_reads (due to foreign key constraint)
        await db.query('DELETE FROM notification_reads WHERE notification_id = ?', [id]);
        
        // Then delete the notification
        const [result] = await db.query('DELETE FROM notifications WHERE id = ?', [id]);
        return result.affectedRows;
    }

    // Get global notifications for a user (with read status)
    static async getGlobalNotifications(userId) {
        const [rows] = await db.query(`
            SELECT 
                n.*,
                CASE WHEN nr.notification_id IS NOT NULL THEN 1 ELSE 0 END as is_read
            FROM notifications n
            LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = ?
            WHERE n.type = 'global'
            ORDER BY n.created_at DESC
        `, [userId]);
        
        return rows;
    }

    // Get user-specific notifications
    static async getUserNotifications(userId, includeRead = true) {
        const query = `
            SELECT 
                n.*,
                u.username,
                u.avatar,
                u.email,
                CASE WHEN nr.notification_id IS NOT NULL THEN 1 ELSE 0 END as is_read
            FROM notifications n
            JOIN users u ON n.user_id = u.id
            LEFT JOIN notification_reads nr ON n.id = nr.notification_id AND nr.user_id = n.user_id
            WHERE n.user_id = ? AND n.type = 'user'
            ${includeRead ? '' : 'AND nr.notification_id IS NULL'}
            ORDER BY n.created_at DESC
        `;
        
        const [rows] = await db.query(query, [userId]);
        return rows;
    }

    // Check if a notification is read by a user
    static async isReadByUser(notificationId, userId) {
        const [rows] = await db.query(
            'SELECT id FROM notification_reads WHERE notification_id = ? AND user_id = ?',
            [notificationId, userId]
        );
        return rows.length > 0;
    }

    // Mark multiple notifications as read at once
    static async markMultipleAsRead(notificationIds, userId) {
        if (!notificationIds.length) return 0;

        const placeholders = notificationIds.map(() => '?').join(',');
        const values = [...notificationIds, userId];

        // First, find which notifications are not already read
        const [unread] = await db.query(`
            SELECT ? as notification_id 
            FROM DUAL 
            WHERE notification_id NOT IN (
                SELECT notification_id FROM notification_reads WHERE user_id = ?
            )
        `, [notificationIds[0], userId]);

        // For simplicity, we'll insert each one individually
        // In a production environment, you might want to use a bulk insert
        let markedCount = 0;
        for (const notificationId of notificationIds) {
            const result = await this.markAsRead(notificationId, userId);
            if (result > 0) markedCount++;
        }

        return markedCount;
    }

    // Remove read status (mark as unread)
    static async markAsUnread(notificationId, userId) {
        const [result] = await db.query(
            'DELETE FROM notification_reads WHERE notification_id = ? AND user_id = ?',
            [notificationId, userId]
        );
        return result.affectedRows;
    }
}

module.exports = Notification;