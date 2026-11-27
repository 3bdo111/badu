import json, os, subprocess
from PIL import Image, ImageDraw

d = json.load(open('/tmp/prods.json'))
l = d if isinstance(d, list) else d.get('products', [])
p = [x for x in l if x['slug'] == 'badu-hoodie'][0]
base = 'https://badu-liart.vercel.app'
out = '/tmp/journeyimg'
os.makedirs(out, exist_ok=True)
rows = []
for i, im in enumerate(p['images']):
    src = im['src']
    url = src if src.startswith('http') else base + src
    path = f'{out}/{i:02d}-{im["id"]}.img'
    if not os.path.exists(path):
        subprocess.run(['curl', '-s', '-o', path, url], check=True)
    try:
        pic = Image.open(path).convert('RGB')
        # average colour of the central region (the garment)
        w, h = pic.size
        crop = pic.crop((int(w*0.3), int(h*0.35), int(w*0.7), int(h*0.75))).resize((1, 1), Image.LANCZOS)
        avg = crop.getpixel((0, 0))
        rows.append((i, im['id'], im['colorKey'], im.get('sortOrder'), im['alt'].get('en'), pic, avg))
    except Exception as e:
        rows.append((i, im['id'], im['colorKey'], im.get('sortOrder'), 'ERR ' + str(e), None, None))

cell = 300
cols = 4
rowsn = (len(rows) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cell, rowsn * (cell + 34)), 'white')
dr = ImageDraw.Draw(sheet)
for n, (i, iid, ck, so, alt, pic, avg) in enumerate(rows):
    x = (n % cols) * cell
    y = (n // cols) * (cell + 34)
    if pic:
        pic.thumbnail((cell - 8, cell - 8))
        sheet.paste(pic, (x + 4, y + 4))
    dr.text((x + 6, y + cell + 2), f'{i} {ck} avg{avg}', fill='black')
    dr.text((x + 6, y + cell + 16), alt[:44], fill='black')
sheet.save('/downloads/gallery-v2/journey-contactsheet.png')
print('images', len(rows))
for r in rows:
    print(r[0], r[1], r[2], r[3], r[6], '|', r[4][:60])
