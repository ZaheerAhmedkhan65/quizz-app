const ChatHistory = require("../model/ChatHistory");

const groupChatsByDate = (chats) => {
    const groups = {};

    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.setDate(now.getDate() - 1)).toDateString();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 6));
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 23));
    const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

    chats.forEach(chat => {
        const date = new Date(chat.created_at);
        const dateString = date.toDateString();

        let label;

        if (dateString === today) {
            label = 'Today';
        } else if (dateString === yesterday) {
            label = 'Yesterday';
        } else if (date > sevenDaysAgo) {
            label = 'Last 7 Days';
        } else if (date > thirtyDaysAgo) {
            label = 'Last 30 Days';
        } else if (date > oneYearAgo) {
            label = date.toLocaleString('default', { month: 'long' }); // e.g., "March"
        } else {
            label = date.getFullYear().toString(); // e.g., "2024"
        }

        if (!groups[label]) groups[label] = [];
        groups[label].push(chat);
    });

    return groups;
};

const getUserChatHistory = async (req, res) => {
    try {
        let chatHistory = await ChatHistory.getUserChatHistory(req.user.userId);
        const groupedChats = groupChatsByDate(chatHistory);
        res.json(groupedChats);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).send('Error fetching chat history.');
    }
};

module.exports = { getUserChatHistory };