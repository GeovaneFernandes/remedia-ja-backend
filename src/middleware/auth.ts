import { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../lib/jwt';

export interface AuthedRequest extends Request {
  auth?: { userId: string; role: 'CAREGIVER' | 'ADMIN' };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente.' });
  }
  try {
    const payload = verifyAuthToken(header.slice('Bearer '.length));
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

export function requireRole(role: 'CAREGIVER' | 'ADMIN') {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (req.auth?.role !== role) {
      return res.status(403).json({ error: 'Sem permissão para este recurso.' });
    }
    next();
  };
}
