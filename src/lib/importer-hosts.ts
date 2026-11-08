const ALLOWED = [/(^|\.)estatesales\.net$/, /(^|\.)estatesales\.org$/, /(^|\.)auctionzip\.com$/, /(^|\.)hibid\.com$/];
export const isAllowedImportHost = (u: string) => { try { const h = new URL(u).hostname; return ALLOWED.some((r) => r.test(h)); } catch { return false; } };
