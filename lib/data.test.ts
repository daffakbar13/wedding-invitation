import assert from 'node:assert/strict';
import { test } from 'node:test';
import { guests } from '../data/guests.ts';
import { findByToken } from './data.ts';

test('a sample attendee token finds the attendee and the couple', async () => {
  const found = await findByToken(guests[0].token);
  assert.ok(found);
  assert.equal(found.guest.name, 'Budi Santoso');
  assert.equal(found.invitation.groom.fullName, 'Muhammad Daffa Raihan Akbar');
  assert.equal(found.invitation.bride.fullName, 'Alvina Damayanti');
});

test('an unknown or altered token finds nothing', async () => {
  const token = guests[0].token;
  assert.equal(await findByToken('unknown'), null);
  assert.equal(await findByToken(token.slice(0, -1)), null);
  assert.equal(await findByToken(`${token}x`), null);
  assert.equal(await findByToken(token.toLowerCase()), null);
});

test('attendee tokens are long and unique', () => {
  const tokens = guests.map((g) => g.token);
  assert.equal(new Set(tokens).size, tokens.length);
  tokens.forEach((t) => assert.match(t, /^[A-Za-z0-9_-]{22,}$/));
});
