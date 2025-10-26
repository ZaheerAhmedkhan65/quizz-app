const pool = require("../config/db");

module.exports = async (req, res) => {
  try {
    const [result] = await pool.query(`
      DELETE FROM sessions
      WHERE JSON_EXTRACT(data, '$.cookie.expires') < NOW()
    `);
    return res.status(200).json({ deleted: result.affectedRows });
  } catch (err) {
    console.error("Cleanup error:", err);
    return res.status(500).json({ error: "Failed to clean sessions" });
  }
};
