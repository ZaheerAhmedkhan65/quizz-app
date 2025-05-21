const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');

const authenticate = require('../middleware/authenticate');

router.get('/get-notifications',authenticate,notificationsController.getNotification);
router.post('/add-notification', authenticate, notificationsController.createNotification);
router.put('/update-notification/:id', authenticate, notificationsController.updateNotification);
router.delete('/delete-notification/:id', authenticate, notificationsController.deleteNotification);

module.exports = router;