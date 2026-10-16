import type { Ionicons } from '@expo/vector-icons';

/**
 * Static studio content. Everything here mirrors what is published on
 * dubosephotography.com so the app and the website say the same thing.
 * Update this file (or move it to a CMS later) when the website copy changes.
 */

export const Studio = {
  name: 'DuBose Photography',
  photographer: 'DuBose Blakeney',
  tagline: 'Classic black & white portraits of children',
  website: 'https://www.dubosephotography.com',
  blogUrl: 'https://www.dubosephotography.com/dubose-photography-blog',
  facebookUrl: 'https://www.facebook.com/p/DuBose-Photography-100064693461976/',
  phone: '(843) 442-4096',
  phoneDial: '+18434424096',
  email: 'ordersdbp@gmail.com',
  address: {
    line1: '6201 Church Flats Road',
    city: 'Hollywood',
    state: 'SC',
    zip: '29449',
  },
  /** Regional representative for families who want to host a session. */
  representative: {
    name: 'Sophie Fulmer',
    phone: '864.270.8264',
    phoneDial: '+18642708264',
    states: ['AL', 'DC', 'FL', 'GA', 'MS', 'NC', 'SC', 'TN'],
  },
};

export const About = {
  heading: 'About the Studio',
  eyebrow: 'Charleston, South Carolina · Since 1994',
  intro:
    'DuBose Photography is a Charleston children’s portrait studio specializing in the classic black and white vignetted style created in the earliest days of photography.',
  paragraphs: [
    'Since 1994, the studio has created timeless portraits of children that are now displayed in homes around the world.',
    'Each Spring and Fall, the studio travels to cities across the Southeast. Local hostesses organize every session, so families can be photographed close to home.',
  ],
  highlights: [
    {
      icon: 'contrast-outline',
      title: 'Classic black & white',
      body: 'Soft, vignetted portraits with a timeless, heirloom look.',
    },
    {
      icon: 'map-outline',
      title: 'Sessions across the Southeast',
      body: 'Travel sessions every Spring and Fall, hosted locally in each city.',
    },
    {
      icon: 'happy-outline',
      title: 'Children 6 months to 16 years',
      body: 'A private 15-minute session for each family, with each child photographed separately.',
    },
    {
      icon: 'images-outline',
      title: 'Single images and composites',
      body: 'Order individual portraits, or several poses arranged together on one print.',
    },
  ] satisfies { icon: keyof typeof Ionicons.glyphMap; title: string; body: string }[],
};

export const SessionInfo = {
  heading: 'Photo Sessions',
  intro:
    'DuBose travels to cities across the Southeast each Spring and Fall. Sessions are organized by a local hostess, and families reserve a time with her directly.',
  points: [
    {
      title: 'Private 15-minute session',
      body: 'Each family receives a 15-minute private session. Each child is photographed separately.',
    },
    {
      title: 'Sitting fee',
      body: 'A non-refundable sitting fee is charged for each child. It is collected at the time of the session and credited toward that child’s order. Your hostess can share the details.',
    },
    {
      title: 'How to pay',
      body: 'Sitting fees may be paid through Venmo or cash at the session. Credit and debit cards are not accepted.',
    },
    {
      title: 'Proofs',
      body: 'Proofs are emailed approximately four to five weeks after the photo session and include a price sheet. Once your proofs are ready they will also appear under My Proofs in this app.',
    },
    {
      title: 'Ages',
      body: 'Children from 6 months to 16 years.',
    },
  ],
  whatToExpect: [
    'Please arrive ten minutes before your session so your children can settle in.',
    'Simple, classic clothing photographs best. Solid colors and timeless styles suit the black and white vignette.',
    'DuBose works quickly and quietly with each child. Parents are welcome nearby.',
  ],
};

export const SingleImagesInfo = {
  heading: 'Single Images',
  paragraphs: [
    'Single image portraits are crafted in the same classic, vignetted style as DuBose’s composite images.',
    'All single image portraits may be ordered in a variety of sizes and are printed vertically.',
    'DuBose Photography does not offer digital images.',
    'Your price sheet arrives with your proofs. To place or change an order, use the Order button inside your proof gallery or contact the studio directly.',
  ],
};

export const HostessInfo = {
  heading: 'Host a Session',
  intro:
    'Hostesses bring DuBose to their city. A hostess helps find a quiet indoor venue, gathers interested families, and coordinates the schedule for the day.',
  benefits: [
    'Bring classic portraiture to your community.',
    'Choose a date in the Spring or Fall travel season.',
    'The studio and your state representative guide you every step of the way.',
  ],
  nextSteps:
    'After you apply, the representative for your state will reach out to talk through dates, venue, and the number of families needed.',
};

export const PaymentsInfo = {
  heading: 'Payments',
  paragraphs: [
    'You may pay for your DuBose Photography order through Venmo at @dubphotos.',
    'Your prints will be shipped approximately 8 to 10 weeks after we receive your payment.',
    'Sitting fees are collected at the time of the photo session and may be paid through Venmo or cash. Credit and debit cards are not accepted.',
    'DuBose Photography does not offer digital copies of client images.',
  ],
};

/** Single-print sizes from the studio price list. '4 wallets' is one sheet of four wallets; 4x5 is priced like a 5x7. */
export const PrintSizes = ['4 wallets', '4x5', '5x7', '8x10', '11x14', '16x20'];

/** Size a favorite proof starts with on a new order. */
export const DefaultPrintSize = '8x10';

export const PackageRules = 'Packages are for single image portraits only, all of the same pose. No substitutions.';
