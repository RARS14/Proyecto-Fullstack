const express = require('express');
const Task = require('../models/Task');
const verifyToken = require('../middleware/authmiddleware');
const { validateTask, validateId, validateQuery } = require('../middleware/validate');
const router = express.Router();

// READ: abierta, con filtro y paginación opcionales
router.get('/', validateQuery, async (req, res) => {
  const { page, limit, completed } = req.query;
  const filter = {};
  if (completed !== undefined) filter.completed = completed === 'true';

  if (page === undefined && limit === undefined) {
    return res.json(await Task.find(filter));
  }

  const p = Number(page) || 1;
  const l = Number(limit) || 10;
  const total = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .skip((p - 1) * l)
    .limit(l);

  res.json({ page: p, limit: l, total, totalPages: Math.ceil(total / l), data: tasks });
});
// CREATE: protegida y validada
router.post('/', verifyToken, validateTask, async (req, res) => {
  const task = await Task.create({ title: req.body.title });
  res.status(201).json(task);
});

// UPDATE: protegida
router.put('/:id', verifyToken, validateId, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  res.json(task);
});

// DELETE: protegida
router.delete('/:id', verifyToken, validateId, async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  res.json({ message: 'Tarea eliminada' });
});

module.exports = router;