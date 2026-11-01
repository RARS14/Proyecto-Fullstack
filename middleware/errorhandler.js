const notFound = (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El JSON enviado no es válido' });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'El usuario ya existe' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID inválido' });
  }
  res.status(500).json({ message: 'Error interno del servidor' });
};

module.exports = { notFound, errorHandler };