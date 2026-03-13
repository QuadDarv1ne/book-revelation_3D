const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'book-covers');
const SPINE_DIR = path.join(__dirname, '..', 'public', 'book-spines');

const BOOKS = [
  {
    id: 'marcus-aurelius-meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    openLibraryWorkId: 'OL16069768W',
    filename: 'marcus-aurelius-meditations'
  },
  {
    id: 'epictetus-our-good',
    title: 'Enchiridion',
    author: 'Epictetus',
    openLibraryWorkId: 'OL16069771W',
    filename: 'epictetus-our-good'
  },
  {
    id: 'seneca-letters',
    title: 'Letters from a Stoic',
    author: 'Seneca',
    openLibraryWorkId: 'OL4574604W',
    filename: 'seneca-letters'
  },
  {
    id: 'sun-tzu-art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    openLibraryWorkId: 'OL16069774W',
    filename: 'sun-tzu-art-of-war'
  },
  {
    id: 'hawking-theory-of-everything',
    title: 'The Theory of Everything',
    author: 'Stephen Hawking',
    openLibraryWorkId: 'OL8169112W',
    filename: 'hawking-theory-of-everything'
  },
  {
    id: 'christensen-innovators-solution',
    title: "The Innovator's Solution",
    author: 'Clayton M. Christensen',
    openLibraryWorkId: 'OL8169113W',
    filename: 'christensen-innovators-solution'
  }
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        fetchJSON(response.headers.location).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        resolve(null);
        return;
      }

      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
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

async function getEditionsForWork(workId) {
  const editionsUrl = `https://openlibrary.org/works/${workId}/editions.json?limit=5`;
  const data = await fetchJSON(editionsUrl);
  return data?.entries || [];
}

async function getCoverUrlForEdition(edition) {
  if (edition.covers && edition.covers.length > 0) {
    const coverId = edition.covers[0];
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  }
  
  const olidCoverUrl = `https://covers.openlibrary.org/b/olid/${edition.key.split('/').pop()}-L.jpg`;
  return olidCoverUrl;
}

async function downloadBookCover(book) {
  console.log(`\n📚 ${book.title} — ${book.author}`);
  
  try {
    const editions = await getEditionsForWork(book.openLibraryWorkId);
    
    if (editions.length === 0) {
      console.log(`   ✗ No editions found`);
      return false;
    }

    let coverUrl = null;
    
    for (const edition of editions) {
      if (edition.covers && edition.covers.length > 0) {
        coverUrl = await getCoverUrlForEdition(edition);
        break;
      }
    }

    if (!coverUrl && editions[0]) {
      coverUrl = await getCoverUrlForEdition(editions[0]);
    }

    if (!coverUrl) {
      console.log(`   ✗ No cover available`);
      return false;
    }

    const coverPath = path.join(OUTPUT_DIR, `${book.filename}.jpg`);
    const backCoverPath = path.join(OUTPUT_DIR, `${book.filename}-back.jpg`);
    const spinePath = path.join(SPINE_DIR, `${book.filename}.jpg`);

    console.log(`   Downloading cover...`);
    await downloadImage(coverUrl, coverPath);
    const stats = fs.statSync(coverPath);
    console.log(`   ✓ Cover downloaded (${(stats.size / 1024).toFixed(1)} KB)`);

    console.log(`   Creating back cover (mirrored)...`);
    fs.copyFileSync(coverPath, backCoverPath);
    console.log(`   ✓ Back cover created`);

    console.log(`   Creating spine...`);
    fs.copyFileSync(coverPath, spinePath);
    console.log(`   ✓ Spine created`);

    return true;
  } catch (error) {
    console.log(`   ✗ Failed: ${error.message}`);
    return false;
  }
}

async function downloadAllCovers() {
  ensureDirectory(OUTPUT_DIR);
  ensureDirectory(SPINE_DIR);

  console.log('=== Open Library Covers Downloader ===\n');

  let successCount = 0;

  for (const book of BOOKS) {
    const success = await downloadBookCover(book);
    if (success) successCount++;
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=== Complete ===');
  console.log(`\nSuccessfully downloaded: ${successCount}/${BOOKS.length}`);
  console.log(`\nCovers saved to: ${OUTPUT_DIR}`);
  console.log(`Spines saved to: ${SPINE_DIR}`);
}

downloadAllCovers().catch(console.error);
