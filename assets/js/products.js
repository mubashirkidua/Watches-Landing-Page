/* ============================================================
   THE OCEAN WATCHES — Product Catalogue Data
   Exposed as window.OW_PRODUCTS for shared components
   ============================================================ */
(function () {
  'use strict';

  window.OW_PRODUCTS = [
    {
      id: 'royal', category: 'Royal', name: 'Ocean Royal', img: 'assets/svg/watches/royal.svg',
      desc: 'Deep royal-blue sunray dial crowned in gold. Precision quartz heartbeat for the modern monarch.',
      original: 289000, discount: 199000, rating: 4.9, reviews: 128,
      badge: { label: 'Best Seller', type: 'gold' }, featured: true,
      specs: [
        { label: 'Movement', value: 'Swiss Quartz 6A20' },
        { label: 'Case', value: '316L Steel 41mm' },
        { label: 'Water Resistance', value: '100m' },
        { label: 'Crystal', value: 'Sapphire AR' },
        { label: 'Strap', value: 'Navy Alligator' },
        { label: 'Warranty', value: '5 Years' }
      ]
    },
    {
      id: 'elite', category: 'Elite', name: 'Ocean Elite', img: 'assets/svg/watches/elite.svg',
      desc: 'Noir-on-noir elegance with a brushed steel bezel and an understated gold seconds hand.',
      original: 265000, discount: 179000, rating: 4.8, reviews: 96,
      badge: { label: 'Limited', type: 'cyan' }, featured: false,
      specs: [
        { label: 'Movement', value: 'Swiss Quartz 6A22' },
        { label: 'Case', value: 'Steel 40mm' },
        { label: 'Water Resistance', value: '80m' },
        { label: 'Crystal', value: 'Sapphire' },
        { label: 'Strap', value: 'Black Leather' },
        { label: 'Warranty', value: '5 Years' }
      ]
    },
    {
      id: 'classic', category: 'Classic', name: 'Ocean Classic', img: 'assets/svg/watches/classic.svg',
      desc: 'A timeless silver dial and polished platinum-tone case — the heirloom every wardrobe deserves.',
      original: 155000, discount: 119000, rating: 4.7, reviews: 84,
      badge: { label: 'Icon', type: 'emerald' }, featured: true,
      specs: [
        { label: 'Movement', value: 'Quartz 6A10' },
        { label: 'Case', value: 'Platinum-Tone 39mm' },
        { label: 'Water Resistance', value: '50m' },
        { label: 'Crystal', value: 'Mineral Hard' },
        { label: 'Strap', value: 'Navy Leather' },
        { label: 'Warranty', value: '3 Years' }
      ]
    },
    {
      id: 'black', category: 'Black', name: 'Ocean Black', img: 'assets/svg/watches/black.svg',
      desc: 'Stealth black with a cyan-lit dial, engineered for those who move after midnight.',
      original: 199000, discount: 149000, rating: 4.8, reviews: 110,
      badge: { label: 'New', type: 'cyan' }, featured: true,
      specs: [
        { label: 'Movement', value: 'Swiss Quartz 6A25' },
        { label: 'Case', value: 'Black Steel 41mm' },
        { label: 'Water Resistance', value: '120m' },
        { label: 'Crystal', value: 'Sapphire AR' },
        { label: 'Strap', value: 'Black Carbon' },
        { label: 'Warranty', value: '5 Years' }
      ]
    },
    {
      id: 'gold', category: 'Gold', name: 'Ocean Gold', img: 'assets/svg/watches/gold.svg',
      desc: 'Champagne-gold case that turns light into luxury. Reserved for the bold.',
      original: 349000, discount: 249000, rating: 5.0, reviews: 72,
      badge: { label: 'Icon', type: 'gold' }, featured: false,
      specs: [
        { label: 'Movement', value: 'Swiss Quartz 6A30' },
        { label: 'Case', value: 'Gold-Tone 42mm' },
        { label: 'Water Resistance', value: '60m' },
        { label: 'Crystal', value: 'Sapphire' },
        { label: 'Strap', value: 'Honey Leather' },
        { label: 'Warranty', value: '5 Years' }
      ]
    },
    {
      id: 'titanium', category: 'Titanium', name: 'Ocean Titanium', img: 'assets/svg/watches/titanium.svg',
      desc: 'Featherlight aerospace titanium with a slate dial built to conquer every horizon.',
      original: 229000, discount: 169000, rating: 4.8, reviews: 64,
      badge: { label: 'Durable', type: 'emerald' }, featured: false,
      specs: [
        { label: 'Movement', value: 'Swiss Quartz 6A18' },
        { label: 'Case', value: 'Titanium 40mm' },
        { label: 'Water Resistance', value: '200m' },
        { label: 'Crystal', value: 'Sapphire AR' },
        { label: 'Strap', value: 'Titanium Bracelet' },
        { label: 'Warranty', value: '7 Years' }
      ]
    },
    {
      id: 'premium', category: 'Premium', name: 'Ocean Premium', img: 'assets/svg/watches/premium.svg',
      desc: 'Emerald lacquer dial and gold indices — rare craft for rare collectors.',
      original: 399000, discount: 289000, rating: 4.9, reviews: 58,
      badge: { label: 'Limited', type: 'cyan' }, featured: true,
      specs: [
        { label: 'Movement', value: 'Swiss Quartz 6A40' },
        { label: 'Case', value: 'Steel 41mm' },
        { label: 'Water Resistance', value: '100m' },
        { label: 'Crystal', value: 'Sapphire AR' },
        { label: 'Strap', value: 'Green Leather' },
        { label: 'Warranty', value: '5 Years' }
      ]
    },
    {
      id: 'prestige', category: 'Prestige', name: 'Ocean Prestige', img: 'assets/svg/watches/prestige.svg',
      desc: 'Midnight aurora dial, platinum bezel and sapphire crystal. The flagship of the ocean.',
      original: 499000, discount: 369000, rating: 5.0, reviews: 41,
      badge: { label: 'Signature', type: 'gold' }, featured: false,
      specs: [
        { label: 'Movement', value: 'Swiss Quartz 6A50' },
        { label: 'Case', value: 'Platinum-Tone 43mm' },
        { label: 'Water Resistance', value: '150m' },
        { label: 'Crystal', value: 'Double AR Sapphire' },
        { label: 'Strap', value: 'Navy Alligator' },
        { label: 'Warranty', value: 'Lifetime' }
      ]
    },
    {
      id: 'sapphire', category: 'Sapphire', name: 'Ocean Sapphire', img: 'assets/svg/watches/sapphire.svg',
      desc: 'A faceted sapphire-blue dial lit by an icy cyan glow. Cut from light, worn by visionaries.',
      original: 229000, discount: 169000, rating: 4.9, reviews: 57,
      badge: { label: 'Crystal', type: 'cyan' }, featured: false,
      specs: [
        { label: 'Movement', value: 'Swiss Quartz 6A28' },
        { label: 'Case', value: 'Platinum-Tone 40mm' },
        { label: 'Water Resistance', value: '120m' },
        { label: 'Crystal', value: 'Sapphire AR' },
        { label: 'Strap', value: 'Royal Blue Leather' },
        { label: 'Warranty', value: '5 Years' }
      ]
    },
    {
      id: 'diamond', category: 'Diamond', name: 'Ocean Diamond', img: 'assets/svg/watches/diamond.svg',
      desc: 'An ice-white dial set with diamond-cut indices. One of only fifty, ever.',
      original: 549000, discount: 419000, rating: 5.0, reviews: 33,
      badge: { label: 'Rare', type: 'gold' }, featured: false,
      specs: [
        { label: 'Movement', value: 'Swiss Quartz 6A60' },
        { label: 'Case', value: 'Platinum-Tone 42mm' },
        { label: 'Water Resistance', value: '100m' },
        { label: 'Crystal', value: 'Dome Sapphire' },
        { label: 'Strap', value: 'White Alligator' },
        { label: 'Warranty', value: 'Lifetime' }
      ]
    }
  ];

  window.OW_PRODUCTS.forEach(function (p) {
    p.off = Math.round((1 - p.discount / p.original) * 100);
  });
})();
