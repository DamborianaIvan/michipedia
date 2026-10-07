import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return res.status(401).json({ message: 'Iniciá sesión para continuar.' });
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).select('_id name email');
    if (!user) return res.status(401).json({ message: 'La sesión ya no es válida.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'La sesión ya no es válida.' });
  }
}
