// Mockup behaviour for WEDDIN-4. No network: owners, invitation and attendees are
// canned data shaped like the WEDDIN-3 API; saves and sign-ins are faked with timers.

const LINK_BASE = 'undangan.app/i/'; // placeholder domain, decided at deploy
const themes = [{ id: 'garden-arch', name: 'Garden Arch' }];

const seedOwners = () => [
  { id: 1, name: 'Daffa & Alvina', email: 'daffa.alvina@gmail.com', theme: 'garden-arch', active: true, added: '12 Oct 2026' },
  { id: 2, name: 'Fajar & Intan', email: 'fajar.intan@yahoo.co.id', theme: 'garden-arch', active: true, added: '15 Oct 2026' },
  { id: 3, name: 'Bayu & Citra', email: 'bayucitra.wedding@gmail.com', theme: 'garden-arch', active: true, added: '18 Oct 2026' },
];

const textFields = [
  { key: 'invitedLine', label: 'Envelope line' },
  { key: 'greetTitle', label: 'Greeting title' },
  { key: 'greetBody', label: 'Greeting', long: true },
  { key: 'quote', label: 'Quote', long: true },
  { key: 'thanksBody', label: 'Thank-you message', long: true },
];
const langName = { en: 'English', id: 'Indonesian' };
const seedTexts = () => ({
  en: {
    invitedLine: 'We are delighted to invite you to our wedding.',
    greetTitle: 'Together with our families',
    greetBody: 'With joy and gratitude, we invite you to share in the celebration of our marriage. Your presence and prayers mean the world to us.',
    quote: 'Two hearts, one journey. From this day on, every road we take, we take together.',
    thanksBody: 'It would be an honour to celebrate this day with you.',
    venueAddr: 'Jl. Melati No. 12, South Jakarta',
  },
  id: {
    invitedLine: 'Dengan hormat, kami mengundang Anda ke pernikahan kami.',
    greetTitle: 'Bersama keluarga kami',
    greetBody: 'Dengan penuh rasa syukur, kami mengundang Anda untuk turut merayakan pernikahan kami. Kehadiran dan doa restu Anda sangat berarti bagi kami.',
    quote: 'Dua hati, satu perjalanan. Mulai hari ini, setiap jalan yang kami tempuh, kami tempuh bersama.',
    thanksBody: 'Merupakan kehormatan bagi kami apabila Anda berkenan hadir.',
    venueAddr: 'Jl. Melati No. 12, Jakarta Selatan',
  },
});
// Theme labels (fixed by the theme, not edited by the owner)
const previewCopy = {
  en: { weddingOf: 'The Wedding of', dear: 'Dear,', open: 'Open Invitation', groom: 'The Groom', bride: 'The Bride', eventsTitle: 'Save the Date', akad: 'Holy Matrimony', reception: 'Reception', thanks: 'Thank you', withLove: 'With love,', locale: 'en-GB', missing: 'Missing in English', map: 'View location' },
  id: { weddingOf: 'Pernikahan', dear: 'Kepada Yth.,', open: 'Buka Undangan', groom: 'Mempelai Pria', bride: 'Mempelai Wanita', eventsTitle: 'Simpan Tanggalnya', akad: 'Akad Nikah', reception: 'Resepsi', thanks: 'Terima kasih', withLove: 'Dengan cinta,', locale: 'id-ID', missing: 'Belum diisi dalam Bahasa Indonesia', map: 'Lihat lokasi' },
};

const seedGroups = () => ['Keluarga Papah', 'Keluarga Mamah', 'Teman Kantor', 'Teman Kuliah'];
const seedAttendees = () => [
  { name: 'Budi Santoso', group: 'Keluarga Papah', token: 'k7Qm2xR9vB4p', phone: '081234567890', sent: '18 Oct' },
  { name: 'Hendra Pratama & family', group: 'Keluarga Papah', token: 'Zr5Kd8Wm2PqA', phone: '081398765432' },
  { name: 'Om Joko Susilo', group: 'Keluarga Papah', token: 'b4Ns7Xe3Ty9H', phone: '' },
  { name: 'Rina Kartika & family', group: 'Keluarga Mamah', token: 'P3wz8LdQ1sYe', phone: '085711223344', sent: '18 Oct' },
  { name: 'Tante Lusi Wijaya', group: 'Keluarga Mamah', token: 'Fq2Lm6Rv8Jc4', phone: '081577889900' },
  { name: 'Andi Pratama', group: 'Teman Kantor', token: 'Hx6Tn0cVb2Ru', phone: '081322114455' },
  { name: 'Dewi Lestari', group: 'Teman Kantor', token: 'u7Gp3Yk9Ma5S', phone: '082166554433' },
  { name: 'Yoga Prasetyo', group: 'Teman Kantor', token: 'Wd4Bh8Nz2Ce6', phone: '087844332211' },
  { name: 'Sari Wulandari', group: 'Teman Kuliah', token: 'm9Fk4Ja7Wq5L', phone: '081255667788' },
  { name: 'Fikri Ramadhan', group: 'Teman Kuliah', token: 'Ka3Vs6Pt9Xn2', phone: '089912345678' },
  { name: 'Pak RT Sutrisno', group: '', token: 'e8Rj2Hq5Lz7D', phone: '' },
].map((a, i) => ({ ...a, id: i + 1 }));

const body = document.body;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let owners = seedOwners();
let ownersStatus = 'ready'; // ready | loading | error
let texts = seedTexts();
let attendees = seedAttendees();
let timers = [];
const later = (ms, fn) => timers.push(setTimeout(fn, ms));
const go = (state) => { location.hash = `state=${state}`; };

// ---- Toast ----
let toastTimer;
function toast(html, ms = 3200) {
  const el = $('.toast');
  $('[data-toast-text]').innerHTML = html;
  el.hidden = false;
  clearTimeout(toastTimer);
  if (ms) toastTimer = setTimeout(() => { el.hidden = true; }, ms);
}

// ---- Dialogs ----
let lastFocus = null;
function openDialog(name) {
  lastFocus = document.activeElement;
  const d = $(`[data-dialog="${name}"]`);
  d.hidden = false;
  const first = $('input, button', d);
  if (first) first.focus();
}
function closeDialogs() {
  $$('[data-dialog]').forEach((d) => { d.hidden = true; });
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
$$('[data-close]').forEach((b) => b.addEventListener('click', closeDialogs));
$$('[data-dialog]').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) closeDialogs(); }));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDialogs(); });

// ---- Top bar ----
const navs = {
  admin: [{ label: 'Owners', state: 'owners', views: ['owners'] }],
  owner: [
    { label: 'Invitation', state: 'editor', views: ['editor'] },
    { label: 'Photos', state: 'photos', views: ['photos'] },
    { label: 'Attendees', state: 'attendees', views: ['attendees'] },
    { label: 'WhatsApp', state: 'whatsapp', views: ['whatsapp'] },
  ],
};
function renderTopbar(role, view) {
  body.dataset.role = role;
  const admin = role === 'admin';
  $('[data-role-label]').textContent = admin ? 'Platform admin' : 'Daffa & Alvina';
  $('[data-who-name]').textContent = admin ? 'Platform admin' : 'Daffa & Alvina';
  $('[data-who-email]').textContent = admin ? 'admin@undangan.app' : 'daffa.alvina@gmail.com';
  $('[data-who-initials]').textContent = admin ? 'PA' : 'DA';
  $('[data-home]').setAttribute('href', admin ? '#state=owners' : '#state=editor');
  $$('[data-nav]').forEach((nav) => {
    nav.innerHTML = navs[role].map((n) => `<a href="#state=${n.state}"${n.views.includes(view) ? ' aria-current="page"' : ''}>${n.label}</a>`).join('');
  });
}

// ---- Login ----
const loginForm = $('.login-form');
function setLoginBusy(busy) {
  const btn = $('[data-login-submit]');
  btn.disabled = busy;
  $('[data-google]').disabled = busy;
  btn.innerHTML = busy ? '<span class="spinner" aria-hidden="true"></span><span>Signing in…</span>' : '<span>Sign in</span>';
}
function showLoginError(msg) {
  $('[data-login-error]').hidden = !msg;
  if (msg) $('[data-login-error-text]').textContent = msg;
}
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  showLoginError('');
  const email = loginForm.email.value.trim().toLowerCase();
  const password = loginForm.password.value;
  setLoginBusy(true);
  later(900, () => {
    setLoginBusy(false);
    // Demo: admin@… signs in as platform admin; a disabled owner or empty password is refused.
    const owner = owners.find((o) => o.email === email);
    if (!password) return showLoginError('Email or password is incorrect.');
    if (owner && !owner.active) return showLoginError('This account has been disabled. Contact the platform admin.');
    if (email.startsWith('admin@')) { ownersStatus = 'loading'; go('loading'); later(900, () => { ownersStatus = 'ready'; renderOwners(); }); return; }
    if (!owner) return showLoginError('Email or password is incorrect.');
    go('editor');
  });
});
$('[data-google]').addEventListener('click', () => {
  showLoginError('');
  setLoginBusy(true);
  later(1100, () => { setLoginBusy(false); go('editor'); });
});

// ---- Owners (platform admin) ----
function themeOptions(selected) {
  return themes.map((t) => `<option value="${t.id}"${t.id === selected ? ' selected' : ''}>${esc(t.name)}</option>`).join('');
}
$('[data-theme-select]').innerHTML = themeOptions('garden-arch');

