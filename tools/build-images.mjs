/**
 * The Mango Villa — responsive image pipeline
 * Source photography lives in assets/img-src (downloaded from themangovillas.com).
 * Outputs optimized WebP variants + JPG fallbacks into assets/img.
 *
 * Run from the repository root:  node mango-villa/tools/build-images.mjs
 */
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const srcDir = path.join(root, 'assets', 'img-src');
const outDir = path.join(root, 'assets', 'img');

const jobs = [
  // Signature portal hero — the arched entrance at night
  { src: 'gallery5.jpg', name: 'hero-portal', widths: [800, 1280, 1920], jpg: 1280 },
  // Founders' chapter parallax — garden, villa and red-tiled veranda
  { src: 'gallery9.jpg', name: 'story-garden', widths: [640, 1200], jpg: 1200 },
  // Wide estate band
  { src: 'slider3.jpg', name: 'estate-wide', widths: [1000, 1920], jpg: 1600 },
  // Suites — the four real room categories
  { src: '01-Premium-Deluxe-Room2-scaled.jpg', name: 'suite-premium', widths: [640, 1280], jpg: 1280 },
  { src: '02-Super-Deluxe-Room-scaled.jpg', name: 'suite-super', widths: [640, 1280], jpg: 1280 },
  { src: 'Deluxe-Room1-scaled.jpg', name: 'suite-deluxe-1', widths: [640, 1280], jpg: 1280 },
  { src: 'Deluxe-Room2-scaled.jpg', name: 'suite-deluxe-2', widths: [640, 1280], jpg: 1280 },
  // Culinary interlude — Konkan thali on a banana leaf
  { src: 'meal-on-banana-leaf.jpg', name: 'dining-thali', widths: [800, 1600], jpg: 1600 },
  // Field notes strip
  { src: 'gallery18.jpg', name: 'note-gate', widths: [480, 960], jpg: 960 },
  { src: 'gallery13.jpg', name: 'note-grove', widths: [480, 960], jpg: 960 },
  { src: 'gallery19.jpg', name: 'note-ixora', widths: [480, 960], jpg: 960 },
  { src: 'gallery3.jpg', name: 'note-dining', widths: [480, 960], jpg: 960 },
  { src: 'gallery8.jpg', name: 'note-night', widths: [480, 960], jpg: 960 },
  { src: 'Premium-Deluxe-AC_4-Custom.jpg', name: 'note-bed', widths: [480, 960], jpg: 960 },
];

await mkdir(outDir, { recursive: true });

const available = new Set(await readdir(srcDir));

for (const job of jobs) {
  if (!available.has(job.src)) {
    console.warn(`skip (missing source): ${job.src}`);
    continue;
  }
  const input = path.join(srcDir, job.src);
  for (const width of job.widths) {
    const out = path.join(outDir, `${job.name}-${width}.webp`);
    await sharp(input)
      .rotate()
      .resize({ width, kernel: sharp.kernel.lanczos3 })
      .webp({ quality: 76, effort: 5 })
      .toFile(out);
    console.log(`webp  ${path.basename(out)}`);
  }
  if (job.jpg) {
    const out = path.join(outDir, `${job.name}-${job.jpg}.jpg`);
    await sharp(input)
      .rotate()
      .resize({ width: job.jpg, kernel: sharp.kernel.lanczos3 })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toFile(out);
    console.log(`jpg   ${path.basename(out)}`);
  }
}

// Social share cover (1200 × 630)
await sharp(path.join(srcDir, 'gallery5.jpg'))
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(outDir, 'og-cover.jpg'));
console.log('jpg   og-cover.jpg');
