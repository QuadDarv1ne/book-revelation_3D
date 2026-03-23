#!/usr/bin/env node

/**
 * Улучшенный скрипт для загрузки обложек книг
 * Поддерживает Open Library, Google Books, Internet Archive
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'book-covers');

// Книги с ISBN из books.ts
const BOOKS = [
  {
    id: 'marcus-aurelius-meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    isbn: '9780140449334',
    filename: 'marcus-aurelius-meditations'
  },
  {
    id: 'epictetus-our-good',
    title: 'Enchiridion',
    author: 'Epictetus',
    isbn: '9780195041583',
    filename: 'epictetus-our-good'
  },
  {
    id: 'seneca-letters',
    title: 'Letters from a Stoic',
    author: 'Seneca',
    isbn: '9780140442106',
    filename: 'seneca-letters'
  },
  {
    id: 'sun-tzu-art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    isbn: '9781599869773',
    filename: 'sun-tzu-art-of-war'
  },
  {
    id: 'hawking-theory-of-everything',
    title: 'The Theory of Everything',
    author: 'Stephen Hawking',
    isbn: '9780762476282',
    filename: 'hawking-theory-of-everything'
  },
  {
    id: 'christensen-innovators-solution',
    title: "The Innovator's Solution",
    author: 'Clayton M. Christensen',
    isbn: '9781422185889',
    filename: 'christensen-innovators-solution'
  }
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
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

      const file = fs.createWriteStream(outputPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function tryOpenLibrary(isbn) {
  const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  console.log(`  Trying Open Library: ${url}`);

  try {
    const tempPath = path.join(OUTPUT_DIR, 'temp.jpg');
    await downloadImage(url, tempPath);

    const stats = fs.statSync(tempPath);
    if (stats.size < 1000) {
      fs.unlinkSync(tempPath);
      return null;
    }

    return tempPath;
  } catch (error) {
    return null;
  }
}

async function tryGoogleBooks(isbn) {
  return new Promise((resolve) => {
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
    console.log(`  Trying Google Books API...`);

    https.get(apiUrl, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', async () => {
        try {
          const json = JSON.parse(data);
          if (json.items && json.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
            const imageUrl = json.items[0].volumeInfo.imageLinks.thumbnail
              .replace('zoom=1', 'zoom=3')
              .replace('http:', 'https:');

            console.log(`  Found: ${imageUrl}`);
            const tempPath = path.join(OUTPUT_DIR, 'temp.jpg');
            await downloadImage(imageUrl, tempPath);
            resolve(tempPath);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function tryInternetArchive(isbn) {
  const url = `https://archive.org/services/img/isbn_${isbn}`;
  console.log(`  Trying Internet Archive: ${url}`);

  try {
    const tempPath = path.join(OUTPUT_DIR, 'temp.jpg');
    await downloadImage(url, tempPath);

    const stats = fs.statSync(tempPath);
    if (stats.size < 1000) {
      fs.unlinkSync(tempPath);
      return null;
    }

    return tempPath;
  } catch (error) {
    return null;
  }
}

async function downloadBookCover(book) {
  console.log(`\n📚 ${book.title} by ${book.author}`);
  console.log(`   ISBN: ${book.isbn}`);

  const outputPath = path.join(OUTPUT_DIR, `${book.filename}.jpg`);

  if (fs.existsSync(outputPath)) {
    console.log(`   ✓ Already exists: ${outputPath}`);
    return;
  }

  // Try sources in order
  let tempPath = await tryOpenLibrary(book.isbn);

  if (!tempPath) {
    tempPath = await tryGoogleBooks(book.isbn);
  }

  if (!tempPath) {
    tempPath = await tryInternetArchive(book.isbn);
  }

  if (tempPath) {
    fs.renameSync(tempPath, outputPath);
    const stats = fs.statSync(outputPath);
    console.log(`   ✓ Downloaded: ${(stats.size / 1024).toFixed(1)} KB`);
    console.log(`   Saved to: ${outputPath}`);
  } else {
    console.log(`   ✗ Not found in any source`);
    console.log(`   💡 Try manual search:`);
    console.log(`      Amazon: https://www.amazon.com/s?k=${book.isbn}`);
    console.log(`      Google: https://books.google.com/books?isbn=${book.isbn}`);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     📚 Book Cover Downloader (Multi-Source)           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  ensureDirectory(OUTPUT_DIR);

  for (const book of BOOKS) {
    await downloadBookCover(book);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ Complete                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\nCovers saved to: ${OUTPUT_DIR}`);
  console.log('\nNext steps:');
  console.log('1. Check downloaded covers');
  console.log('2. Manually download missing covers from Amazon/Google Books');
  console.log('3. Run: npm run covers:optimize (convert to WebP)');
  console.log('4. Generate spines: node scripts/create-spine.js');
}

main().catch(console.error);
