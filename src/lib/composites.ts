/**
 * Composite templates.
 *
 * A composite places several proofs on one print, each inside a soft oval
 * vignette, in DuBose's classic style. Each template below describes the
 * print's shape and where each photo sits.
 *
 * THESE ARE STARTER LAYOUTS. Replace them with the studio's real templates:
 * see docs/COMPOSITES.md for the format and how to measure a template.
 *
 * Geometry is normalized: x, y, w, h are fractions (0 to 1) of the print's
 * width and height, measured from the top-left corner.
 */

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
    id: 'trio-horizontal',
    name: 'Classic Trio',
    description: 'Three poses side by side.',
    aspectRatio: 2,
    sizes: ['8x16', '10x20', '12x24'],
    slots: [
      { id: 'left', x: 0.04, y: 0.08, w: 0.29, h: 0.84 },
      { id: 'center', x: 0.355, y: 0.08, w: 0.29, h: 0.84 },
      { id: 'right', x: 0.67, y: 0.08, w: 0.29, h: 0.84 },
    ],
  },
  {
    id: 'feature-trio',
    name: 'Featured Pose',
    description: 'One large center pose with a smaller pose on each side.',
    aspectRatio: 2,
    sizes: ['8x16', '10x20', '12x24'],
    slots: [
      { id: 'left', x: 0.05, y: 0.22, w: 0.24, h: 0.56 },
      { id: 'center', x: 0.33, y: 0.05, w: 0.34, h: 0.9 },
      { id: 'right', x: 0.71, y: 0.22, w: 0.24, h: 0.56 },
    ],
  },
  {
    id: 'pair-horizontal',
    name: 'Pair',
    description: 'Two poses side by side, or two siblings.',
    aspectRatio: 1.25,
    sizes: ['8x10', '11x14', '16x20'],
    slots: [
      { id: 'left', x: 0.05, y: 0.07, w: 0.42, h: 0.86 },
      { id: 'right', x: 0.53, y: 0.07, w: 0.42, h: 0.86 },
    ],
  },
  {
    id: 'four-grid',
    name: 'Four Poses',
    description: 'Four poses in a square arrangement.',
    aspectRatio: 0.8,
    sizes: ['8x10', '11x14', '16x20'],
    slots: [
      { id: 'top-left', x: 0.05, y: 0.04, w: 0.43, h: 0.44 },
      { id: 'top-right', x: 0.52, y: 0.04, w: 0.43, h: 0.44 },
      { id: 'bottom-left', x: 0.05, y: 0.52, w: 0.43, h: 0.44 },
      { id: 'bottom-right', x: 0.52, y: 0.52, w: 0.43, h: 0.44 },
    ],
  },
];

export function getTemplate(id: string): CompositeTemplate | undefined {
  return CompositeTemplates.find((t) => t.id === id);
}
