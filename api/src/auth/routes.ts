import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { Config } from '../config.ts';
import type { Account, Collections } from '../db.ts';
import { HttpError, body, str } from '../http.ts';
import type { GoogleVerifier } from './google.ts';
import { currentAccount, requireAuth, signSession } from './session.ts';

const WRONG_CREDENTIALS = 'Email or password is incorrect.';
const DISABLED = 'This account has been disabled. Contact the platform admin.';

// Compared against when the email is unknown, so both cases take the same time.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export function authRoutes(db: Collections, config: Config, verifyGoogle: GoogleVerifier): Router {
  const router = Router();

  async function session(account: Account) {
    const invitation = account.role === 'owner'
      ? await db.invitations.findOne({ ownerId: account._id }, { projection: { _id: 1 } })
      : null;
    return {
      token: signSession(account, config),
      account: publicAccount(account),
      invitationId: invitation?._id.toHexString() ?? null,
    };
  }

  router.post('/login', async (req, res) => {
    const b = body(req);
    const email = str(b, 'email', { required: true })!.toLowerCase();
    const password = typeof b.password === 'string' ? b.password : '';

    const account = await db.accounts.findOne({ email });
    const ok = await bcrypt.compare(password, account?.passwordHash ?? DUMMY_HASH);
    if (!account || !account.passwordHash || !ok) throw new HttpError(401, WRONG_CREDENTIALS);
    if (!account.active) throw new HttpError(403, DISABLED);
    res.json(await session(account));
  });

  router.post('/google', async (req, res) => {
    const idToken = str(body(req), 'idToken', { required: true })!;
    if (!config.googleClientId) throw new HttpError(503, 'Google sign-in is not configured.');

    const email = await verifyGoogle(idToken);
    if (!email) throw new HttpError(401, 'Google sign-in failed. Please try again.');
    const account = await db.accounts.findOne({ email });
    if (!account) {
      throw new HttpError(403, `The Google account ${email} is not registered. Ask the platform admin to add you first.`);
    }
    if (!account.active) throw new HttpError(403, DISABLED);
    res.json(await session(account));
  });

  router.get('/me', requireAuth(db, config), async (_req, res) => {
    const { token: _token, ...rest } = await session(currentAccount(res));
    res.json(rest);
  });

  return router;
}

export function publicAccount(a: Account) {
  return { id: a._id.toHexString(), role: a.role, name: a.name, email: a.email, active: a.active };
}
