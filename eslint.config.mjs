import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'design/**', 'api/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Themes use small decorative SVGs (roses, frames) that next/image would not optimise.
    files: ['themes/**'],
    rules: { '@next/next/no-img-element': 'off' },
  },
];

export default config;
