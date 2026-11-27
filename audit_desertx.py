import json, os, subprocess
from PIL import Image, ImageDraw

d = json.load(open('/tmp/prods.json'))
l = d if isinstance(d, list) else d.get('products', [])
p = [x for x in l if x['slug'] == 'desert-x'][0]
base = 'https://badu-liart.vercel.app'
out = '/tmp/desertximg'
os.makedirs(out, exist_ok=True)
rows = []
for i, im in enumerate(p['images']):
    src = im['src']
    url = src if src.startswith('http') else base + src
    path = f'{out}/{i:02d}-{im["id"]}.img'
    if not os.path.exists(path):
        subprocess.run(['curl', '-s', '-o', path, url], check=True)
    pic = Image.open(path).convert('RGB')
    rows.append((i, im.get('colorKey'), im['alt'].get('en'), pic))

cell = 320
cols = 3
rowsn = (len(rows) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cell, rowsn * (cell + 30)), 'white')
dr = ImageDraw.Draw(sheet)
for n, (i, ck, alt, pic) in enumerate(rows):
    x = (n % cols) * cell
    y = (n // cols) * (cell + 30)
    pic.thumbnail((cell - 8, cell - 8))
    sheet.paste(pic, (x + 4, y + 4))
    dr.text((x + 6, y + cell + 4), f'{i} {ck}', fill='black')
    dr.text((x + 6, y + cell + 16), alt[:46], fill='black')
sheet.save('/downloads/gallery-v2/desertx-contactsheet.png')
for r in rows:
    print(r[0], r[1], '|', r[2][:70])
