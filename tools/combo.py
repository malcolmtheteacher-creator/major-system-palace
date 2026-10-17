import sys, collections, pronouncing
sys.path.insert(0,'tools'); from major import encode
from vocab import ADJ, NOUN
codes = {}
for w in set(ADJ+NOUN):
    r = encode(w)
    if r: codes[w] = sorted(set(d for d,_ in r))
out = collections.defaultdict(list)
for a in ADJ+NOUN:
    for n in NOUN:
        if a==n: continue
        for ca in codes.get(a,[]):
            for cn in codes.get(n,[]):
                out[ca+cn].append(f"{a} {n}")
for t in sys.argv[1:]:
    print(t+':', ', '.join(sorted(set(out[t]))[:40]))
