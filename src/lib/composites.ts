/**
 * Composite templates.
 *
 * A composite places several proofs on one print, each inside a soft oval
 * vignette, in DuBose's classic style. These are the twelve layouts on the
 * studio's composite price list, named the way the price list and order
 * forms name them ("07 Horizontal", "027 Horizontal").
 *
 * Slot positions were measured from the studio's Photoshop templates
 * (F:\Dub Templates, the 16x20 version of each layout). Each slot is the
 * template's vignette at half opacity, enlarged so the app's oval mask fades
 * at the same place. The 8x10 and 11x14 files differ by a percent or two,
 * which does not matter for a preview. See docs/COMPOSITES.md.
 *
 * Geometry is normalized: x, y, w, h are fractions (0 to 1) of the print's
 * width and height, measured from the top-left corner.
 */

/** The studio backdrop grey, sRGB (203, 202, 198), flooded around composite photos. */
const STUDIO_GREY = '#CBCAC6';

export interface CompositeSlot {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** 'oval' is the classic soft vignette. 'rect' is a soft-edged rectangle. */
  shape?: 'oval' | 'rect';
}

export interface CompositeTemplate {
  id: string;
  name: string;
  description?: string;
  /** Print width divided by height, e.g. 2 for a 10x20 landscape print. */
  aspectRatio: number;
  /** Print sizes this template is offered in, written the way the price sheet writes them. */
  sizes: string[];
  slots: CompositeSlot[];
  /** Paper color behind the photos. Defaults to white. */
  background?: string;
}

