import type { RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import type { Account, Collections, Role } from '../db.ts';
import { HttpError, forbidden } from '../http.ts';

type SessionConfig = { jwtSecret: string; jwtExpiresIn: string };

export function signSession(account: Account, config: SessionConfig): string {
  return jwt.sign({ role: account.role }, config.jwtSecret, {
    subject: account._id.toHexString(),
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

const unauthorized = () => new HttpError(401, 'Please sign in.');

// Reads `Authorization: Bearer <token>` and loads the account on every request, so a
// disabled account loses access straight away instead of when its token expires.
export function requireAuth(db: Collections, config: SessionConfig): RequestHandler {
  return async (req, res, next) => {
    const header = req.get('authorization') ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw unauthorized();

    let sub: string | undefined;
    try {
      const claims = jwt.verify(token, config.jwtSecret);
      sub = typeof claims === 'string' ? undefined : claims.sub;
    } catch {
      throw unauthorized();
    }
    if (!sub || !ObjectId.isValid(sub)) throw unauthorized();

    const account = await db.accounts.findOne({ _id: new ObjectId(sub) });
    if (!account || !account.active) throw unauthorized();
    res.locals.account = account;
    next();
  };
}

export function requireRole(role: Role): RequestHandler {
  return (_req, res, next) => {
    if (currentAccount(res).role !== role) throw forbidden();
    next();
  };
}

export function currentAccount(res: Response): Account {
  return res.locals.account as Account;
}
