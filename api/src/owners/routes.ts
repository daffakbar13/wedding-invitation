import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { MongoServerError, ObjectId } from 'mongodb';
import { publicAccount } from '../auth/routes.ts';
import type { Account, Collections, Invitation } from '../db.ts';
import { HttpError, body, notFound, parseId, str } from '../http.ts';
import { DEFAULT_THEME, newInvitation } from '../invitations/settings.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const THEME = /^[a-z0-9-]{1,40}$/;

function theme(b: Record<string, unknown>): string | undefined {
  const t = str(b, 'theme');
  if (t !== undefined && !THEME.test(t)) throw new HttpError(400, 'theme must be a theme id like "garden-arch".');
  return t;
}

async function passwordHash(b: Record<string, unknown>): Promise<string | undefined> {
  if (b.password === undefined || b.password === null || b.password === '') return undefined;
  if (typeof b.password !== 'string' || b.password.length < 8) throw new HttpError(400, 'password must be at least 8 characters.');
  return bcrypt.hash(b.password, 10);
}

// Platform admin only (guarded where mounted). Owners are the only way an account
// gets created; each owner gets exactly one invitation.
export function ownerRoutes(db: Collections): Router {
  const router = Router();

  const ownerView = (owner: Account, inv: Pick<Invitation, '_id' | 'theme'> | null | undefined) => ({
    ...publicAccount(owner),
    invitationId: inv?._id.toHexString() ?? null,
    theme: inv?.theme ?? null,
    createdAt: owner.createdAt.toISOString(),
  });

  async function view(owner: Account) {
    return ownerView(owner, await db.invitations.findOne({ ownerId: owner._id }, { projection: { theme: 1 } }));
  }

  router.get('/', async (_req, res) => {
    const owners = await db.accounts.find({ role: 'owner' }).sort({ createdAt: -1 }).toArray();
    const invitations = await db.invitations
      .find({ ownerId: { $in: owners.map((o) => o._id) } }, { projection: { ownerId: 1, theme: 1 } })
      .toArray();
    const byOwner = new Map(invitations.map((i) => [i.ownerId.toHexString(), i]));
    res.json(owners.map((o) => ownerView(o, byOwner.get(o._id.toHexString()))));
  });

  // A password is optional: an owner without one signs in with Google only.
  router.post('/', async (req, res) => {
    const b = body(req);
    const email = str(b, 'email', { required: true, max: 254 })!.toLowerCase();
    if (!EMAIL.test(email)) throw new HttpError(400, 'email is not a valid email address.');
    const owner: Account = {
      _id: new ObjectId(),
      role: 'owner',
      name: str(b, 'name', { required: true, max: 120 })!,
      email,
      active: true,
      createdAt: new Date(),
    };
    const hash = await passwordHash(b);
    if (hash) owner.passwordHash = hash;

    try {
      await db.accounts.insertOne(owner);
    } catch (err) {
      if (err instanceof MongoServerError && err.code === 11000) throw new HttpError(409, `An account with ${email} already exists.`);
      throw err;
    }
    await db.invitations.insertOne({ _id: new ObjectId(), ...newInvitation(owner._id, theme(b) ?? DEFAULT_THEME) });
    res.status(201).json(await view(owner));
  });

  // Rename, disable/enable, reset password or assign a theme.
  router.patch('/:id', async (req, res) => {
    const b = body(req);
    const id = parseId(req.params.id, 'Owner');
    const set: Partial<Account> = {};
    const name = str(b, 'name', { required: 'name' in b, max: 120 });
    if (name !== undefined) set.name = name;
    if (b.active !== undefined) {
      if (typeof b.active !== 'boolean') throw new HttpError(400, 'active must be true or false.');
      set.active = b.active;
    }
    const hash = await passwordHash(b);
    if (hash) set.passwordHash = hash;
    const t = theme(b);

    const owner = await db.accounts.findOneAndUpdate({ _id: id, role: 'owner' }, { $set: set }, { returnDocument: 'after' });
    if (!owner) throw notFound('Owner not found');
    if (t) await db.invitations.updateOne({ ownerId: owner._id }, { $set: { theme: t, updatedAt: new Date() } });
    res.json(await view(owner));
  });

  return router;
}
