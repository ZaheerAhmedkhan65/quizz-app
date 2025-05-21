const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

const authenticate = require('../middleware/authenticate');

router.get('/get-todos',authenticate,todoController.getToDo);
router.post('/add-todo', authenticate, todoController.createToDo);
router.put('/update-todo/:id', authenticate, todoController.updateToDo);
router.delete('/delete-todo/:id', authenticate, todoController.deleteToDo);


module.exports = router;