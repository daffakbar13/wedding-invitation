import { OAuth2Client } from 'google-auth-library';

// Returns the verified email of a Google ID token (from Google Identity Services
// on the admin screens), or null when the token is invalid or the email unverified.
export type GoogleVerifier = (idToken: string) => Promise<string | null>;

export function googleVerifier(clientId: string | undefined): GoogleVerifier {
  const client = new OAuth2Client();
  return async (idToken) => {
    if (!clientId) return null;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      const payload = ticket.getPayload();
      if (!payload?.email || !payload.email_verified) return null;
      return payload.email.toLowerCase();
    } catch {
      return null;
    }
  };
}
