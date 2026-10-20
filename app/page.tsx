import { notFound } from 'next/navigation';

// There is no public home page yet; every visitor arrives through their own /i/<token> link.
export default function Home() {
  notFound();
}
