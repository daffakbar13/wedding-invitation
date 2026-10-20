// Mockup behaviour for WEDDIN-1. No network: settings, guest and texts are canned
// sample data shaped like the repo's planned data/ files.

const settings = { outsideColor: '#FFFFFF', defaultLang: 'en', theme: 'garden-arch' };
const guest = { token: 'k7Qm2xR9vB4p', name: 'Budi Santoso' };
const weddingAt = new Date('2027-02-13T08:00:00+07:00');

const texts = {
  en: {
    language: 'Language',
    loading: 'Preparing your invitation…',
    nfTitle: 'Invitation not found',
    nfBody: 'This link is not valid or has been changed. Please open the link exactly as it was sent to you.',
    weddingOf: 'The Wedding of',
    dear: 'Dear,',
    invitedLine: 'We are delighted to invite you to our wedding.',
    open: 'Open Invitation',
    dayLong: 'Saturday, 13 February 2027',
    for: 'For',
    scroll: 'Scroll',
    greetTitle: 'Together with our families',
    greetBody: 'With joy and gratitude, we invite you to share in the celebration of our marriage. Your presence and prayers mean the world to us.',
    groom: 'The Groom',
    bride: 'The Bride',
    eventsTitle: 'Save the Date',
    akad: 'Holy Matrimony',
    reception: 'Reception',
    venueAddr: 'Jl. Melati No. 12, South Jakarta',
    countTitle: 'Counting down to our day',
    days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds',
    thanks: 'Thank you',
    thanksBody: 'It would be an honour to celebrate this day with you.',
    withLove: 'With love,',
    quote: 'Two hearts, one journey. From this day on, every road we take, we take together.',
    galleryTitle: 'Our Gallery',
    galleryHint: 'Swipe to turn',
    ringsLabel: 'Two gold wedding rings',
    gallerySub: 'A few moments from our journey together.',
    photoOf: 'Photo {n} of {t}',
    wishesTitle: 'Wishes',
    wishesSub: 'Send your prayers and wishes to the couple.',
    nameLabel: 'Name',
    messageLabel: 'Your wish',
    messagePh: 'Write your wish for Daffa & Alvina…',
    messageError: 'Please write a wish before sending.',
    send: 'Send wish',
    sending: 'Sending…',
    sent: 'Thank you! Your wish has been sent.',
    wishesCount: 'wishes',
    justNow: 'just now',
    hoursAgo: '{n} h ago',
    daysAgo: '{n} d ago',
  },
  id: {
    language: 'Bahasa',
    loading: 'Menyiapkan undangan Anda…',
    nfTitle: 'Undangan tidak ditemukan',
    nfBody: 'Tautan ini tidak valid atau telah diubah. Silakan buka tautan persis seperti yang dikirimkan kepada Anda.',
    weddingOf: 'Pernikahan',
    dear: 'Kepada Yth.,',
    invitedLine: 'Dengan hormat, kami mengundang Anda ke pernikahan kami.',
    open: 'Buka Undangan',
    dayLong: 'Sabtu, 13 Februari 2027',
    for: 'Untuk',
    scroll: 'Gulir',
    greetTitle: 'Bersama keluarga kami',
    greetBody: 'Dengan penuh rasa syukur, kami mengundang Anda untuk turut merayakan pernikahan kami. Kehadiran dan doa restu Anda sangat berarti bagi kami.',
    groom: 'Mempelai Pria',
    bride: 'Mempelai Wanita',
    eventsTitle: 'Simpan Tanggalnya',
    akad: 'Akad Nikah',
    reception: 'Resepsi',
    venueAddr: 'Jl. Melati No. 12, Jakarta Selatan',
    countTitle: 'Menghitung hari bahagia kami',
    days: 'Hari', hours: 'Jam', minutes: 'Menit', seconds: 'Detik',
    thanks: 'Terima kasih',
    thanksBody: 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir.',
    withLove: 'Dengan cinta,',
    quote: 'Dua hati, satu perjalanan. Mulai hari ini, setiap jalan yang kami tempuh, kami tempuh bersama.',
    galleryTitle: 'Galeri Kami',
    galleryHint: 'Geser untuk memutar',
    ringsLabel: 'Dua cincin emas pernikahan',
    gallerySub: 'Beberapa momen dari perjalanan kami bersama.',
    photoOf: 'Foto {n} dari {t}',
    wishesTitle: 'Ucapan & Doa',
    wishesSub: 'Kirimkan doa dan ucapan untuk kedua mempelai.',
    nameLabel: 'Nama',
    messageLabel: 'Ucapan Anda',
    messagePh: 'Tulis ucapan untuk Daffa & Alvina…',
    messageError: 'Mohon tulis ucapan sebelum mengirim.',
    send: 'Kirim ucapan',
    sending: 'Mengirim…',
    sent: 'Terima kasih! Ucapan Anda telah terkirim.',
    wishesCount: 'ucapan',
    justNow: 'baru saja',
    hoursAgo: '{n} jam lalu',
    daysAgo: '{n} hari lalu',
  },
};

