import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InvitationShell } from '@/components/InvitationShell';
import { findByToken } from '@/lib/data';

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await findByToken((await params).token);
  if (!found) return { title: 'Invitation not found' };
  const { groom, bride } = found.invitation;
  return { title: `${groom.shortName} & ${bride.shortName} — Wedding Invitation` };
}

/** An attendee's own link. Unknown or altered tokens get the not-found page (HTTP 404). */
export default async function InvitationPage({ params }: Props) {
  const found = await findByToken((await params).token);
  if (!found) notFound();
  return <InvitationShell invitation={found.invitation} guest={found.guest} />;
}
