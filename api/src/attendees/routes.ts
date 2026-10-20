import { randomBytes } from 'node:crypto';
import { Router, type Request, type Response } from 'express';
import { MongoServerError } from 'mongodb';
import type { Attendee, Collections } from '../db.ts';
import { body, notFound, parseId, str } from '../http.ts';
import { loadOwnInvitation } from '../invitations/routes.ts';

// 128 random bits, URL-safe: the attendee's personal link cannot be guessed or
// derived from their name or id.
export function newAttendeeToken(): string {
  return randomBytes(16).toString('base64url');
}

export function attendeeView(a: Attendee) {
  return { id: a._id.toHexString(), name: a.name, group: a.group, phone: a.phone, token: a.token, createdAt: a.createdAt.toISOString() };
}

function fields(b: Record<string, unknown>, partial: boolean) {
  return {
    name: str(b, 'name', { required: !partial || 'name' in b, max: 120 }),
    group: str(b, 'group', { max: 80 }),
    phone: str(b, 'phone', { max: 30 }),
  };
}

// Mounted under /api/invitations/:invitationId/attendees
export function attendeeRoutes(db: Collections): Router {
  const router = Router({ mergeParams: true });
  // :invitationId comes from the parent path, which Express's types cannot see.
  const own = (req: Request, res: Response) =>
    loadOwnInvitation(db, res, (req.params as Record<string, string | undefined>).invitationId);

  router.get('/', async (req, res) => {
    const invitation = await own(req, res);
    const list = await db.attendees.find({ invitationId: invitation._id }).sort({ name: 1 }).toArray();
    res.json(list.map(attendeeView));
  });

  router.post('/', async (req, res) => {
    const invitation = await own(req, res);
    const f = fields(body(req), false);
    const doc = { invitationId: invitation._id, name: f.name!, group: f.group ?? '', phone: f.phone ?? '', createdAt: new Date() };

    // The unique index on token is the guarantee; a collision is retried, not trusted away.
    for (let attempt = 0; ; attempt++) {
      try {
        const token = newAttendeeToken();
        const { insertedId } = await db.attendees.insertOne({ ...doc, token } as Attendee);
        res.status(201).json(attendeeView({ ...doc, token, _id: insertedId }));
        return;
      } catch (err) {
        if (!(err instanceof MongoServerError && err.code === 11000) || attempt >= 2) throw err;
      }
    }
  });

  router.patch('/:attendeeId', async (req, res) => {
    const invitation = await own(req, res);
    const f = fields(body(req), true);
    const set = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== undefined));
    const updated = await db.attendees.findOneAndUpdate(
      { _id: parseId(req.params.attendeeId, 'Attendee'), invitationId: invitation._id },
      { $set: set },
      { returnDocument: 'after' },
    );
    if (!updated) throw notFound('Attendee not found');
    res.json(attendeeView(updated));
  });

  router.delete('/:attendeeId', async (req, res) => {
    const invitation = await own(req, res);
    const { deletedCount } = await db.attendees.deleteOne({ _id: parseId(req.params.attendeeId, 'Attendee'), invitationId: invitation._id });
    if (!deletedCount) throw notFound('Attendee not found');
    res.status(204).end();
  });

  return router;
}
