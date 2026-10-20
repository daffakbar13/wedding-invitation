import { guests } from '../data/guests.ts';
import { invitations } from '../data/invitations.ts';
import type { Guest, Invitation } from './types.ts';

export interface GuestInvitation {
  guest: Guest;
  invitation: Invitation;
}

/**
 * Finds the attendee and their invitation for a link token, or null for an unknown
 * or altered token. Reads the sample data for now; WEDDIN-3 replaces this with an API call.
 */
export async function findByToken(token: string): Promise<GuestInvitation | null> {
  const guest = guests.find((g) => g.token === token);
  if (!guest) return null;
  const invitation = invitations.find((i) => i.id === guest.invitationId);
  return invitation ? { guest, invitation } : null;
}
