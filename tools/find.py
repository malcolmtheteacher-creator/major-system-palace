import sys, pronouncing, collections
from wordfreq import zipf_frequency
sys.path.insert(0,'tools'); from major import encode_phones
pronouncing.init_cmu()
idx = collections.defaultdict(set)
for w, ph in pronouncing.pronunciations:
    d,_ = encode_phones(ph)
    if d and w.isalpha(): idx[d].add(w)
N = int(sys.argv[1]) if sys.argv[1].isdigit() and len(sys.argv)>2 and sys.argv[1].startswith('k') else 25
for n in sys.argv[1:]:
    ws = sorted(idx.get(n, []), key=lambda w:-zipf_frequency(w,'en'))
    print(n+':', ' '.join(w for w in ws[:22] if zipf_frequency(w,'en')>1.8))
