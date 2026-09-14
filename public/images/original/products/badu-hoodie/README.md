# BADU product photography

Drop the real hoodie photography here. Do NOT replace these with
generated/CSS stand-ins — the storefront expects genuine product photos.

## Expected files

| File | Content |
| --- | --- |
| `front.jpg` | Front view — heavyweight hoodie in desert sand, embroidered sun symbol on the chest |
| `back.jpg` | Back view — embroidered desert scene: camel, traveler, mountains, sun, small birds |
| `detail-1.jpg` | Optional close-up (embroidery stitch, fabric weight, hood, etc.) |
| `detail-2.jpg` | Optional second close-up |

## Conventions

- Prefer high-quality JPEG or WebP, roughly 2000px on the long edge.
- Soft, warm, neutral light. No heavy filters — the garment is the hero.
- Square-ish or 4:5 crops work best with the current layout
  (the hero frame uses `aspect-ratio: 4 / 5`, `object-fit: cover`).
- Descriptive filenames only; add new images to the product's
  `images` array in `src/data/products.ts` with bilingual `alt` text.

Filenames referenced in code: `front.jpg`, `back.jpg` (see
`src/data/products.ts`). Until a file exists, the storefront shows a
quiet labelled frame instead of a broken image.
