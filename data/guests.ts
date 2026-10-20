import type { Guest } from '../lib/types.ts';

// Sample attendees. Tokens are 128-bit random values (base64url), so a link cannot be guessed:
//   node -e "console.log(require('crypto').randomBytes(16).toString('base64url'))"
export const guests: Guest[] = [
  { token: 'zrOXKCOCTHII0277hRFFQA', invitationId: 'daffa-alvina', name: 'Budi Santoso' },
  { token: 'KP5owT2PovDkX2NuMlRGLg', invitationId: 'daffa-alvina', name: 'Rina Kartika' },
  { token: 'V5Yb0okD_4OKHyAfwhUnBQ', invitationId: 'daffa-alvina', name: 'Andi Pratama' },
];
