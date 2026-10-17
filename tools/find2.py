import sys, pronouncing, collections
from wordfreq import zipf_frequency
sys.path.insert(0,'tools'); from major import encode_phones
pronouncing.init_cmu()
idx = collections.defaultdict(set)
for w, ph in pronouncing.pronunciations:
    d,_ = encode_phones(ph)
    if d and w.isalpha(): idx[d].add(w)
for n in sys.argv[1:]:
    ws = sorted(idx.get(n, []), key=lambda w:-zipf_frequency(w,'en'))
    print(n+':', ' '.join(w for w in ws[:45] if zipf_frequency(w,'en')>0.5))
