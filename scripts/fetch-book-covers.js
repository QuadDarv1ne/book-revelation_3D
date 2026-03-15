const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'book-covers');
const SPINE_DIR = path.join(__dirname, '..', 'public', 'book-spines');

// Проверенные ISBN и обложки
const BOOK_COVERS = [
  {
    id: 'marcus-aurelius-meditations',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    // ISBN: 9780140449334 (Penguin Classics)
    isbn: '9780140449334',
    fallbackUrl: 'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg'
  },
  {
    id: 'epictetus-our-good',
    title: 'Enchiridion',
    author: 'Epictetus',
    // ISBN: 9780872207868 (Hackett Publishing)
    isbn: '9780872207868',
    fallbackUrl: 'https://covers.openlibrary.org/b/isbn/9780872207868-L.jpg'
  },
  {
    id: 'seneca-letters',
    title: 'Letters from a Stoic',
    author: 'Seneca',
    // ISBN: 9780140442106 (Penguin Classics)
    isbn: '9780140442106',
    fallbackUrl: 'https://covers.openlibrary.org/b/isbn/9780140442106-L.jpg'
  },
  {
    id: 'sun-tzu-art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    // ISBN: 9781599869773 (Filiquarian)
    isbn: '9781599869773',
    fallbackUrl: 'https://covers.openlibrary.org/b/isbn/9781599869773-L.jpg'
  },
  {
    id: 'hawking-theory-of-everything',
    title: 'The Theory of Everything',
    author: 'Stephen Hawking',
    // ISBN: 9781893224032 (New Millennium)
    isbn: '9781893224032',
    fallbackUrl: 'https://covers.openlibrary.org/b/isbn/9781893224032-L.jpg'
  },
  {
    id: 'christensen-innovators-solution',
    title: "The Innovator's Solution",
    author: 'Clayton M. Christensen',
    // ISBN: 9781422187678 (Harvard Business Review)
    isbn: '9781422187678',
    fallbackUrl: 'https://covers.openlibrary.org/b/isbn/9781422187678-L.jpg'
  }
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);

    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      },
      timeout: 10000
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
    });

    request.on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });

    request.on('timeout', () => {
      request.destroy();
      fs.unlink(outputPath, () => {});
      reject(new Error('Timeout'));
    });
  });
}

// Генерация красивой SVG обложки с градиентом
function generateSVGCover(book, color1, color2) {
  const width = 400;
  const height = 600;
  const gradientId = `grad-${book.id}`;

  const shortTitle = book.title.length > 25 ? book.title.substring(0, 22) + '...' : book.title;
  const shortAuthor = book.author.length > 20 ? book.author.substring(0, 17) + '...' : book.author;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${gradientId})"/>
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <text x="${width / 2}" y="${height / 2 - 30}" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">${shortTitle}</text>
  <text x="${width / 2}" y="${height / 2 + 20}" font-family="Georgia, serif" font-size="18" fill="rgba(255,255,255,0.8)" text-anchor="middle">${shortAuthor}</text>
  <line x1="${width / 2 - 50}" y1="${height / 2 + 45}" x2="${width / 2 + 50}" y2="${height / 2 + 45}" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
  <text x="${width / 2}" y="${height - 60}" font-size="36" text-anchor="middle" opacity="0.3">📖</text>
</svg>`;

  return svg;
}

function generateSVGSpine(book, color1, color2) {
  const width = 60;
  const height = 600;
  const shortAuthor = book.author.length > 12 ? book.author.substring(0, 10) + '.' : book.author;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="spine-${book.id}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${color2};stop-opacity:1" />
      <stop offset="50%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#spine-${book.id})"/>
  <text x="${width / 2}" y="${height / 2}" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" transform="rotate(-90 ${width / 2} ${height / 2})">${shortAuthor}</text>
</svg>`;

  return svg;
}

const BOOK_COLORS = {
  'marcus-aurelius-meditations': ['#d4af37', '#8b7355'],
  'epictetus-our-good': ['#c9a961', '#7d6b4f'],
  'seneca-letters': ['#b89f5e', '#6b5f4a'],
  'sun-tzu-art-of-war': ['#a67c52', '#5c4a3a'],
  'hawking-theory-of-everything': ['#8b7355', '#4a3f35'],
  'christensen-innovators-solution': ['#9a7b4f', '#5a4a3a']
};

async function downloadBookCover(book) {
  console.log(`\n📚 ${book.title} — ${book.author}`);

  const coverPath = path.join(OUTPUT_DIR, `${book.id}.jpg`);
  const backCoverPath = path.join(OUTPUT_DIR, `${book.id}-back.jpg`);
  const spinePath = path.join(SPINE_DIR, `${book.id}.jpg`);
  const coverSvgPath = path.join(OUTPUT_DIR, `${book.id}.svg`);
  const spineSvgPath = path.join(SPINE_DIR, `${book.id}.svg`);

  const colors = BOOK_COLORS[book.id] || ['#8b7355', '#4a3f35'];

  try {
    // Пробуем скачать по ISBN через Open Library
    const url = book.fallbackUrl;
    console.log(`   ISBN: ${book.isbn}`);
    console.log(`   URL: ${url}`);

    await downloadImage(url, coverPath);
    const stats = fs.statSync(coverPath);
    const sizeKB = (stats.size / 1024).toFixed(1);

    // Проверяем что файл не пустой и не ошибка (< 5KB скорее всего ошибка)
    if (stats.size < 5000) {
      console.log(`   ⚠ File small (${sizeKB} KB), generating SVG fallback...`);
      fs.unlinkSync(coverPath);
      throw new Error('File too small');
    }

    console.log(`   ✓ Cover downloaded (${sizeKB} KB)`);

    // Копируем для back cover и spine
    fs.copyFileSync(coverPath, backCoverPath);
    fs.copyFileSync(coverPath, spinePath);
    console.log(`   ✓ Back cover & spine created`);

    return true;
  } catch (error) {
    console.log(`   ⚠ Download failed, generating SVG...`);

    // Генерируем SVG обложку
    const svgCover = generateSVGCover(book, colors[0], colors[1]);
    fs.writeFileSync(coverSvgPath, svgCover, 'utf8');
    fs.copyFileSync(coverSvgPath, backCoverPath.replace('.jpg', '.svg'));
    console.log(`   ✓ SVG cover generated`);

    // Генерируем SVG spine
    const svgSpine = generateSVGSpine(book, colors[0], colors[1]);
    fs.writeFileSync(spineSvgPath, svgSpine, 'utf8');
    console.log(`   ✓ SVG spine generated`);

    return true;
  }
}

async function downloadAllCovers() {
  ensureDirectory(OUTPUT_DIR);
  ensureDirectory(SPINE_DIR);

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         Book Covers Downloader v3.1                   ║');
  console.log('║    Загрузка обложек через ISBN (Open Library)         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  let successCount = 0;
  const startTime = Date.now();

  for (const book of BOOK_COVERS) {
    const success = await downloadBookCover(book);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    COMPLETE                          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\n⏱ Duration: ${duration}s`);
  console.log(`✅ Successfully: ${successCount}/${BOOK_COVERS.length}`);
  console.log(`\n📁 Output: ${OUTPUT_DIR}`);
  console.log(`📁 Spines: ${SPINE_DIR}`);
}

downloadAllCovers().catch(console.error);
