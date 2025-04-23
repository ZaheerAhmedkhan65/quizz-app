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

    static async saveFeedback({ chatHistoryId, liked = 0, disliked = 0 }) {
        const [result] = await db.query(
            `UPDATE chat_history 
             SET liked = ?, disliked = ? 
             WHERE id = ?`,
            [liked, disliked, chatHistoryId]
        );
        return result;
    }

}

module.exports = ChatHistory;