function renderOwners() {
  const box = $('[data-owners]');
  if (ownersStatus === 'loading') {
    box.innerHTML = `<div class="skeleton" aria-busy="true" aria-label="Loading owners">${'<div class="sk-row"><span class="sk"></span><span class="sk"></span><span class="sk"></span><span class="sk"></span><span class="sk"></span></div>'.repeat(4)}</div>`;
    return;
  }
  if (ownersStatus === 'error') {
    box.innerHTML = `<div class="blank" role="alert">
      <svg class="icon" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><path d="M24 7L43 40H5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 19v10M24 34v.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
      <h2>Couldn't load owners</h2><p>Check your connection and try again.</p>
      <button type="button" class="btn btn-ghost" data-retry>Try again</button></div>`;
    $('[data-retry]').addEventListener('click', () => { ownersStatus = 'loading'; renderOwners(); later(900, () => { ownersStatus = 'ready'; go('owners'); renderOwners(); }); });
    return;
  }
  if (!owners.length) {
    box.innerHTML = `<div class="blank"><h2>No owners yet</h2><p>Create an owner for each couple. They can sign in once you add them.</p></div>`;
    return;
  }
  box.innerHTML = `<div class="list-head" aria-hidden="true"><span>Couple</span><span>Sign-in email</span><span>Theme</span><span>Status</span><span></span></div>`
    + owners.map((o) => `<div class="row${o.isNew ? ' is-new' : ''}${o.active ? '' : ' is-disabled'}" data-owner="${o.id}">
      <div class="row-name">${esc(o.name)}<span>Added ${esc(o.added)}</span></div>
      <div class="row-email">${esc(o.email)}</div>
      <label class="row-theme"><span class="cell-label">Theme</span><select class="select" aria-label="Theme for ${esc(o.name)}" data-theme>${themeOptions(o.theme)}</select></label>
      <div class="row-status"><span class="pill ${o.active ? 'pill-on' : 'pill-off'}">${o.active ? 'Active' : 'Disabled'}</span></div>
      <div class="row-actions">${o.active
        ? `<button type="button" class="btn btn-ghost btn-sm" data-disable>Disable</button>`
        : `<button type="button" class="btn btn-ghost btn-sm" data-enable>Enable</button>`}</div>
    </div>`).join('');
  $$('[data-owner]', box).forEach((row) => {
    const o = owners.find((x) => x.id === Number(row.dataset.owner));
    $('[data-theme]', row).addEventListener('change', (e) => {
      o.theme = e.target.value;
      toast(`Theme for ${esc(o.name)} set to ${esc(themes.find((t) => t.id === o.theme).name)}.`);
    });
    const dis = $('[data-disable]', row);
    if (dis) dis.addEventListener('click', () => { pendingDisable = o; $('[data-disable-name]').textContent = o.name; openDialog('disable'); });
    const en = $('[data-enable]', row);
    if (en) en.addEventListener('click', () => { o.active = true; renderOwners(); toast(`${esc(o.name)} can sign in again.`); });
  });
}
let pendingDisable = null;
$('[data-confirm-disable]').addEventListener('click', () => {
  pendingDisable.active = false;
  closeDialogs();
  renderOwners();
  toast(`${esc(pendingDisable.name)} is disabled. Their invitation now shows “not found”.`);
});
$('[data-open-create]').addEventListener('click', () => openDialog('create'));
$('[data-create]').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  owners.forEach((o) => { o.isNew = false; });
  const o = { id: Date.now(), name: f.couple.value.trim() || 'New couple', email: f.email.value.trim(), theme: f.theme.value, active: true, added: '20 Oct 2026', isNew: true };
  owners.unshift(o);
  closeDialogs();
  renderOwners();
  toast(`${esc(o.name)} added. They can sign in with ${esc(o.email)}.`);
});

// ---- Invitation editor (owner) ----
const editor = $('[data-editor]');
function renderTextPanels() {
  ['en', 'id'].forEach((lang) => {
    $(`[data-panel="${lang}"]`).innerHTML = textFields.map((f) => {
      const id = `${lang}-${f.key}`;
      const input = f.long
        ? `<textarea id="${id}" name="${id}" rows="3" aria-describedby="${id}-err">${esc(texts[lang][f.key])}</textarea>`
        : `<input id="${id}" name="${id}" value="${esc(texts[lang][f.key])}" aria-describedby="${id}-err">`;
      return `<label class="field" data-field="${id}">${f.label} (${langName[lang]})${input}<span class="field-error" id="${id}-err">Write the ${f.label.toLowerCase()} in ${langName[lang]}.</span></label>`;
    }).join('');
  });
}
// ---- Events: Akad and Resepsi, each with its own date, time (end time or "selesai") and place ----
const eventDefs = [
  {
    key: 'akad', label: 'Holy Matrimony',
    n: { date: 'date', start: 'akad', endMode: 'akadEndMode', end: 'akadEnd', venue: 'venue', address: 'akadAddress', maps: 'akadMaps' },
    d: { date: '2027-02-13', start: '08:00', endMode: 'time', end: '10:00', venue: 'Masjid Agung Al-Azhar', address: 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan', maps: 'https://maps.app.goo.gl/q3Vd8kLm2PaZ' },
  },
  {
    key: 'reception', label: 'Reception',
    n: { date: 'receptionDate', start: 'reception', endMode: 'receptionEndMode', end: 'receptionEnd', venue: 'receptionVenue', address: 'receptionAddress', maps: 'receptionMaps', same: 'receptionSame' },
    d: { date: '2027-02-13', start: '11:00', endMode: 'done', end: '14:00', venue: 'Graha Sentosa Ballroom', address: 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan', maps: '' },
  },
];
const MAPS_RE = /^https:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|(www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+)\//;
const PIN = '<svg viewBox="0 0 26 34" width="26" height="34" aria-hidden="true"><path d="M13 33s11-11.5 11-20A11 11 0 002 13c0 8.5 11 20 11 20z" fill="#D9473B"/><circle cx="13" cy="13" r="4.2" fill="#fff"/></svg>';
function renderEvents() {
  $('[data-events]').innerHTML = eventDefs.map(({ key, label, n, d }) => `
    <fieldset class="event-block" data-event="${key}">
      <legend>${label}</legend>
      <div class="event-times">
        <label class="field">Date<input type="date" name="${n.date}" value="${d.date}"></label>
        <label class="field">Starts<input type="time" name="${n.start}" value="${d.start}"></label>
        <label class="field">Ends<select name="${n.endMode}">
          <option value="time"${d.endMode === 'time' ? ' selected' : ''}>At a set time</option>
          <option value="done"${d.endMode === 'done' ? ' selected' : ''}>Until finished (selesai)</option>
        </select></label>
        <label class="field field-end">End time<input type="time" name="${n.end}" value="${d.end}"></label>
      </div>
      ${n.same ? `<label class="check-inline"><input type="checkbox" name="${n.same}"> Same place as Holy Matrimony</label>` : ''}
      <div class="event-place">
        <div class="two">
          <label class="field">Venue name<input name="${n.venue}" value="${esc(d.venue)}"></label>
          <label class="field">Address<textarea name="${n.address}" rows="2">${esc(d.address)}</textarea></label>
        </div>
        <div class="maps-row">
          <label class="field" data-maps-field="${key}">Google Maps link<span class="hint">Optional. In Google Maps, tap Share and copy the link.</span>
            <input type="url" name="${n.maps}" value="${esc(d.maps)}" placeholder="https://maps.app.goo.gl/…">
            <span class="field-error">Paste a link from Google Maps.</span>
          </label>
          <button type="button" class="btn btn-ghost" data-maps-find="${key}">Find on Google Maps</button>
        </div>
        <div class="map-card" data-map-card="${key}"></div>
      </div>
    </fieldset>`).join('');
}
// Place for an event: the reception can reuse the akad's place.
function eventPlace(key) {
  const e = editor.elements;
  const def = eventDefs.find((x) => x.key === key);
  const src = key === 'reception' && e.receptionSame.checked ? eventDefs[0] : def;
  return { venue: e[src.n.venue].value.trim(), address: e[src.n.address].value.trim(), maps: e[src.n.maps].value.trim() };
}
function eventInfo(key, lang) {
  const e = editor.elements;
  const { n } = eventDefs.find((x) => x.key === key);
  const d = new Date(`${e[n.date].value}T00:00:00`);
  const date = Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(previewCopy[lang].locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hm = (v) => v.replace(':', '.');
  const tz = e.tz.value;
  const start = hm(e[n.start].value);
  const time = e[n.endMode].value === 'done'
    ? `${start} ${tz} – ${lang === 'id' ? 'selesai' : 'until finished'}`
    : `${start} – ${hm(e[n.end].value)} ${tz}`;
  return { date, time, ...eventPlace(key) };
}
function updateEvents() {
  const e = editor.elements;
  eventDefs.forEach(({ key, n }) => {
    const block = $(`[data-event="${key}"]`);
    block.dataset.end = e[n.endMode].value;
    block.dataset.same = String(!!(n.same && e[n.same].checked));
    const link = e[n.maps].value.trim();
    $(`[data-maps-field="${key}"]`).classList.toggle('invalid', !!link && !MAPS_RE.test(link));
    const p = eventPlace(key);
    $(`[data-map-card="${key}"]`).innerHTML = `<div class="map-art">${PIN}</div>
      <div class="map-info"><b>${esc(p.venue || '—')}</b><span>${esc(p.address)}</span>
        <button type="button" class="btn btn-ghost btn-sm" data-map-open>Open in Google Maps</button>
        <span class="map-note">${p.maps && MAPS_RE.test(p.maps) ? 'Guests open this exact pin.' : 'No link yet: guests get a Google Maps search for the address.'}</span></div>`;
  });
}
// Real app: both open Google Maps in a new tab (the link, or a search for venue + address).
$('[data-events]').addEventListener('click', (ev) => {
  const find = ev.target.closest('[data-maps-find]');
  if (find) {
    const p = eventPlace(find.dataset.mapsFind);
    toast(`Opens a Google Maps search for “${esc([p.venue, p.address].filter(Boolean).join(', '))}”. Copy the link from Share and paste it here.`, 6000);
  }
  if (ev.target.closest('[data-map-open]')) toast('Opens Google Maps in a new tab.');
});

// ---- Parents line: "Putra kedua dari …" (child no. + parents), "Putra dari …" (parents only) or hidden ----
const parentDefaults = {
  groom: { mode: 'order', order: 2, father: 'Bapak H. Ahmad Santoso', mother: 'Ibu Siti Aminah' },
  bride: { mode: 'parents', order: 1, father: 'Bapak Hendra Wijaya', mother: 'Ibu Ratna Sari' },
};
const parentModes = [['order', 'With birth order'], ['parents', 'Without birth order'], ['none', 'Hide']];
function renderParents() {
  $('[data-parents]').innerHTML = ['groom', 'bride'].map((r) => {
    const d = parentDefaults[r];
    return `<fieldset class="parent-block" data-parent="${r}">
      <legend>${r === 'groom' ? "Groom's parents" : "Bride's parents"}</legend>
      <div class="radios" role="radiogroup">${parentModes.map(([v, l]) => `<label class="radio"><input type="radio" name="${r}ParentsMode" value="${v}"${d.mode === v ? ' checked' : ''}> ${l}</label>`).join('')}</div>
      <div class="parent-fields">
        <label class="field field-order">Child no.<input type="number" name="${r}Order" min="1" max="15" value="${d.order}" aria-describedby="${r}-order-hint"><span class="hint" id="${r}-order-hint">e.g. 2 = second</span></label>
        <label class="field">Father's name<input name="${r}Father" value="${esc(d.father)}"></label>
        <label class="field">Mother's name<input name="${r}Mother" value="${esc(d.mother)}"></label>
      </div>
      <p class="parent-sample" data-parent-sample="${r}"></p>
    </fieldset>`;
  }).join('');
}
const ORD = {
  id: ['pertama', 'kedua', 'ketiga', 'keempat', 'kelima', 'keenam', 'ketujuh', 'kedelapan', 'kesembilan', 'kesepuluh'],
  en: ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'],
};
function parentLine(role, lang) {
  const e = editor.elements;
  const mode = e[`${role}ParentsMode`].value;
  // On the English invitation the common Indonesian titles are translated: Bapak → Mr., Ibu → Mrs., Alm./Almh. → the late
  const enTitle = (s) => s.replace(/^(Alm\.|Almh\.|Almarhum|Almarhumah)\s+/i, 'the late ').replace(/(^|the late )Bapak\s+/i, '$1Mr. ').replace(/(^|the late )Ibu\s+/i, '$1Mrs. ');
  const who = [e[`${role}Father`].value, e[`${role}Mother`].value].map((s) => s.trim()).filter(Boolean)
    .map((s) => (lang === 'en' ? enTitle(s) : s)).join(' & ');
  if (mode === 'none' || !who) return '';
  const n = Math.max(1, parseInt(e[`${role}Order`].value, 10) || 1);
  if (lang === 'id') {
    const noun = role === 'groom' ? 'Putra' : 'Putri';
    return mode === 'order' ? `${noun} ${ORD.id[n - 1] || `ke-${n}`} dari ${who}` : `${noun} dari ${who}`;
  }
  const noun = role === 'groom' ? 'son' : 'daughter';
  const ord = ORD.en[n - 1] || `${n}th`;
  return mode === 'order' ? `${ord[0].toUpperCase()}${ord.slice(1)} ${noun} of ${who}` : `${noun[0].toUpperCase()}${noun.slice(1)} of ${who}`;
}
function updateParents() {
  ['groom', 'bride'].forEach((r) => {
    const mode = editor.elements[`${r}ParentsMode`].value;
    $(`[data-parent="${r}"]`).dataset.mode = mode;
    // One labelled line per invitation language; the quoted line is guest text, never translated by the admin language
    const langs = enabledLangs().filter((l) => parentLine(r, l));
    const box = $(`[data-parent-sample="${r}"]`);
    if (mode === 'none') box.textContent = 'Not shown on the invitation.';
    else if (!langs.length) box.textContent = "Fill in at least one parent's name.";
    else {
      box.innerHTML = '<span class="ps-head">On the invitation:</span>' + langs.map((l) => `<span class="ps-line">${
        langs.length > 1 || enabledLangs().length > 1 ? `<b>${langName[l]}</b> ` : ''}<span data-no-i18n>“${esc(parentLine(r, l))}”</span></span>`).join('');
    }
  });
}

function selectTab(lang) {
  $$('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === lang)));
  $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== lang; });
}
$$('[data-tab]').forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.tab)));

