const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateLogin, validateRegister } = require('../middleware/validate');

const router = express.Router();

// REGISTRO: validado, con la contraseña encriptada
router.post('/register', validateRegister, async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, password: hashedPassword });
  res.status(201).json({ message: 'Usuario creado', id: user._id });
});

// LOGIN: validado, entrega el token
router.post('/login', validateLogin, async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  }
  const passwordOk = await bcrypt.compare(password, user.password);
  if (!passwordOk) {
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});
const authMiddleware = require('../middleware/authmiddleware');
const adminOnly = require('../middleware/adminOnly');

// Lista de usuarios: solo admin
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});
module.exports = router;