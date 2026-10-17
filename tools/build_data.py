"""Validate every word in words.txt against CMUdict and write data/numbers.json."""
import json, sys, os
sys.path.insert(0, 'tools'); from major import encode
# Manual pronunciations (ARPAbet) for words missing from CMUdict, checked by hand.
OVERRIDES = {
 'tealight': ['T IY1 L AY2 T'], 'teacake': ['T IY1 K EY2 K'], 'teabag': ['T IY1 B AE2 G'],
 'dodgem': ['D AA1 JH AH0 M'], 'tweezer': ['T W IY1 Z ER0'], 'lolly': ['L AA1 L IY0'],
 'windup': ['W AY1 N D AH2 P'], 'hotdog': ['HH AA1 T D AO2 G'], 'beehive': ['B IY1 HH AY2 V'],
 'teapot': ['T IY1 P AA2 T'], 'teacup': ['T IY1 K AH2 P'], 'takeoff': ['T EY1 K AO2 F'],
 'honeycomb': ['HH AH1 N IY0 K OW2 M'], 'woodchuck': ['W UH1 D CH AH2 K'], 'nacho': ['N AA1 CH OW0'],
 'tv': ['T IY1 V IY1'], 'anorak': ['AE1 N ER0 AE2 K'], 'narwhal': ['N AA1 R W AA2 L'],
 'oatmeal': ['OW1 T M IY2 L'], 'tofu': ['T OW1 F UW0'], 'tyre': ['T AY1 ER0'], 'honour': ['AA1 N ER0'],
 'neighbour': ['N EY1 B ER0'], 'toucan': ['T UW1 K AH0 N'], 'tapir': ['T EY1 P ER0'], 'unlit': ['AH0 N L IH1 T'], 'tumour': ['T UW1 M ER0'], 'nighthawk': ['N AY1 T HH AO2 K'],
}
BANNED_ALTS = {'idiotic','naked','toilet','devil','tumour','diaper','whatsapp','depeche','toshiba','tajima',
  'tajik','digby','nunnally','dashiell','pizza','dress','deluge','top pop','headship','tobacco','theatre'}
DIG_COLOURS = None
out, problems = [], []
for line in open('words.txt'):
    n, word, desc, alts = line.rstrip('\n').split('|')
    n = int(n); digits = str(n)
    res = encode(word, OVERRIDES)
    match = [s for d, s in (res or []) if d == digits]
    if not match:
        problems.append(f"{n} {word}: got {sorted(set(d for d,_ in res)) if res else 'NOT IN DICT'}")
        continue
    good_alts = []
    for a in [x.strip() for x in alts.split(',') if x.strip()]:
        if a.lower() in BANNED_ALTS or a.lower() == word.lower(): continue
        r = encode(a, OVERRIDES)
        if r and any(d == digits for d, _ in r): good_alts.append(a)
    sounds = match[0]
    out.append({
        'n': n, 'digits': digits,
        'sounds': [{'digit': d, 'sound': s} for d, s in zip(digits, sounds)],
        'word': word, 'image': f'img/{n:04d}.webp', 'hasImage': os.path.exists(f'img/{n:04d}.webp'),
        'description': desc, 'alt': desc[0].upper() + desc[1:] + f' – the peg for {n}, "{word}".',
        'alternates': good_alts[:2],
    })
if problems:
    print('PROBLEMS:'); print('\n'.join(problems))
words = [o['word'].lower() for o in out]
dups = {w for w in words if words.count(w) > 1}
if dups: print('DUPLICATE WORDS:', dups)
json.dump({'version': 1, 'phase': '1–300', 'numbers': out}, open('data/numbers.json', 'w'), ensure_ascii=False, indent=1)
print(len(out), 'valid entries written')