function setStatus(kind) {
  const el = $('[data-save-status]');
  const map = {
    dirty: '<span class="dot"></span><span>Unsaved changes</span>',
    clean: '<span>All changes saved</span>',
    saved: '<span style="color:var(--sage-deep);font-weight:600">Saved just now</span> <span class="long">· guests see the new version</span>',
    invalid: '<span style="color:var(--danger);font-weight:600">Not saved</span> <span class="long">· fill in the missing texts</span>',
  };
  el.innerHTML = map[kind];
  setPreviewState(kind === 'clean' || kind === 'saved');
}
function clearErrors() {
  $('[data-editor-error]').hidden = true;
  $$('.field.invalid', editor).forEach((f) => f.classList.remove('invalid'));
  $$('[data-tab]').forEach((b) => b.classList.remove('has-error'));
}
// ---- Languages: one or both; texts are only required in the chosen ones ----
const enabledLangs = () => $$('[data-lang-check]').filter((c) => c.checked).map((c) => c.value);
function applyLanguages() {
  const langs = enabledLangs();
  const single = langs.length === 1;
  // The last language left can't be turned off.
  $$('[data-lang-check]').forEach((c) => { c.disabled = single && c.checked; });
  $('[data-default-wrap]').hidden = single;
  if (!langs.includes(editor.elements.defaultLang.value)) editor.elements.defaultLang.value = langs[0];
  $$('[data-tab]').forEach((b) => { b.hidden = !langs.includes(b.dataset.tab); });
  $('.tabs[role="tablist"]').hidden = single;
  const current = $('[data-tab][aria-selected="true"]').dataset.tab;
  selectTab(langs.includes(current) ? current : langs[0]);
  $('[data-texts-hint]').textContent = single
    ? `Write each text in ${langName[langs[0]]}.`
    : 'Write each text in English and Indonesian. Guests switch language on the invitation.';
  const note = $('[data-lang-note]');
  note.hidden = !single;
  if (single) {
    const off = langs[0] === 'en' ? 'id' : 'en';
    const kept = textFields.some((f) => editor.elements[`${off}-${f.key}`].value.trim());
    note.textContent = `Guests see the invitation in ${langName[langs[0]]} only, with no language switch.`
      + (kept ? ` Your ${langName[off]} texts are kept in case you turn it back on.` : '');
  }
  $$('.tabs-sm').forEach((t) => { t.hidden = single; });
  if (!langs.includes(pvLang)) pvLang = langs[0];
  updatePreview();
}
$$('[data-lang-check]').forEach((c) => c.addEventListener('change', () => { clearErrors(); applyLanguages(); }));

function validate() {
  clearErrors();
  const missing = [];
  enabledLangs().forEach((lang) => textFields.forEach((f) => {
    const el = editor.elements[`${lang}-${f.key}`];
    if (!el.value.trim()) missing.push({ lang, f, el });
  }));
  if (!missing.length) return true;
  $('[data-missing]').innerHTML = missing.map((m) => `<li><a href="#${m.lang}-${m.f.key}" data-goto="${m.lang}">${langName[m.lang]} — ${m.f.label}</a></li>`).join('');
  $('[data-editor-error]').hidden = false;
  missing.forEach((m) => m.el.closest('.field').classList.add('invalid'));
  ['en', 'id'].forEach((lang) => {
    const n = missing.filter((m) => m.lang === lang).length;
    const tab = $(`[data-tab="${lang}"]`);
    tab.classList.toggle('has-error', n > 0);
    $(`[data-badge="${lang}"]`).textContent = n;
  });
  $$('[data-goto]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    selectTab(a.dataset.goto);
    $(a.getAttribute('href')).focus();
  }));
  selectTab(missing[0].lang);
  pvLang = missing[0].lang;
  updatePreview();
  setStatus('invalid');
  return false;
}
function save() {
  if (!validate()) { $('[data-editor-error]').scrollIntoView({ block: 'center' }); return; }
  const btn = $('[data-save]');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Saving…';
  later(800, () => {
    btn.disabled = false;
    btn.textContent = 'Save changes';
    ['en', 'id'].forEach((lang) => textFields.forEach((f) => { texts[lang][f.key] = editor.elements[`${lang}-${f.key}`].value; }));
    showSaved();
  });
}
function showSaved() {
  setStatus('saved');
  toast('Saved. Guests now see the changes.', 0);
}
$('[data-save]').addEventListener('click', save);
$('[data-view-invite]').addEventListener('click', () => toast('Opens the public invitation in a new tab.'));
editor.addEventListener('submit', (e) => { e.preventDefault(); save(); });
editor.addEventListener('input', (e) => {
  const field = e.target.closest('.field');
  if (field && e.target.value.trim()) field.classList.remove('invalid');
  setStatus('dirty');
  updatePreview();
});

