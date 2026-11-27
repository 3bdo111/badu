from PIL import Image
import numpy as np
from scipy import ndimage as ndi

src = 'public/images/campaign/2026/studio-girl-blue-front.jpg'
out_path = 'public/images/campaign/2026/girl-blue-front-cream.jpg'
preview = '/downloads/gallery-v2/cutout-check4.png'

im = Image.open(src).convert('RGB')
full = np.asarray(im, dtype=np.float64)
h, w, _ = full.shape

# Background model: heavy blurred estimate built while excluding the subject,
# refined a few times so the vignette and floor shadow are captured.
bg = ndi.gaussian_filter(full, sigma=(120, 120, 0), mode='nearest')
for _ in range(5):
    d = np.abs(full - bg).sum(axis=2)
    mask = d > 40
    mask = ndi.binary_closing(mask, np.ones((9, 9)))
    mask = ndi.binary_fill_holes(mask)
    filled = full.copy()
    filled[mask] = bg[mask]
    bg = ndi.gaussian_filter(filled, sigma=(110, 110, 0), mode='nearest')

d = np.abs(full - bg).sum(axis=2)
bgmask = (d < 34).astype(np.float64)
bgmask = ndi.binary_closing(bgmask > 0, np.ones((5, 5))).astype(np.float64)
bgmask = ndi.binary_opening(bgmask > 0, np.ones((3, 3))).astype(np.float64)
# background must be connected to the frame edge; anything enclosed is subject
lab, n = ndi.label(bgmask > 0)
edge_labels = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
edge_labels.discard(0)
keepbg = np.isin(lab, list(edge_labels)).astype(np.float64)
keepbg = ndi.binary_fill_holes(keepbg > 0).astype(np.float64)
feather = ndi.gaussian_filter(keepbg, 1.1)[..., None]

cream = np.array([244.0, 232.0, 215.0])
out = np.clip(full * (1 - feather) + cream * feather, 0, 255).astype(np.uint8)
Image.fromarray(out).save(out_path, quality=90, optimize=True)
Image.fromarray(out).resize((560, 700), Image.LANCZOS).save(preview)
print('bg fraction', round(float(keepbg.mean()), 3))
