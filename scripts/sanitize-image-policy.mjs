import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/context/AppContext.tsx';
const text = readFileSync(path, 'utf8');
const oldLine = "const isDummyImage = (value: unknown): boolean => { const url = String(value || '').trim().toLowerCase(); return url.includes('images.unsplash.com') || url.includes('images.pexels.com'); };";
const newLine = "const isDummyImage = (value: unknown): boolean => { const url = String(value || '').trim().toLowerCase(); return !url || !url.startsWith('https://res.cloudinary.com/'); };";

if (!text.includes(newLine)) {
  if (!text.includes(oldLine)) {
    throw new Error('Expected image policy line was not found; refusing to modify AppContext.tsx.');
  }
  writeFileSync(path, text.replace(oldLine, newLine), 'utf8');
}

console.log('Image policy: only Cloudinary user-uploaded URLs are allowed; all seeded/external image URLs resolve to empty.');
