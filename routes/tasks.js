const express = require('express');
const Task = require('../models/Task');
const verifyToken = require('../middleware/authmiddleware');
const { validateTask } = require('../middleware/validate');

const router = express.Router();

// READ: abierta, no pide token
router.get('/', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// CREATE: protegida y validada
router.post('/', verifyToken, validateTask, async (req, res) => {
  const task = await Task.create({ title: req.body.title });
  res.status(201).json(task);
});

// UPDATE: protegida
router.put('/:id', verifyToken, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  res.json(task);
});

// DELETE: protegida
router.delete('/:id', verifyToken, async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  res.json({ message: 'Tarea eliminada' });
});

module.exports = router;