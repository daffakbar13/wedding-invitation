import { Router } from 'express';
import type { Collections } from '../db.ts';
import { notFound } from '../http.ts';
import { invitationView } from '../invitations/settings.ts';

const TOKEN = /^[A-Za-z0-9_-]{8,64}$/;
const NOT_FOUND = 'Invitation not found';

// No sign-in: the unguessable attendee token is the only key. Unknown tokens,
// and invitations of disabled owners, are the same not-found.
export function publicRoutes(db: Collections): Router {
  const router = Router();

  router.get('/invitations/:token', async (req, res) => {
    const token = req.params.token;
    if (!TOKEN.test(token)) throw notFound(NOT_FOUND);

    const attendee = await db.attendees.findOne({ token });
    if (!attendee) throw notFound(NOT_FOUND);
    const invitation = await db.invitations.findOne({ _id: attendee.invitationId });
    if (!invitation) throw notFound(NOT_FOUND);
    const owner = await db.accounts.findOne({ _id: invitation.ownerId }, { projection: { active: 1 } });
    if (!owner?.active) throw notFound(NOT_FOUND);

    const { id: _id, updatedAt: _updatedAt, ...settings } = invitationView(invitation);
    res.set('Cache-Control', 'no-store');
    res.json({ invitation: settings, attendee: { name: attendee.name } });
  });

  return router;
}
