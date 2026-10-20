import { MongoClient, type Collection, type Db, type ObjectId } from 'mongodb';

export type Lang = 'en' | 'id';
export const LANGS: Lang[] = ['en', 'id'];

export type Role = 'admin' | 'owner';

// One collection for everyone who can sign in. Accounts are only created by the
// platform admin (or the seed script); there is no self sign-up.
export type Account = {
  _id: ObjectId;
  role: Role;
  name: string;
  email: string; // lower-case, unique
  passwordHash?: string; // absent for Google-only accounts
  active: boolean;
  createdAt: Date;
};

export type InvitationTexts = Record<string, string>;

export type Invitation = {
  _id: ObjectId;
  ownerId: ObjectId; // unique: one invitation per owner
  theme: string;
  defaultLang: Lang;
  outerColor: string;
  colors: { primary: string; accent: string };
  groomName: string;
  brideName: string;
  weddingAt: Date | null;
  venueName: string;
  mapUrl: string;
  texts: Record<Lang, InvitationTexts>;
  updatedAt: Date;
};

export type Attendee = {
  _id: ObjectId;
  invitationId: ObjectId;
  name: string;
  group: string;
  phone: string;
  token: string; // unique, unguessable, used in the attendee's personal link
  createdAt: Date;
};

export type Collections = {
  accounts: Collection<Account>;
  invitations: Collection<Invitation>;
  attendees: Collection<Attendee>;
};

export function collections(db: Db): Collections {
  return {
    accounts: db.collection<Account>('accounts'),
    invitations: db.collection<Invitation>('invitations'),
    attendees: db.collection<Attendee>('attendees'),
  };
}

export async function ensureIndexes(c: Collections): Promise<void> {
  await c.accounts.createIndex({ email: 1 }, { unique: true });
  await c.invitations.createIndex({ ownerId: 1 }, { unique: true });
  await c.attendees.createIndex({ token: 1 }, { unique: true });
  await c.attendees.createIndex({ invitationId: 1, name: 1 });
}

export async function connect(uri: string, dbName: string): Promise<{ client: MongoClient; db: Collections }> {
  const client = new MongoClient(uri);
  await client.connect();
  const db = collections(client.db(dbName));
  await ensureIndexes(db);
  return { client, db };
}
