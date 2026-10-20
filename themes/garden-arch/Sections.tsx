import { useCountdown } from '@/components/kit/useCountdown';
import { formatDayLong, formatTime } from '@/lib/i18n';
import type { ThemeProps } from '@/lib/theme';
import type { Invitation } from '@/lib/types';
import { photoStyle } from './photo';
import { SplitText } from './SplitText';

type Props = Pick<ThemeProps, 'invitation' | 'lang' | 't'>;
type CoupleText = keyof Invitation['texts'];

// Rose stems in the quote: [height px, grow order]
const STEMS: [number, number][] = [[70, 3], [104, 1], [84, 5], [126, 0], [92, 4], [112, 2], [76, 6]];

/** The couple's own wording when they wrote one, else the theme's. */
function useCoupleText({ invitation, lang, t }: Props) {
  return (key: CoupleText) => invitation.texts[key]?.[lang] ?? t(key);
}

function Names({ invitation, className, as: Tag = 'p' }: { invitation: Invitation; className: string; as?: 'h1' | 'p' }) {
  return (
    <Tag className={`names ${className} reveal`}>
      <span className="ink">{invitation.groom.shortName} <i>&amp;</i> {invitation.bride.shortName}</span>
    </Tag>
  );
}

export function Quote(props: Props) {
  const text = useCoupleText(props);
  return (
    <section className="sec sec-quote">
      <p className="quote-mark reveal" aria-hidden="true">“</p>
      <SplitText className="quote reveal" text={text('quote')} />
      <div className="rose-row reveal" aria-hidden="true">
        {STEMS.map(([h, i]) => (
          <span key={i} className="stem" style={{ '--h': `${h}px`, '--i': i } as React.CSSProperties}>
            <img src="/themes/garden-arch/rose.svg" alt="" />
          </span>
        ))}
      </div>
    </section>
  );
}

export function Greeting(props: Props) {
  const text = useCoupleText(props);
  return (
    <section className="sec sec-greeting">
      <Names invitation={props.invitation} className="names-lg" as="h1" />
      <div className="divider reveal" aria-hidden="true"><span />✦<span /></div>
      <SplitText as="h2" className="reveal" text={text('greetTitle')} />
      <p className="reveal">{text('greetBody')}</p>
    </section>
  );
}

export function Couple({ invitation, t }: Props) {
  const { groom, bride, photos } = invitation;
  return (
    <section className="sec sec-couple">
      <article className="person reveal">
        <div className={`arch arch-sm arch-groom${photos.groom ? ' photo' : ''}`} style={photoStyle(photos.groom)} role="img" aria-label={t('groomPhoto')} />
        <p className="eyebrow">{t('groom')}</p>
        <h3 className="fullname">{groom.fullName}</h3>
      </article>
      <div className="amp reveal" aria-hidden="true">&amp;</div>
      <article className="person reveal">
        <div className={`arch arch-sm arch-bride${photos.bride ? ' photo' : ''}`} style={photoStyle(photos.bride)} role="img" aria-label={t('bridePhoto')} />
        <p className="eyebrow">{t('bride')}</p>
        <h3 className="fullname">{bride.fullName}</h3>
      </article>
    </section>
  );
}

export function Events({ invitation, lang, t }: Props) {
  const { events, venue, timeZone, timeZoneLabel } = invitation;
  return (
    <section className="sec sec-events">
      <SplitText as="h2" className="reveal" text={t('eventsTitle')} />
      {events.map((event) => (
        <div key={event.start} className="event-card reveal">
          <p className="eyebrow">{event.title[lang]}</p>
          <p className="event-day">{formatDayLong(event.start, lang, timeZone)}</p>
          <p className="event-time">
            {formatTime(event.start, timeZone)} – {formatTime(event.end, timeZone)} {timeZoneLabel}
          </p>
        </div>
      ))}
      <div className="venue reveal">
        <p className="venue-name">{venue.name}</p>
        <p className="muted small">{venue.address[lang]}</p>
      </div>
    </section>
  );
}

export function CountdownSection({ invitation, t }: Props) {
  const left = useCountdown(invitation.events[0].start);
  const cells: [number, string][] = [
    [left.days, 'days'], [left.hours, 'hours'], [left.minutes, 'minutes'], [left.seconds, 'seconds'],
  ];
  return (
    <section className="sec sec-countdown">
      <SplitText as="h2" className="reveal" text={t('countTitle')} />
      <div className="countdown reveal" role="timer">
        {cells.map(([value, key]) => (
          <div key={key}>
            <b>{key === 'days' ? value : String(value).padStart(2, '0')}</b>
            <span>{t(key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Closing(props: Props) {
  const text = useCoupleText(props);
  return (
    <section className="sec sec-closing">
      <div className="divider reveal" aria-hidden="true"><span />✦<span /></div>
      <SplitText as="h2" className="reveal" text={props.t('thanks')} />
      <p className="reveal">{text('thanksBody')}</p>
      <p className="muted small reveal">{props.t('withLove')}</p>
      <Names invitation={props.invitation} className="names-sm" />
    </section>
  );
}
