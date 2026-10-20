import type { ObjectId } from 'mongodb';
import { LANGS, type Invitation, type InvitationTexts, type Lang } from '../db.ts';
import { HttpError, str } from '../http.ts';

// Texts the owner writes in both languages (same keys as the WEDDIN-4 editor).
// Theme labels such as "Open Invitation" belong to the theme, not to these settings.
export const TEXT_FIELDS: { key: string; label: string; max: number }[] = [
  { key: 'invitedLine', label: 'Envelope line', max: 200 },
  { key: 'greetTitle', label: 'Greeting title', max: 120 },
  { key: 'greetBody', label: 'Greeting', max: 1000 },
  { key: 'quote', label: 'Quote', max: 1000 },
  { key: 'thanksBody', label: 'Thank-you message', max: 1000 },
  { key: 'venueAddr', label: 'Venue address', max: 300 },
];

const LANG_NAME: Record<Lang, string> = { en: 'English', id: 'Indonesian' };
const HEX = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_THEME = 'garden-arch';

export function newInvitation(ownerId: ObjectId, theme: string): Omit<Invitation, '_id'> {
  const empty = Object.fromEntries(TEXT_FIELDS.map((f) => [f.key, '']));
  return {
    ownerId,
    theme,
    defaultLang: 'en',
    outerColor: '#FFFFFF',
    colors: { primary: '#8A6D3B', accent: '#C9A86A' },
    groomName: '',
    brideName: '',
    weddingAt: null,
    venueName: '',
    mapUrl: '',
    texts: { en: { ...empty }, id: { ...empty } },
    updatedAt: new Date(),
  };
}

type Editable = Pick<Invitation,
  'defaultLang' | 'outerColor' | 'colors' | 'groomName' | 'brideName' | 'weddingAt' | 'venueName' | 'mapUrl' | 'texts'>;

// Validates a full settings save from the owner editor. Every text is required in
// both languages; when any is missing nothing is saved and the error names them.
export function parseSettings(b: Record<string, unknown>): Editable {
  const defaultLang = b.defaultLang;
  if (!LANGS.includes(defaultLang as Lang)) throw new HttpError(400, 'defaultLang must be "en" or "id".');

  const color = (value: unknown, key: string) => {
    if (typeof value !== 'string' || !HEX.test(value)) throw new HttpError(400, `${key} must be a colour like #FFFFFF.`);
    return value.toUpperCase();
  };
  const colors = (b.colors ?? {}) as Record<string, unknown>;

  let weddingAt: Date | null = null;
  if (b.weddingAt !== undefined && b.weddingAt !== null && b.weddingAt !== '') {
    weddingAt = new Date(String(b.weddingAt));
    if (Number.isNaN(weddingAt.getTime())) throw new HttpError(400, 'weddingAt must be a date and time.');
  }

  const mapUrl = str(b, 'mapUrl', { max: 500 }) ?? '';
  if (mapUrl && !/^https:\/\//.test(mapUrl)) throw new HttpError(400, 'mapUrl must start with https://.');

  return {
    defaultLang: defaultLang as Lang,
    outerColor: color(b.outerColor, 'outerColor'),
    colors: { primary: color(colors.primary, 'colors.primary'), accent: color(colors.accent, 'colors.accent') },
    groomName: str(b, 'groomName', { required: true, max: 120 })!,
    brideName: str(b, 'brideName', { required: true, max: 120 })!,
    weddingAt,
    venueName: str(b, 'venueName', { max: 200 }) ?? '',
    mapUrl,
    texts: parseTexts(b.texts),
  };
}

function parseTexts(value: unknown): Record<Lang, InvitationTexts> {
  const input = (value && typeof value === 'object' ? value : {}) as Record<string, Record<string, unknown> | undefined>;
  const texts = { en: {}, id: {} } as Record<Lang, InvitationTexts>;
  const missing: { lang: Lang; field: string }[] = [];

  for (const lang of LANGS) {
    for (const f of TEXT_FIELDS) {
      const raw = input[lang]?.[f.key];
      const text = typeof raw === 'string' ? raw.trim() : '';
      if (!text) missing.push({ lang, field: f.key });
      else if (text.length > f.max) throw new HttpError(400, `${f.label} (${LANG_NAME[lang]}) must be at most ${f.max} characters.`);
      texts[lang][f.key] = text;
    }
  }

  if (missing.length) {
    const label = (key: string) => TEXT_FIELDS.find((f) => f.key === key)!.label;
    const message = LANGS
      .map((lang) => {
        const fields = missing.filter((m) => m.lang === lang).map((m) => label(m.field));
        return fields.length ? `Missing in ${LANG_NAME[lang]}: ${fields.join(', ')}.` : '';
      })
      .filter(Boolean)
      .join(' ');
    throw new HttpError(400, message, { missing });
  }
  return texts;
}

// What the editor and the public invitation see; no owner id.
export function invitationView(inv: Invitation) {
  return {
    id: inv._id.toHexString(),
    theme: inv.theme,
    defaultLang: inv.defaultLang,
    outerColor: inv.outerColor,
    colors: inv.colors,
    groomName: inv.groomName,
    brideName: inv.brideName,
    weddingAt: inv.weddingAt?.toISOString() ?? null,
    venueName: inv.venueName,
    mapUrl: inv.mapUrl,
    texts: inv.texts,
    updatedAt: inv.updatedAt.toISOString(),
  };
}
