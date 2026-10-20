import type { Dictionary } from './i18n.ts';
import type { Lang } from './types.ts';

/** Texts the core shows itself (outside any theme). */
export const coreTexts: Record<Lang, Dictionary> = {
  en: {
    language: 'Language',
    nfTitle: 'Invitation not found',
    nfBody: 'This link is not valid or has been changed. Please open the link exactly as it was sent to you.',
  },
  id: {
    language: 'Bahasa',
    nfTitle: 'Undangan tidak ditemukan',
    nfBody: 'Tautan ini tidak valid atau telah diubah. Silakan buka tautan persis seperti yang dikirimkan kepada Anda.',
  },
};
