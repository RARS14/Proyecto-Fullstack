const { validateTask, validateRegister, validateId, validateQuery } = require('../middleware/validate');
const adminOnly = require('../middleware/adminOnly');
const { errorHandler } = require('../middleware/errorhandler');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

describe('validateTask', () => {
  test('rechaza tarea sin título', () => {
    const res = mockRes(); const next = jest.fn();
    validateTask({ body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
  test('acepta tarea con título', () => {
    const res = mockRes(); const next = jest.fn();
    validateTask({ body: { title: 'test' } }, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateRegister', () => {
  test('rechaza contraseña corta', () => {
    const res = mockRes(); const next = jest.fn();
    validateRegister({ body: { username: 'a', password: '123' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('validateId', () => {
  test('rechaza ID inválido', () => {
    const res = mockRes(); const next = jest.fn();
    validateId({ params: { id: 'abc' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('acepta ID válido', () => {
    const res = mockRes(); const next = jest.fn();
    validateId({ params: { id: '507f1f77bcf86cd799439011' } }, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateQuery', () => {
  test('rechaza page inválido', () => {
    const res = mockRes(); const next = jest.fn();
    validateQuery({ query: { page: 'abc' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('rechaza limit mayor a 50', () => {
    const res = mockRes(); const next = jest.fn();
    validateQuery({ query: { limit: '100' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('acepta parámetros válidos', () => {
    const res = mockRes(); const next = jest.fn();
    validateQuery({ query: { page: '1', limit: '5', completed: 'false' } }, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('adminOnly', () => {
  test('bloquea a usuario normal con 403', () => {
    const res = mockRes(); const next = jest.fn();
    adminOnly({ userRole: 'user' }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
  test('deja pasar al admin', () => {
    const res = mockRes(); const next = jest.fn();
    adminOnly({ userRole: 'admin' }, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('errorHandler', () => {
  test('usuario duplicado responde 400', () => {
    const res = mockRes();
    errorHandler({ code: 11000 }, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });
  test('error desconocido responde 500', () => {
    const res = mockRes();
    errorHandler(new Error('x'), {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
  });
});