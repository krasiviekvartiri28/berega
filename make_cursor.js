const Jimp = require("jimp");
const path = require("path");

const SRC = path.join(__dirname, "ключ 2.png");
const OUT_DIR = path.join(__dirname, "site");

async function run() {
  const img = await Jimp.read(SRC);
  console.log("Source:", img.bitmap.width, "x", img.bitmap.height);

  // Удаляем почти-белый фон -> прозрачность
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    if (r > 240 && g > 240 && b > 240) {
      this.bitmap.data[idx + 3] = 0; // alpha = 0
    }
  });

  // Обрезаем по непрозрачным пикселям
  let minX = img.bitmap.width, minY = img.bitmap.height, maxX = 0, maxY = 0;
  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    if (this.bitmap.data[idx + 3] > 10) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  });
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  img.crop(minX, minY, cropW, cropH);
  console.log("Cropped:", img.bitmap.width, "x", img.bitmap.height);

  // Делаем квадрат с прозрачным фоном (чтобы курсор не растягивало по разным осям)
  const side = Math.max(img.bitmap.width, img.bitmap.height);
  const square = new Jimp(side, side, 0x00000000);
  square.composite(img, Math.floor((side - img.bitmap.width) / 2), Math.floor((side - img.bitmap.height) / 2));

  for (const size of [32, 64, 128]) {
    const out = square.clone().resize(size, size, Jimp.RESIZE_BICUBIC);
    const outPath = path.join(OUT_DIR, `cursor-key-${size}.png`);
    await out.writeAsync(outPath);
    console.log("Saved:", outPath);
  }
  console.log("DONE");
}

run().catch(e => { console.error(e); process.exit(1); });
