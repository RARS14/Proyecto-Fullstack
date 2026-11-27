const mongoose = require('mongoose');

const validateTask = (req, res, next) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ message: 'El título es obligatorio' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
  }
  next();
};

const validateRegister = (req, res, next) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }
  next();
};

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID inválido' });
  }
  next();
};

const validateQuery = (req, res, next) => {
  const { page, limit, completed } = req.query;
  if (page !== undefined && (!Number.isInteger(Number(page)) || Number(page) < 1)) {
    return res.status(400).json({ message: 'page debe ser un entero mayor a 0' });
  }
  if (limit !== undefined && (!Number.isInteger(Number(limit)) || Number(limit) < 1 || Number(limit) > 50)) {
    return res.status(400).json({ message: 'limit debe ser un entero entre 1 y 50' });
  }
  if (completed !== undefined && completed !== 'true' && completed !== 'false') {
    return res.status(400).json({ message: 'completed debe ser true o false' });
  }
  next();
};

module.exports = { validateTask, validateLogin, validateRegister, validateId, validateQuery };