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
        return rows[0];
    }

    static async getUserChatHistory(userId) {
        const [rows] = await db.query('SELECT * FROM chat_history WHERE user_id = ?', [userId]);
        return rows;
    }

    static async deleteChatById(id){
        const [rows] = await db.query('DELETE FROM chat_history WHERE id = ?', [id]);
        return rows;
    }

}

module.exports = ChatHistory;