// ---- Preview: the whole invitation, as the sample guest sees it, from the unsaved draft ----
let pvLang = 'en';
let pvFocus = null; // field key being edited, highlighted in the preview
function previewHTML() {
  const c = (n) => esc(editor.elements[n].value);
  const L = previewCopy[pvLang];
  const t = (k) => {
    const v = editor.elements[`${pvLang}-${k}`].value.trim();
    const cls = pvFocus === k ? ' class="pv-hl"' : '';
    return v ? `<span data-k="${k}"${cls}>${esc(v)}</span>` : `<span data-k="${k}" class="pv-missing${pvFocus === k ? ' pv-hl' : ''}">${L.missing}</span>`;
  };
  const f = (k, v) => `<span data-k="${k}"${pvFocus === k ? ' class="pv-hl"' : ''}>${v}</span>`;
  const d = new Date(`${editor.elements.date.value}T00:00:00`);
  const valid = !Number.isNaN(d.getTime());
  const short = valid ? [d.getDate(), d.getMonth() + 1, d.getFullYear()].map((n) => String(n).padStart(2, '0')).join(' · ') : '—';
  const long = valid ? d.toLocaleDateString(L.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—';
  return `<div class="pv">
    <section class="pv-cover">
      <p class="eyebrow">${L.weddingOf}</p>
      <p class="names">${f('groomShort', c('groomShort'))} <i>&amp;</i> ${f('brideShort', c('brideShort'))}</p>
      <p class="date">${f('date', short)}</p>
      <div class="pv-env"><p class="muted">${L.dear}</p><b>Budi Santoso</b><p class="muted" style="margin-top:6px">${t('invitedLine')}</p></div>
      <p><span class="pv-btn">${L.open}</span></p>
    </section>
    <section class="pv-quote"><p class="mark">“</p><p>${t('quote')}</p></section>
    <section><h4>${t('greetTitle')}</h4><p class="muted">${t('greetBody')}</p></section>
    <section class="pv-couple">
      <p class="eyebrow">${L.groom}</p><p class="full">${f('groomFull', c('groomFull'))}</p>
      <p class="muted parents-line">${esc(parentLine('groom', pvLang))}</p>
      <p class="amp">&amp;</p>
      <p class="eyebrow">${L.bride}</p><p class="full">${f('brideFull', c('brideFull'))}</p>
      <p class="muted parents-line">${esc(parentLine('bride', pvLang))}</p>
    </section>
    <section>
      <h4>${L.eventsTitle}</h4>
      ${eventDefs.map(({ key, n }) => {
        const ev = eventInfo(key, pvLang);
        return `<div class="pv-card"><p class="eyebrow">${L[key]}</p>
          <p>${f(n.date, esc(ev.date))}</p><p class="when">${f(n.start, esc(ev.time))}</p>
          <p class="where"><b>${f(n.venue, esc(ev.venue))}</b><span class="muted">${esc(ev.address)}</span></p>
          <span class="pv-mapbtn">${L.map}</span></div>`;
      }).join('')}
    </section>
    <section><h4>${L.thanks}</h4><p class="muted">${t('thanksBody')}</p><p style="margin-top:10px">${L.withLove}</p>
      <p class="names" style="font-size:20px">${c('groomShort')} <i>&amp;</i> ${c('brideShort')}</p></section>
  </div>`;
}
function updatePreview() {
  const c = (n) => editor.elements[n].value;
  $$('[data-preview]').forEach((p) => {
    p.style.setProperty('--p-primary', c('primary'));
    p.style.setProperty('--p-accent', c('accent'));
    p.style.setProperty('--p-bg', c('background'));
    p.style.setProperty('--p-outer', c('outer'));
  });
  $$('[data-hex]').forEach((h) => { h.textContent = $(`[data-color="${h.dataset.hex}"]`).value.toUpperCase(); });
  updateParents();
  updateEvents();
  const html = previewHTML();
  $$('[data-pv-body]').forEach((b) => {
    const top = b.parentElement.scrollTop;
    b.innerHTML = html;
    b.parentElement.scrollTop = top;
  });
  $$('[data-pv-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pvLang === pvLang)));
}
function setPreviewState(saved) {
  $$('[data-pv-state]').forEach((p) => {
    p.textContent = saved ? 'Same as guests see' : 'Draft · not saved';
    p.className = `pill ${saved ? 'pill-saved' : 'pill-draft'}`;
  });
}
// Editing a field jumps the preview to where that text shows, in that field's language.
function focusPreview(key) {
  pvFocus = key;
  updatePreview();
  $$('.pv-phone').forEach((ph) => {
    const el = $(`[data-k="${key}"]`, ph);
    const sc = $('.pv-scroll', ph);
    if (el && sc) sc.scrollTop = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 60;
  });
}
editor.addEventListener('focusin', (e) => {
  const name = e.target.name || '';
  const m = name.match(/^(en|id)-(\w+)$/);
  if (m) { pvLang = m[1]; focusPreview(m[2]); } else if (['groomShort', 'brideShort', 'groomFull', 'brideFull', 'date', 'akad', 'reception', 'venue', 'receptionDate', 'receptionVenue'].includes(name)) focusPreview(name);
});
editor.addEventListener('focusout', () => { pvFocus = null; updatePreview(); });
$$('[data-pv-lang]').forEach((b) => b.addEventListener('click', () => { pvLang = b.dataset.pvLang; updatePreview(); }));
$$('[data-pv-full]').forEach((b) => b.addEventListener('click', () => { updatePreview(); openDialog('preview'); }));
editor.elements.defaultLang.forEach((r) => r.addEventListener('change', () => { pvLang = r.value; }));

// ---- Attendees (owner) ----
const TOKEN_CHARS = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newToken = () => Array.from({ length: 12 }, () => TOKEN_CHARS[Math.floor(Math.random() * TOKEN_CHARS.length)]).join('');
let groups = seedGroups();
const filter = { q: '', group: 'all' }; // group: 'all' | '' (no group) | group name
let editing = null;
let copiedToken = null;
const NEW_GROUP = '__new';
const groupLabel = (g) => g || 'No group';
function groupOptions(selected, withNew) {
  return `<option value=""${selected ? '' : ' selected'}>No group</option>`
    + groups.map((g) => `<option${g === selected ? ' selected' : ''}>${esc(g)}</option>`).join('')
    + (withNew ? `<option value="${NEW_GROUP}">+ New group…</option>` : '');
}
function highlight(name) {
  if (!filter.q) return esc(name);
  const i = name.toLowerCase().indexOf(filter.q.toLowerCase());
  if (i < 0) return esc(name);
  return esc(name.slice(0, i)) + `<mark>${esc(name.slice(i, i + filter.q.length))}</mark>` + esc(name.slice(i + filter.q.length));
}
function renderChips() {
  const count = (g) => attendees.filter((a) => g === 'all' || a.group === g).length;
  const keys = ['all', ...groups, ...(attendees.some((a) => !a.group) ? [''] : [])];
  $('[data-chips]').innerHTML = keys.map((g) => `<button type="button" class="chip" data-chip="${esc(g)}" aria-pressed="${filter.group === g}">${g === 'all' ? 'All' : esc(groupLabel(g))}<b>${count(g)}</b></button>`).join('');
  $$('[data-chip]').forEach((c) => c.addEventListener('click', () => { filter.group = c.dataset.chip; renderAttendees(); }));
}
function renderAttendees() {
  const box = $('[data-attendees]');
  $('[data-group-select]').innerHTML = groupOptions($('[data-group-select]').value || '', true);
  $('[data-toolbar]').hidden = !attendees.length;
  if ($('[data-search]').value !== filter.q) $('[data-search]').value = filter.q;
  if (!attendees.length) {
    box.innerHTML = `<div class="blank">
      <svg class="icon" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><rect x="7" y="12" width="34" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M7 15l17 12 17-12" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>
      <h2>No guests yet</h2><p>Add your first guest above. Put guests in groups like "Keluarga Papah" or "Teman Kantor" to keep the list tidy.</p></div>`;
    return;
  }
  renderChips();
  const q = filter.q.trim().toLowerCase();
  const visible = attendees.filter((a) => (filter.group === 'all' || a.group === filter.group) && (!q || a.name.toLowerCase().includes(q)));
  if (!visible.length) {
    const where = filter.group === 'all' ? '' : ` in ${esc(groupLabel(filter.group))}`;
    box.innerHTML = `<div class="blank"><h2>No guests found</h2><p>No guest matches “${esc(filter.q)}”${where}.</p>
      <button type="button" class="btn btn-ghost" data-clear>Clear search</button></div>`;
    $('[data-clear]').addEventListener('click', () => { filter.q = ''; filter.group = 'all'; renderAttendees(); $('[data-search]').focus(); });
    return;
  }
  const order = [...groups, ''];
  const sections = order.map((g) => ({ g, list: visible.filter((a) => a.group === g) })).filter((s) => s.list.length);
  const summary = q || filter.group !== 'all' ? `${visible.length} of ${attendees.length} guests` : `${attendees.length} guests in ${groups.length} groups`;
  box.innerHTML = `<p class="att-count" aria-live="polite">${summary}</p><ul class="att-list">`
    + sections.map((s) => `<li class="att-group"><h3>${esc(groupLabel(s.g))}</h3><span>${s.list.length} ${s.list.length === 1 ? 'guest' : 'guests'}</span></li>`
      + s.list.map((a) => {
        const nameCell = editing === a.id
          ? `<form class="att-edit" data-edit-form><label class="sr-only" for="edit-${a.id}">Guest name</label><input class="select" id="edit-${a.id}" value="${esc(a.name)}">
              <label class="sr-only" for="edit-phone-${a.id}">WhatsApp number</label><input class="select" type="tel" id="edit-phone-${a.id}" data-edit-phone placeholder="WhatsApp number" value="${esc(a.phone || '')}">
              <label class="sr-only" for="edit-group-${a.id}">Group</label><select class="select" id="edit-group-${a.id}">${groupOptions(a.group)}</select>
              <button class="btn btn-primary btn-sm">Save</button></form>`
          : `<div class="att-name">${highlight(a.name)}<span class="att-meta">${a.phone
            ? `${fmtPhone(a.phone)}${a.sent ? ` · <span class="sent">Sent on WhatsApp ${esc(a.sent)}</span>` : ''}`
            : '<span class="nonum">No WhatsApp number</span>'}</span></div>`;
        const copied = copiedToken === a.token;
        return `<li class="att${a.isNew ? ' is-new' : ''}" data-id="${a.id}">
          ${nameCell}
          <div class="att-link"><span title="${LINK_BASE}${a.token}">${LINK_BASE}${a.token}</span>
            <button type="button" class="btn btn-ghost btn-sm${copied ? ' copied' : ''}" data-copy aria-label="Copy link for ${esc(a.name)}">${copied ? 'Copied' : 'Copy link'}</button></div>
          <div class="att-actions">
            <button type="button" class="btn btn-text btn-sm" data-edit aria-label="Edit ${esc(a.name)}">Edit</button>
            <button type="button" class="btn btn-text btn-sm danger" data-remove aria-label="Remove ${esc(a.name)}">Remove</button>
          </div></li>`;
      }).join('')).join('') + '</ul>';
  $$('.att', box).forEach((li) => {
    const a = attendees.find((x) => x.id === Number(li.dataset.id));
    $('[data-copy]', li).addEventListener('click', () => copyLink(a));
    $('[data-edit]', li).addEventListener('click', () => { editing = a.id; renderAttendees(); $(`#edit-${a.id}`).focus(); });
    $('[data-remove]', li).addEventListener('click', () => { pendingRemove = a; $('[data-remove-name]').textContent = a.name; openDialog('remove'); });
    const ef = $('[data-edit-form]', li);
    if (ef) ef.addEventListener('submit', (e) => {
      e.preventDefault();
      a.name = $('input', ef).value.trim() || a.name;
      a.phone = $('[data-edit-phone]', ef).value.trim();
      a.group = $('select', ef).value;
      editing = null;
      renderAttendees();
      toast('Guest updated. Their link stays the same.');
    });
  });
}
$('[data-search]').addEventListener('input', (e) => { filter.q = e.target.value; renderAttendees(); });
$('[data-group-select]').addEventListener('change', (e) => {
  const isNew = e.target.value === NEW_GROUP;
  $('[data-new-group]').hidden = !isNew;
  if (isNew) $('[data-new-group] input').focus();
});
function copyLink(a, sticky) {
  const url = `https://${LINK_BASE}${a.token}`;
  try { navigator.clipboard.writeText(url).catch(() => {}); } catch (e) { /* file:// may block it */ }
  copiedToken = a.token;
  renderAttendees();
  toast(`Link for ${esc(a.name)} copied.`);
  if (!sticky) later(2500, () => { copiedToken = null; renderAttendees(); });
}
let pendingRemove = null;
$('[data-confirm-remove]').addEventListener('click', () => {
  const a = pendingRemove;
  attendees = attendees.filter((x) => x !== a);
  closeDialogs();
  renderAttendees();
  toast(`${esc(a.name)} removed.`);
});
$('[data-add]').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const name = f.name.value.trim();
  $('[data-name-field]').classList.toggle('invalid', !name);
  if (!name) { f.name.focus(); return; }
  let group = f.group.value;
  if (group === NEW_GROUP) {
    group = f.newGroup.value.trim();
    if (group && !groups.includes(group)) groups.push(group);
  }
  addAttendee(name, group, false, f.phone.value.trim());
  f.name.value = '';
  f.phone.value = '';
  f.newGroup.value = '';
  $('[data-new-group]').hidden = true;
  $('[data-group-select]').innerHTML = groupOptions(group, true);
});
function addAttendee(name, group, sticky, phone = '') {
  attendees.forEach((x) => { x.isNew = false; });
  const a = { id: Date.now(), name, group, phone, token: sticky ? 'Tq8vN3pZk6Ds' : newToken(), isNew: true };
  attendees.unshift(a);
  // Show where the guest landed: clear a search that would hide them.
  filter.q = '';
  if (filter.group !== 'all' && filter.group !== group) filter.group = 'all';
  copyLink(a, sticky);
  toast(`${esc(name)} added. Their personal link is copied.`, sticky ? 0 : 3200);
}

// ---- WhatsApp: a template per language, sent one guest at a time from the owner's own WhatsApp ----
// Real app: "Open WhatsApp" opens https://wa.me/<62number>?text=<message>; the owner taps Send there.
function fmtPhone(p) {
  let d = String(p).replace(/\D/g, '');
  if (d.startsWith('0')) d = `62${d.slice(1)}`;
  if (!d.startsWith('62')) return `+${d}`;
  const r = d.slice(2);
  return `+62 ${r.slice(0, 3)}-${r.slice(3, 7)}-${r.slice(7)}`;
}
const defaultTemplates = {
  en: 'Dear *{guest_name}*,\n\nWith joy, we would like to invite you to our wedding:\n\n*{couple}*\n{date}\n{venue}\n\nHere is your personal invitation:\n{link}\n\nIt would mean so much to us if you could join us and give us your blessing.\n\nWith love,\n{couple}',
  id: 'Kepada Yth.\nBapak/Ibu/Saudara/i *{guest_name}*\n\nTanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di acara pernikahan kami:\n\n*{couple}*\n{date}\n{venue}\n\nBerikut undangan untuk Anda:\n{link}\n\nMerupakan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.\n\nTerima kasih,\n{couple}',
};
let templates = { ...defaultTemplates };
let waLang = 'id';
const wa = { group: 'all', resend: false, queue: [], index: 0, sentNow: 0, running: false };
const waText = $('[data-wa-text]');

