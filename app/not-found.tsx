import type { Metadata } from 'next';
import { NotFound } from '@/components/NotFound';

export const metadata: Metadata = { title: 'Invitation not found' };

export default function NotFoundPage() {
  return <NotFound />;
}
