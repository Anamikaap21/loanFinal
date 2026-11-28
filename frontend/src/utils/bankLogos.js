/**
 * Official Verified Banking Partner Logos Utility
 * Ensures ONLY authentic, researched official logos are displayed across RealCred
 * with active cache busting to prevent stale or previously generated logos from persisting.
 */

export const BANK_OFFICIAL_LOGOS = {
  // 10 Public Sector Undertaking (PSU) Banks
  BOB: '/assets/banks/bob.svg',
  BOI: '/assets/banks/boi.png',
  BOM: '/assets/banks/bom.svg',
  CANARA: '/assets/banks/canara.svg',
  IDBI: '/assets/banks/idbi.svg',
  INDIANBANK: '/assets/banks/indianbank.svg',
  PNB: '/assets/banks/pnb.svg',
  SBI: '/assets/banks/sbi.svg',
  UCO: '/assets/banks/uco.jpg',
  UNIONBANK: '/assets/banks/unionbank.svg',

  // 10 Private Sector Banks
  AUBANK: '/assets/banks/aubank.svg',
  AXIS: '/assets/banks/axis.svg',
  DCB: '/assets/banks/dcb.svg',
  FEDERAL: '/assets/banks/federal.svg',
  HDFC: '/assets/banks/hdfc.svg',
  HSBC: '/assets/banks/hsbc.svg',
  ICICI: '/assets/banks/icici.svg',
  IDFC: '/assets/banks/idfc.svg',
  INDUSIND: '/assets/banks/indusind.svg',
  KOTAK: '/assets/banks/kotak.svg',

  // 17 Non-Banking Financial Companies (NBFCs) & Housing Finance Companies (HFCs)
  ABHFL: '/assets/banks/abhfl.svg',
  AXISFIN: '/assets/banks/axisfin.webp',
  BAJAJHFL: '/assets/banks/bajajhfl.svg',
  CHOLA: '/assets/banks/chola.svg',
  EASYHOME: '/assets/banks/easyhome.svg',
  GODREJHFL: '/assets/banks/godrejhfl.svg',
  HINDUJA: '/assets/banks/hinduja.png',
  ICICIHFC: '/assets/banks/icicihfc.png',
  IIFL: '/assets/banks/iifl.svg',
  LTFIN: '/assets/banks/ltfin.svg',
  LICHFL: '/assets/banks/lichfl.svg',
  MOTILAL: '/assets/banks/motilal.svg',
  PIRAMAL: '/assets/banks/piramal.svg',
  PNBHFL: '/assets/banks/pnbhfl.png',
  SAMMAN: '/assets/banks/samman.png',
  TATAHFC: '/assets/banks/tatahfc.svg',
  VASTU: '/assets/banks/vastu.svg',
};

// Cache-busting version token to ensure clients immediately discard old/synthetic cached logos
export const LOGO_CACHE_VERSION = 'v=20261128_official';

/**
 * Returns the verified official logo URL for a bank or NBFC
 * @param {Object|string} bank Bank object or bankCode string
 * @returns {string} Fully resolved official logo path with cache busting
 */
export function getVerifiedBankLogo(bank) {
  if (!bank) return '';
  
  const code = (typeof bank === 'string' ? bank : (bank.bankCode || '')).toUpperCase().trim();
  const canonicalPath = BANK_OFFICIAL_LOGOS[code] || (typeof bank === 'object' ? bank.logoUrl : '') || '';
  
  if (!canonicalPath) return '';
  
  // Strip any old query strings and append latest official cache invalidation token
  const cleanPath = canonicalPath.split('?')[0];
  return `${cleanPath}?${LOGO_CACHE_VERSION}`;
}
