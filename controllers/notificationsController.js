const Notification = require('../models/Notification');

const getNotification = async (req, res) => {
  try {
    let notifications;
    
    if (req.user.role === "admin") {
      notifications = await Notification.getAll();
    } else {
      notifications = await Notification.findByUserId(req.user.userId);
    }
    
    res.json(notifications); // Send response once
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Create
const createNotification = async (req, res) => {
  const { title, notification_text, user_id } = req.body;
  try {
    const id = await Notification.create(title, notification_text, user_id);
    res.json({ id, title, notification_text, user_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Update
const updateNotification = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await Notification.update(id, status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

// Delete
const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    await Notification.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

module.exports = {
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification
};
