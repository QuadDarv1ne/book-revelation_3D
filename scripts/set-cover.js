const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'assets', 'book-covers', 'mark-avreliy-naedine-s-soboy-v-chem-nashe-blago.jpg');
const dest = path.join(__dirname, '..', 'public', 'book-cover.jpg');

try {
  fs.copyFileSync(src, dest);
  const stats = fs.statSync(dest);
  console.log(`✓ Copied to public/book-cover.jpg (${(stats.size / 1024).toFixed(1)} KB)`);
} catch (error) {
  console.error('✗ Error:', error.message);
}
