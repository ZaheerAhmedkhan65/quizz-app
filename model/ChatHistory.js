const db = require('../config/db');

class ChatHistory {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM chat_history');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM chat_history WHERE id = ?', [id]);
        return rows[0];
    }

    static async saveChatHistory({ userId, sessionId, prompt, response, isPdfBased = false, pdfId = null }) {
        const [rows] = await db.query( `INSERT INTO chat_history 
                                        (user_id, session_id, prompt, response, is_pdf_based, pdf_id)
                                        VALUES (?, ?, ?, ?, ?, ?)`, 
                                        [userId, sessionId, prompt, response, isPdfBased, pdfId]
                                    );
        const [chatHistory] = await db.query('SELECT * FROM chat_history WHERE id = ?', [rows.insertId]);
        return chatHistory[0];
    }

    // ChatHistory.js
    static async getUserChatHistory(userId) {
        const [rows] = await db.query(
            'SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at DESC', [userId]
        );
        return rows;
    }


    static async deleteChatById(id){
        const [rows] = await db.query('DELETE FROM chat_history WHERE id = ?', [id]);
        return rows;
    }

    static async getFeedbackSummaryNormalized() {
        const [rows] = await db.query(`
            SELECT 
                SUM(CASE WHEN liked = 1 THEN 1 ELSE 0 END) AS total_likes,
                SUM(CASE WHEN disliked = 1 THEN 1 ELSE 0 END) AS total_dislikes,
                SUM(CASE WHEN liked = 0 AND disliked = 0 THEN 1 ELSE 0 END) AS total_no_feedback,
                COUNT(*) AS total
            FROM chat_history
        `);
    
        const { total_likes, total_dislikes, total_no_feedback, total } = rows[0];
    
        if (total === 0) {
            return {
                likes_percent: 0,
                dislikes_percent: 0,
                no_feedback_percent: 0,
                total_likes: 0,
                total_dislikes: 0,
                total_no_feedback: 0,
                total: 0
            };
        }
    
        return {
            likes_percent: Math.round((total_likes / total) * 100),
            dislikes_percent: Math.round((total_dislikes / total) * 100),
            no_feedback_percent: Math.round((total_no_feedback / total) * 100),
            total_likes,
            total_dislikes,
            total_no_feedback,
            total
        };
    }
    
}

module.exports = ChatHistory;