// Canned wishes (newest first); ageHours drives the "x ago" label.
const wishes = [
  { name: 'Rina Kartika', ageHours: 2, message: 'Selamat Daffa & Alvina! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.' },
  { name: 'Andi Pratama', ageHours: 26, message: 'Congratulations to you both! Wishing you a lifetime of love and laughter.' },
  { name: 'Sari Wulandari', ageHours: 50, message: 'Bahagia selalu ya, semoga lancar sampai hari H!' },
];

const body = document.body;
const params = new URLSearchParams(location.search);
let lang = settings.defaultLang;

// ---- Word-by-word text: each word becomes a span the CSS can stagger ----
function split(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((word, i) => {
    const w = document.createElement('span');
    w.className = 'w';
    w.style.setProperty('--i', Math.min(i, 16));
    w.textContent = word;
    el.append(w, ' ');
  });
  el.classList.add('split');
}
document.querySelectorAll('.sec h2, .hero-frame .eyebrow, .hero-frame .date-long').forEach((el) => { el.dataset.split = ''; });
document.querySelectorAll('.hero-frame [data-split]').forEach((el) => el.classList.add('in'));
document.querySelectorAll('[data-split]:not([data-i18n])').forEach(split);
document.querySelectorAll('.invitation .names').forEach((el) => { el.innerHTML = `<span class="ink">${el.innerHTML}</span>`; });

// ---- Language: swaps every text in place, no reload ----
function setLang(next) {
  lang = next;
  document.documentElement.lang = next;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = texts[next][el.dataset.i18n];
    if (el.dataset.split !== undefined) split(el);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', texts[next][el.dataset.i18nAria]);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = texts[next][el.dataset.i18nPlaceholder];
  });
  renderWishes();
  if (!lightbox.hidden) showPhoto(photoIndex);
  document.querySelectorAll('[data-lang]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === next));
  });
}
document.querySelectorAll('[data-lang]').forEach((b) => {
  b.addEventListener('click', () => setLang(b.dataset.lang));
});
const t = (key, vars = {}) => texts[lang][key].replace(/\{(\w+)\}/g, (_, k) => vars[k]);

// ---- Gallery lightbox ----
const photos = [...document.querySelectorAll('[data-photo]')];
const lightbox = document.querySelector('.lightbox');
let photoIndex = 0;
let lastFocus = null;
function showPhoto(i) {
  photoIndex = (i + photos.length) % photos.length;
  lightbox.querySelector('.lb-photo').style.background = getComputedStyle(photos[photoIndex]).backgroundImage;
  lightbox.querySelector('.lb-count').textContent = t('photoOf', { n: photoIndex + 1, t: photos.length });
}
function openLightbox(i) {
  lastFocus = document.activeElement;
  lightbox.hidden = false;
  showPhoto(i);
  lightbox.querySelector('.lb-close').focus();
}
function closeLightbox() {
  lightbox.hidden = true;
  if (lastFocus) lastFocus.focus();
}
photos.forEach((p) => p.addEventListener('click', () => openLightbox(Number(p.dataset.photo))));
lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lb-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
lightbox.querySelector('.lb-next').addEventListener('click', () => showPhoto(photoIndex + 1));
document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPhoto(photoIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(photoIndex + 1);
});

