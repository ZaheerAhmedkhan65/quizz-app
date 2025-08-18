const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

router.get('/get-todos', todoController.getToDo);
router.post('/add-todo', todoController.createToDo);
router.put('/update-todo/:id', todoController.updateToDo);
router.delete('/delete-todo/:id', todoController.deleteToDo);


module.exports = router;