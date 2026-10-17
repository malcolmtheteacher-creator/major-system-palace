import sys, os
sys.path.insert(0, 'tools'); from slice import slice_sheet
from PIL import Image
done = []
for k in [int(x) for x in sys.argv[1:]]:
    path = f'../sheets/sheet_{k:03d}.jpg'
    if not os.path.exists(path): print('missing', k); continue
    first = 10 + (k - 2) * 8
    nums = [n for n in range(first, first + 8) if n <= 300]
    xs, ys, res = slice_sheet(path, 4, 2, nums, 'img')
    print(k, 'cols', [b - a for a, b in xs], 'rows', [b - a for a, b in ys], len(res))
    done += nums
# review contact image with numbers
from PIL import ImageDraw
W = 8; cell = 160
im = Image.new('RGB', (W * cell, ((len(done) + W - 1) // W) * (cell + 18)), 'white'); d = ImageDraw.Draw(im)
words = {int(l.split('|')[0]): l.split('|')[1] for l in open('words.txt')}
for i, n in enumerate(done):
    x, y = (i % W) * cell, (i // W) * (cell + 18)
    im.paste(Image.open(f'img/{n:04d}.webp').resize((cell - 4, cell - 4)), (x + 2, y + 2))
    d.text((x + 4, y + cell), f'{n} {words[n]}', fill='black')
im.save('/tmp/review.png'); print('review', im.size)
