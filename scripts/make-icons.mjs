// Builds all icon sizes from the approved master (white background → cropped square tile with transparent rounded corners).
import sharp from "sharp"; import { writeFileSync } from "node:fs";
const SRC = process.argv[2] ?? "/workspace/thriftradarfl-assets/trfl-icon.png";
const trimmed = await sharp(SRC).trim({ background: "#ffffff", threshold: 40 }).toBuffer({ resolveWithObject: true });
const { width: w, height: h } = trimmed.info; const side = Math.max(w, h);
const square = await sharp({ create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: trimmed.data, left: Math.round((side - w) / 2), top: Math.round((side - h) / 2) }]).png().toBuffer();
const r = Math.round(side * 0.2); // tile corner radius ≈ 20%
const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}"><rect x="1" y="1" width="${side - 2}" height="${side - 2}" rx="${r}" ry="${r}" fill="#fff"/></svg>`);
const tile = await sharp(square).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
const out = (n, file, buf = tile) => sharp(buf).resize(n, n, { kernel: "lanczos3" }).png({ compressionLevel: 9 }).toFile(file);
await out(192, "public/icons/icon-192.png"); await out(512, "public/icons/icon-512.png");
await sharp(tile).resize(180, 180).flatten({ background: "#ffffff" }).png().toFile("public/icons/apple-touch-icon.png"); // iOS ignores alpha
await out(64, "public/icons/mark-64.png"); await out(128, "public/icons/mark-128.png");
// Maskable: full-bleed royal background, tile inside the 80% safe zone.
const inner = await sharp(tile).resize(368, 368).toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#0b3fc4" } }).composite([{ input: inner, left: 72, top: 72 }]).png().toFile("public/icons/maskable-512.png");
await sharp(tile).resize(96, 96).flatten({ background: "#072a66" }).png().toFile("public/icons/email-icon-96.png");
// favicon.ico with embedded PNGs (16/32/48)
const sizes = [16, 32, 48]; const pngs = await Promise.all(sizes.map((n) => sharp(tile).resize(n, n).png().toBuffer()));
const head = Buffer.alloc(6 + 16 * sizes.length); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let off = head.length; pngs.forEach((p, i) => { const e = 6 + 16 * i; head.writeUInt8(sizes[i], e); head.writeUInt8(sizes[i], e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(p.length, e + 8); head.writeUInt32LE(off, e + 12); off += p.length; });
writeFileSync("src/app/favicon.ico", Buffer.concat([head, ...pngs]));
console.log("tile", w, h, "→", side);
// Email lockup: icon + wordmark (white text for the navy email header), 2x for retina.
const word = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="420" height="96"><text x="12" y="64" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="#fff">ThriftRadar</text><rect x="320" y="26" width="60" height="44" rx="7" fill="#d4001a"/><text x="331" y="59" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#fff">FL</text></svg>`);
await sharp({ create: { width: 516, height: 96, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: await sharp(tile).resize(88, 88).toBuffer(), left: 4, top: 4 }, { input: word, left: 96, top: 0 }]).png({ compressionLevel: 9 }).toFile("public/logo-email.png");
