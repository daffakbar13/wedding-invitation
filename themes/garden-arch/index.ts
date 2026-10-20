import { lazy } from 'react';
import type { ThemeDefinition } from '@/lib/theme';
import { Loading } from './Loading';
import { texts } from './texts';
import './garden-arch.css';

const gardenArch: ThemeDefinition = {
  id: 'garden-arch',
  name: 'Garden Arch',
  texts,
  Loading,
  Component: lazy(() => import('./GardenArch')),
};

export default gardenArch;
