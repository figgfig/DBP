# Composite templates

Clients can build composites in the app: pick a layout, tap each spot to choose a proof, pick a size and quantity, and add it to their order. The studio receives the layout name, size, quantity, and which proof goes in each spot.

The layouts live in `src/lib/composites.ts`. They are the twelve layouts on the studio composite price list (07, 05, 04 and 03 in Vertical and Horizontal, plus 02 Horizontal, 027 Horizontal, 01 Vertical and 01 Horizontal), each sold in 8x10, 11x14 and 16x20. Slot positions were measured from the studio Photoshop templates in `F:\Dub Templates`, using the 16x20 file of each layout. The paper color is the studio backdrop grey, sRGB (203, 202, 198).

The template folder also has `02 vert` and `037 horiz_8x10` files that are not on the price list, so the app leaves them out.

## Template format

```ts
{
  id: '07-horizontal',          // unique, never change once orders use it
  name: '07 Horizontal',           // shown to clients and on orders
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

## Re-measuring a template

Each slot in the PSD is an unclipped smart object named `mask` (or `top mask`, `center mask`, and so on) holding the feathered vignette. The app slot is the box where that vignette is at least half opaque, enlarged by 1 / 0.8516 because the app oval mask reaches half opacity at 85.16% of its frame. Slots are listed top to bottom, then left to right, which is the order clients fill them.

Completed composites are also great for the **Gallery** tab (category `composite`) and for the template picker thumbnails.
