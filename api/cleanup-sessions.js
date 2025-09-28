// /api/cleanup-sessions.js
const pool = require("../../config/db.js");

module.exports = async function handler(req, res) {
  try {
    const [result] = await pool.query(`
      DELETE FROM sessions
      WHERE JSON_EXTRACT(data, '$.cookie.expires') < NOW()
    `);

    res.status(200).json({ deleted: result.affectedRows });
  } catch (err) {
    console.error("Cleanup error:", err);
    res.status(500).json({ error: "Failed to clean sessions" });
  }
};
