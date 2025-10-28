// controllers/settingsController.js
const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.all();
    res.render('admin/settings', { settings, title: "Settings" });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).send('Server error');
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { new_user_webhook, app_update_webhook } = req.body;

    await Setting.upsert('new_user', new_user_webhook);
    await Setting.upsert('app_update', app_update_webhook);

    res.redirect('/admin/settings');
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).send('Server error');
  }
};
