# Major System palace – research notes

Compiled 17 October 2026 for the Major System Memory Palace project.

## 1. How the Major System works

- Each digit maps to a group of consonant **sounds** (not letters); vowels, the semivowels /w/ and /j/ (y), and /h/ are ignored and act as free "filler". [W]
- Standard mapping [W]:
  | Digit | Sounds | Typical spellings | Common memory hook |
  |---|---|---|---|
  | 0 | /s/ /z/ | s, soft c, z | **z**ero |
  | 1 | /t/ /d/ (often also /θ/ /ð/) | t, d, th | t has one downstroke |
  | 2 | /n/ | n | n has two downstrokes |
  | 3 | /m/ | m | m has three downstrokes |
  | 4 | /r/ | r | fou**r** ends in r |
  | 5 | /l/ | l | L = Roman 50; thumb + finger make an L |
  | 6 | /ʃ/ /ʒ/ /tʃ/ /dʒ/ | sh, ch, j, soft g | script j / G looks like 6 |
  | 7 | /k/ /g/ | k, hard c, q, hard g | K is two 7s back to back |
  | 8 | /f/ /v/ | f, v, ph | script f looks like 8 |
  | 9 | /p/ /b/ | p, b | p is a mirrored 9 |
- **Sound, not spelling**: "action" = 762 (k-sh-n), not 712. The c in call/cell/cello is 7/0/6. [W]
- **Doubled letters** count once unless pronounced twice: muddy = 31, midday = 311, accept = 7091. [W]
- **Silent letters** don't count (knee = 2, lamb = 53, comb = 73). [W]
- **x** = 70 when /ks/ or /gz/ (fax, exam); 76 when /kʃ/ (anxious). z in pizza (/ts/) = 10. **gh** depends on sound (ghost 701, enough 28). [W]
- A **rhotic accent** is usually assumed (fear = 84). That matters for British speakers, where a final r isn't sounded. [W]
- **ng (/ŋ/)** is the one disputed sound: different systems treat it as 2, 7 or 27 ("ring" = 42/47/427). [W] **Decision for this project:** avoid /ŋ/ words altogether so nobody has to learn a convention.
- **th**: most modern systems put /θ/ /ð/ under 1. [W] Allowed, but used sparingly.

## 2. History (checked)

- **Pierre Hérigone** published the earliest digit-to-letter system in *Cursus mathematicus* (1634). [W]
- **Johann Just Winckelmann** (pseudonym Stanislaus Mink von Wennsshein/Weunßhein), *Relatio novissima ex Parnasso de arte reminiscentiae* (1648), turned digits into consonants and added vowels to make words. His code differs from the modern one (e.g. 1 = B/P, 0 = D/T). [WW][WS][G]
- **Richard Grey** (1730) used both consonants and vowels; **Gregor von Feinaigle** (1808) went consonant-only but swapped 8 and 9. [W]
- **Aimé Paris**, *Exposition et pratique des procédés mnémoniques* (1825), is the first known version in its modern form (1 T/D, 2 N, 3 M, 4 R, 5 L, 6 CH/J, 7 K/G, 8 F/V, 9 P/B, 0 S/Z). [W][WS-B]
- **Francis Fauvel Gouraud** spread it in English with *Phreno-Mnemotechny* (1845). It was later popularised by Loisette (1880s), the Pelman Institute, Bruno Fürst, and **Harry Lorayne** (*The Memory Book*, 1974, with Jerry Lucas). [W]
- The name "Major" may come from Major Bartłomiej Beniowski (1845), but that is uncertain, so the site says "possibly". [W]
- A related idea from India, the Katapayadi system, goes back to at least the 7th century. [W]

## 3. Peg lists and palaces

- Practitioners learn a fixed image for every 1- and 2-digit number (00–99), and advanced mnemonists extend this to all 000–999. Each extra digit means ten times more images to learn. [W][MM]
- **Leading zeros:** in a 000–999 system, 7, 07 and 007 are different pegs (e.g. 7 = cow, 07 = sky, 007 = sock). [AoM-DB][MD] Some lists simply reuse the 2-digit word for 000–099. [MD]
  **Decision:** phase 1 covers the integers 1–300, so each number has one peg built from its digits as written (7 = k, 17 = t-k, 107 = t-s-k). `digits` is stored as a string in the data so 00–99 and 000–099 pegs could be added later as separate entries.
- **Method of loci + Major:** pegs go in a mind palace, with a fixed spot for each image. Alex Mullen (3× World Memory Champion) uses a 3-digit Major list of about one-third people and two-thirds objects, puts two images at each spot, and has about 3,000 spots across 80 palaces with about 5 spots per room. [MM] That's why this site uses wings → rooms → spots, with 10 spots per room.
- **Choosing good words:** concrete nouns that are distinctive to several senses (e.g. lime for 53) and things that move work best. [W] Avoid plurals that clash with shorter pegs (e.g. "laces" for 500 when 50 is "lace"). [HN]

