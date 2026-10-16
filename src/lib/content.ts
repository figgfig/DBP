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
  heading: 'About DuBose',
  paragraphs: [
    'DuBose Photography specializes in the classic black and white vignetted style of portraiture created in the earlier days of photography.',
    'DuBose Blakeney is a self-trained photographer and has been creating memorable images since 1994. His angelic portraits of children are displayed around the world, and their timeless look will take you back to days gone by.',
    'A native Charlestonian, DuBose enjoys spending time with his family in the charm-filled Holy City.',
    'DuBose travels around the Southeast providing children’s photography shoots, scheduling travel sessions during the Spring and Fall months. He photographs children from 6 months to 16 years.',
  ],
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
      body: 'A non-refundable sitting fee is charged for each child, usually $100 with a $200 minimum order per child. It is collected at the time of the session and applied to that child’s order. Each session lists its own fee and minimum.',
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

/**
 * Print prices, taken from the studio's Spring 2026 order forms (the prices
 * the studio actually charged), with the package contents and composite rules
 * from the studio price lists. The website does not publish prices.
 */
export interface PrintPackage {
  id: string;
  name: string;
  price: number;
  /** What the package contains. Every print in a package is the same pose. */
  contents: { size: string; quantity: number }[];
  summary: string;
}

export const Packages: PrintPackage[] = [
  {
    id: 'package-1',
    name: 'Package 1',
    price: 795,
    contents: [
      { size: '16x20', quantity: 1 },
      { size: '8x10', quantity: 1 },
      { size: '5x7', quantity: 2 },
    ],
    summary: 'One 16x20, one 8x10, two 5x7s',
  },
  {
    id: 'package-2',
    name: 'Package 2',
    price: 550,
    contents: [
      { size: '11x14', quantity: 2 },
      { size: '5x7', quantity: 2 },
    ],
    summary: 'Two 11x14s, two 5x7s',
  },
  {
    id: 'package-3',
    name: 'Package 3',
    price: 475,
    contents: [
      { size: '11x14', quantity: 1 },
      { size: '5x7', quantity: 2 },
      { size: '4 wallets', quantity: 1 },
    ],
    summary: 'One 11x14, two 5x7s, four wallets',
  },
  {
    id: 'package-4',
    name: 'Package 4',
    price: 375,
    contents: [
      { size: '8x10', quantity: 1 },
      { size: '5x7', quantity: 2 },
      { size: '4 wallets', quantity: 1 },
    ],
    summary: 'One 8x10, two 5x7s, four wallets',
  },
];

export const PackageRules = 'Packages are for single image portraits only, all of the same pose. No substitutions.';

export function getPackage(id: string): PrintPackage | undefined {
  return Packages.find((p) => p.id === id);
}

export const CompositePricing = {
  /** Price of one composite print by paper size. */
  prices: { '8x10': 375, '11x14': 475, '16x20': 795 } as Record<string, number>,
  additionalChild: 75,
  notes: [
    'Add $75 for each additional child in the same composite.',
    'Buy one composite and get a second print of the same composite at half price.',
  ],
};

/** Single image prices. Each row's prices line up with `sizes`; null means not sold that way. */
export const SinglePricing = {
  sizes: ['16x20', '11x14', '8x10', '5x7 / 4x5', '4 wallets'],
  rows: [
    { label: 'First print of each child', prices: [725, 375, 275, 200, null] },
    { label: 'Same child, different pose', prices: [455, 225, 125, 55, 55] },
    { label: 'Reprint, same child, size and pose', prices: [395, 95, 75, 45, null] },
  ] as { label: string; prices: (number | null)[] }[],
  notes: [
    'After a composite, package, or first print, additional single images use the second and third rows.',
    'Basic retouching and clean-up of children’s faces is included. Additional retouching is quoted by our photo technicians.',
  ],
};
