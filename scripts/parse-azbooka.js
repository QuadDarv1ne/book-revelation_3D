const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'book-covers');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const AZBOOKA_BOOKS = [
  {
    title: 'mark-avreliy-naedine-s-soboy',
    url: 'https://azbooka.ru/books/mark-avreliy-naedine-s-soboy-v-chem-nashe-blago',
    imageSelector: /<img[^>]+src="([^"]*\.jpg)"[^>]*class="book-cover"/i
  }
];

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    
    lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(outputPath);
    
    lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://azbooka.ru/'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadImage(res.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      res.pipe(file);
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

function extractImageUrl(html) {
  const imgMatch = html.match(/<img[^>]+src="([^"]*\.jpg)"[^>]*class="book-cover"/i);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
  if (ogMatch) {
    return ogMatch[1];
  }
  
  const allImages = html.match(/https?:\/\/[^"\s]+\.jpg/gi) || [];
  const coverImages = allImages.filter(url => 
    url.includes('cover') || url.includes('book') || url.includes('azbooka')
  );
  
  if (coverImages.length > 0) {
    return coverImages[0];
  }
  
  return null;
}

async function downloadFromAzbooka() {
  ensureDirectory(OUTPUT_DIR);
  ensureDirectory(PUBLIC_DIR);
  
  console.log('=== Azbooka.ru Book Covers Downloader ===\n');
  
  for (const book of AZBOOKA_BOOKS) {
    console.log(`\n📚 ${book.title}`);
    console.log(`   URL: ${book.url}`);
    
    try {
      console.log(`   Fetching page...`);
      const html = await fetchUrl(book.url);
      
      const imageUrl = extractImageUrl(html);
      
      if (!imageUrl) {
        console.log(`   ✗ No cover image found`);
        continue;
      }
      
      console.log(`   Found image: ${imageUrl}`);
      
      const coverFilename = `${book.title}-cover.jpg`;
      const coverPath = path.join(OUTPUT_DIR, coverFilename);
      
      console.log(`   Downloading cover...`);
      await downloadImage(imageUrl, coverPath);
      
      const stats = fs.statSync(coverPath);
      console.log(`   ✓ Cover downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
      
      const publicCoverPath = path.join(PUBLIC_DIR, 'book-cover.jpg');
      fs.copyFileSync(coverPath, publicCoverPath);
      console.log(`   ✓ Copied to public/book-cover.jpg`);
      
    } catch (error) {
      console.log(`   ✗ Failed: ${error.message}`);
    }
  }
  
  console.log('\n=== Complete ===');
  console.log(`\nDownloaded covers: ${OUTPUT_DIR}`);
}

downloadFromAzbooka().catch(console.error);
