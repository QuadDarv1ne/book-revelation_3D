const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'book-covers');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const STOIC_BOOKS = [
  { title: 'Meditations Marcus Aurelius', q: 'Marcus+Aurelius+Meditations' },
  { title: 'Enchiridion Epictetus', q: 'Epictetus+Enchiridion' },
  { title: 'Letters Seneca', q: 'Seneca+Letters+Stoic' },
  { title: 'Discourses Epictetus', q: 'Epictetus+Discourses' }
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(outputPath);
    
    lib.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function downloadGoogleBooksCovers() {
  ensureDirectory(OUTPUT_DIR);
  ensureDirectory(PUBLIC_DIR);
  
  console.log('=== Google Books Covers Downloader ===\n');
  
  for (const book of STOIC_BOOKS) {
    console.log(`\n📚 ${book.title}`);
    
    try {
      const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${book.q}&maxResults=1&printType=books`;
      console.log(`   Searching...`);
      
      const data = await fetchJson(apiUrl);
      
      if (!data.items || data.items.length === 0) {
        console.log(`   ✗ Not found`);
        continue;
      }
      
      const volume = data.items[0];
      const imageLinks = volume.volumeInfo.imageLinks;
      
      if (!imageLinks || !imageLinks.thumbnail) {
        console.log(`   ✗ No cover image`);
        continue;
      }
      
      const imageUrl = imageLinks.thumbnail.replace('zoom=1', 'zoom=3');
      console.log(`   Found: ${imageUrl}`);
      
      const safeTitle = book.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const coverPath = path.join(OUTPUT_DIR, `${safeTitle}-cover.jpg`);
      
      await downloadImage(imageUrl, coverPath);
      const stats = fs.statSync(coverPath);
      console.log(`   ✓ Downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
      
    } catch (error) {
      console.log(`   ✗ Failed: ${error.message}`);
    }
  }
  
  console.log('\n=== Complete ===');
  console.log(`Covers saved to: ${OUTPUT_DIR}`);
}

downloadGoogleBooksCovers().catch(console.error);
