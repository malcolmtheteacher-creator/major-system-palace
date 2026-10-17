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
  function viewHome() {
    setTitle('');
    const notes = Object.keys(loadNotes()).length;
    const wings = WINGS.map(w => {
      const built = DATA.filter(e => e.n >= w.from && e.n <= w.to).length;
      const total = w.to - w.from + 1;
      if (!built) return `<a class="wingcard locked" href="#/wing/${w.id}" aria-label="${esc(w.name)}, ${w.from} to ${w.to}, coming soon"><span class="range">${w.from}–${w.to}</span><span class="name">${esc(w.name)}</span><span class="meta"><span class="badge soon">Coming soon</span></span></a>`;
      return `<a class="wingcard" href="#/wing/${w.id}"><span class="range">${w.from}–${w.to}</span><span class="name">${esc(w.name)}</span><span class="meta">${built === total ? 'Open · ' + built + ' pegs' : '<span class="badge">Partly open</span> ' + built + ' of ' + total}</span></a>`;
    }).join('');
    $main.innerHTML = `
      <section class="hero">
        <div>
          <h1>The Major System <em>Memory Palace</em></h1>
          <p class="lead">A palace with a room for every ten numbers and a picture for every number. Each picture is a word whose consonant sounds spell out its digits, so <strong>137</strong> (t-m-k) is a <em>tomahawk</em>. Walk the halls, learn the pegs, and pin your own ideas to any number.</p>
          <div class="btnrow">
            <a class="btn gold" href="#/room/0">Enter the Vestibule (1–9)</a>
            <a class="btn ghost" href="#/how">How the Major System works</a>
            <a class="btn ghost" href="#/practice">Practise</a>
          </div>
          <p class="hint">${DATA.length} numbers open (1–${MAXN}) · ${notes} note${notes === 1 ? '' : 's'} saved in this browser</p>
        </div>
        <div class="hero-art" aria-hidden="true">${palaceSVG()}</div>
      </section>
      <h2>The palace <em>map</em></h2>
      <p class="lead">Each wing holds a hundred numbers and is named after a word that starts with that hundred's sound. Each wing has ten rooms of ten.</p>
      <div class="palace-map">${wings}
        <div class="wingcard locked tower"><span class="name">The Tower · 1000</span><span class="badge soon">Coming soon</span></div>
      </div>
      <div class="legend">
        <div class="panel"><h3>Wings → rooms → spots</h3><p>A wing is a hundred numbers (100–199 is the Tea Wing). A room is ten numbers, named after the peg for its first two digits: 130–139 is the Dome Room because 13 is a dome. A spot is one number with its picture, set somewhere around the room.</p></div>
        <div class="panel"><h3>Your notes</h3><p>Every number has a notebook. Anything you write is saved automatically, and a gold dot marks the number on the map. Type <code>#137</code> in a note to link to another number. Back up or move your notes from <a href="#/notes">My notes</a>.</p></div>
        <div class="panel"><h3>Keyboard</h3><p>On a number page, press <kbd>←</kbd>/<kbd>→</kbd> for the previous or next number and <kbd>Esc</kbd> to go back to the room. Press <kbd>/</kbd> anywhere to search.</p></div>
      </div>`;
  }

  function palaceSVG() {
    let cols = '';
    for (let i = 0; i < 7; i++) { const x = 70 + i * 43; cols += `<rect x="${x}" y="150" width="14" height="120" fill="#e9dfc8" opacity=".9"/>`; }
    let stars = '';
    for (let i = 0; i < 26; i++) stars += `<circle cx="${(i * 97) % 400}" cy="${(i * 53) % 110}" r="${i % 3 ? 1 : 1.8}" fill="#f3e2b0" opacity=".8"/>`;
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">${stars}
      <circle cx="320" cy="60" r="26" fill="#f3e2b0"/><circle cx="330" cy="54" r="24" fill="#244637"/>
      <rect x="40" y="270" width="320" height="30" fill="#c08a2d" opacity=".55"/>
      <polygon points="50,150 200,70 350,150" fill="#c08a2d"/><polygon points="80,145 200,85 320,145" fill="#1e3a2f"/>
      <text x="200" y="134" text-anchor="middle" font-family="Instrument Serif,Georgia" font-size="28" fill="#f3e2b0">0 1 2 3 4 5 6 7 8 9</text>
      <rect x="55" y="150" width="290" height="10" fill="#c08a2d"/>${cols}
      <rect x="178" y="200" width="44" height="70" rx="22" fill="#c08a2d" opacity=".9"/>
      <rect x="40" y="262" width="320" height="10" fill="#e9dfc8"/></svg>`;
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
