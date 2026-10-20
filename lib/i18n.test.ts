import assert from 'node:assert/strict';
import { test } from 'node:test';
import { texts as gardenArchTexts } from '../themes/garden-arch/texts.ts';
import { invitations } from '../data/invitations.ts';
import { coreTexts } from './core-texts.ts';
import { formatDateShort, formatDayLong, formatTime, missingKeys, translator } from './i18n.ts';
import { LANGS } from './types.ts';

test('core and theme texts exist in every language', () => {
  assert.deepEqual(missingKeys(coreTexts), []);
  assert.deepEqual(missingKeys(gardenArchTexts), []);
});

test('every localized text in the sample invitations has every language', () => {
  invitations.forEach((inv) => {
    const localized = [
      inv.venue.address,
      ...inv.events.map((e) => e.title),
      ...Object.values(inv.texts),
    ];
    localized.forEach((text) => LANGS.forEach((l) => assert.ok(text?.[l], `${inv.id}: missing ${l}`)));
  });
});

test('translator fills placeholders and differs per language', () => {
  const en = translator(gardenArchTexts, 'en');
  const id = translator(gardenArchTexts, 'id');
  assert.equal(en('photoOf', { n: 2, t: 6 }), 'Photo 2 of 6');
  assert.equal(id('photoOf', { n: 2, t: 6 }), 'Foto 2 dari 6');
  assert.equal(en('open'), 'Open Invitation');
  assert.equal(id('open'), 'Buka Undangan');
});

test('dates show in the invitation time zone and language', () => {
  const iso = '2027-02-13T08:00:00+07:00';
  assert.equal(formatDayLong(iso, 'en', 'Asia/Jakarta'), 'Saturday, 13 February 2027');
  assert.equal(formatDayLong(iso, 'id', 'Asia/Jakarta'), 'Sabtu, 13 Februari 2027');
  assert.equal(formatTime(iso, 'Asia/Jakarta'), '08.00');
  assert.equal(formatDateShort(iso, 'Asia/Jakarta'), '13 · 02 · 2027');
});
