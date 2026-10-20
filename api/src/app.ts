import express, { type Express } from 'express';
import { attendeeRoutes } from './attendees/routes.ts';
import type { GoogleVerifier } from './auth/google.ts';
import { authRoutes } from './auth/routes.ts';
import { requireAuth, requireRole } from './auth/session.ts';
import type { Config } from './config.ts';
import type { Collections } from './db.ts';
import { errorHandler, unknownRoute } from './http.ts';
import { invitationRoutes } from './invitations/routes.ts';
import { ownerRoutes } from './owners/routes.ts';
import { publicRoutes } from './public/routes.ts';

export function createApp(db: Collections, config: Config, verifyGoogle: GoogleVerifier): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '100kb' }));

  // The FE (Vercel) and admin screens call from another origin; only listed origins.
  app.use((req, res, next) => {
    const origin = req.get('origin');
    if (origin && config.corsOrigins.includes(origin)) {
      res.set({
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE',
        Vary: 'Origin',
      });
    }
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  const signedIn = requireAuth(db, config);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api/auth', authRoutes(db, config, verifyGoogle));
  app.use('/api/public', publicRoutes(db));
  app.use('/api/owners', signedIn, requireRole('admin'), ownerRoutes(db));
  app.use('/api/invitations/:invitationId/attendees', signedIn, attendeeRoutes(db));
  app.use('/api/invitations', signedIn, invitationRoutes(db));

  app.use(unknownRoute);
  app.use(errorHandler);
  return app;
}
