const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'book-covers');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const STOIC_BOOKS = [
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    openLibraryId: 'OL7388586M',
    coverSize: 'L'
  },
  {
    title: 'Enchiridion',
    author: 'Epictetus',
    openLibraryId: 'OL24597746M',
    coverSize: 'L'
  },
  {
    title: 'Discourses',
    author: 'Epictetus',
    openLibraryId: 'OL7352805M',
    coverSize: 'L'
  },
  {
    title: 'Letters from a Stoic',
    author: 'Seneca',
    openLibraryId: 'OL7772662M',
    coverSize: 'L'
  },
  {
    title: 'On the Shortness of Life',
    author: 'Seneca',
    openLibraryId: 'OL26268896M',
    coverSize: 'L'
  }
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

function getOpenLibraryCoverUrl(book) {
  return `https://covers.openlibrary.org/b/id/${book.openLibraryId}-${book.coverSize}.jpg`;
}

async function fetchOpenLibraryData(book) {
  return new Promise((resolve, reject) => {
    https.get(`https://openlibrary.org/works/${book.openLibraryId}.json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function downloadBookCovers() {
  ensureDirectory(OUTPUT_DIR);
  ensureDirectory(PUBLIC_DIR);
  
  console.log('=== Stoic Book Covers Downloader ===\n');
  
  for (const book of STOIC_BOOKS) {
    console.log(`\n📚 ${book.title} — ${book.author}`);
    
    const safeTitle = book.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const coverFilename = `${safeTitle}-cover.jpg`;
    const spineFilename = `${safeTitle}-spine.jpg`;
    
    const coverPath = path.join(OUTPUT_DIR, coverFilename);
    const publicCoverPath = path.join(PUBLIC_DIR, 'book-cover.jpg');
    
    const coverUrl = `https://covers.openlibrary.org/b/olid/${book.openLibraryId}-${book.coverSize}.jpg`;
    
    try {
      console.log(`   Downloading cover...`);
      await downloadImage(coverUrl, coverPath);
      const stats = fs.statSync(coverPath);
      console.log(`   ✓ Cover downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
      
      console.log(`   Copying to public/book-cover.jpg...`);
      fs.copyFileSync(coverPath, publicCoverPath);
      console.log(`   ✓ Copied to public folder`);
      
    } catch (error) {
      console.log(`   ✗ Failed: ${error.message}`);
    }
  }
  
  console.log('\n=== Complete ===');
  console.log(`\nDownloaded covers: ${OUTPUT_DIR}`);
  console.log(`Public folder: ${PUBLIC_DIR}`);
  console.log('\nTo use a specific cover:');
  console.log('  cp assets/book-covers/<filename>.jpg public/book-cover.jpg');
}

downloadBookCovers().catch(console.error);
