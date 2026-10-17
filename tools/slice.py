"""Slice a contact sheet into panels by detecting white gutters, pad each to a square, save WebP."""
import sys, numpy as np
from PIL import Image
def runs(mask):
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None: start = i
        if not v and start is not None: out.append((start, i)); start = None
    if start is not None: out.append((start, len(mask)))
    return out
def segments(arr, axis, expect):
    # gutter = line where nearly all pixels are very bright and low-saturation
    bright = (arr.min(axis=2) > 236)
    frac = bright.mean(axis=axis)
    for thr in (0.97, 0.94, 0.9, 0.85):
        content = runs(frac < thr)
        content = [c for c in content if c[1] - c[0] > 40]
        if len(content) == expect: return content
    # fallback: equal division
    L = arr.shape[1 - axis]
    return [(round(i * L / expect), round((i + 1) * L / expect)) for i in range(expect)]
def slice_sheet(path, cols, rows, numbers, outdir, size=512):
    im = Image.open(path).convert('RGB'); a = np.asarray(im).astype(int)
    xs = segments(a, 0, cols); ys = segments(a, 1, rows)
    k = 0; results = []
    for (y0, y1) in ys:
        for (x0, x1) in xs:
            if k >= len(numbers): break
            n = numbers[k]; k += 1
            if n is None: continue
            p = im.crop((x0 + 3, y0 + 3, x1 - 3, y1 - 3))
            w, h = p.size
            if abs(w - h) <= 0.15 * max(w, h):   # nearly square: centre-crop
                s = min(w, h); sq = p.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
            else:                                  # pad by repeating edge pixels (smooth background)
                s = max(w, h); pa = np.asarray(p).astype(float)
                py, px = s - h, s - w
                out = np.zeros((s, s, 3)); top, left = py // 2, px // 2
                # fill each side with a smooth colour taken from that edge, blended across the square
                tc = np.median(pa[:4].reshape(-1, 3), axis=0); bc = np.median(pa[-4:].reshape(-1, 3), axis=0)
                lc = np.median(pa[:, :4].reshape(-1, 3), axis=0); rc = np.median(pa[:, -4:].reshape(-1, 3), axis=0)
                yy = np.linspace(0, 1, s)[:, None, None]; xx = np.linspace(0, 1, s)[None, :, None]
                out[:] = (tc * (1 - yy) + bc * yy) if py else (lc * (1 - xx) + rc * xx)
                out[top:top + h, left:left + w] = pa
                sq = Image.fromarray(out.clip(0, 255).astype('uint8'))
                from PIL import ImageFilter
                blur = sq.filter(ImageFilter.GaussianBlur(6)); mask = Image.new('L', (s, s), 0)
                from PIL import ImageDraw
                d = ImageDraw.Draw(mask)
                if py: d.rectangle((0, top - 6, s, top + 6), fill=255); d.rectangle((0, top + h - 6, s, top + h + 6), fill=255)
                else: d.rectangle((left - 6, 0, left + 6, s), fill=255); d.rectangle((left + w - 6, 0, left + w + 6, s), fill=255)
                sq = Image.composite(blur, sq, mask.filter(ImageFilter.GaussianBlur(4)))
            sq = sq.resize((size, size), Image.LANCZOS)
            out = f'{outdir}/{n:04d}.webp'; sq.save(out, 'WEBP', quality=80, method=6)
            results.append((n, (x1 - x0, y1 - y0)))
    return xs, ys, results
if __name__ == '__main__':
    path, cols, rows, first = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
    nums = [int(x) if x != '-' else None for x in first.split(',')]
    xs, ys, res = slice_sheet(path, cols, rows, nums, sys.argv[5] if len(sys.argv) > 5 else 'img')
    print('cols', xs); print('rows', ys); print(res)
