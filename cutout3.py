from PIL import Image
import numpy as np
from scipy import ndimage as ndi

src = 'public/images/campaign/2026/studio-girl-blue-front.jpg'
out_path = 'public/images/campaign/2026/girl-blue-front-cream.jpg'
preview = '/downloads/gallery-v2/cutout-check5.png'

im = Image.open(src).convert('RGB')
full = np.asarray(im, dtype=np.float64)
h, w, _ = full.shape
sc = 4
a = np.asarray(im.resize((w // sc, h // sc), Image.LANCZOS), dtype=np.float64)

bg = ndi.gaussian_filter(a, sigma=(45, 45, 0), mode='nearest')
for _ in range(6):
    d = np.abs(a - bg).sum(axis=2)
    mask = ndi.binary_fill_holes(ndi.binary_closing(d > 34, np.ones((7, 7))))
    filled = a.copy()
    filled[mask] = bg[mask]
    bg = ndi.gaussian_filter(filled, sigma=(40, 40, 0), mode='nearest')

d = np.abs(a - bg).sum(axis=2)
alpha = np.clip((d - 22) / 26.0, 0, 1)
lab, n = ndi.label(alpha > 0.5)
sizes = ndi.sum(alpha > 0.5, lab, range(1, n + 1))
keep = ndi.binary_fill_holes(lab == (np.argmax(sizes) + 1)).astype(np.float64)
keep = ndi.gaussian_filter(keep, 1.0)
alpha = ndi.gaussian_filter(np.clip(alpha * keep, 0, 1), 0.8)

A = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS), dtype=np.float64) / 255.0
BG = np.stack([
    np.asarray(Image.fromarray(bg[..., c].astype(np.uint8)).resize((w, h), Image.LANCZOS), dtype=np.float64)
    for c in range(3)
], axis=-1)

# Hard-ish matte: anything that is not clearly subject becomes flat cream, so
# the soft floor shadow and the tan fringe around the hair go away.
matte = np.clip((A - 0.55) / 0.25, 0, 1)
matte = ndi.gaussian_filter(matte, 0.9)[..., None]
aa = np.clip(A, 1e-3, 1)[..., None]
sub = np.clip((full - BG * (1 - aa)) / aa, 0, 255)
cream = np.array([244.0, 232.0, 215.0])
out = np.clip(sub * matte + cream * (1 - matte), 0, 255).astype(np.uint8)
Image.fromarray(out).save(out_path, quality=90, optimize=True)
Image.fromarray(out).resize((560, 700), Image.LANCZOS).save(preview)
Image.fromarray(out).crop((280, 40, 900, 560)).save('/downloads/gallery-v2/cutout-check5-head.png')
print('subject fraction', round(float((matte > 0.5).mean()), 3))
