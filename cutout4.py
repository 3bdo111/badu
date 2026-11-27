from PIL import Image
import numpy as np
from scipy import ndimage as ndi

src = 'public/images/campaign/2026/studio-girl-blue-front.jpg'
out_path = 'public/images/campaign/2026/girl-blue-front-cream.jpg'
preview = '/downloads/gallery-v2/cutout-check6.png'

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
core = ndi.binary_fill_holes(lab == (np.argmax(sizes) + 1)).astype(np.float64)
core = ndi.gaussian_filter(core, 1.0)
alpha = ndi.gaussian_filter(np.clip(alpha * core, 0, 1), 0.8)

A = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).resize((w, h), Image.LANCZOS), dtype=np.float64) / 255.0
BG = np.stack([
    np.asarray(Image.fromarray(bg[..., c].astype(np.uint8)).resize((w, h), Image.LANCZOS), dtype=np.float64)
    for c in range(3)
], axis=-1)

lum = lambda x: 0.299 * x[..., 0] + 0.587 * x[..., 1] + 0.114 * x[..., 2]
lf, lb = lum(full), lum(BG)
tan = (full[..., 0] > full[..., 1] + 8) & (full[..., 1] > full[..., 2] + 8) & ((full[..., 0] - full[..., 2]) > 22)
shadow = tan & (lf < 0.95 * lb) & (A > 0.02)
shadow = ndi.binary_closing(shadow, np.ones((3, 3)))
shadow = ndi.binary_dilation(shadow, np.ones((3, 3)))

subject = ((A > 0.5) & ~shadow).astype(np.float64)
subject = ndi.binary_fill_holes(subject > 0).astype(np.float64)
lab2, n2 = ndi.label(subject > 0)
if n2:
    sizes2 = ndi.sum(subject > 0, lab2, range(1, n2 + 1))
    subject = (lab2 == (np.argmax(sizes2) + 1)).astype(np.float64)
    subject = ndi.binary_fill_holes(subject > 0).astype(np.float64)
matte = ndi.gaussian_filter(subject, 1.0)[..., None]

aa = np.clip(A, 1e-3, 1)[..., None]
sub = np.clip((full - BG * (1 - aa)) / aa, 0, 255)
cream = np.array([244.0, 232.0, 215.0])
out = np.clip(sub * matte + cream * (1 - matte), 0, 255).astype(np.uint8)
Image.fromarray(out).save(out_path, quality=90, optimize=True)
Image.fromarray(out).resize((560, 700), Image.LANCZOS).save(preview)
Image.fromarray(out).crop((280, 40, 900, 560)).save('/downloads/gallery-v2/cutout-check6-head.png')
print('subject fraction', round(float((matte > 0.5).mean()), 3), 'shadow frac', round(float(shadow.mean()), 3))
