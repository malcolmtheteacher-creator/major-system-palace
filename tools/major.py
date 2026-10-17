"""Major System encoder using CMUdict (via the `pronouncing` package)."""
import re, pronouncing
MAP = {'S':'0','Z':'0','T':'1','D':'1','TH':'1','DH':'1','N':'2','M':'3','R':'4','ER':'4',
       'L':'5','SH':'6','ZH':'6','CH':'6','JH':'6','K':'7','G':'7','F':'8','V':'8','P':'9','B':'9'}
SOUND = {'S':'s','Z':'z','T':'t','D':'d','TH':'th','DH':'th','N':'n','M':'m','R':'r','ER':'r',
         'L':'l','SH':'sh','ZH':'zh','CH':'ch','JH':'j','K':'k','G':'g','F':'f','V':'v','P':'p','B':'b'}
def encode_phones(ph):
    digits, sounds = '', []
    for p in ph.split():
        base = re.sub(r'\d','',p)
        if base == 'NG': return None, None   # ambiguous sound: avoid
        if base in MAP:
            digits += MAP[base]; sounds.append(SOUND[base])
    return digits, sounds
def encode(text, overrides=None):
    """Return list of possible (digits, sounds) for a word/phrase (all pronunciation combos)."""
    results = [('', [])]
    for w in re.findall(r"[a-zA-Z']+", text.lower()):
        prons = (overrides or {}).get(w) or pronouncing.phones_for_word(w)
        if not prons: return None
        new = []
        for d0, s0 in results:
            for ph in prons:
                d, s = encode_phones(ph)
                if d is not None: new.append((d0+d, s0+s))
        results = new
    return results
