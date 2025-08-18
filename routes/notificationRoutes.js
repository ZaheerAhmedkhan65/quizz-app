const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');


router.get('/get-notifications', notificationsController.getNotification);
router.post('/add-notification',   notificationsController.createNotification);
router.put('/update-notification/:id',   notificationsController.updateNotification);
router.delete('/delete-notification/:id',   notificationsController.deleteNotification);

module.exports = router;