## 4. Dominic System and PAO

- **Dominic System** (Dominic O'Brien, eight-time World Memory Champion): digits become **letters**, not sounds: 1 A, 2 B, 3 C, 4 D, 5 E, 6 S, 7 G, 8 H, 9 N, 0 O. Each pair of digits is a person's initials (e.g. 15 = AE = Albert Einstein), and each person has an action. It's a Person-Action system that stores 4 digits per image. [AoM-D][WD][WMC]
- **PAO** (Person-Action-Object): each 00–99 number gets a person, an action and an object; 6 digits make one compound image per spot (e.g. 15-16-33 = Einstein → lifting → cane). The images can come from the Major System, Dominic or anything else. [AoM-PAO][WMC]
- **For this site:** phase 1 stores one object image per number. The data model leaves room for later `person` and `action` fields (PAO) without changing the layout.

## 5. Existing open-source tools and word lists (licences)

| Project | What it is | Licence | Used here? |
|---|---|---|---|
| CMU Pronouncing Dictionary (cmusphinx/cmudict) | about 134k English words with ARPAbet phonemes | Free for any use, attribution requested | **Yes**: used to check every word's sounds |
| `pronouncing` (Allison Parrish, PyPI) | Python wrapper bundling CMUdict | BSD 3-Clause | **Yes**: build-time checker only (not shipped) |
| b3nj5m1n/major-system-converter | CMUdict/g2p-based Major dataset + Go CLI | MIT | Reviewed for approach; data not copied |
| hnvy/major-system-maker | IPA-dictionary Major generator | GPL-3.0 | Not used (GPL incompatible with a permissive site) |
| marcusbuffett/chitauri | Haskell CMUdict trie lookup | BSD-3 | Reviewed for approach only |
| theUpsider/majorsystem-backend | REST API for Major words | MIT | Not used |
| MatthiasSCG/Major-System-Wortfinder | German Major word finder | MIT code / CC BY-SA 4.0 data | Not used (German) |
| Alexsey gist "Words in Major System" | 00–99 candidates | **no licence** | Not used |
| Wikipedia example peg table | 0–99 examples | CC BY-SA 4.0 | Not copied; common words like "tie", "Noah" and "cow" are generic, not copyrightable |
| Art of Memory Major System Image Database | community 000–999 list | site terms | Consulted for ideas only |

The word list in `data/numbers.json` was chosen by hand for this project, and every word was checked against CMUdict by `tools/validate.py`.

## Sources
- [W] Wikipedia, "Mnemonic major system": https://en.wikipedia.org/wiki/Mnemonic_major_system
- [WW] Wikipedia, "Johann Just Winckelmann": https://en.wikipedia.org/wiki/Stanislaus_Mink_von_Wennsshein
- [WS] Wikisource, *Memory Systems New and Old*, ch. 2: https://en.wikisource.org/wiki/Memory_Systems_New_and_Old/Chapter_2
- [WS-B] Wikisource, Bibliography of Mnemonics: https://en.wikisource.org/wiki/Memory_Systems_New_and_Old/Bibliography_of_Mnemonics
- [G] *Galilæana*, "Memorizing numerical data in the 17th and 18th centuries": https://gal-studies.museogalileo.it/index.php/galilaeana/article/view/55
- [AoM-D] Art of Memory, Dominic System: https://artofmemory.com/blog/dominic-system/
- [AoM-PAO] Art of Memory, PAO System: https://artofmemory.com/blog/pao-system/
- [AoM-DB] Art of Memory, Major System Image Database: https://artofmemory.com/wiki/Major_System_Image_Database/
- [WD] Wikipedia, "Dominic system": https://en.wikipedia.org/wiki/Dominic_system
- [WMC] World Memory Championships, Random Numbers discipline: https://www.worldmemorychampionships.com/the-random-numbers-discipline/
- [MM] Alex Mullen, Memory Sports tips: https://mullenmemory.com/alex-mullen-memory-sports
- [MD] Major Dictionary, Major System chart: https://majordictionary.com/major-system
- [HN] hnvy/major-system-maker: https://github.com/hnvy/major-system-maker
- CMUdict: https://github.com/cmusphinx/cmudict · pronouncing: https://github.com/aparrish/pronouncingpy
- b3nj5m1n/major-system-converter: https://github.com/b3nj5m1n/major-system-converter · chitauri: https://github.com/marcusbuffett/chitauri
