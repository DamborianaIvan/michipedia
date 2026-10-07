import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-only-secret-not-used-in-production-12345';
const { app } = await import('../server.js');
const { default: User } = await import('../models/User.js');

// HTTP and real model hashing/JWT, with a fake database to avoid production data.
test('registro → login → perfil; protege hash, contraseña y claims JWT', async t => {
  let saved;
  t.mock.method(User, 'create', async data => {
    if (saved) { const error = new Error('duplicate'); error.code = 11000; throw error; }
    saved = new User(data);
    await new Promise((resolve, reject) => User.schema.s.hooks.execPre('save', saved, [], error => error ? reject(error) : resolve()));
    return saved;
  });
  t.mock.method(User, 'findOne', ({ email }) => ({ select: async () => saved?.email === email ? saved : null }));
  t.mock.method(User, 'findById', id => ({ select: async () => saved?.id === id ? saved : null }));
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/auth`;
  const account = { name: 'Ana', email: 'ana@example.com', password: 'UnaClaveLarga123' };
  const post = (path, body) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const me = token => fetch(base + '/me', { headers: { Authorization: `Bearer ${token}` } });
  try {
    const registered = await post('/register', account); assert.equal(registered.status, 201);
    const session = await registered.json();
    assert.equal(session.user.password, undefined); assert.equal(session.user.name, account.name);
    assert.notEqual(saved.password, account.password); assert.ok(await bcrypt.compare(account.password, saved.password));
    assert.equal((await post('/register', account)).status, 409);
    const login = await post('/login', account); assert.equal(login.status, 200);
    assert.equal((await me((await login.json()).token)).status, 200);
    assert.equal((await post('/login', { ...account, password: 'Incorrecta123' })).status, 401);
    assert.equal((await post('/login', { ...account, email: 'unknown@example.com' })).status, 401);
    for (const options of [ { audience: 'other', expiresIn: '1d' }, { audience: 'michipedia-app', expiresIn: -1 }, { audience: 'michipedia-app', expiresIn: '1d', algorithm: 'HS384' } ]) {
      const token = jwt.sign({ sub: saved.id }, process.env.JWT_SECRET, { issuer: 'michipedia', ...options });
      assert.equal((await me(token)).status, 401);
    }
    t.mock.method(User, 'findOne', () => { throw new Error('SECRET DATABASE URI'); });
    const failure = await post('/login', account); assert.equal(failure.status, 500);
    assert.ok(!(await failure.text()).includes('SECRET'));
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
