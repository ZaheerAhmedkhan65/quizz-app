const Notification = require('../models/Notification');

const getNotification = async (req, res) => {
  try {
    let notifications;
    
    if (req.user.role === "admin") {
      notifications = await Notification.getAll();
    } else {
      notifications = await Notification.findByUserId(req.user.userId);
    }
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.markAsRead(req.params.id, req.user.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.markAllRead(req.user.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

// Create Notification (supports both user and global types)
const createNotification = async (req, res) => {
  const { title, subtitle, notification_text, user_id, type } = req.body;
  
  try {
    let id;
    
    if (type === 'global') {
      // Create global notification (no specific user)
      id = await Notification.createGlobal(title, subtitle, notification_text);
    } else {
      // Create user-specific notification
      if (!user_id) {
        return res.status(400).json({ error: 'User ID is required for user notifications' });
      }
      id = await Notification.create(title, subtitle, notification_text, user_id, type);
    }
    
    res.json({ 
      id, 
      title, 
      subtitle, 
      notification_text, 
      user_id: type === 'global' ? null : user_id, 
      type 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Update Notification
const updateNotification = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const affectedRows = await Notification.update(id, updates);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    await Notification.delete(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

module.exports = {
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead, 
  markAllRead 
};