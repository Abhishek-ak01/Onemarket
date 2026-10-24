const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const dir = path.join(__dirname, '..', 'assets', 'product-images');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Create placeholder.svg
const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#f0fdf4" stroke="#a7f3d0" stroke-width="2"/>
  <circle cx="200" cy="115" r="45" fill="#d1fae5"/>
  <path d="M175 120 L195 100 L225 130 L215 130" fill="none" stroke="#059669" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="185" cy="105" r="4" fill="#047857"/>
  <text x="200" y="190" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="#1b4332" text-anchor="middle">OneMarket</text>
  <text x="200" y="215" font-family="system-ui, sans-serif" font-size="13" fill="#059669" text-anchor="middle">Local Hubballi Verified Item</text>
</svg>`;
fs.writeFileSync(path.join(dir, 'placeholder.svg'), placeholderSvg);
console.log('Created placeholder.svg');

async function downloadImages() {
  const prods = await db.query('SELECT id, name, category, image FROM products');
  console.log('Total products to process:', prods.length);

  let successCount = 0;
  for (const prod of prods) {
    const filename = `${prod.id}.jpg`;
    const dest = path.join(dir, filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      successCount++;
      continue;
    }

    try {
      if (prod.image && prod.image.startsWith('http')) {
        const res = await fetch(prod.image);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(dest, buf);
          console.log(`✓ [${prod.id}] Saved ${filename} (${buf.length} bytes)`);
          successCount++;
          continue;
        }
      }
    } catch (err) {
      console.warn(`! [${prod.id}] Download failed: ${err.message}`);
    }

    // Fallback if download failed
    fs.copyFileSync(path.join(dir, 'placeholder.svg'), dest);
    console.log(`Fallback placeholder used for ${prod.id}`);
  }

  console.log(`Finished processing images. ${successCount}/${prods.length} downloaded successfully.`);
  process.exit(0);
}

downloadImages().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
