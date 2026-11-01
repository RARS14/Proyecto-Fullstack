const validateTask = (req, res, next) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ message: 'El título es obligatorio' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
  }
  next();
};

const validateRegister = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }
  next();
};

module.exports = { validateTask, validateLogin, validateRegister };