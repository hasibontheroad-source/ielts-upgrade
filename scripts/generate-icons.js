import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function generateIconPNG(size, isMaskable = false) {
  const width = size;
  const height = size;

  // Raw RGBA pixels per scanline: 1 filter byte (0) + width * 4 bytes
  const scanlineWidth = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineWidth * height);

  const cx = width / 2;
  const cy = height / 2;
  const scale = isMaskable ? 0.8 : 1.0;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineWidth;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const nx = (x - cx) / (cx * scale);
      const ny = (y - cy) / (cy * scale);
      const distFromCenter = Math.sqrt(nx * nx + ny * ny);

      // Default background: dark slate #0f172a
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Shield / Emblem region
      const inShield = Math.abs(nx) < 0.65 && ny > -0.7 && ny < (0.8 - Math.abs(nx) * 0.7);
      if (inShield) {
        // Red crest gradient #ef4444 to #b91c1c
        const crestGrad = Math.min(1, Math.max(0, (ny + 0.7) / 1.5));
        r = Math.round(239 - crestGrad * 54);
        g = Math.round(68 - crestGrad * 40);
        b = Math.round(68 - crestGrad * 40);

        // Gold center medallion
        const medDist = Math.sqrt(nx * nx + (ny + 0.05) * (ny + 0.05));
        if (medDist < 0.35) {
          if (medDist > 0.30) {
            // Gold border
            r = 245; g = 158; b = 11;
          } else {
            // Dark interior
            r = 9; g = 13; b = 22;
          }
        }

        // Academic Ribbon / Text bar
        if (ny > 0.40 && ny < 0.58 && Math.abs(nx) < 0.45) {
          r = 255; g = 255; b = 255; // White academic banner
        }
      }

      // Outer rounded rect border for non-maskable
      if (!isMaskable) {
        const cornerDist = Math.max(Math.abs(x - cx) - (cx - 24), 0)**2 + Math.max(Math.abs(y - cy) - (cy - 24), 0)**2;
        if (cornerDist > 24 * 24) {
          a = 0;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: 13 bytes (width: 4, height: 4, depth: 1 (8-bit), colorType: 1 (6 = RGBA), comp: 1, filter: 1, interlace: 1)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const pubDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), generateIconPNG(192, false));
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), generateIconPNG(512, false));
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), generateIconPNG(512, true));
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), generateIconPNG(180, false));
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), generateIconPNG(32, false));

console.log('Successfully generated all PWA icons (192, 512, maskable, apple-touch-icon, favicon).');
