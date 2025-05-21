const ToDo = require('../model/ToDo');

const getToDo = async (req, res) => {
  try {
    const todos = await ToDo.findByUserId(req.user.userId);
    res.json(todos); // Return all todos
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
};

// Create
const createToDo = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.userId;

  try {
    const id = await ToDo.create(userId, content);
    res.json({ id, content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
};

// Update
const updateToDo = async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    await ToDo.update(id, completed);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
};

// Delete
const deleteToDo = async (req, res) => {
  const { id } = req.params;

  try {
    await ToDo.delete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
};

module.exports = {
  getToDo,
  createToDo,
  updateToDo,
  deleteToDo
};