function fillTemplate(tpl, guest, lang) {
  const e = editor.elements;
  const a = eventInfo('akad', lang);
  const r = eventInfo('reception', lang);
  const L = previewCopy[lang];
  const samePlace = a.venue === r.venue && a.address === r.address;
  const values = {
    guest_name: guest.name,
    couple: `${e.groomShort.value} & ${e.brideShort.value}`,
    date: a.date,
    venue: samePlace ? `${a.venue}, ${a.address}` : `${L.akad}: ${a.venue}, ${a.address}\n${L.reception}: ${r.venue}, ${r.address}`,
    link: `https://${LINK_BASE}${guest.token}`,
  };
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] : m));
}
// WhatsApp-style rendering: *bold*, links underlined
function waHTML(text) {
  return esc(text)
    .replace(/\*([^*\n]+)\*/g, '<b>$1</b>')
    .replace(/(https:\/\/\S+)/g, '<span class="tok-link">$1</span>');
}
function renderWaTemplate() {
  const langs = enabledLangs();
  if (!langs.includes(waLang)) waLang = langs[0];
  $('[data-wa-tabs]').hidden = langs.length === 1;
  $$('[data-wa-tab]').forEach((b) => { b.hidden = !langs.includes(b.dataset.waTab); b.setAttribute('aria-selected', String(b.dataset.waTab === waLang)); });
  waText.value = templates[waLang];
  updateWaPreview();
}
function updateWaPreview() {
  const sample = attendees.find((a) => a.name === 'Budi Santoso') || { name: 'Budi Santoso', token: 'k7Qm2xR9vB4p' };
  $('[data-wa-preview]').innerHTML = waHTML(fillTemplate(waText.value, sample, waLang));
}
function checkTemplate() {
  const ok = waText.value.includes('{link}');
  $('[data-wa-field]').classList.toggle('invalid', !ok);
  return ok;
}
waText.addEventListener('input', () => { templates[waLang] = waText.value; checkTemplate(); updateWaPreview(); });
$$('[data-wa-tab]').forEach((b) => b.addEventListener('click', () => { waLang = b.dataset.waTab; renderWaTemplate(); }));
$$('[data-token]').forEach((b) => b.addEventListener('click', () => {
  const tok = `{${b.dataset.token}}`;
  const { selectionStart: s, selectionEnd: en, value } = waText;
  waText.value = value.slice(0, s) + tok + value.slice(en);
  waText.focus();
  waText.setSelectionRange(s + tok.length, s + tok.length);
  waText.dispatchEvent(new Event('input'));
}));
$('[data-wa-reset]').addEventListener('click', () => { templates[waLang] = defaultTemplates[waLang]; renderWaTemplate(); checkTemplate(); });
$('[data-wa-save]').addEventListener('click', () => {
  if (!checkTemplate()) { waText.focus(); return; }
  toast(`${langName[waLang]} message saved.`);
});

function waCandidates() {
  return attendees.filter((a) => (wa.group === 'all' || a.group === wa.group) && (wa.resend || !a.sent));
}
function renderWaSetup() {
  const inGroup = (g) => attendees.filter((a) => g === 'all' || a.group === g);
  const keys = ['all', ...groups, ...(attendees.some((a) => !a.group) ? [''] : [])];
  $('[data-wa-chips]').innerHTML = keys.map((g) => `<button type="button" class="chip" data-wa-chip="${esc(g)}" aria-pressed="${wa.group === g}">${g === 'all' ? 'All guests' : esc(groupLabel(g))}<b>${inGroup(g).length}</b></button>`).join('');
  $$('[data-wa-chip]').forEach((c) => c.addEventListener('click', () => { wa.group = c.dataset.waChip; renderWaSetup(); }));
  $('[data-wa-resend]').checked = wa.resend;
  const list = waCandidates();
  const ready = list.filter((a) => a.phone).length;
  const noNum = list.length - ready;
  const alreadySent = inGroup(wa.group).filter((a) => a.sent).length;
  $('[data-wa-summary]').textContent = `${ready} ${ready === 1 ? 'guest' : 'guests'} to send`
    + (noNum ? ` · ${noNum} without a number (add it in Attendees)` : '')
    + (!wa.resend && alreadySent ? ` · ${alreadySent} already sent` : '');
  $('[data-wa-start]').disabled = !ready;
}
$('[data-wa-resend]').addEventListener('change', (e) => { wa.resend = e.target.checked; renderWaSetup(); });
$('[data-wa-start]').addEventListener('click', () => startWa());
function startWa(index = 0) {
  wa.queue = waCandidates().filter((a) => a.phone);
  wa.index = index;
  wa.sentNow = index;
  wa.running = true;
  renderWaRun();
}
function renderWaRun() {
  $('[data-wa-setup]').hidden = wa.running;
  $('.wa-grid').hidden = wa.running; // focus on the guest being sent to
  const box = $('[data-wa-run]');
  box.hidden = !wa.running;
  if (!wa.running) return;
  const total = wa.queue.length;
  if (wa.index >= total) {
    box.innerHTML = `<div class="wa-done">
      <svg class="muted" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true"><circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 24.5l6 6 12-13" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <h3>All done</h3><p class="muted">${wa.sentNow} of ${total} invitations opened in WhatsApp. Skipped guests stay unsent.</p>
      <button type="button" class="btn btn-ghost" data-wa-back>Back</button></div>`;
    $('[data-wa-back]').addEventListener('click', () => { wa.running = false; renderWaSetup(); renderWaRun(); });
    return;
  }
  const a = wa.queue[wa.index];
  const lang = waLang;
  box.innerHTML = `<div class="wa-run">
    <div>
      <div class="wa-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${wa.index}"><span style="width:${(wa.index / total) * 100}%"></span></div>
      <div class="wa-guest">
        <p class="small muted">Guest ${wa.index + 1} of ${total}${a.group ? ` · ${esc(a.group)}` : ''}</p>
        <h3>${esc(a.name)}</h3>
        <p class="num">${fmtPhone(a.phone)}</p>
      </div>
      <div class="wa-run-actions">
        <button type="button" class="btn btn-primary" data-wa-open>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 16l1-3.2A6.5 6.5 0 1110 16.5a6.6 6.6 0 01-3-.7z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
          Open WhatsApp
        </button>
        <button type="button" class="btn btn-ghost" data-wa-skip>Skip</button>
        <button type="button" class="btn btn-text" data-wa-stop>Stop</button>
      </div>
      <p class="small muted" style="margin-top:12px">After you tap Send in WhatsApp, come back here for the next guest.</p>
    </div>
    <div class="wa-chat"><div class="wa-bubble">${waHTML(fillTemplate(templates[lang], a, lang))}</div></div>
  </div>`;
  $('[data-wa-open]').addEventListener('click', () => {
    a.sent = '20 Oct';
    wa.sentNow += 1;
    toast(`WhatsApp opened for ${esc(a.name)} with the message ready.`);
    wa.index += 1;
    renderWaRun();
  });
  $('[data-wa-skip]').addEventListener('click', () => { wa.index += 1; renderWaRun(); });
  $('[data-wa-stop]').addEventListener('click', () => { wa.running = false; renderWaSetup(); renderWaRun(); });
}

