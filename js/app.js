/* Major System Memory Palace – vanilla JS, hash routing, notes in localStorage. */
(function () {
  'use strict';
  const MAX_PLANNED = 1000;
  const NOTES_KEY = 'msp-notes-v1';
  const SOUND_TABLE = [
    ['0', 's, z', 'soft c (city), z', 'zero starts with z'],
    ['1', 't, d (th)', 't, d, th', 't and d have one downstroke'],
    ['2', 'n', 'n', 'n has two downstrokes'],
    ['3', 'm', 'm', 'm has three downstrokes'],
    ['4', 'r', 'r', 'four ends in r'],
    ['5', 'l', 'l', 'L is the Roman numeral for 50'],
    ['6', 'sh, ch, j, zh', 'sh, ch, j, soft g (gem)', 'a script j curls like a 6'],
    ['7', 'k, g', 'k, hard c (cat), q, hard g (goat)', 'a K is two 7s back to back'],
    ['8', 'f, v', 'f, v, ph', 'a script f has two loops like an 8'],
    ['9', 'p, b', 'p, b', 'p is a mirrored 9']
  ];
  // Wings are named after a word that begins with the wing's leading digit sound.
  const WINGS = [
    { id: 0, name: 'The Sun Wing', sound: 's (0)', from: 1, to: 99 },
    { id: 1, name: 'The Tea Wing', sound: 't (1)', from: 100, to: 199 },
    { id: 2, name: 'The Honey Wing', sound: 'n (2)', from: 200, to: 299 },
    { id: 3, name: 'The Moon Wing', sound: 'm (3)', from: 300, to: 399 },
    { id: 4, name: 'The Rose Wing', sound: 'r (4)', from: 400, to: 499 },
    { id: 5, name: 'The Lion Wing', sound: 'l (5)', from: 500, to: 599 },
    { id: 6, name: 'The Chess Wing', sound: 'ch (6)', from: 600, to: 699 },
    { id: 7, name: 'The Cave Wing', sound: 'k (7)', from: 700, to: 799 },
    { id: 8, name: 'The Fire Wing', sound: 'f (8)', from: 800, to: 899 },
    { id: 9, name: 'The Bell Wing', sound: 'b (9)', from: 900, to: 999 }
  ];
  let DATA = [], BY = new Map(), MAXN = 0;
  const $main = document.getElementById('main');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- notes ----------
  function loadNotes() { try { return JSON.parse(localStorage.getItem(NOTES_KEY)) || {}; } catch (e) { return {}; } }
  function saveNotes(obj) { localStorage.setItem(NOTES_KEY, JSON.stringify(obj)); }
  function getNote(n) { const x = loadNotes()[n]; return x ? x.text : ''; }
  function setNote(n, text) {
    const all = loadNotes();
    if (text.trim()) all[n] = { text, updated: new Date().toISOString() }; else delete all[n];
    saveNotes(all);
  }
  const hasNote = n => !!loadNotes()[n];

  // ---------- helpers ----------
  const wingOf = n => Math.floor(n / 100);
  const roomOf = n => Math.floor(n / 10);
  function roomName(r) {
    if (r === 0) return 'The Vestibule';
    const e = BY.get(r);
    return e ? 'The ' + cap(e.word) + ' Room' : 'Room ' + r * 10 + '–' + (r * 10 + 9);
  }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  function roomRange(r) { const a = Math.max(1, r * 10), b = r * 10 + 9; return a + '–' + b; }
  function hue(n) { return (n * 47) % 360; }
  function tile(e, big) {
    if (!e) return '<div class="tile"></div>';
    const ph = `<div class="ph${big ? ' big' : ''}" style="background:hsl(${hue(e.n)} 60% 86%)">${esc(e.word)}</div>`;
    if (!e.hasImage) return `<div class="tile" role="img" aria-label="${esc(e.alt)}">${ph}</div>`;
    return `<div class="tile" data-n="${e.n}"><img src="${e.image}" alt="${esc(e.alt)}" loading="lazy" decoding="async" width="512" height="512" onerror="mspPh(this)"></div>`;
  }
  // If a picture fails to load, fall back to the word tile.
  window.mspPh = function (img) {
    const e = BY.get(+img.parentNode.dataset.n); if (!e) return;
    const big = !!img.closest('.frame');
    img.parentNode.setAttribute('role', 'img'); img.parentNode.setAttribute('aria-label', e.alt);
    img.outerHTML = `<div class="ph${big ? ' big' : ''}" style="background:hsl(${hue(e.n)} 60% 86%)">${esc(e.word)}</div>`;
  };
  function setTitle(t) { document.title = (t ? t + ' · ' : '') + 'Major System Palace'; }
  function crumbs(parts) {
    return '<nav class="crumbs" aria-label="Breadcrumb">' + parts.map(p => p[1] ? `<a href="${p[1]}">${esc(p[0])}</a>` : `<span aria-current="page">${esc(p[0])}</span>`).join(' › ') + '</nav>';
  }
  function markNav(hash) {
    document.querySelectorAll('.topbar nav a').forEach(a => {
      const h = a.getAttribute('href');
      const on = h === '#/' ? (hash === '#/' || hash === '') : hash.startsWith(h);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  // ---------- views ----------
  // Peg pictures that hang in each open wing's archway (the word the wing is named after).
  const WING_ART = { 0: 202, 1: 179, 2: 264, 3: 32 };
  const WING_SOUND = ['s', 't', 'n', 'm', 'r', 'l', 'ch', 'k', 'f', 'b'];
  function viewHome() {
    setTitle('');
    const notes = Object.keys(loadNotes()).length;
    const arches = WINGS.map(w => {
      const built = DATA.filter(e => e.n >= w.from && e.n <= w.to).length;
      const total = w.to - w.from + 1;
      const sound = `<span class="arch-key" aria-hidden="true"><b>${w.id}</b>${WING_SOUND[w.id]}</span>`;
      if (!built) {
        return `<li class="is-locked"><a class="arch locked" href="#/wing/${w.id}" aria-label="${esc(w.name)}, ${w.from} to ${w.to}, closed, coming soon">
          <span class="arch-frame"><span class="arch-win"><span class="arch-door" aria-hidden="true"></span></span></span>
          <span class="arch-plaque">${sound}<span class="arch-range">${w.from}–${w.to}</span><span class="arch-name">${esc(w.name)}</span><span class="arch-meta">Closed · coming soon</span></span></a></li>`;
      }
      const art = BY.get(WING_ART[w.id]);
      const pic = art && art.hasImage
        ? `<img src="${art.image}" alt="" loading="lazy" decoding="async" width="512" height="512">`
        : `<span class="arch-glow" aria-hidden="true"></span>`;
      const meta = built === total ? `${built} pegs open` : `${built} of ${total} open`;
      return `<li><a class="arch open${built === total ? '' : ' partial'}" href="#/wing/${w.id}" aria-label="${esc(w.name)}, ${w.from} to ${w.to}, ${meta}">
        <span class="arch-frame"><span class="arch-win">${pic}</span></span>
        <span class="arch-plaque">${sound}<span class="arch-range">${w.from}–${w.to}</span><span class="arch-name">${esc(w.name)}</span><span class="arch-meta">${built === total ? meta : '<span class="badge">Partly open</span> ' + built + ' of ' + total}</span></span></a></li>`;
    }).join('');
    const frieze = SOUND_TABLE.map(r => `<li><b>${r[0]}</b><span>${esc(r[1].replace(' (th)', ''))}</span></li>`).join('');
    $main.innerHTML = `
      <section class="ent-hero" aria-labelledby="entTitle">
        <picture class="ent-hero-img">
          <source media="(max-width: 640px)" srcset="img/ui/entrance-mobile.webp" width="720" height="800">
          <img src="img/ui/entrance-1280.webp" srcset="img/ui/entrance-960.webp 960w, img/ui/entrance-1280.webp 1280w" sizes="100vw" width="1280" height="720" fetchpriority="high" decoding="async" alt="A painted palace at dusk, its windows lit, with steps rising through a lantern-lit garden to an open, glowing doorway.">
        </picture>
        <div class="ent-hero-inner">
          <p class="ent-eyebrow">A memory palace for numbers</p>
          <h1 id="entTitle">The Major System <em>Memory Palace</em></h1>
          <p class="ent-lead">A room for every ten numbers and a picture for every number. Each picture is a word whose consonant sounds spell out its digits, so <strong>137</strong> (t-m-k) is a <em>tomahawk</em>. Walk the halls, learn the pegs, and pin your own ideas to any number.</p>
          <div class="ent-doors">
            <a class="ent-door primary" href="#/room/0"><span class="k">Enter</span><span class="t">The Vestibule · 1–9</span></a>
            <a class="ent-door" href="#/how"><span class="k">Learn</span><span class="t">How the Major System works</span></a>
            <a class="ent-door" href="#/practice"><span class="k">Train</span><span class="t">Practise</span></a>
          </div>
          <p class="hint ent-stats">${DATA.length} numbers open (1–${MAXN}) · ${notes} note${notes === 1 ? '' : 's'} saved in this browser</p>
        </div>
      </section>
      <div class="ent-frieze-band">
        <div class="ent-wrap">
          <a class="ent-frieze-link" href="#/how" aria-label="The ten digit sounds: 0 s or z, 1 t or d, 2 n, 3 m, 4 r, 5 l, 6 sh, ch or j, 7 k or g, 8 f or v, 9 p or b. Read how it works."><ol class="ent-frieze" aria-hidden="true">${frieze}</ol></a>
        </div>
      </div>
      <div class="ent-wrap">
        <section class="ent-plan" aria-labelledby="planTitle">
          <p class="ent-eyebrow dark">The palace plan</p>
          <h2 id="planTitle">Ten wings, one for every <em>hundred</em></h2>
          <p class="lead">Each wing is named after a word that starts with its hundred's sound, and holds ten rooms of ten. Step through an open archway, or peek at the doors still being built.</p>
          <ol class="ent-arcade">${arches}</ol>
          <div class="ent-tower">
            <svg viewBox="0 0 60 96" width="44" height="70" aria-hidden="true"><path d="M14 92V30h-4V16h6v6h6v-6h6v6h4v-6h6v6h6v-6h6v14h-4v62z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 92V74a6 6 0 0 1 12 0v18M27 44h6v10h-6z" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>
            <div><span class="arch-range">1000</span><span class="arch-name">The Tower</span><span class="arch-meta">Closed · coming soon</span></div>
          </div>
        </section>
      </div>
      <section class="ent-guide" aria-label="How the palace works">
        <div class="ent-wrap ent-guide-grid">
          <div><span class="ent-num" aria-hidden="true">I</span><h3>Wings → rooms → spots</h3><p>A wing is a hundred numbers (100–199 is the Tea Wing). A room is ten numbers, named after the peg for its first two digits: 130–139 is the Dome Room because 13 is a dome. A spot is one number with its picture, set somewhere around the room.</p></div>
          <div><span class="ent-num" aria-hidden="true">II</span><h3>Your notes</h3><p>Every number has a notebook. Anything you write is saved automatically, and a gold dot marks the number on the map. Type <code>#137</code> in a note to link to another number. Back up or move your notes from <a href="#/notes">My notes</a>.</p></div>
          <div><span class="ent-num" aria-hidden="true">III</span><h3>Keyboard</h3><p>On a number page, press <kbd>←</kbd>/<kbd>→</kbd> for the previous or next number and <kbd>Esc</kbd> to go back to the room. Press <kbd>/</kbd> anywhere to search.</p></div>
        </div>
      </section>`;
  }

  function viewWing(id) {
    const w = WINGS[id];
    if (!w) return viewNotFound();
    setTitle(w.name);
    const built = DATA.filter(e => e.n >= w.from && e.n <= w.to);
    let doors = '';
    for (let t = 0; t < 10; t++) {
      const r = id * 10 + t;
      const inRoom = built.filter(e => roomOf(e.n) === r);
      if (!inRoom.length) { doors += `<div class="door locked" aria-hidden="true"><span class="range">${roomRange(r)}</span><span class="rname">Locked</span><span class="rmeta">Coming soon</span></div>`; continue; }
      const nNotes = inRoom.filter(e => hasNote(e.n)).length;
      doors += `<a class="door" href="#/room/${r}"><span class="range">${roomRange(r)}</span><span class="rname">${esc(roomName(r))}</span>
        <span class="thumbs">${inRoom.slice(0, 3).map(e => tile(e)).join('')}</span>
        <span class="rmeta">${inRoom.length} spot${inRoom.length > 1 ? 's' : ''}${nNotes ? ' · ' + nNotes + ' note' + (nNotes > 1 ? 's' : '') : ''}</span></a>`;
    }
    const prev = WINGS[id - 1], next = WINGS[id + 1];
    $main.innerHTML = crumbs([['Entrance', '#/'], [w.name]]) + `
      <h1>${esc(w.name)} <em>${w.from}–${w.to}</em></h1>
      <p class="lead">${built.length ? `Every number in this wing ${id === 0 ? 'has one or two digits' : 'starts with the sound <strong>' + esc(w.sound) + '</strong>'}. Choose a door.` : 'This wing is still being built. Its rooms will open in a later phase, on the way to 1000.'}</p>
      <div class="corridor">${doors}</div>
      <div class="roomnav">${prev ? `<a class="btn ghost" href="#/wing/${prev.id}">← ${esc(prev.name)}</a>` : '<span></span>'}${next ? `<a class="btn ghost" href="#/wing/${next.id}">${esc(next.name)} →</a>` : ''}</div>`;
  }

  // Positions of the ten spots around the room (4×4 grid perimeter, door at the bottom centre).
  const SPOTS = [[4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [3, 4], [4, 4]];
  function viewRoom(r) {
    const first = r * 10;
    const entries = [];
    for (let k = 0; k < 10; k++) entries.push(BY.get(first + k));
    if (!entries.some(Boolean)) return viewLocked('Room ' + roomRange(r));
    const w = WINGS[wingOf(first)];
    setTitle(roomName(r));
    const spots = entries.map((e, k) => {
      const [row, col] = SPOTS[k];
      const style = `grid-row:${row};grid-column:${col}`;
      if (!e) return `<div class="locus empty" style="${style}">${first + k === 0 ? 'No zero here' : 'Coming soon'}</div>`;
      return `<a class="locus" style="${style}" href="#/n/${e.n}" aria-label="${e.n}: ${esc(e.word)}${hasNote(e.n) ? ' (has a note)' : ''}">
        <span class="num">${e.n}</span>${hasNote(e.n) ? '<span class="notedot" aria-hidden="true">✎</span>' : ''}${tile(e)}<span class="w">${esc(e.word)}</span></a>`;
    }).join('');
    const prevR = BY.has(first - 1) ? r - 1 : null, nextR = BY.has(first + 10) ? r + 1 : null;
    const peg = r === 0 ? 'Single digits, one sound each.' : `Named after <strong>${r}</strong> = <em>${esc(BY.get(r) ? BY.get(r).word : '')}</em>. Every number here starts with ${digitsSound(String(r))}.`;
    $main.innerHTML = crumbs([['Entrance', '#/'], [w.name, '#/wing/' + w.id], [roomName(r)]]) + `
      <div class="room" role="region" aria-label="${esc(roomName(r))}">${spots}
        <div class="rug"><p>${roomRange(r)}</p><h1>${esc(roomName(r))}</h1><p>${peg}</p></div>
        <div class="doorway"><a href="#/wing/${w.id}">↩ Back to the ${esc(w.name.replace(/^The /, ''))}</a></div>
      </div>
      <p class="hint">Walk clockwise from the bottom-left spot: ${roomRange(r)}. Choose a picture to open it.</p>
      <div class="roomnav">${prevR !== null ? `<a class="btn ghost" href="#/room/${prevR}">← ${esc(roomName(prevR))}</a>` : '<span></span>'}${nextR !== null ? `<a class="btn ghost" href="#/room/${nextR}">${esc(roomName(nextR))} →</a>` : ''}</div>`;
  }
  function digitsSound(ds) {
    return ds.split('').map(d => `<strong>${SOUND_TABLE[+d][1].split(' (')[0].split(',')[0]}</strong>`).join('-');
  }

  function viewNumber(n) {
    const e = BY.get(n);
    if (!e) return viewLocked('Number ' + n);
    const r = roomOf(n), w = WINGS[wingOf(n)];
    setTitle(n + ' · ' + e.word);
    const chips = e.sounds.map(s => `<li class="chip" style="background:var(--d${s.digit})"><b>${s.digit}</b><span>${esc(s.sound)}</span></li>`).join('');
    const prev = BY.get(n - 1), next = BY.get(n + 1);
    $main.innerHTML = crumbs([['Entrance', '#/'], [w.name, '#/wing/' + w.id], [roomName(r), '#/room/' + r], [String(n)]]) + `
      <article class="entry">
        <div class="frame">${tile(e, true)}</div>
        <div>
          <p class="bignum" id="h-num">${n}</p>
          <h1 class="word">${esc(e.word)}</h1>
          <ul class="breakdown" aria-label="Digit to sound breakdown">${chips}</ul>
          <p>${esc(cap(e.description))}.</p>
          ${e.alternates.length ? `<p class="alts"><strong>Other words for ${n}:</strong> ${e.alternates.map(esc).join(', ')}</p>` : ''}
          <div class="pager">
            ${prev ? `<a class="btn ghost" href="#/n/${prev.n}" rel="prev">← ${prev.n} ${esc(prev.word)}</a>` : '<span></span>'}
            <a class="btn ghost" href="#/room/${r}">↑ ${esc(roomName(r))}</a>
            ${next ? `<a class="btn ghost" href="#/n/${next.n}" rel="next">${next.n} ${esc(next.word)} →</a>` : '<span></span>'}
          </div>
          <section class="notes">
            <label for="note">Your notes for ${n}</label>
            <textarea id="note" placeholder="Link ideas to ${n}: a date, a fact, a story… Type #42 to link another number."></textarea>
            <div class="status" id="noteStatus" aria-live="polite"></div>
            <div class="links" id="noteLinks"></div>
          </section>
        </div>
      </article>`;
    const ta = document.getElementById('note'), st = document.getElementById('noteStatus');
    ta.value = getNote(n);
    renderLinks(ta.value, n);
    let timer;
    ta.addEventListener('input', () => {
      st.textContent = 'Saving…';
      clearTimeout(timer);
      timer = setTimeout(() => { setNote(n, ta.value); st.textContent = 'Saved in this browser · ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); renderLinks(ta.value, n); }, 400);
    });
    ta.addEventListener('blur', () => { clearTimeout(timer); setNote(n, ta.value); renderLinks(ta.value, n); });
  }
  function renderLinks(text, self) {
    const el = document.getElementById('noteLinks'); if (!el) return;
    const nums = [...new Set((text.match(/#(\d{1,4})\b/g) || []).map(x => +x.slice(1)))].filter(x => x !== self && x >= 1 && x <= MAX_PLANNED);
    const back = Object.entries(loadNotes()).filter(([k, v]) => +k !== self && new RegExp('#' + self + '\\b').test(v.text)).map(([k]) => +k);
    let html = '';
    if (nums.length) html += 'Links to: ' + nums.map(x => `<a href="#/n/${x}">${x}${BY.get(x) ? ' ' + esc(BY.get(x).word) : ''}</a>`).join('');
    if (back.length) html += (html ? '<br>' : '') + 'Linked from: ' + back.map(x => `<a href="#/n/${x}">${x}${BY.get(x) ? ' ' + esc(BY.get(x).word) : ''}</a>`).join('');
    el.innerHTML = html;
  }

  function viewLocked(label) {
    setTitle('Coming soon');
    $main.innerHTML = crumbs([['Entrance', '#/'], [label]]) + `<h1>${esc(label)} <em>is still being built</em></h1>
      <p class="lead">Phase 1 of the palace covers 1–${MAXN}. The rest of the wings, on the way to 1000, will open in later phases.</p>
      <div class="btnrow"><a class="btn" href="#/">Back to the entrance</a></div>`;
  }
  function viewNotFound() { setTitle('Not found'); $main.innerHTML = `<h1>That corridor <em>doesn't exist</em></h1><p><a href="#/">Back to the entrance</a></p>`; }

  function viewHow() {
    setTitle('How the Major System works');
    const rows = SOUND_TABLE.map(r => `<tr><td class="dg" style="background:var(--d${r[0]})">${r[0]}</td><td><strong>${r[1]}</strong></td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('');
    const ex = [137, 53, 101, 285, 4, 174].filter(n => BY.has(n)).map(n => { const e = BY.get(n); return `<li><strong>${n}</strong> → ${e.sounds.map(s => s.sound).join('-')} → <a href="#/n/${n}">${esc(e.word)}</a></li>`; }).join('');
    $main.innerHTML = crumbs([['Entrance', '#/'], ['How it works']]) + `<div class="prose">
      <h1>How the Major System <em>works</em></h1>
      <p class="lead">Numbers are hard to picture, but words aren't. The Major System gives every digit a consonant <em>sound</em>. Put vowels around those sounds to make a word, picture the word, and you have the number back.</p>
      </div>
      <table class="sounds"><thead><tr><th>Digit</th><th>Sounds</th><th>Usual spellings</th><th>Memory hook</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="prose">
      <h2>The rules</h2>
      <ul>
        <li><strong>Sounds, not letters.</strong> <em>Action</em> is k-sh-n (762), not k-t-n. The c in <em>cat</em>, <em>city</em> and <em>cello</em> is 7, 0 and 6.</li>
        <li><strong>Vowels, w, h and y are free.</strong> Add them anywhere without changing the number: <em>hen</em> and <em>Noah</em> are both 2.</li>
        <li><strong>Silent letters don't count.</strong> <em>Comb</em> is k-m (73); <em>knife</em> is n-f (28).</li>
        <li><strong>Double letters count once</strong> unless you hear them twice: <em>teddy</em> is 11, while <em>midday</em> is 311.</li>
        <li><strong>x is two sounds:</strong> k-s (70) in <em>taxi</em> becomes 170.</li>
        <li><strong>r is always sounded.</strong> The system counts every r, even where a British accent drops it, so <em>car</em> is 74 and <em>winner</em> is 24.</li>
        <li><strong>ng is avoided.</strong> Systems disagree about whether it's 2, 7 or 27, so no word in this palace uses it.</li>
        <li><strong>th counts as 1</strong> (as in <em>thistle</em>, 105), though it's used sparingly here.</li>
      </ul>
      <h2>Examples from the palace</h2><ul>${ex}</ul>
      <h2>Why a palace?</h2>
      <p>Memory champions put their peg pictures in imagined buildings: the <em>method of loci</em>. Once each number has a fixed spot, you can find it straight away without counting up from 1. Here every hundred is a wing, every ten is a room, and every number has its own spot in that room. Walk a room clockwise from the door and the numbers come in order.</p>
      <h2>Phrases as pegs</h2>
      <p>Some numbers have no good single word, so they get a short phrase that sounds out exactly the right consonants. Some rooms share a theme to make this easier: in the Neon room (220–229), each number is <em>neon</em> (22) plus the single-digit peg, so 227 is a <em>neon cow</em>.</p>
      <h2>A short history</h2>
      <p>Pierre Hérigone published the first system that turned digits into letters in 1634. Johann Just Winckelmann (writing as "Stanislaus Mink von Wennsshein") added vowels to make words in 1648. Aimé Paris gave it its modern form in 1825, and Harry Lorayne made it famous in the 20th century. Dominic O'Brien's <em>Dominic System</em> and the <em>PAO</em> (person-action-object) method are popular alternatives used in memory competitions.</p>
      <div class="btnrow"><a class="btn gold" href="#/room/0">Start in the Vestibule</a><a class="btn ghost" href="#/practice">Test yourself</a></div>
      </div>`;
  }

  function viewSearch(q) {
    setTitle('Search');
    const s = q.trim().toLowerCase();
    let hits = [];
    if (/^\d+$/.test(s)) {
      const n = +s;
      if (BY.has(n)) { location.hash = '#/n/' + n; return; }
      hits = DATA.filter(e => String(e.n).includes(s));
    } else if (s) {
      hits = DATA.filter(e => e.word.toLowerCase().includes(s) || e.alternates.some(a => a.toLowerCase().includes(s)) || e.description.toLowerCase().includes(s) || getNote(e.n).toLowerCase().includes(s));
    }
    $main.innerHTML = crumbs([['Entrance', '#/'], ['Search']]) + `<h1>Search <em>${esc(q)}</em></h1>
      <p class="lead">${hits.length ? hits.length + ' match' + (hits.length > 1 ? 'es' : '') + ' in words, other words, descriptions and your notes.' : 'Nothing matched. Try a number from 1 to ' + MAXN + ' or a word such as “cake”.'}</p>
      <ul class="results">${hits.slice(0, 120).map(e => `<li><a href="#/n/${e.n}">${tile(e)}<span class="cap"><b>${e.n}</b><span>${esc(e.word)}</span></span></a></li>`).join('')}</ul>`;
  }

  function viewNotes() {
    setTitle('My notes');
    const all = loadNotes();
    const keys = Object.keys(all).map(Number).sort((a, b) => a - b);
    $main.innerHTML = crumbs([['Entrance', '#/'], ['My notes']]) + `<h1>My <em>notes</em></h1>
      <p class="lead">Your notes are saved in this browser on this device (localStorage). Export them now and then as a backup, or to move them to another device.</p>
      <div class="btnrow">
        <button class="btn gold" id="exp" ${keys.length ? '' : 'disabled'}>Export notes (JSON)</button>
        <label class="btn ghost" for="imp" tabindex="0" id="impLabel">Import notes…</label><input type="file" id="imp" accept="application/json,.json" class="sr">
      </div>
      <p class="status" id="impStatus" aria-live="polite"></p>
      ${keys.length ? `<ul class="notelist">${keys.map(k => `<li><div class="nl-head"><a href="#/n/${k}"><strong>${k}</strong> ${BY.get(k) ? esc(BY.get(k).word) : ''}</a><span class="hint">${all[k].updated ? new Date(all[k].updated).toLocaleString('en-GB') : ''}</span></div><pre>${esc(all[k].text)}</pre></li>`).join('')}</ul>` : '<p>No notes yet. Open any number and start typing in its notebook.</p>'}`;
    const exp = document.getElementById('exp');
    exp && exp.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify({ app: 'major-system-palace', version: 1, exported: new Date().toISOString(), notes: loadNotes() }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'major-palace-notes-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove();
    });
    const imp = document.getElementById('imp');
    document.getElementById('impLabel').addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); imp.click(); } });
    imp.addEventListener('change', () => {
      const f = imp.files[0]; if (!f) return;
      f.text().then(t => {
        const j = JSON.parse(t); const incoming = j.notes || j; const cur = loadNotes(); let c = 0;
        Object.entries(incoming).forEach(([k, v]) => {
          const n = +k; if (!(n >= 1 && n <= MAX_PLANNED)) return;
          const text = typeof v === 'string' ? v : v && v.text; if (!text) return;
          if (cur[n] && cur[n].text !== text && !cur[n].text.includes(text)) cur[n] = { text: cur[n].text + '\n\n— imported —\n' + text, updated: new Date().toISOString() };
          else if (!cur[n]) cur[n] = { text, updated: (v && v.updated) || new Date().toISOString() };
          c++;
        });
        saveNotes(cur); viewNotes(); document.getElementById('impStatus').textContent = 'Imported ' + c + ' note' + (c === 1 ? '' : 's') + '. Existing notes were kept, and any differing text was added below them.';
      }).catch(() => { document.getElementById('impStatus').textContent = 'That file could not be read. Please choose a notes file exported from this site.'; });
    });
  }

  // ---------- practice ----------
  let quiz = { mode: 'img', range: 'all', cur: null, right: 0, total: 0 };
  function viewPractice() {
    setTitle('Practise');
    const withImg = DATA.filter(e => e.hasImage).length;
    $main.innerHTML = crumbs([['Entrance', '#/'], ['Practise']]) + `<div class="quiz">
      <h1>Practise <em>the pegs</em></h1>
      <div class="seg" role="group" aria-label="Quiz type">
        <button data-m="img" aria-pressed="${quiz.mode === 'img'}">Picture → number</button>
        <button data-m="word" aria-pressed="${quiz.mode === 'word'}">Number → word</button>
        <button data-m="dec" aria-pressed="${quiz.mode === 'dec'}">Word → number</button>
      </div>
      <p><label>Range: <select id="rng">
        <option value="all">All open numbers</option><option value="0">1–99</option><option value="1">100–199</option><option value="2">200–${Math.min(299, MAXN)}</option>
        ${[...Array(Math.ceil(MAXN / 10)).keys()].map(r => `<option value="r${r}">${roomRange(r)}</option>`).join('')}
      </select></label></p>
      <div id="qbox"></div>
      <p class="score" id="score"></p>
      ${quiz.mode === 'img' && !withImg ? '<p class="hint">No pictures yet, so this mode shows the word tile instead. Try "Word → number".</p>' : ''}
      </div>`;
    document.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => { quiz.mode = b.dataset.m; viewPractice(); }));
    const rng = document.getElementById('rng'); rng.value = quiz.range;
    rng.addEventListener('change', () => { quiz.range = rng.value; nextQ(); });
    nextQ();
  }
  function pool() {
    let p = DATA;
    if (/^\d$/.test(quiz.range)) p = DATA.filter(e => wingOf(e.n) === +quiz.range);
    else if (quiz.range[0] === 'r') p = DATA.filter(e => roomOf(e.n) === +quiz.range.slice(1));
    if (quiz.mode === 'img' && p.some(e => e.hasImage)) p = p.filter(e => e.hasImage);
    return p;
  }
  function nextQ() {
    const p = pool(); const e = p[Math.floor(Math.random() * p.length)]; quiz.cur = e;
    const box = document.getElementById('qbox'); if (!box || !e) return;
    let prompt, label;
    if (quiz.mode === 'img') { prompt = e.hasImage ? `<div class="tile"><img src="${e.image}" alt="A peg picture. What number is it?" width="512" height="512"></div>` : tile(e, true); label = 'Which number?'; }
    else if (quiz.mode === 'word') { prompt = `<div class="q-num">${e.n}</div>`; label = 'Which word?'; }
    else { prompt = `<div class="word">${esc(e.word)}</div>`; label = 'Which number?'; }
    box.innerHTML = `${prompt}<form id="qf"><p><label for="ans">${label}</label><br><input id="ans" autocomplete="off" ${quiz.mode !== 'word' ? 'inputmode="numeric"' : ''}></p>
      <div class="btnrow" style="justify-content:center"><button class="btn" type="submit">Check</button><button class="btn ghost" type="button" id="reveal">Show me</button><button class="btn ghost" type="button" id="skip">Next →</button></div></form>
      <p class="feedback" id="fb" aria-live="polite"></p>`;
    const ans = document.getElementById('ans'); ans.focus();
    document.getElementById('qf').addEventListener('submit', ev => { ev.preventDefault(); check(ans.value); });
    document.getElementById('reveal').addEventListener('click', () => show(false, true));
    document.getElementById('skip').addEventListener('click', nextQ);
    score();
  }
  function check(v) {
    const e = quiz.cur; v = v.trim().toLowerCase();
    let ok;
    if (quiz.mode === 'word') ok = [e.word, ...e.alternates].some(w => w.toLowerCase() === v);
    else ok = +v === e.n;
    quiz.total++; if (ok) quiz.right++;
    show(ok, false);
  }
  function show(ok, revealed) {
    const e = quiz.cur, fb = document.getElementById('fb');
    fb.className = 'feedback ' + (ok ? 'ok' : 'no');
    const ans = `${e.n} = ${e.sounds.map(s => s.sound).join('-')} = <a href="#/n/${e.n}">${esc(e.word)}</a>`;
    fb.innerHTML = (revealed ? '' : ok ? 'Correct! ' : 'Not quite. ') + ans;
    score();
    if (ok) setTimeout(() => { if (quiz.cur === e) nextQ(); }, 1400);
  }
  function score() { const s = document.getElementById('score'); if (s) s.textContent = quiz.total ? `Score: ${quiz.right} / ${quiz.total}` : ''; }

  // ---------- router ----------
  function route() {
    const h = location.hash || '#/';
    markNav(h);
    $main.classList.toggle('is-home', h === '#/' || h === '#');
    let m;
    if (h === '#/' || h === '#') viewHome();
    else if ((m = h.match(/^#\/n\/(\d+)$/))) viewNumber(+m[1]);
    else if ((m = h.match(/^#\/room\/(\d+)$/))) viewRoom(+m[1]);
    else if ((m = h.match(/^#\/wing\/(\d+)$/))) viewWing(+m[1]);
    else if (h === '#/how') viewHow();
    else if (h === '#/notes') viewNotes();
    else if (h === '#/practice') viewPractice();
    else if ((m = h.match(/^#\/search\/(.*)$/))) viewSearch(decodeURIComponent(m[1]));
    else viewNotFound();
    window.scrollTo(0, 0);
    const h1 = $main.querySelector('h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }
  document.getElementById('searchForm').addEventListener('submit', ev => {
    ev.preventDefault(); const q = document.getElementById('q').value.trim(); if (q) location.hash = '#/search/' + encodeURIComponent(q);
  });
  document.addEventListener('keydown', ev => {
    const t = ev.target, typing = /INPUT|TEXTAREA|SELECT/.test(t.tagName);
    if (ev.key === '/' && !typing) { ev.preventDefault(); document.getElementById('q').focus(); return; }
    if (typing || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    const m = (location.hash || '').match(/^#\/n\/(\d+)$/);
    if (!m) return;
    const n = +m[1];
    if (ev.key === 'ArrowRight' && BY.has(n + 1)) location.hash = '#/n/' + (n + 1);
    else if (ev.key === 'ArrowLeft' && BY.has(n - 1)) location.hash = '#/n/' + (n - 1);
    else if (ev.key === 'Escape') location.hash = '#/room/' + roomOf(n);
  });
  // Support ?n=137 links too.
  const qn = new URLSearchParams(location.search).get('n');
  if (qn && /^\d+$/.test(qn) && !location.hash) location.hash = '#/n/' + qn;

  fetch('data/numbers.json').then(r => r.json()).then(j => {
    DATA = j.numbers; DATA.forEach(e => BY.set(e.n, e)); MAXN = Math.max(...DATA.map(e => e.n));
    window.addEventListener('hashchange', route); route();
  }).catch(() => { $main.innerHTML = '<h1>The palace doors are stuck</h1><p>The number data could not be loaded. Please refresh the page.</p>'; });
})();
