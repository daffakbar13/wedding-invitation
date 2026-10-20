// Seeds the platform admin and the WEDDIN-1 sample couple with a few attendees.
// Safe to run again: accounts are matched by email, attendees by token.
//   npm run seed
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { loadConfig } from '../src/config.ts';
import { connect, type Account } from '../src/db.ts';
import { newInvitation } from '../src/invitations/settings.ts';

const config = loadConfig();
const adminEmail = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
const ownerEmail = (process.env.SEED_OWNER_EMAIL ?? 'daffa.alvina@example.com').toLowerCase();
const ownerPassword = process.env.SEED_OWNER_PASSWORD; // unset: Google sign-in only

if (!adminEmail) throw new Error('Set SEED_ADMIN_EMAIL (and SEED_ADMIN_PASSWORD for email sign-in) in .env');

const { client, db } = await connect(config.mongoUri, config.dbName);

async function upsertAccount(role: Account['role'], name: string, email: string, password: string | undefined) {
  const set: Partial<Account> = { role, name, active: true };
  if (password) set.passwordHash = await bcrypt.hash(password, 10);
  const account = await db.accounts.findOneAndUpdate(
    { email },
    { $set: set, $setOnInsert: { _id: new ObjectId(), email, createdAt: new Date() } },
    { upsert: true, returnDocument: 'after' },
  );
  return account!;
}

try {
  await upsertAccount('admin', 'Platform admin', adminEmail, adminPassword);
  const owner = await upsertAccount('owner', 'Daffa & Alvina', ownerEmail, ownerPassword);

  const base = newInvitation(owner._id, 'garden-arch');
  const invitation = await db.invitations.findOneAndUpdate(
    { ownerId: owner._id },
    {
      $set: {
        ...base,
        groomName: 'Muhammad Daffa Raihan Akbar',
        brideName: 'Alvina Damayanti',
        weddingAt: new Date('2027-02-13T08:00:00+07:00'),
        venueName: 'Gedung Melati',
        texts: {
          en: {
            invitedLine: 'We are delighted to invite you to our wedding.',
            greetTitle: 'Together with our families',
            greetBody: 'With joy and gratitude, we invite you to share in the celebration of our marriage. Your presence and prayers mean the world to us.',
            quote: 'Two hearts, one journey. From this day on, every road we take, we take together.',
            thanksBody: 'It would be an honour to celebrate this day with you.',
            venueAddr: 'Jl. Melati No. 12, South Jakarta',
          },
          id: {
            invitedLine: 'Dengan hormat, kami mengundang Anda ke pernikahan kami.',
            greetTitle: 'Bersama keluarga kami',
            greetBody: 'Dengan penuh rasa syukur, kami mengundang Anda untuk turut merayakan pernikahan kami. Kehadiran dan doa restu Anda sangat berarti bagi kami.',
            quote: 'Dua hati, satu perjalanan. Mulai hari ini, setiap jalan yang kami tempuh, kami tempuh bersama.',
            thanksBody: 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir.',
            venueAddr: 'Jl. Melati No. 12, Jakarta Selatan',
          },
        },
      },
      $setOnInsert: { _id: new ObjectId() },
    },
    { upsert: true, returnDocument: 'after' },
  );

  // Same tokens as the FE sample data (WEDDIN-1), so its sample links work against the API.
  // Attendees added through the API get 128-bit tokens.
  const attendees = [
    { name: 'Budi Santoso', group: 'Keluarga Papah', token: 'k7Qm2xR9vB4p' },
    { name: 'Rina Kartika & family', group: 'Keluarga Mamah', token: 'P3wz8LdQ1sYe' },
    { name: 'Andi Pratama', group: 'Teman Kantor', token: 'Hx6Tn0cVb2Ru' },
    { name: 'Sari Wulandari', group: 'Teman Kuliah', token: 'm9Fk4Ja7Wq5L' },
  ];
  for (const a of attendees) {
    await db.attendees.updateOne(
      { token: a.token },
      { $set: { name: a.name, group: a.group, invitationId: invitation!._id }, $setOnInsert: { phone: '', createdAt: new Date() } },
      { upsert: true },
    );
  }

  console.log(`Seeded admin ${adminEmail}, owner ${ownerEmail}, invitation ${invitation!._id.toHexString()}, ${attendees.length} attendees.`);
} finally {
  await client.close();
}