// ---- Photos: main slots and a gallery; each upload is saved when it finishes ----
const MAX_MB = 10;
const MAX_GALLERY = 12;
const photoSlots = [
  { key: 'cover', label: 'Cover photo', hint: 'Opening screen; shown in black and white', bw: true },
  { key: 'couple', label: 'Couple photo', hint: 'Main photo at the top of the invitation' },
  { key: 'groom', label: "Groom's photo", hint: 'Next to the groom’s name' },
  { key: 'bride', label: "Bride's photo", hint: 'Next to the bride’s name' },
];
const seedPhotos = () => ({
  slots: { cover: { src: 'g7' }, couple: { src: 'g1' }, groom: { src: 'g3' }, bride: null },
  slotErrors: {},
  gallery: ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'].map((src, i) => ({ id: i + 1, src })),
});
let photos = seedPhotos();
const imgHTML = (src) => (src.startsWith('blob:') ? `<img src="${src}" alt="">` : `<span class="fill ${src}"></span>`);
const fileInput = (attrs, multiple) => `<input type="file" accept="image/jpeg,image/png" ${attrs}${multiple ? ' multiple' : ''}>`;
function checkFile(file) {
  if (!/^image\/(jpeg|png)$/.test(file.type)) return 'Only JPG or PNG photos.';
  if (file.size > MAX_MB * 1024 * 1024) return `Larger than ${MAX_MB} MB. Choose a smaller photo.`;
  return '';
}
// Fake upload: progress to 100%, then show the photo from the local file.
function fakeUpload(item, file, done) {
  item.progress = 0;
  const step = () => {
    item.progress = Math.min(100, item.progress + 20);
    if (item.progress < 100) { later(180, () => { step(); done(false); }); return; }
    item.src = file ? URL.createObjectURL(file) : item.src;
    delete item.progress;
    done(true);
  };
  later(180, () => { step(); done(false); });
}
function renderSlots() {
  $('[data-slots]').innerHTML = photoSlots.map((s) => {
    const p = photos.slots[s.key];
    const err = photos.slotErrors[s.key];
    let inner;
    if (p && p.progress != null) {
      inner = `${imgHTML(p.src || 'g4')}<span class="upload-label">Uploading… ${p.progress}%</span><span class="progress"><span style="width:${p.progress}%"></span></span>`;
    } else if (p) {
      inner = `${imgHTML(p.src)}<div class="slot-actions">
        <label class="btn btn-ghost btn-sm">Replace${fileInput(`data-slot-file="${s.key}" aria-label="Replace ${s.label}"`)}</label>
        <button type="button" class="btn btn-ghost btn-sm" data-slot-remove="${s.key}">Remove</button></div>`;
    } else {
      inner = `<label class="drop" data-drop="${s.key}">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="1.8" fill="currentColor"/><path d="M4 17l5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
        <b>Choose photo</b><span class="small">or drag it here</span>${fileInput(`data-slot-file="${s.key}" aria-label="${s.label}"`)}</label>`;
    }
    return `<div class="slot"><div class="slot-img${s.bw ? ' slot-bw' : ''}${p && p.progress != null ? ' is-uploading' : ''}" data-slot-box="${s.key}">${inner}</div>
      <p class="slot-label">${s.label}</p><p class="slot-hint">${s.hint}</p>${err ? `<p class="slot-error" role="alert">${err}</p>` : ''}</div>`;
  }).join('');
  $$('[data-slot-file]').forEach((inp) => inp.addEventListener('change', () => { if (inp.files[0]) uploadSlot(inp.dataset.slotFile, inp.files[0]); }));
  $$('[data-slot-remove]').forEach((b) => b.addEventListener('click', () => {
    photos.slots[b.dataset.slotRemove] = null;
    renderSlots();
    toast('Photo removed.');
  }));
  $$('[data-slot-box]').forEach((box) => wireDrop(box, (files) => uploadSlot(box.dataset.slotBox, files[0])));
}
function uploadSlot(key, file) {
  const err = checkFile(file);
  photos.slotErrors[key] = err;
  if (err) { renderSlots(); return; }
  const item = { src: 'g4' };
  photos.slots[key] = item;
  fakeUpload(item, file, (finished) => { renderSlots(); if (finished) toast('Photo saved.'); });
  renderSlots();
}
function wireDrop(el, onFiles) {
  el.addEventListener('dragover', (e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); el.classList.add('over'); } });
  el.addEventListener('dragleave', () => el.classList.remove('over'));
  el.addEventListener('drop', (e) => {
    if (!e.dataTransfer.files.length) return;
    e.preventDefault();
    el.classList.remove('over');
    onFiles([...e.dataTransfer.files]);
  });
}
let dragId = null;
function renderGallery() {
  const g = photos.gallery;
  const ready = g.filter((p) => !p.error).length;
  $('[data-gallery-count]').textContent = `${ready} / ${MAX_GALLERY}`;
  $('[data-gallery]').innerHTML = g.map((p, i) => {
    if (p.error) {
      return `<div class="g-tile is-error" role="alert"><b>${esc(p.name)}</b><span>${p.error}</span>
        <button type="button" class="btn btn-ghost btn-sm" data-g-remove="${p.id}">Remove</button></div>`;
    }
    if (p.progress != null) {
      return `<div class="g-tile is-uploading">${imgHTML(p.src)}<span class="upload-label">Uploading… ${p.progress}%</span><span class="progress"><span style="width:${p.progress}%"></span></span></div>`;
    }
    return `<div class="g-tile" draggable="true" data-g-id="${p.id}">${imgHTML(p.src)}<span class="num">${i + 1}</span>
      <button type="button" class="x" data-g-remove="${p.id}" aria-label="Remove photo ${i + 1}">×</button></div>`;
  }).join('') + (ready < MAX_GALLERY ? `<div class="g-tile"><label class="drop" data-g-drop>
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <b>Add photos</b><span class="small">or drag them here</span>${fileInput('data-g-file aria-label="Add photos"', true)}</label></div>` : '');
  $$('[data-g-remove]').forEach((b) => b.addEventListener('click', () => {
    const wasError = photos.gallery.find((p) => p.id === Number(b.dataset.gRemove)).error;
    photos.gallery = photos.gallery.filter((p) => p.id !== Number(b.dataset.gRemove));
    renderGallery();
    if (!wasError) toast('Photo removed.');
  }));
  const addInput = $('[data-g-file]');
  if (addInput) addInput.addEventListener('change', () => addGallery([...addInput.files]));
  const addDrop = $('[data-g-drop]');
  if (addDrop) wireDrop(addDrop, addGallery);
  // Reorder by dragging one photo onto another
  $$('[data-g-id]').forEach((t) => {
    t.addEventListener('dragstart', (e) => { dragId = Number(t.dataset.gId); t.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; });
    t.addEventListener('dragend', () => { dragId = null; t.classList.remove('dragging'); });
    t.addEventListener('dragover', (e) => { if (dragId != null) { e.preventDefault(); t.classList.add('drop-target'); } });
    t.addEventListener('dragleave', () => t.classList.remove('drop-target'));
    t.addEventListener('drop', (e) => {
      if (dragId == null) return;
      e.preventDefault();
      const from = photos.gallery.findIndex((p) => p.id === dragId);
      const to = photos.gallery.findIndex((p) => p.id === Number(t.dataset.gId));
      const [moved] = photos.gallery.splice(from, 1);
      photos.gallery.splice(to, 0, moved);
      renderGallery();
      toast('Gallery order saved.');
    });
  });
}
function addGallery(files) {
  const room = MAX_GALLERY - photos.gallery.filter((p) => !p.error).length;
  files.slice(0, room).forEach((file, i) => {
    const err = checkFile(file);
    const item = { id: Date.now() + i, name: file.name, src: 'g5' };
    if (err) { item.error = err; photos.gallery.push(item); return; }
    photos.gallery.push(item);
    fakeUpload(item, file, () => renderGallery());
  });
  if (files.length > room) toast(`Only ${MAX_GALLERY} photos fit in the gallery. ${files.length - room} not added.`);
  renderGallery();
}

// ---- States (#state=…) ----
const STATES = {
  login: { view: 'login' },
  'login-error': { view: 'login', loginError: 'Email or password is incorrect.' },
  loading: { view: 'owners', role: 'admin', owners: 'loading' },
  error: { view: 'owners', role: 'admin', owners: 'error' },
  owners: { view: 'owners', role: 'admin' },
  'owner-create': { view: 'owners', role: 'admin', dialog: 'create' },
  'owner-disabled': { view: 'owners', role: 'admin', disableId: 2 },
  editor: { view: 'editor', role: 'owner' },
  'editor-invalid': { view: 'editor', role: 'owner', invalid: true },
  success: { view: 'editor', role: 'owner', saved: true },
  preview: { view: 'editor', role: 'owner', preview: true },
  empty: { view: 'attendees', role: 'owner', noAttendees: true },
  attendees: { view: 'attendees', role: 'owner' },
  'attendee-added': { view: 'attendees', role: 'owner', added: ['Siti Rahmawati', 'Teman Kantor'] },
  'attendee-search': { view: 'attendees', role: 'owner', q: 'pratama' },
  'attendee-search-none': { view: 'attendees', role: 'owner', q: 'bambang', group: 'Teman Kantor' },
  denied: { view: 'denied', role: 'owner' },
  photos: { view: 'photos', role: 'owner', photoDemo: true },
  'photos-empty': { view: 'photos', role: 'owner', noPhotos: true },
  whatsapp: { view: 'whatsapp', role: 'owner' },
  'whatsapp-invalid': { view: 'whatsapp', role: 'owner', waInvalid: true },
  'whatsapp-sending': { view: 'whatsapp', role: 'owner', waRun: 2, waGroup: 'Teman Kantor' },
  'whatsapp-done': { view: 'whatsapp', role: 'owner', waRun: 99, waGroup: 'Teman Kuliah' },
};
let lastState = null;
function render() {
  const name = new URLSearchParams(location.hash.slice(1)).get('state') || 'login';
  const s = STATES[name] || STATES.login;
  timers.forEach(clearTimeout);
  timers = [];
  $('.toast').hidden = true;
  $$('[data-dialog]').forEach((d) => { d.hidden = true; });
  body.dataset.view = s.view;
  renderTopbar(s.role || 'owner', s.view);

  // Snapshot states start from canned data; moving between views keeps changes.
  const snapshot = !lastState || STATES[lastState].view === s.view || !['owners', 'editor', 'attendees', 'whatsapp', 'photos'].includes(name);
  if (snapshot) {
    owners = seedOwners();
    texts = seedTexts();
    attendees = s.noAttendees ? [] : seedAttendees();
    groups = seedGroups();
    filter.q = s.q || '';
    filter.group = s.group || 'all';
    editing = null;
    copiedToken = null;
  }
  lastState = name;

  if (s.view === 'login') { setLoginBusy(false); showLoginError(s.loginError || ''); }

  ownersStatus = s.owners || 'ready';
  if (s.disableId) {
    const o = owners.find((x) => x.id === s.disableId);
    o.active = false;
    toast(`${esc(o.name)} is disabled. Their invitation now shows “not found”.`, 0);
  }
  renderOwners();
  if (s.dialog) openDialog(s.dialog);

  if (s.view === 'editor') {
    if (snapshot) { renderTextPanels(); editor.reset(); }
    clearErrors();
    selectTab('en');
    // success starts at Date & venue so the shot shows the events
    $$('.editor-main > .card').forEach((c, i) => c.classList.toggle('skip', !!s.saved && i === 0));
    pvLang = editor.elements.defaultLang.value;
    pvFocus = null;
    applyLanguages();
    setStatus('clean');
    if (s.invalid) {
      editor.elements['id-quote'].value = '';
      editor.elements.primary.value = '#7A5C61';
      validate();
    }
    if (s.saved) {
      editor.elements.primary.value = '#7A5C61';
      editor.elements.outer.value = '#F3ECE4';
      // Saved as an Indonesian-only invitation
      $('[data-lang-check][value="en"]').checked = false;
      applyLanguages();
      showSaved();
    }
    if (s.preview) {
      // Owner is mid-edit: a changed quote and accent, not saved yet
      editor.elements['en-quote'].value = 'Two hearts, one journey — and a lifetime of road trips ahead.';
      editor.elements.accent.value = '#C07A5A';
      setStatus('dirty');
    }
    updatePreview();
    if (s.preview) openDialog('preview');
  }

  if (s.view === 'attendees') {
    renderAttendees();
    if (s.added) {
      $('[data-group-select]').innerHTML = groupOptions(s.added[1], true);
      addAttendee(s.added[0], s.added[1], true, '081299887766');
    }
  }

  if (s.view === 'photos') {
    if (snapshot) photos = s.noPhotos ? { slots: { cover: null, couple: null, groom: null, bride: null }, slotErrors: {}, gallery: [] } : seedPhotos();
    if (s.photoDemo) {
      // Snapshot: bride photo too large, one gallery photo mid-upload, one rejected
      photos.slotErrors.bride = `Larger than ${MAX_MB} MB. Choose a smaller photo.`;
      photos.gallery.push({ id: 90, src: 'g2', progress: 60 });
      photos.gallery.push({ id: 91, name: 'IMG_2231.HEIC', error: 'Only JPG or PNG photos.' });
    }
    renderSlots();
    renderGallery();
  }

  if (s.view === 'whatsapp') {
    if (snapshot) {
      templates = { ...defaultTemplates };
      waLang = editor.elements.defaultLang.value === 'en' && enabledLangs().includes('en') ? 'en' : 'id';
      Object.assign(wa, { group: s.waGroup || 'all', resend: false, running: false });
    }
    renderWaTemplate();
    if (s.waInvalid) {
      waText.value = waText.value.replace('{link}', '');
      templates[waLang] = waText.value;
      updateWaPreview();
      checkTemplate();
    } else {
      $('[data-wa-field]').classList.remove('invalid');
    }
    renderWaSetup();
    if (s.waRun) {
      startWa(0);
      // Snapshot: the first guests in the queue are already done
      const n = Math.min(s.waRun, wa.queue.length);
      wa.queue.slice(0, n).forEach((a) => { a.sent = '20 Oct'; });
      wa.index = n;
      wa.sentNow = n;
    }
    renderWaRun();
  }

  $$('.statebar a').forEach((a) => a.toggleAttribute('aria-current', a.getAttribute('href') === `#state=${name}`));
  window.scrollTo(0, 0);
}

