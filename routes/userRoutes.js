const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authenticate = require('../middleware/authenticate');

router.get('/dashboard',authenticate,userController.userDashboard);
router.get('/admin/dashboard',authenticate,userController.adminDashboard);

router.post('/users/:id/:action', authenticate, userController.updateUserStatus); // Handles all actions

module.exports = router;