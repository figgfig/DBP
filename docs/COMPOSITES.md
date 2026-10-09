# Composite templates

Clients can build composites in the app: pick a layout, tap each spot to choose a proof, pick a size and quantity, and add it to their order. The studio receives the layout name, size, quantity, and which proof goes in each spot.

The layouts live in `src/lib/composites.ts`. **The four there now are starter layouts** (Classic Trio, Featured Pose, Pair, Four Poses). Replace them with the studio's real composite templates.

## Template format

```ts
{
  id: 'trio-horizontal',          // unique, never change once orders use it
  name: 'Classic Trio',           // shown to clients and on orders
  description: 'Three poses side by side.',
  aspectRatio: 2,                 // print width ÷ height (10x20 landscape = 2, 8x10 portrait = 0.8)
  sizes: ['8x16', '10x20', '12x24'], // sizes offered, spelled like the price sheet
  background: '#FFFFFF',          // optional paper color
  slots: [                        // one per photo, in the order clients fill them
    { id: 'left', x: 0.04, y: 0.08, w: 0.29, h: 0.84 },          // oval vignette (default)
    { id: 'center', x: 0.355, y: 0.08, w: 0.29, h: 0.84, shape: 'rect' }, // soft rectangle
  ],
}
```

`x`, `y`, `w`, `h` are fractions of the print's width and height measured from the top-left corner. To measure a real template: open it in any image editor, note the canvas size in pixels, then for each photo opening divide its left edge by the width (`x`), top edge by the height (`y`), its width by the canvas width (`w`), and its height by the canvas height (`h`).

## What's needed from the studio's files

For each composite template:

1. The template file or a finished example (PSD, PNG, or JPG).
2. Its name as the studio calls it.
3. The print sizes it is sold in.
4. Whether openings are soft ovals, soft rectangles, or something else.

Completed composites are also great for the **Gallery** tab (category `composite`) and for the template picker thumbnails.