export const CompositeTemplates: CompositeTemplate[] = [
  {
    id: '07-vertical',
    name: '07 Vertical',
    description: 'One large center pose with a pose in each corner.',
    aspectRatio: 0.8,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'top-left', x: 0.048, y: 0.06, w: 0.294, h: 0.29 },
      { id: 'top-right', x: 0.684, y: 0.06, w: 0.294, h: 0.29 },
      { id: 'center', x: 0.337, y: 0.315, w: 0.322, h: 0.348 },
      { id: 'bottom-left', x: 0.046, y: 0.638, w: 0.294, h: 0.29 },
      { id: 'bottom-right', x: 0.666, y: 0.638, w: 0.294, h: 0.29 },
    ],
  },
  {
    id: '07-horizontal',
    name: '07 Horizontal',
    description: 'One large center pose with a pose in each corner.',
    aspectRatio: 1.25,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'top-left', x: 0.063, y: 0.021, w: 0.221, h: 0.38 },
      { id: 'top-right', x: 0.714, y: 0.021, w: 0.221, h: 0.38 },
      { id: 'center', x: 0.358, y: 0.243, w: 0.281, h: 0.504 },
      { id: 'bottom-left', x: 0.071, y: 0.558, w: 0.221, h: 0.38 },
      { id: 'bottom-right', x: 0.714, y: 0.558, w: 0.221, h: 0.38 },
    ],
  },
  {
    id: '05-vertical',
    name: '05 Vertical',
    description: 'Five poses: one in each corner and one in the center.',
    aspectRatio: 0.8,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'top-left', x: 0.037, y: 0.005, w: 0.371, h: 0.382 },
      { id: 'top-right', x: 0.597, y: 0.005, w: 0.371, h: 0.382 },
      { id: 'center', x: 0.305, y: 0.298, w: 0.371, h: 0.382 },
      { id: 'bottom-left', x: 0.034, y: 0.575, w: 0.371, h: 0.382 },
      { id: 'bottom-right', x: 0.593, y: 0.575, w: 0.371, h: 0.382 },
    ],
  },
  {
    id: '05-horizontal',
    name: '05 Horizontal',
    description: 'Five poses: one in each corner and one in the center.',
    aspectRatio: 1.25,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'top-left', x: 0.056, y: 0.021, w: 0.233, h: 0.409 },
      { id: 'top-right', x: 0.703, y: 0.021, w: 0.233, h: 0.409 },
      { id: 'center', x: 0.387, y: 0.284, w: 0.233, h: 0.409 },
      { id: 'bottom-left', x: 0.056, y: 0.549, w: 0.233, h: 0.409 },
      { id: 'bottom-right', x: 0.711, y: 0.549, w: 0.233, h: 0.409 },
    ],
  },
  {
    id: '04-vertical',
    name: '04 Vertical',
    description: 'Four poses in a diamond.',
    aspectRatio: 0.8,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'top', x: 0.32, y: 0.047, w: 0.34, h: 0.344 },
      { id: 'left', x: 0.085, y: 0.289, w: 0.34, h: 0.344 },
      { id: 'right', x: 0.579, y: 0.289, w: 0.34, h: 0.344 },
      { id: 'bottom', x: 0.326, y: 0.589, w: 0.34, h: 0.344 },
    ],
  },
  {
    id: '04-horizontal',
    name: '04 Horizontal',
    description: 'Four poses in a diamond.',
    aspectRatio: 1.25,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'top', x: 0.354, y: -0.006, w: 0.293, h: 0.483 },
      { id: 'left', x: 0.058, y: 0.265, w: 0.293, h: 0.483 },
      { id: 'right', x: 0.66, y: 0.265, w: 0.293, h: 0.483 },
      { id: 'bottom', x: 0.36, y: 0.511, w: 0.293, h: 0.483 },
    ],
  },
  {
    id: '03-vertical',
    name: '03 Vertical',
    description: 'Three poses on a diagonal.',
    aspectRatio: 0.8,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'top-left', x: -0.001, y: 0.0, w: 0.397, h: 0.368 },
      { id: 'center', x: 0.309, y: 0.319, w: 0.397, h: 0.368 },
      { id: 'bottom-right', x: 0.618, y: 0.623, w: 0.397, h: 0.368 },
    ],
  },
  {
    id: '03-horizontal',
    name: '03 Horizontal',
    description: 'Three poses on a diagonal.',
    aspectRatio: 1.25,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'top-left', x: -0.01, y: -0.039, w: 0.371, h: 0.518 },
      { id: 'center', x: 0.314, y: 0.224, w: 0.371, h: 0.518 },
      { id: 'bottom-right', x: 0.646, y: 0.452, w: 0.371, h: 0.518 },
    ],
  },
  {
    id: '02-horizontal',
    name: '02 Horizontal',
    description: 'Two large poses side by side.',
    aspectRatio: 1.25,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'left', x: 0.02, y: 0.113, w: 0.475, h: 0.707 },
      { id: 'right', x: 0.501, y: 0.113, w: 0.475, h: 0.707 },
    ],
  },
  {
    id: '027-horizontal',
    name: '027 Horizontal',
    description: 'One large center pose between two smaller poses.',
    aspectRatio: 1.25,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'left', x: 0.03, y: 0.187, w: 0.285, h: 0.506 },
      { id: 'center', x: 0.33, y: 0.136, w: 0.347, h: 0.6 },
      { id: 'right', x: 0.684, y: 0.187, w: 0.285, h: 0.506 },
    ],
  },
  {
    id: '01-vertical',
    name: '01 Vertical',
    description: 'Three poses stacked in a column.',
    aspectRatio: 0.8,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'top', x: 0.307, y: -0.025, w: 0.376, h: 0.389 },
      { id: 'center', x: 0.307, y: 0.299, w: 0.376, h: 0.389 },
      { id: 'bottom', x: 0.307, y: 0.616, w: 0.376, h: 0.389 },
    ],
  },
  {
    id: '01-horizontal',
    name: '01 Horizontal',
    description: 'Three poses in a row.',
    aspectRatio: 1.25,
    sizes: ['8x10', '11x14', '16x20'],
    background: STUDIO_GREY,
    slots: [
      { id: 'left', x: 0.029, y: 0.169, w: 0.272, h: 0.464 },
      { id: 'center', x: 0.363, y: 0.169, w: 0.272, h: 0.464 },
      { id: 'right', x: 0.701, y: 0.175, w: 0.272, h: 0.464 },
    ],
  },
];

export function getTemplate(id: string): CompositeTemplate | undefined {
  return CompositeTemplates.find((t) => t.id === id);
}
