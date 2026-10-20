import { createElement, Fragment } from 'react';

interface Props {
  as?: 'p' | 'h2' | 'h3' | 'span';
  text: string;
  className?: string;
}

/** Text as one span per word, so the CSS can stagger them (.split .w with --i). */
export function SplitText({ as = 'p', text, className = '' }: Props) {
  const words = text.trim().split(/\s+/);
  return createElement(
    as,
    { className: `split ${className}`.trim() },
    words.map((word, i) => (
      <Fragment key={`${i}-${word}`}>
        <span className="w" style={{ '--i': Math.min(i, 16) } as React.CSSProperties}>{word}</span>{' '}
      </Fragment>
    )),
  );
}