// ---- Wishes (fake send) ----
const wishForm = document.querySelector('.wish-form');
const wishList = document.querySelector('.wish-list');
function ago(h) {
  if (h < 1) return t('justNow');
  return h < 24 ? t('hoursAgo', { n: h }) : t('daysAgo', { n: Math.floor(h / 24) });
}
function renderWishes() {
  wishList.innerHTML = '';
  wishes.forEach((w) => {
    const li = document.createElement('li');
    li.className = 'wish' + (w.isNew ? ' new' : '');
    li.innerHTML = '<div class="wish-head"><span class="wish-name"></span><span class="wish-time"></span></div><p class="wish-msg"></p>';
    li.querySelector('.wish-name').textContent = w.name;
    li.querySelector('.wish-time').textContent = ago(w.ageHours);
    li.querySelector('.wish-msg').textContent = w.message;
    wishList.appendChild(li);
  });
  document.querySelector('[data-wish-count]').textContent = wishes.length;
}
function addWish(name, message) {
  wishes.forEach((w) => { w.isNew = false; });
  wishes.unshift({ name, message, ageHours: 0, isNew: true });
  renderWishes();
}
function resetWishForm() {
  wishForm.classList.remove('invalid', 'sending', 'sent');
  wishForm.message.value = '';
  wishForm.querySelector('[type=submit]').disabled = false;
}
wishForm.message.addEventListener('input', () => wishForm.classList.remove('invalid'));
wishForm.addEventListener('submit', (e) => {
  e.preventDefault();
  wishForm.classList.remove('sent');
  const message = wishForm.message.value.trim();
  if (!message) {
    wishForm.classList.add('invalid');
    wishForm.message.focus();
    return;
  }
  const btn = wishForm.querySelector('[type=submit]');
  const label = btn.querySelector('[data-i18n]');
  btn.disabled = true;
  wishForm.classList.add('sending');
  label.textContent = t('sending');
  setTimeout(() => {
    addWish(wishForm.name.value.trim() || guest.name, message);
    wishForm.classList.remove('sending');
    wishForm.classList.add('sent');
    wishForm.message.value = '';
    btn.disabled = false;
    label.textContent = t('send');
  }, 900);
});
document.querySelectorAll('[data-guest-value]').forEach((el) => { el.value = guest.name; });

// ---- Outside colour from settings ----
function setOutside(color) {
  document.documentElement.style.setProperty('--outside', color);
}
document.querySelectorAll('[data-outside]').forEach((b) => {
  b.style.background = b.dataset.outside;
  b.addEventListener('click', () => setOutside(b.dataset.outside));
});

// ---- Petals: spread over depth; --k is how strongly the finger's wind moves each one ----
document.querySelectorAll('.petals').forEach((box) => {
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('span');
    const z = -250 + ((i * 83) % 400);
    p.className = 'petal' + (i % 3 === 0 ? ' gold' : '');
    p.style.left = `${(i * 37) % 100}%`;
    p.style.animationDuration = `${7 + (i % 5) * 1.6}s`;
    p.style.animationDelay = `${-(i * 1.1)}s`;
    p.style.setProperty('--z', `${z}px`);
    p.style.setProperty('--k', (0.5 + (z + 250) / 400).toFixed(2));
    box.appendChild(p);
  }
});

// ---- Gold rings: 30 plates per band ----
document.querySelectorAll('.ring').forEach((ring) => {
  for (let i = 0; i < 30; i++) {
    const seg = document.createElement('span');
    seg.className = 'seg';
    seg.style.setProperty('--a', `${i * 12}deg`);
    ring.appendChild(seg);
  }
});

