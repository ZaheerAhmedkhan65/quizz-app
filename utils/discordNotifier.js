// utils/discordNotifier.js
const axios = require('axios');
const Setting = require('../models/Setting');

async function sendDiscordMessage(type, messageData = {}) {
  // Decide webhook key and embed details based on type
  let key, embed;

  switch (type) {
    case 'new_user':
      key = 'new_user';
      embed = {
        title: "👤 New User Joined!",
        description: `Welcome **${messageData.username}** to **VU EMPIRE!** 🎉`,
        color: 0x4F46E5,
        footer: { text: "🚀 VU EMPIRE Portal" },
        timestamp: new Date()
      };
      break;

    case 'app_update':
      key = 'app_update';
      embed = {
        title: messageData.title,
        description: messageData.notification_text || "An update has been deployed.",
        color: 0x10B981, // Green
        footer: { text: "⚡ VU EMPIRE Portal" },
        timestamp: new Date()
      };
      break;

    default:
      console.warn(`⚠️ Unknown message type: ${type}`);
      return;
  }

  // Fetch webhook URL from DB
  const setting = await Setting.findByKey(key);
  if (!setting || !setting.value) {
    console.warn(`⚠️ No Discord webhook set for ${key}`);
    return;
  }

  // Send embed message
  try {
    await axios.post(setting.value, {
      username: "VU Empire Bot 🤖",
      avatar_url: "https://cdn-icons-png.flaticon.com/512/4712/4712108.png", // you can change this avatar
      embeds: [embed],
    });
    console.log(`✅ Discord message sent for ${key}`);
  } catch (err) {
    console.error("❌ Discord message failed:", err.message);
  }
}

module.exports = sendDiscordMessage;
