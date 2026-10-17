# The Major System Memory Palace

An interactive memory palace built on the **Major System**. Every number has a peg word whose consonant sounds spell out its digits, a picture of that word, a fixed spot in an imagined building, and a notebook where you can pin your own ideas.

**Live site:** https://malcolmhyndman.com/major-system-palace/

Phase 1 covers **1–300**. The data and layout are built to grow to 1000.

---

## The Major System in one minute

Each digit stands for a group of similar consonant **sounds**. Vowels and the letters w, h and y count for nothing, so you can put them anywhere to turn the sounds into a word you can picture.

| Digit | Sounds | Usual spellings | Memory hook |
|---|---|---|---|
| 0 | s, z | s, soft c (*city*), z | **z**ero starts with z |
| 1 | t, d (th) | t, d, th | t has one downstroke |
| 2 | n | n | n has two downstrokes |
| 3 | m | m | m has three downstrokes |
| 4 | r | r | fou**r** ends in r |
| 5 | l | l | L is the Roman numeral for 50 |
| 6 | sh, ch, j, zh | sh, ch, j, soft g (*gem*) | a script j curls like a 6 |
| 7 | k, g | k, hard c (*cat*), q, hard g (*goat*) | a K is two 7s back to back |
| 8 | f, v | f, v, ph | a script f has two loops, like an 8 |
| 9 | p, b | p, b | p is a mirrored 9 |

### Rules used in this palace

- **Sounds, not spelling.** *Action* is k-sh-n = 762. The c in *cat*, *city* and *cello* is 7, 0 and 6.
- **Silent letters don't count:** *comb* = k-m = 73, *knife* = n-f = 28.
- **Double letters count once** unless you hear them twice: *teddy* = 11, while *midday* = 311.
- **x is two sounds**, k + s: *taxi* = t-k-s = 170.
- **r is always sounded.** The system counts every r, even where a British accent drops it, so *car* = 74 and *winner* = 24.
- **ng is avoided.** Systems disagree on whether it means 2, 7 or 27, so no peg here uses it.
- **th = 1** (*thistle* = 105), used sparingly.

### Examples

| Number | Sounds | Peg |
|---|---|---|
| 7 | k | cow |
| 53 | l-m | lime |
| 101 | t-s-t | toast |
| 137 | t-m-k | tomahawk |
| 174 | t-g-r | tiger |
| 227 | n-n-k | neon cow |
| 285 | n-v-l | anvil |

## How the palace is organised

- **Wings = hundreds.** Each wing is named after a word that starts with its hundred's sound: Sun (1–99), Tea (100–199), Honey (200–299), Moon (300–399), then Rose, Lion, Chess, Cave, Fire and Bell, with the Tower for 1000. Wings that aren't built yet show as *Coming soon*.
- **Rooms = tens.** Each wing has ten rooms, named after the peg for the room's first two digits: 130–139 is the **Dome Room** because 13 is a dome. 1–9 is the **Vestibule**.
- **Spots = numbers.** Each room has ten spots set clockwise around the walls, starting bottom-left by the door, so walking the room gives the numbers in order.
- **Phrase pegs.** Where no good single word exists, a short phrase spells out exactly the right sounds. Some rooms share a theme to help: the **Neon room** (220–229) is *neon* (22) plus each single-digit peg, so 221 is a *neon tie* and 227 is a *neon cow*.

## Using the site

- **Move around:** Entrance → wing → room → number. Each number has its own link, e.g. `#/n/137`; `?n=137` works too.
- **On a number page:** you'll see the picture, the digit-to-sound breakdown, the peg word, other words that fit, previous and next links, and your notebook.
- **Keyboard:** <kbd>←</kbd>/<kbd>→</kbd> for the previous or next number, <kbd>Esc</kbd> to go back to the room, <kbd>/</kbd> to search.
- **Search:** by number, word, other word, description or the text of your own notes.
- **Practise:** three quiz modes (picture → number, number → word, word → number), for the whole palace, one wing or one room.
- **How it works:** the sound table, rules, examples and a short history.

### Notes

- Every number has a notebook. It saves as you type and a gold ✎ marks that number on the map.
- Type `#42` in any note to link to number 42. The number page lists **Links to** and **Linked from**.
- Notes are stored in your browser's **localStorage**, on this device only. Go to **My notes** to:
  - **Export** all notes as a JSON file (a backup, or to move them to another device).
  - **Import** a notes file. Existing notes are kept; if a note for the same number differs, the imported text is added underneath.
- Clearing your browser data deletes your notes, so export now and then.

## Building and updating

This is a plain static site with no build step: `index.html`, `css/`, `js/`, `data/numbers.json` and `img/`. It's hosted on GitHub Pages from `main`.

- `words.txt`: the source list (`number|peg|picture description|other words`).
- `tools/major.py`: Major System encoder based on the CMU Pronouncing Dictionary.
- `tools/build_data.py`: **checks every peg and other word against CMUdict** and fails if the sounds don't give exactly that number. It then writes `data/numbers.json` and sets `hasImage` from the files in `img/`.
- `tools/slice.py`: cuts a generated contact sheet into separate square WebP pictures.
- `tools/find.py`, `tools/find2.py`, `tools/combo.py`: helpers for finding candidate words and phrases.

```bash
python3 -m venv .venv && .venv/bin/pip install pronouncing wordfreq numpy pillow
.venv/bin/python tools/build_data.py
```

Each entry in `data/numbers.json` looks like this:

```json
{"n": 137, "digits": "137", "sounds": [{"digit":"1","sound":"t"}, {"digit":"3","sound":"m"}, {"digit":"7","sound":"k"}],
 "word": "tomahawk", "image": "img/0137.webp", "hasImage": true, "description": "a tomahawk axe",
 "alt": "...", "alternates": ["atomic"]}
```

`digits` is a string, so 00–99 and 000–099 pegs, which need leading zeros, can be added later as separate entries.

## Roadmap to 1000

1. **Phase 1 (now):** 1–300: words, pictures, palace layout, notes, search, practice.
2. **Phase 2:** 301–599 (Moon, Rose and Lion wings).
3. **Phase 3:** 600–999 (Chess, Cave, Fire and Bell wings).
4. **Phase 4:** 1000 (the Tower), then optional extras: 00–99 / 000–099 leading-zero pegs, PAO (person-action-object) layers, notes syncing between devices, and printable room cards.

## Credits and licences

- **CMU Pronouncing Dictionary** (Carnegie Mellon University) is used at build time to check pronunciations. *"Use of this dictionary for any research or commercial purpose is completely unrestricted."* Source: https://github.com/cmusphinx/cmudict
- **pronouncing** (Allison Parrish, BSD 3-Clause) is the Python wrapper for CMUdict, used at build time only.
- **wordfreq** (Robyn Speer, Apache-2.0; data CC BY-SA 4.0) was used at build time only to rank candidate words. None of its data is included here.
- The **peg list was chosen by hand** for this project. No third-party word list was copied: GPL-licensed and unlicensed lists were looked at but not used. See `research.md` for the sources and licences reviewed.
- **Pictures** were generated for this project in one storybook painterly style.
- **Fonts:** Instrument Serif and Inter (SIL Open Font Licence), served by Google Fonts.
- **History notes:** Pierre Hérigone (1634), Johann Just Winckelmann (1648), Aimé Paris (1825). See `research.md`.

© Malcolm Hyndman. Code is released under the MIT Licence (see `LICENSE`).