// ---- Admin display language: Indonesian by default, English optional ----
// Mockup: English source strings are swapped for Indonesian as the DOM changes. The real app
// would use message files (id.json / en.json). Guest-facing content (invitation preview,
// WhatsApp messages) follows the invitation's own languages, not this setting.
const ID = {
  'Invitations': 'Admin Undangan', 'Platform admin': 'Admin platform', 'Sign out': 'Keluar',
  'Owners': 'Pemilik', 'Invitation': 'Undangan', 'Attendees': 'Tamu', 'WhatsApp': 'WhatsApp',
  'Display language': 'Bahasa tampilan', 'Main': 'Utama',
  // Login
  'Sign in': 'Masuk', 'Manage your wedding invitation and guests.': 'Kelola undangan pernikahan dan tamu Anda.',
  'Email or password is incorrect.': 'Email atau kata sandi salah.', 'Password': 'Kata sandi', 'Signing in…': 'Sedang masuk…',
  'or': 'atau', 'Continue with Google': 'Lanjutkan dengan Google',
  'No account? Accounts are created by the platform admin.': 'Belum punya akun? Akun dibuat oleh admin platform.',
  'This account has been disabled. Contact the platform admin.': 'Akun ini telah dinonaktifkan. Hubungi admin platform.',
  // Owners
  'Couples who can sign in and edit their own invitation.': 'Pasangan yang bisa masuk dan mengubah undangan mereka sendiri.',
  'New owner': 'Pemilik baru', 'Couple': 'Pasangan', 'Sign-in email': 'Email masuk', 'Theme': 'Tema',
  'Active': 'Aktif', 'Disabled': 'Nonaktif', 'Disable': 'Nonaktifkan', 'Enable': 'Aktifkan',
  "Couldn't load owners": 'Gagal memuat daftar pemilik', 'Check your connection and try again.': 'Periksa koneksi Anda, lalu coba lagi.',
  'Try again': 'Coba lagi', 'No owners yet': 'Belum ada pemilik',
  'Create an owner for each couple. They can sign in once you add them.': 'Buat pemilik untuk setiap pasangan. Mereka bisa masuk setelah Anda menambahkannya.',
  'Couple name': 'Nama pasangan', 'Use their Google email to let them sign in with Google too.': 'Pakai email Google mereka agar bisa masuk dengan Google juga.',
  'Temporary password': 'Kata sandi sementara', 'Share it with the couple; they can sign in with Google instead.': 'Berikan ke pasangan; mereka juga bisa masuk dengan Google.',
  'Cancel': 'Batal', 'Create owner': 'Buat pemilik', 'Disable owner': 'Nonaktifkan pemilik',
  'They will no longer be able to sign in, and every guest link to their invitation will show “Invitation not found”. You can enable them again later.':
    'Mereka tidak bisa masuk lagi, dan semua tautan tamu ke undangan mereka akan menampilkan “Undangan tidak ditemukan”. Anda bisa mengaktifkannya lagi nanti.',
  // Editor
  "Changes show on every guest's link after you save.": 'Perubahan tampil di tautan setiap tamu setelah Anda menyimpan.',
  'Not saved.': 'Belum tersimpan.', 'Every text is needed in each language you chose. Missing:': 'Setiap teks wajib diisi di semua bahasa yang dipilih. Belum diisi:',
  'Names appear as written in every invitation language.': 'Nama tampil persis seperti yang ditulis, di semua bahasa undangan.',
  "Groom's short name": 'Nama panggilan mempelai pria', "Bride's short name": 'Nama panggilan mempelai wanita',
  "Groom's full name": 'Nama lengkap mempelai pria', "Bride's full name": 'Nama lengkap mempelai wanita',
  'Date & venue': 'Tanggal & tempat', 'Wedding date': 'Tanggal pernikahan', 'Holy Matrimony': 'Akad nikah', 'Reception': 'Resepsi', 'Venue name': 'Nama tempat',
  'Languages': 'Bahasa undangan', 'Choose the languages your invitation uses. With two, guests can switch between them.': 'Pilih bahasa yang dipakai undangan Anda. Jika dua, tamu bisa beralih di antaranya.',
  'English': 'Inggris', 'Indonesian': 'Indonesia', 'Shown first': 'Tampil pertama',
  'Texts': 'Teks', 'Write each text in English and Indonesian. Guests switch language on the invitation.': 'Tulis setiap teks dalam bahasa Inggris dan Indonesia. Tamu bisa mengganti bahasa di undangan.',
  'Envelope line': 'Kalimat di amplop', 'Greeting title': 'Judul sambutan', 'Greeting': 'Sambutan', 'Quote': 'Kutipan',
  'Thank-you message': 'Ucapan terima kasih', 'Venue address': 'Alamat tempat',
  'Colours': 'Warna', 'The theme stays the same; these colours change its look.': 'Temanya tetap sama; warna ini mengubah tampilannya.',
  'Accent': 'Aksen', 'Background': 'Latar', 'Outer colour': 'Warna luar',
  'Outer colour fills the space around the invitation on wide screens.': 'Warna luar mengisi ruang di sekitar undangan pada layar lebar.',
  'Preview': 'Pratinjau', 'Draft · not saved': 'Draf · belum disimpan', 'Same as guests see': 'Sudah tayang',
  'Full screen': 'Layar penuh', 'Preview invitation': 'Pratinjau undangan', 'Close': 'Tutup', 'Preview language': 'Bahasa pratinjau',
  'Scroll inside the phone to see the whole invitation, as the sample guest': 'Gulir di dalam ponsel untuk melihat seluruh undangan, sebagai tamu contoh',
  'Unsaved changes': 'Ada perubahan yang belum disimpan', 'All changes saved': 'Semua perubahan tersimpan', 'Saved just now': 'Baru saja disimpan',
  '· guests see the new version': '· tamu melihat versi terbaru', 'Not saved': 'Belum tersimpan', '· fill in the missing texts': '· lengkapi teks yang kosong',
  'View invitation': 'Lihat undangan', 'Save changes': 'Simpan perubahan', 'Saving…': 'Menyimpan…',
  'Saved. Guests now see the changes.': 'Tersimpan. Tamu sekarang melihat perubahannya.', 'Opens the public invitation in a new tab.': 'Membuka undangan publik di tab baru.',
  // Attendees
  'Each guest gets a personal link that opens the invitation with their name.': 'Setiap tamu mendapat tautan pribadi yang membuka undangan dengan namanya.',
  'Add a guest': 'Tambah tamu', 'Guest name': 'Nama tamu', 'As it should appear on the envelope, e.g. "Budi Santoso & family"': 'Seperti yang tertulis di amplop, mis. "Budi Santoso & keluarga"',
  'Please enter a name.': 'Mohon isi nama.', 'WhatsApp number': 'Nomor WhatsApp', 'Optional': 'Opsional', 'Group': 'Grup',
  'New group name': 'Nama grup baru', 'e.g. "Teman Kantor"': 'mis. "Teman Kantor"', 'Group name': 'Nama grup', 'Add guest': 'Tambah tamu',
  'Search guests by name': 'Cari tamu berdasarkan nama', 'Search guests': 'Cari tamu', 'Filter by group': 'Saring berdasarkan grup',
  'All': 'Semua', 'No group': 'Tanpa grup', '+ New group…': '+ Grup baru…', 'Copy link': 'Salin tautan', 'Copied': 'Tersalin',
  'Edit': 'Ubah', 'Save': 'Simpan', 'Remove': 'Hapus', 'No WhatsApp number': 'Belum ada nomor WhatsApp',
  'No guests yet': 'Belum ada tamu', 'No guests found': 'Tamu tidak ditemukan', 'Clear search': 'Hapus pencarian',
  'Add your first guest above. Put guests in groups like "Keluarga Papah" or "Teman Kantor" to keep the list tidy.':
    'Tambahkan tamu pertama Anda di atas. Kelompokkan tamu, misalnya "Keluarga Papah" atau "Teman Kantor", agar daftar tetap rapi.',
  'Their personal link will stop working.': 'Tautan pribadinya tidak akan berfungsi lagi.',
  'Guest updated. Their link stays the same.': 'Data tamu diperbarui. Tautannya tetap sama.',
  // WhatsApp
  'Send each guest their personal link from your own WhatsApp.': 'Kirim tautan pribadi ke setiap tamu dari WhatsApp Anda sendiri.',
  'Message template': 'Template pesan', 'Words in {curly brackets} are filled in for each guest.': 'Kata dalam {kurung kurawal} diisi otomatis untuk setiap tamu.',
  'Message language': 'Bahasa pesan', 'Insert:': 'Sisipkan:', 'Personal link': 'Tautan pribadi', 'Date': 'Tanggal', 'Venue': 'Tempat', 'Message': 'Pesan',
  'Keep {link} in the message so each guest gets their own invitation.': 'Pertahankan {link} di pesan agar setiap tamu mendapat undangannya sendiri.',
  'Use *stars* for bold, as in WhatsApp.': 'Gunakan *bintang* untuk huruf tebal, seperti di WhatsApp.',
  'Reset to default': 'Kembalikan ke bawaan', 'Save template': 'Simpan template', 'Send invitations': 'Kirim undangan',
  'WhatsApp opens with the message ready for each guest, and you tap Send there. Nothing is sent automatically.':
    'WhatsApp terbuka dengan pesan siap kirim untuk setiap tamu, lalu Anda tekan Kirim di sana. Tidak ada yang terkirim otomatis.',
  'All guests': 'Semua tamu', 'Include guests I already sent to': 'Sertakan tamu yang sudah dikirimi', 'Start sending': 'Mulai kirim',
  'Open WhatsApp': 'Buka WhatsApp', 'Skip': 'Lewati', 'Stop': 'Berhenti', 'All done': 'Selesai', 'Back': 'Kembali',
  'After you tap Send in WhatsApp, come back here for the next guest.': 'Setelah menekan Kirim di WhatsApp, kembali ke sini untuk tamu berikutnya.',
  // Events
  'Each event has its own time and place.': 'Setiap acara punya waktu dan tempatnya sendiri.', 'Time zone': 'Zona waktu',
  'Starts': 'Mulai', 'Ends': 'Selesai', 'At a set time': 'Jam tertentu', 'Until finished (selesai)': 'Sampai selesai', 'End time': 'Jam selesai',
  'Same place as Holy Matrimony': 'Tempat sama dengan akad nikah', 'Address': 'Alamat', 'Google Maps link': 'Tautan Google Maps',
  'Optional. In Google Maps, tap Share and copy the link.': 'Opsional. Di Google Maps, tekan Bagikan lalu salin tautannya.',
  'Paste a link from Google Maps.': 'Tempel tautan dari Google Maps.', 'Find on Google Maps': 'Cari di Google Maps', 'Open in Google Maps': 'Buka di Google Maps',
  'Guests open this exact pin.': 'Tamu membuka titik lokasi ini.',
  'No link yet: guests get a Google Maps search for the address.': 'Belum ada tautan: tamu diarahkan ke pencarian alamat di Google Maps.',
  'Opens Google Maps in a new tab.': 'Membuka Google Maps di tab baru.',
  // Parents
  "Groom's parents": 'Orang tua mempelai pria', "Bride's parents": 'Orang tua mempelai wanita',
  'With birth order': 'Dengan urutan anak', 'Without birth order': 'Tanpa urutan anak', 'Hide': 'Sembunyikan',
  'Child no.': 'Anak ke-', 'e.g. 2 = second': 'mis. 2 = kedua', "Father's name": 'Nama ayah', "Mother's name": 'Nama ibu',
  'On the invitation:': 'Tampil di undangan:',
  'Not shown on the invitation.': 'Tidak ditampilkan di undangan.', "Fill in at least one parent's name.": 'Isi minimal satu nama orang tua.',
  "Write parents' names with their titles, such as Bapak, Ibu, H., Hj. or Alm. On the English invitation, Bapak and Ibu become Mr. and Mrs.":
    'Tulis nama orang tua beserta gelarnya, misalnya Bapak, Ibu, H., Hj., atau Alm. Di undangan berbahasa Inggris, Bapak dan Ibu otomatis menjadi Mr. dan Mrs.',
  // Photos
  'Photos': 'Foto', 'Photos show on your invitation as soon as they finish uploading. JPG or PNG, up to 10 MB each.': 'Foto langsung tampil di undangan setelah selesai diunggah. JPG atau PNG, maks. 10 MB per foto.',
  'Main photos': 'Foto utama', 'Each one has its own place on the invitation.': 'Setiap foto punya tempatnya sendiri di undangan.',
  'Gallery': 'Galeri', 'Up to 12 photos. Drag to change the order.': 'Maksimal 12 foto. Seret untuk mengubah urutan.',
  'Cover photo': 'Foto sampul', 'Opening screen; shown in black and white': 'Di layar pembuka; otomatis hitam putih', 'Couple photo': 'Foto berdua',
  'Main photo at the top of the invitation': 'Foto utama di bagian atas undangan',
  "Groom's photo": 'Foto mempelai pria', "Bride's photo": 'Foto mempelai wanita',
  'Next to the groom’s name': 'Di samping nama mempelai pria', 'Next to the bride’s name': 'Di samping nama mempelai wanita',
  'Choose photo': 'Pilih foto', 'or drag it here': 'atau seret ke sini', 'Replace': 'Ganti', 'Add photos': 'Tambah foto', 'or drag them here': 'atau seret ke sini',
  'Photo removed.': 'Foto dihapus.', 'Photo saved.': 'Foto tersimpan.', 'Gallery order saved.': 'Urutan galeri tersimpan.', 'Only JPG or PNG photos.': 'Hanya foto JPG atau PNG.',
  // Denied
  'Access denied': 'Akses ditolak', 'is for the platform admin only. You are signed in as an owner.': 'hanya untuk admin platform. Anda masuk sebagai pemilik.',
  'Go to my invitation': 'Ke undangan saya',
};
const MONTHS_ID = { May: 'Mei', Aug: 'Agu', Oct: 'Okt', Dec: 'Des' };
const idDate = (s) => s.replace(/\b(May|Aug|Oct|Dec)\b/g, (m) => MONTHS_ID[m]);
const w = (s) => ID[s] || s;
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const findCI = (s) => Object.keys(ID).find((k) => k.toLowerCase() === s.toLowerCase());
const PATTERNS = [
  [/^(\d+) guests in (\d+) groups$/, (m) => `${m[1]} tamu dalam ${m[2]} grup`],
  [/^(\d+) of (\d+) guests$/, (m) => `${m[1]} dari ${m[2]} tamu`],
  [/^(\d+) guests?$/, (m) => `${m[1]} tamu`],
  [/^Added (.+)$/, (m) => `Ditambahkan ${idDate(m[1])}`],
  [/^Sent on WhatsApp (.+)$/, (m) => `Terkirim via WhatsApp ${idDate(m[1])}`],
  [/^(.+) \((English|Indonesian)\)$/, (m) => `${w(m[1])} (${w(m[2])})`],
  [/^(English|Indonesian) — (.+)$/, (m) => `${w(m[1])} — ${w(m[2])}`],
  [/^Write the (.+) in (English|Indonesian)\.$/, (m) => `Isi ${lc(w(findCI(m[1]) || m[1]))} dalam bahasa ${w(m[2])}.`],
  [/^Write each text in (English|Indonesian)\.$/, (m) => `Tulis setiap teks dalam bahasa ${w(m[1])}.`],
  [/^Guests see the invitation in (English|Indonesian) only, with no language switch\.(?: Your (English|Indonesian) texts are kept in case you turn it back on\.)?$/,
    (m) => `Tamu melihat undangan hanya dalam bahasa ${w(m[1])}, tanpa pilihan ganti bahasa.${m[2] ? ` Teks bahasa ${w(m[2])} Anda tetap disimpan jika nanti diaktifkan lagi.` : ''}`],
  [/^No guest matches “(.*)”(?: in (.+))?\.$/, (m) => `Tidak ada tamu yang cocok dengan “${m[1]}”${m[2] ? ` di ${w(m[2])}` : ''}.`],
  [/^(\d+) guests? to send$/, (m) => `${m[1]} tamu akan dikirimi`],
  [/^(\d+) without a number \(add it in Attendees\)$/, (m) => `${m[1]} belum punya nomor (tambahkan di menu Tamu)`],
  [/^(\d+) already sent$/, (m) => `${m[1]} sudah dikirimi`],
  [/^Guest (\d+) of (\d+)$/, (m) => `Tamu ${m[1]} dari ${m[2]}`],
  [/^(\d+) of (\d+) invitations opened in WhatsApp\. Skipped guests stay unsent\.$/, (m) => `${m[1]} dari ${m[2]} undangan dibuka di WhatsApp. Tamu yang dilewati tetap belum dikirimi.`],
  [/^Theme for (.+) set to (.+)\.$/, (m) => `Tema untuk ${m[1]} diubah ke ${m[2]}.`],
  [/^(.+) can sign in again\.$/, (m) => `${m[1]} bisa masuk lagi.`],
  [/^(.+) is disabled\. Their invitation now shows “not found”\.$/, (m) => `${m[1]} dinonaktifkan. Undangan mereka sekarang menampilkan “tidak ditemukan”.`],
  [/^(.+) added\. Their personal link is copied\.$/, (m) => `${m[1]} ditambahkan. Tautan pribadinya sudah disalin.`],
  [/^(.+) added\. They can sign in with (.+)\.$/, (m) => `${m[1]} ditambahkan. Mereka bisa masuk dengan ${m[2]}.`],
  [/^Link for (.+) copied\.$/, (m) => `Tautan untuk ${m[1]} disalin.`],
  [/^(.+) removed\.$/, (m) => `${m[1]} dihapus.`],
  [/^(English|Indonesian) message saved\.$/, (m) => `Pesan bahasa ${w(m[1])} tersimpan.`],
  [/^WhatsApp opened for (.+) with the message ready\.$/, (m) => `WhatsApp dibuka untuk ${m[1]} dengan pesan siap kirim.`],
  [/^(Theme|Copy link|Edit|Remove) for (.+)$/, (m) => `${w(m[1])} untuk ${m[2]}`],
  [/^Shows as: (.+)$/, (m) => `Tampil sebagai: ${m[1]}`],
  [/^Opens a Google Maps search for “(.*)”\. Copy the link from Share and paste it here\.$/, (m) => `Membuka pencarian Google Maps untuk “${m[1]}”. Salin tautan dari Bagikan lalu tempel di sini.`],
  [/^Larger than (\d+) MB\. Choose a smaller photo\.$/, (m) => `Lebih dari ${m[1]} MB. Pilih foto yang lebih kecil.`],
  [/^Uploading… (\d+)%$/, (m) => `Mengunggah… ${m[1]}%`],
  [/^Only (\d+) photos fit in the gallery\. (\d+) not added\.$/, (m) => `Galeri maksimal ${m[1]} foto. ${m[2]} foto tidak ditambahkan.`],
  [/^Replace (.+)$/, (m) => `Ganti ${lc(w(m[1]))}`],
  [/^Remove photo (\d+)$/, (m) => `Hapus foto ${m[1]}`],
];
let uiLang = 'id';
try { uiLang = localStorage.getItem('adminLang') || 'id'; } catch (e) { /* storage blocked */ }
if (new URLSearchParams(location.search).get('ui') === 'en') uiLang = 'en';
function trText(s) {
  if (s in ID) return ID[s];
  for (const [re, fn] of PATTERNS) { const m = s.match(re); if (m) return fn(m); }
  // "A · B" lines: translate each part
  if (s.includes(' · ')) {
    const parts = s.split(' · ');
    const out = parts.map((p) => trText(p) ?? p);
    return out.some((p, i) => p !== parts[i]) ? out.join(' · ') : null;
  }
  return null;
}
const SKIP = 'textarea, script, style, [data-no-i18n], .pv, .wa-chat, .names';
const textMem = new WeakMap(); // node -> { en, shown }
const attrMem = new WeakMap(); // element -> { attr: { en, shown } }
function localize(s) {
  if (uiLang === 'en') return s;
  const core = s.trim();
  if (!core) return s;
  const t = trText(core);
  return t == null ? s : s.replace(core, t);
}
function translateAll(root = body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.parentElement && n.parentElement.closest(SKIP)) continue;
    const rec = textMem.get(n);
    const en = rec && rec.shown === n.nodeValue ? rec.en : n.nodeValue;
    const out = localize(en);
    if (out !== n.nodeValue) n.nodeValue = out;
    textMem.set(n, { en, shown: out });
  }
  $$('[placeholder], [aria-label], [title]', root).forEach((el) => {
    if (el.closest(SKIP)) return;
    const mem = attrMem.get(el) || {};
    ['placeholder', 'aria-label', 'title'].forEach((a) => {
      if (!el.hasAttribute(a)) return;
      const cur = el.getAttribute(a);
      const en = mem[a] && mem[a].shown === cur ? mem[a].en : cur;
      const out = localize(en);
      if (out !== cur) el.setAttribute(a, out);
      mem[a] = { en, shown: out };
    });
    attrMem.set(el, mem);
  });
}
const observer = new MutationObserver(() => {
  observer.disconnect();
  translateAll();
  observer.observe(body, { childList: true, subtree: true, characterData: true });
});
function setUiLang(lang) {
  uiLang = lang;
  try { localStorage.setItem('adminLang', lang); } catch (e) { /* storage blocked */ }
  document.documentElement.lang = lang;
  $$('[data-ui-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.uiLang === lang)));
  observer.disconnect();
  translateAll();
  observer.observe(body, { childList: true, subtree: true, characterData: true });
}
$$('[data-ui-lang]').forEach((b) => b.addEventListener('click', () => setUiLang(b.dataset.uiLang)));

renderTextPanels();
renderEvents();
renderParents();
if (new URLSearchParams(location.search).has('clean')) body.classList.add('clean');
window.addEventListener('hashchange', render);
render();
setUiLang(uiLang);
