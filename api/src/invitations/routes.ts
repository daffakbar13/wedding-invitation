import { Router, type Response } from 'express';
import { currentAccount } from '../auth/session.ts';
import type { Collections, Invitation } from '../db.ts';
import { body, forbidden, notFound, parseId } from '../http.ts';
import { invitationView, parseSettings } from './settings.ts';

// Loads an invitation the signed-in account may manage: the platform admin may
// manage any, an owner only their own.
export async function loadOwnInvitation(db: Collections, res: Response, rawId: unknown): Promise<Invitation> {
  const id = parseId(rawId, 'Invitation');
  const invitation = await db.invitations.findOne({ _id: id });
  if (!invitation) throw notFound('Invitation not found');
  const account = currentAccount(res);
  if (account.role !== 'admin' && !invitation.ownerId.equals(account._id)) throw forbidden();
  return invitation;
}

export function invitationRoutes(db: Collections): Router {
  const router = Router();

  router.get('/:id', async (req, res) => {
    res.json(invitationView(await loadOwnInvitation(db, res, req.params.id)));
  });

  // Full save from the owner editor. The theme is assigned by the platform admin
  // (PATCH /api/owners/:id), so it is not editable here.
  router.put('/:id', async (req, res) => {
    const invitation = await loadOwnInvitation(db, res, req.params.id);
    const settings = parseSettings(body(req));
    const updated = await db.invitations.findOneAndUpdate(
      { _id: invitation._id },
      { $set: { ...settings, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (!updated) throw notFound('Invitation not found');
    res.json(invitationView(updated));
  });

  return router;
}
