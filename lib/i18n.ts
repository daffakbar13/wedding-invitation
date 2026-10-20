import { LANGS, type Lang, type Localized } from './types.ts';

export type Dictionary = Record<string, string>;

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/** Builds t(key, vars) for one language; {name} placeholders are filled from vars. */
export function translator(dict: Record<Lang, Dictionary>, lang: Lang) {
  return (key: string, vars: Record<string, string | number> = {}) => {
    const text = dict[lang][key] ?? dict.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
  };
}

/** Keys present in one language but not in another; empty when the dictionary is complete. */
export function missingKeys(dict: Record<Lang, Dictionary>): string[] {
  const all = new Set(LANGS.flatMap((l) => Object.keys(dict[l])));
  return [...all].flatMap((key) => LANGS.filter((l) => !(key in dict[l])).map((l) => `${l}.${key}`));
}

export function pick(text: Localized, lang: Lang): string {
  return text[lang];
}

const LOCALES: Record<Lang, string> = { en: 'en-GB', id: 'id-ID' };

/** "Saturday, 13 February 2027" / "Sabtu, 13 Februari 2027". */
export function formatDayLong(iso: string, lang: Lang, timeZone: string): string {
  const parts = new Intl.DateTimeFormat(LOCALES[lang], {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')}`;
}

/** "08.00" in the invitation's time zone (same in both languages). */
export function formatTime(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('hour')}.${get('minute')}`;
}

/** "13 · 02 · 2027". */
export function formatDateShort(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone,
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('day')} · ${get('month')} · ${get('year')}`;
}
