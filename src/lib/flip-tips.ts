// "Items to look for" vocabulary + general resale tips. Tips are generic know-how, not price promises;
// each tag links to eBay *sold* listings so shoppers can check real recent comps themselves.
export const TAGS = ["furniture", "mid-century", "tools", "jewelry", "vinyl", "art", "collectibles", "clothing", "books", "antiques", "barware", "nautical", "fishing", "electronics", "kitchen", "toys"] as const;
export type Tag = (typeof TAGS)[number];
export const TAG_LABEL: Record<Tag, string> = { furniture: "Furniture", "mid-century": "Mid-century", tools: "Tools", jewelry: "Jewelry", vinyl: "Vinyl records", art: "Art", collectibles: "Collectibles", clothing: "Clothing", books: "Books", antiques: "Antiques", barware: "Barware", nautical: "Nautical", fishing: "Fishing gear", electronics: "Electronics", kitchen: "Kitchenware", toys: "Toys & games" };
export const FLIP_TIPS: Record<Tag, string> = {
  furniture: "Solid wood beats veneer — check drawer joints (dovetails are a good sign) and the maker's stamp inside drawers. Bulky pieces sell best locally on Marketplace.",
  "mid-century": "Look for maker labels (Lane, Broyhill, Drexel, Heywood-Wakefield) under tops and inside drawers. Teak and walnut in original finish draw collectors; heavy refinishing can hurt value.",
  tools: "Older USA-made hand tools and complete power-tool kits with batteries/chargers resell steadily. Test cordless tools — dead batteries are the usual catch.",
  jewelry: "Check clasps for 925, 14K, 10K or maker marks; a magnet helps rule out gold/silver plate. Signed costume pieces often outsell unsigned fine-looking ones.",
  vinyl: "Condition is everything — check for warps and deep scratches, and that the record matches the sleeve. Original pressings of jazz, soul and classic rock move fastest.",
  art: "Look for a signature, gallery labels or provenance on the back. Original paintings and signed, numbered prints are worth researching; decor prints rarely are.",
  collectibles: "Complete sets and original boxes matter more than age. Research the exact item number — similar-looking pieces can differ a lot in value.",
  clothing: "Natural fibers, made-in-USA labels and older union tags signal vintage. Check seams, zippers and underarms before buying.",
  books: "First editions, signed copies and out-of-print niche nonfiction sell best. Scan ISBNs with a resale app before buying a box.",
  antiques: "Patina, hand-cut nails and maker's marks help date pieces. Damage and repairs cut value sharply — inspect in good light.",
  barware: "Signed crystal, mid-century gold-rim glass sets and quality shakers sell well as complete sets. Check rims for chips with a fingertip.",
  nautical: "Brass instruments, old charts and maker-marked items are worth a look; reproduction decor is common, so check weight and markings.",
  fishing: "Vintage reels (Penn, Abu Garcia, Shakespeare) and old wooden lures have active collector markets. Spin reels to check they're smooth.",
  electronics: "Ask to plug things in. Vintage receivers, turntables and film cameras can sell well even untested, but working items fetch much more.",
  kitchen: "Cast iron (Griswold, Wagner), Pyrex patterns and complete stand-mixer sets are dependable resellers. Avoid crazed or chipped glass.",
  toys: "Complete with original box and pieces is what matters. Older video games, LEGO sets and action figures have strong sold-listing data to check.",
};
export const ebaySoldUrl = (q: string) => `https://www.ebay.com/sch/i.html?${new URLSearchParams({ _nkw: q, LH_Sold: "1", LH_Complete: "1" })}`;
export const cleanTags = (v: unknown): Tag[] => {
  const arr = Array.isArray(v) ? v.map(String) : String(v ?? "").split(",");
  return [...new Set(arr.map((x) => x.trim().toLowerCase()).filter((x): x is Tag => (TAGS as readonly string[]).includes(x)))];
};
/** Tags implied by words in a title (used to tag seed data without inventing contents). */
export function tagsFromTitle(title: string): Tag[] {
  const t = title.toLowerCase(); const m: [RegExp, Tag][] = [[/furniture/, "furniture"], [/mid-century|teak/, "mid-century"], [/tools?\b/, "tools"], [/jewel/, "jewelry"], [/vinyl|records/, "vinyl"],
    [/\bart\b/, "art"], [/collectible/, "collectibles"], [/books?/, "books"], [/antique/, "antiques"], [/barware/, "barware"], [/nautical/, "nautical"], [/fishing/, "fishing"]];
  return m.filter(([r]) => r.test(t)).map(([, tag]) => tag);
}
