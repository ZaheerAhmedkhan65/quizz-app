const db = require('../config/db');

class User {
    static async getAllUsers(id) {
        const [results] = await db.query(`
            SELECT 
                u.*, 
                c.id AS course_id, 
                c.title AS course_title
            FROM users u
            LEFT JOIN user_courses uc ON u.id = uc.user_id
            LEFT JOIN courses c ON uc.course_id = c.id
            WHERE u.id != ?
            ORDER BY u.id
        `, [id]);
        
        // Group courses by user
        const usersMap = new Map();
        
        results.forEach(row => {
            if (!usersMap.has(row.id)) {
                // Create user object without course fields
                const user = { ...row, created_at: formatDate(row.created_at),  // Format the date
                    courses: []  };
                delete user.course_id;
                delete user.course_title;
                user.courses = [];
                usersMap.set(row.id, user);
            }
            
            // Add course if it exists (LEFT JOIN might return nulls)
            if (row.course_id) {
                usersMap.get(row.id).courses.push({
                    id: row.course_id,
                    title: row.course_title
                });
            }
        });
        
        return Array.from(usersMap.values());
    }

    static async getUserStats() {
        // 1. Get total users count
        const [totalUsersResult] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const totalUsers = totalUsersResult[0].totalUsers;
    
        // 2. Get new users this month
        const [currentMonthResult] = await db.query(`
            SELECT COUNT(*) AS currentMonthUsers 
            FROM users 
            WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
        `);
        const currentMonthUsers = currentMonthResult[0].currentMonthUsers;
    
        // 3. Get new users from last month
        const [lastMonthResult] = await db.query(`
            SELECT COUNT(*) AS lastMonthUsers 
            FROM users 
            WHERE created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
            AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')
        `);
        const lastMonthUsers = lastMonthResult[0].lastMonthUsers;
    
        // 4. Calculate percentage increase (compared to last month)
        let percentageIncrease = 0;
        if (lastMonthUsers > 0) {
            percentageIncrease = ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;
        }
    
        // 5. Calculate percentage since last month (if needed)
        let percentageSinceLastMonth = 0;
        if (totalUsers > 0 && lastMonthUsers > 0) {
            percentageSinceLastMonth = (currentMonthUsers / totalUsers) * 100;
        }
    
        return {
            totalUsers,
            percentageIncrease: percentageIncrease.toFixed(2),
            percentageSinceLastMonth: percentageSinceLastMonth.toFixed(2),
            currentMonthUsers,
            lastMonthUsers
        };
    }
    
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
            (username, email, password, role, verification_token, verification_token_expires, 
             email_verified, is_online, status, avatar, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username,
                email,
                password,
                role,
                verificationToken,
                verificationTokenExpires,
                false,               // email_verified starts as false
                0,                    // is_online starts as 0 (offline)
                "pending",             // status
                '/uploads/avatars/default.png',  // default avatar
                new Date(),           // created_at
                new Date()           // updated_at
            ]
        );
        
        return this.findById(result.insertId);
    }

    static async verifyEmail(userId) {
        await db.query(
            'UPDATE users SET email_verified = true, verification_token = NULL, verification_token_expires = NULL, status = "approved" WHERE id = ?',
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

    static async updateStatus(id, status) {
        const [result] = await db.query(
            'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?', 
            [status, id]
        );
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

function formatDate(dateString) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

module.exports = User;