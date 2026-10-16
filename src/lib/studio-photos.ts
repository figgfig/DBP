import { Asset } from 'expo-asset';

/**
 * The studio's own finished prints and composites, used by demo mode and the
 * Home and About screens. They are client photographs, so the files live in
 * `assets/studio/` on the studio's computer only and are git-ignored (the
 * repository is public). Anyone without them sees grayscale placeholders.
 * See `assets/studio/README.md` for how they were made.
 */
const files = require.context('../../assets/studio', false, /\.jpg$/);

const photos = new Map<string, string>();
for (const key of files.keys()) {
  const name = key.replace(/^\.\//, '').replace(/\.jpg$/, '');
  photos.set(name, Asset.fromModule(files(key)).uri);
}

export const hasStudioPhotos = photos.size > 0;

const placeholder = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}?grayscale`;

/** URL of a studio photo by file name (without `.jpg`), or a placeholder if it is missing. */
export function studioPhoto(name: string, w = 600, h = 800): string {
  return photos.get(name) ?? placeholder(`dbp-${name}`, w, h);
}

/** Names of the studio photos that start with `prefix`, sorted. */
export function studioPhotoNames(prefix: string): string[] {
  return [...photos.keys()].filter((n) => n.startsWith(prefix)).sort();
}
