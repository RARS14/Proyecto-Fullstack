const express = require('express');
const router = express.Router();

async function getRate() {
  const r = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!r.ok) throw new Error('La API externa respondió con error');
  const data = await r.json();
  if (data.result !== 'success' || typeof data.rates?.MXN !== 'number') {
    throw new Error('Respuesta inválida de la API externa');
  }
  return { mxn: data.rates.MXN, updated: data.time_last_update_utc };
}

// Tipo de cambio actual USD -> MXN
router.get('/', async (req, res) => {
  try {
    const { mxn, updated } = await getRate();
    res.json({ base: 'USD', target: 'MXN', rate: mxn, updated, source: 'exchangerate-api.com' });
  } catch (err) {
    res.status(502).json({ message: 'No se pudo obtener el tipo de cambio' });
  }
});

// Conversión: /api/rates/convert?amount=100
router.get('/convert', async (req, res) => {
  const amount = Number(req.query.amount);
  if (!req.query.amount || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'amount debe ser un número mayor a 0' });
  }
  try {
    const { mxn } = await getRate();
    res.json({ usd: amount, mxn: Number((amount * mxn).toFixed(2)), rate: mxn });
  } catch (err) {
    res.status(502).json({ message: 'No se pudo obtener el tipo de cambio' });
  }
});

module.exports = router;