// 纯 node PNG 解码/编码工具（8-bit RGBA, 非隔行）
const zlib = require('zlib');
const fs = require('fs');

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// 解码 PNG -> {w,h,data(RGBA)}
function decodePNG(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error('not png: ' + file);
  let pos = 8, w = 0, h = 0, bitDepth, colorType, interlace = 0;
  const idats = [];
  let palette = null, trns = null;
  while (pos < b.length) {
    const len = b.readUInt32BE(pos);
    const type = b.toString('ascii', pos + 4, pos + 8);
    const data = b.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idats.push(data);
    else if (type === 'PLTE') palette = Buffer.from(data);
    else if (type === 'tRNS') trns = Buffer.from(data);
    pos += 12 + len;
  }
  if (bitDepth !== 8) throw new Error('unsupported bitDepth ' + bitDepth + ' in ' + file);
  if (interlace !== 0) throw new Error('interlaced png not supported: ' + file);
  const raw = zlib.inflateSync(Buffer.concat(idats));
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  const stride = w * channels;
  const out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  let p = 0;
  for (let y = 0; y < h; y++) {
    const filter = raw[p++];
    const line = Buffer.from(raw.subarray(p, p + stride));
    p += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? line[x - channels] : 0;
      const bb = prev[x];
      const c = x >= channels ? prev[x - channels] : 0;
      switch (filter) {
        case 0: break;
        case 1: line[x] = (line[x] + a) & 0xff; break;
        case 2: line[x] = (line[x] + bb) & 0xff; break;
        case 3: line[x] = (line[x] + ((a + bb) >> 1)) & 0xff; break;
        case 4: {
          const pa = Math.abs(bb - c), pb = Math.abs(a - c), pc = Math.abs(a + bb - 2 * c);
          const pr = pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
          line[x] = (line[x] + pr) & 0xff;
          break;
        }
      }
    }
    prev = line;
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      if (colorType === 6) {
        out[o] = line[x * 4]; out[o + 1] = line[x * 4 + 1]; out[o + 2] = line[x * 4 + 2]; out[o + 3] = line[x * 4 + 3];
      } else if (colorType === 2) {
        out[o] = line[x * 3]; out[o + 1] = line[x * 3 + 1]; out[o + 2] = line[x * 3 + 2]; out[o + 3] = 255;
      } else if (colorType === 0) {
        out[o] = out[o + 1] = out[o + 2] = line[x]; out[o + 3] = 255;
      } else if (colorType === 3) {
        const idx = line[x];
        out[o] = palette[idx * 3]; out[o + 1] = palette[idx * 3 + 1]; out[o + 2] = palette[idx * 3 + 2];
        out[o + 3] = trns && idx < trns.length ? trns[idx] : 255;
      } else if (colorType === 4) {
        out[o] = out[o + 1] = out[o + 2] = line[x * 2]; out[o + 3] = line[x * 2 + 1];
      }
    }
  }
  return { w, h, data: out };
}

// 编码 RGBA -> PNG
function encodePNG(w, h, data) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

module.exports = { decodePNG, encodePNG };