// ---- Tilt, wind and ring spin: one animation loop ----
// Tilt comes from the phone's motion sensor, or from the pointer on desktop. Values -1…1.
const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
let wind = 0;
let lastX = null;
const spin = { angle: 20, speed: 0.35, dragging: false, lastX: 0 };
window.addEventListener('pointermove', (e) => {
  const box = document.getElementById('app').getBoundingClientRect();
  tilt.tx = Math.max(-1, Math.min(1, (e.clientX - (box.left + box.width / 2)) / (box.width / 2)));
  tilt.ty = Math.max(-1, Math.min(1, (e.clientY - innerHeight / 2) / (innerHeight / 2)));
  if (lastX !== null) wind = Math.max(-60, Math.min(60, wind + (e.clientX - lastX) * 1.5));
  lastX = e.clientX;
  if (spin.dragging) { spin.speed = (e.clientX - spin.lastX) * 0.8; spin.lastX = e.clientX; }
});
window.addEventListener('deviceorientation', (e) => {
  if (e.gamma == null) return;
  tilt.tx = Math.max(-1, Math.min(1, e.gamma / 30));
  tilt.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
});
const ringsEl = document.querySelector('.rings');
ringsEl.addEventListener('pointerdown', (e) => { spin.dragging = true; spin.lastX = e.clientX; ringsEl.setPointerCapture(e.pointerId); });
ringsEl.addEventListener('pointerup', () => { spin.dragging = false; });
const ringsSpin = document.querySelector('.rings-spin');
const petalBoxes = [...document.querySelectorAll('.petals')];
(function loop() {
  if (!body.classList.contains('no3d')) {
    tilt.x += (tilt.tx - tilt.x) * 0.08;
    tilt.y += (tilt.ty - tilt.y) * 0.08;
    body.style.setProperty('--tx', tilt.x.toFixed(3));
    body.style.setProperty('--ty', tilt.y.toFixed(3));
    wind *= 0.95;
    petalBoxes.forEach((b) => b.style.setProperty('--wind', wind.toFixed(1)));
    if (!spin.dragging) spin.speed += (0.35 - spin.speed) * 0.02;
    spin.angle += spin.speed;
    ringsSpin.style.setProperty('--spin', `${spin.angle.toFixed(1)}deg`);
  } else {
    body.style.setProperty('--tx', 0);
    body.style.setProperty('--ty', 0);
  }
  requestAnimationFrame(loop);
}());

