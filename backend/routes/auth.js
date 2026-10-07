import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { requireAuth } from '../middleware/requireAuth.js';
import User from '../models/User.js';
import { validateCredentials, validateRegistration } from '../utils/credentials.js';

const router = Router();
const dummyHash = bcrypt.hashSync('dummy-password-for-timing', 12);
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email });
const makeToken = (user) => jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '1d', algorithm: 'HS256', issuer: 'michipedia', audience: 'michipedia-app' });

router.post('/register', async (req, res, next) => {
  try {
    const validated = validateRegistration(req.body);
    if (validated.error) return res.status(400).json({ message: validated.error });
    const user = await User.create(validated.value);
    return res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const validated = validateCredentials(req.body);
    if (validated.error) return res.status(400).json({ message: validated.error });
    const { email, password } = validated.value;
    const user = await User.findOne({ email }).select('+password');
    const matches = await bcrypt.compare(password, user?.password || dummyHash);
    if (!user || !matches) return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    return res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (error) { return next(error); }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
