const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'book-covers');
const SPINE_DIR = path.join(__dirname, '..', 'public', 'book-spines');

const BOOK_COLORS = {
  'marcus-aurelius-meditations': { primary: '#d4af37', secondary: '#8b7355' },
  'epictetus-our-good': { primary: '#c9a961', secondary: '#7d6b4f' },
  'seneca-letters': { primary: '#b89f5e', secondary: '#6b5f4a' },
  'sun-tzu-art-of-war': { primary: '#a67c52', secondary: '#5c4a3a' },
  'hawking-theory-of-everything': { primary: '#8b7355', secondary: '#4a3f35' },
  'christensen-innovators-solution': { primary: '#9a7b4f', secondary: '#5a4a3a' }
};

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

function generateTextCoverSVG(book, colors) {
  const width = 400;
  const height = 600;
  const gradientId = `grad-${book.filename}`;
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#${gradientId})"/>
  
  <!-- Decorative border -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  
  <!-- Title text -->
  <text x="${width / 2}" y="${height / 2 - 40}" 
        font-family="Georgia, 'Times New Roman', serif" 
        font-size="32" font-weight="bold" 
        fill="#ffffff" text-anchor="middle" 
        filter="url(#shadow)">
    ${book.title}
  </text>
  
  <!-- Author text -->
  <text x="${width / 2}" y="${height / 2 + 20}" 
        font-family="Georgia, 'Times New Roman', serif" 
        font-size="20" 
        fill="rgba(255,255,255,0.8)" text-anchor="middle">
    ${book.author}
  </text>
  
  <!-- Decorative line -->
  <line x1="${width / 2 - 50}" y1="${height / 2 + 40}" 
        x2="${width / 2 + 50}" y2="${height / 2 + 40}" 
        stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
  
  <!-- Stoic symbol -->
  <text x="${width / 2}" y="${height - 80}" 
        font-size="48" text-anchor="middle" 
        opacity="0.3">
    🏛️
  </text>
</svg>`;
  
  return svg;
}

function generateSpineSVG(book, colors) {
  const width = 60;
  const height = 600;
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spine-grad-${book.filename}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${colors.secondary};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="${width}" height="${height}" fill="url(#spine-grad-${book.filename})"/>
  
  <!-- Vertical text -->
  <text x="${width / 2}" y="${height / 2}" 
        font-family="Georgia, 'Times New Roman', serif" 
        font-size="14" font-weight="bold" 
        fill="#ffffff" text-anchor="middle" 
        transform="rotate(-90 ${width / 2} ${height / 2})">
    ${book.author}
  </text>
</svg>`;
  
  return svg;
}

function saveSVGFile(svgContent, outputPath) {
  fs.writeFileSync(outputPath, svgContent, 'utf8');
  const stats = fs.statSync(outputPath);
  return (stats.size / 1024).toFixed(1);
}

async function downloadBookCover(book) {
  console.log(`\n📚 ${book.title} — ${book.author}`);
  
  const colors = BOOK_COLORS[book.filename] || { primary: '#8b7355', secondary: '#4a3f35' };
  const coverPath = path.join(OUTPUT_DIR, `${book.filename}.jpg`);
  const coverSvgPath = path.join(OUTPUT_DIR, `${book.filename}.svg`);
  const backCoverPath = path.join(OUTPUT_DIR, `${book.filename}-back.jpg`);
  const backCoverSvgPath = path.join(OUTPUT_DIR, `${book.filename}-back.svg`);
  const spinePath = path.join(SPINE_DIR, `${book.filename}.jpg`);
  const spineSvgPath = path.join(SPINE_DIR, `${book.filename}.svg`);

  try {
    const editions = await getEditionsForWork(book.openLibraryWorkId);

    if (editions.length === 0) {
      console.log(`   ✗ No editions found, generating text cover...`);
      
      const svgContent = generateTextCoverSVG(book, colors);
      const size = saveSVGFile(svgContent, coverSvgPath);
      console.log(`   ✓ SVG cover generated (${size} KB)`);
      
      const spineSvg = generateSpineSVG(book, colors);
      const spineSize = saveSVGFile(spineSvg, spineSvgPath);
      console.log(`   ✓ SVG spine generated (${spineSize} KB)`);
      
      fs.copyFileSync(coverSvgPath, backCoverSvgPath);
      console.log(`   ✓ SVG back cover created`);
      
      return true;
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
      console.log(`   ✗ No cover available, generating text cover...`);
      
      const svgContent = generateTextCoverSVG(book, colors);
      const size = saveSVGFile(svgContent, coverSvgPath);
      console.log(`   ✓ SVG cover generated (${size} KB)`);
      
      const spineSvg = generateSpineSVG(book, colors);
      const spineSize = saveSVGFile(spineSvg, spineSvgPath);
      console.log(`   ✓ SVG spine generated (${spineSize} KB)`);
      
      fs.copyFileSync(coverSvgPath, backCoverSvgPath);
      console.log(`   ✓ SVG back cover created`);
      
      return true;
    }

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
    console.log(`   ✗ Failed: ${error.message}, generating text cover...`);
    
    const svgContent = generateTextCoverSVG(book, colors);
    const size = saveSVGFile(svgContent, coverSvgPath);
    console.log(`   ✓ SVG cover generated (${size} KB)`);
    
    const spineSvg = generateSpineSVG(book, colors);
    const spineSize = saveSVGFile(spineSvg, spineSvgPath);
    console.log(`   ✓ SVG spine generated (${spineSize} KB)`);
    
    fs.copyFileSync(coverSvgPath, backCoverSvgPath);
    console.log(`   ✓ SVG back cover created`);
    
    return true;
  }
}

async function downloadAllCovers() {
  ensureDirectory(OUTPUT_DIR);
  ensureDirectory(SPINE_DIR);

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       Open Library Covers Downloader v2.0             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (const book of BOOKS) {
    const success = await downloadBookCover(book);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    COMPLETE                          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n⏱ Duration: ${duration}s`);
  console.log(`✅ Successfully: ${successCount}/${BOOKS.length}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}/${BOOKS.length}`);
  }
  console.log(`\n📁 Covers saved to: ${OUTPUT_DIR}`);
  console.log(`📁 Spines saved to: ${SPINE_DIR}`);
}

downloadAllCovers().catch(console.error);
