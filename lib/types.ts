// Shapes shared by the core, the sample data and every theme.
// They mirror what the API (WEDDIN-3) will return, so swapping the sample
// data for API calls does not touch the themes.

export const LANGS = ['en', 'id'] as const;
export type Lang = (typeof LANGS)[number];

/** A text in every supported language. */
export type Localized = Record<Lang, string>;

/** Settings an admin can change per invitation (WEDDIN-4 will edit these). */
export interface InvitationSettings {
  /** Id of a theme in themes/registry.ts. */
  theme: string;
  defaultLang: Lang;
  /** Colour around the mobile-width column on wide screens. */
  outsideColor: string;
}

export interface Person {
  fullName: string;
  /** Short name used in script headings, e.g. "Daffa". */
  shortName: string;
}

export interface InvitationEvent {
  title: Localized;
  /** ISO date-time with offset, e.g. 2027-02-13T08:00:00+07:00. */
  start: string;
  end: string;
}

export interface Invitation {
  id: string;
  settings: InvitationSettings;
  groom: Person;
  bride: Person;
  /** IANA time zone the dates are shown in. */
  timeZone: string;
  /** Short zone label shown after times, e.g. "WIB". */
  timeZoneLabel: string;
  events: InvitationEvent[];
  venue: { name: string; address: Localized };
  /** Couple-written texts; a theme falls back to its own wording when one is missing. */
  texts: Partial<Record<'quote' | 'greetTitle' | 'greetBody' | 'thanksBody', Localized>>;
  /** Photo URLs; a theme shows its own placeholder when one is missing. */
  photos: { cover?: string; hero?: string; groom?: string; bride?: string; gallery: string[] };
}

/** One attendee; the token in their link is the only way to open the invitation. */
export interface Guest {
  token: string;
  invitationId: string;
  name: string;
}