// ---- Countdown ----
function tick() {
  let s = Math.max(0, Math.floor((weddingAt - Date.now()) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  const set = (k, v) => { document.querySelector(`[data-cd="${k}"]`).textContent = String(v).padStart(k === 'd' ? 1 : 2, '0'); };
  set('d', d); set('h', h); set('m', m); set('s', s);
}
tick();
setInterval(tick, 1000);

// ---- 3D support: no WebGL or reduced motion -> flat fallback ----
function has3d() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

// ---- Motion (stand-in for the R3F scene) ----
// Each step is a body class; CSS transitions do the movement between them.
const stepClasses = ['intro-start', 'intro-names', 'is-leaving', 'env-open', 'env-static', 'curtain-closed', 'curtain-opening'];
let timers = [];
let playNext = null; // 'intro' | 'open', consumed by the next render
const later = (ms, fn) => timers.push(setTimeout(fn, ms));
function jumpTo(cls) {
  body.classList.add('no-anim');
  body.classList.add(cls);
  void body.offsetHeight; // apply without transition
  body.classList.remove('no-anim');
}
function playIntro() {
  jumpTo('intro-start');
  later(60, () => body.classList.replace('intro-start', 'intro-names'));
  later(1500, () => body.classList.remove('intro-names'));
}
function playOpen() {
  jumpTo('curtain-closed');
  later(150, () => body.classList.remove('curtain-closed'));
}

// Scroll reveals: everything below the hero fades up when it enters the view.
const revealEls = [...document.querySelectorAll('.invitation .sec:not(.sec-hero) > *, .event-card, .gallery .ph, .person')];
revealEls.forEach((el) => el.classList.add('reveal'));
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
function resetReveals() {
  revealEls.forEach((el) => { el.classList.remove('in'); io.unobserve(el); io.observe(el); });
}

// Parallax: the hero photo moves slower than the page.
const heroPhoto = document.querySelector('.hero-photo');
window.addEventListener('scroll', () => {
  const y = body.classList.contains('no3d') ? 0 : Math.min(window.scrollY, 800) * 0.35;
  heroPhoto.style.setProperty('--sy', `${y}px`);
}, { passive: true });

// ---- 3D photo ring: drag/swipe or arrows to turn, tap the front photo to open ----
const carousel = document.querySelector('.carousel');
const carRing = document.querySelector('.car-ring');
const car = { rot: 0, dragging: false, startX: 0, startRot: 0, moved: 0 };
function setRot(deg, snap) {
  car.rot = snap ? Math.round(deg / 60) * 60 : deg;
  carRing.style.setProperty('--rot', `${car.rot}deg`);
}
carousel.addEventListener('pointerdown', (e) => {
  Object.assign(car, { dragging: true, startX: e.clientX, startRot: car.rot, moved: 0 });
  carRing.classList.add('dragging');
});
window.addEventListener('pointermove', (e) => {
  if (!car.dragging) return;
  car.moved = Math.abs(e.clientX - car.startX);
  setRot(car.startRot + (e.clientX - car.startX) * 0.5);
});
window.addEventListener('pointerup', () => {
  if (!car.dragging) return;
  car.dragging = false;
  carRing.classList.remove('dragging');
  setRot(car.rot, true);
});
document.querySelectorAll('[data-turn]').forEach((b) => {
  b.addEventListener('click', () => setRot(car.rot - Number(b.dataset.turn) * 60, true));
});
document.querySelectorAll('[data-card]').forEach((c) => {
  c.addEventListener('click', () => { if (car.moved < 6) openLightbox(Number(c.dataset.card)); });
});

// ---- States (#state=…) ----
const openBtn = document.getElementById('open-btn');
function render() {
  const state = new URLSearchParams(location.hash.slice(1)).get('state') || 'loading';
  timers.forEach(clearTimeout);
  timers = [];
  body.classList.remove(...stepClasses);
  openBtn.disabled = false;
  // Only #state=fallback forces it here so screenshots stay stable; the app uses has3d().
  body.classList.toggle('no3d', state === 'fallback');
  // Section states start the page at that section so fixed-height shots can show it.
  const startAt = {
    details: 'sec-events', gallery: 'sec-gallery',
    wishes: 'sec-wishes', 'wish-invalid': 'sec-wishes', 'wish-sent': 'sec-wishes',
  }[state];
  const secs = [...document.querySelectorAll('.invitation > .sec')];
  const startIdx = startAt ? secs.findIndex((s) => s.classList.contains(startAt)) : 0;
  secs.forEach((s, i) => {
    s.classList.toggle('skip', i < startIdx);
    s.classList.toggle('first', startAt !== undefined && i === startIdx);
  });
  lightbox.hidden = true;
  resetWishForm();
  wishes.splice(0, wishes.length, ...wishes.filter((w) => !w.isNew));
  if (state === 'wish-invalid') wishForm.classList.add('invalid');
  if (state === 'wish-sent') {
    addWish(guest.name, lang === 'id' ? 'Selamat menempuh hidup baru, semoga bahagia selalu!' : 'Congratulations! Wishing you a lifetime of happiness together.');
    wishForm.classList.add('sent');
  } else {
    renderWishes();
  }
  const opened = ['opened-id', 'fallback', 'curtain-closed', 'curtain-opening'];
  const covers = ['cover-intro', 'envelope-open', 'play'];
  const screen = (startAt || opened.includes(state)) ? 'opened' : covers.includes(state) ? 'cover' : state;
  body.dataset.state = screen;
  if (state === 'opened-id') setLang('id');
  document.querySelectorAll('.statebar a').forEach((a) => {
    a.toggleAttribute('aria-current', a.getAttribute('href') === `#state=${state}`);
  });
  window.scrollTo(0, 0);
  heroPhoto.style.setProperty('--sy', '0px');
  setRot(0, true);
  resetReveals();
  // What is already on screen shows at once; only what scrolls in is revealed.
  body.classList.add('no-anim');
  revealEls.forEach((el) => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); });
  void body.offsetHeight;
  body.classList.remove('no-anim');

  // Fixed keyframes for screenshots, or play a sequence.
  if (state === 'cover-intro') jumpTo('intro-names');
  if (state === 'envelope-open') jumpTo('env-static');
  if (state === 'curtain-closed' || state === 'curtain-opening') jumpTo(state);
  const play = state === 'play' ? 'intro' : playNext;
  playNext = null;
  if (play === 'intro' && screen === 'cover') playIntro();
  if (play === 'open' && screen === 'opened') playOpen();
}

openBtn.addEventListener('click', () => {
  openBtn.disabled = true;
  // iOS asks once for the motion sensor; it must be requested from a tap.
  if (window.DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
    DeviceOrientationEvent.requestPermission().catch(() => {});
  }
  if (!has3d()) { location.hash = 'state=fallback'; return; }
  body.classList.add('env-open');
  later(1700, () => body.classList.add('is-leaving'));
  later(2600, () => { playNext = 'open'; location.hash = 'state=opened'; });
});

if (params.has('clean')) body.classList.add('clean');
if (params.has('static')) body.classList.add('static');
setOutside(params.get('outside') || settings.outsideColor);
setLang(params.get('lang') || settings.defaultLang);
window.addEventListener('hashchange', render);
render();

// Fresh visit without a state: fake the token lookup, then show the cover.
if (!location.hash) setTimeout(() => { playNext = 'intro'; location.hash = 'state=cover'; }, 1200);
