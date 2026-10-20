import type { Invitation } from '../lib/types.ts';

// Sample data so the FE runs without the API (WEDDIN-3). Same shape the API will return.
export const invitations: Invitation[] = [
  {
    id: 'daffa-alvina',
    settings: { theme: 'garden-arch', defaultLang: 'en', outsideColor: '#FFFFFF' },
    groom: { fullName: 'Muhammad Daffa Raihan Akbar', shortName: 'Daffa' },
    bride: { fullName: 'Alvina Damayanti', shortName: 'Alvina' },
    timeZone: 'Asia/Jakarta',
    timeZoneLabel: 'WIB',
    events: [
      {
        title: { en: 'Holy Matrimony', id: 'Akad Nikah' },
        start: '2027-02-13T08:00:00+07:00',
        end: '2027-02-13T10:00:00+07:00',
      },
      {
        title: { en: 'Reception', id: 'Resepsi' },
        start: '2027-02-13T11:00:00+07:00',
        end: '2027-02-13T14:00:00+07:00',
      },
    ],
    venue: {
      name: 'Graha Sentosa Ballroom',
      address: { en: 'Jl. Melati No. 12, South Jakarta', id: 'Jl. Melati No. 12, Jakarta Selatan' },
    },
    texts: {
      quote: {
        en: 'Two hearts, one journey. From this day on, every road we take, we take together.',
        id: 'Dua hati, satu perjalanan. Mulai hari ini, setiap jalan yang kami tempuh, kami tempuh bersama.',
      },
    },
    photos: { gallery: [] },
  },
];
