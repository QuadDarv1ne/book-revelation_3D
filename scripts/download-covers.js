const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'book-covers');

const BOOK_COVERS = [
  {
    name: 'meditations-marcus-aurelius',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Marcus_Aurelius_Meditations.jpg/640px-Marcus_Aurelius_Meditations.jpg',
    description: 'Meditations by Marcus Aurelius'
  },
  {
    name: 'encheiridion-epictetus',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Enchiridion_Epictetus.jpg/640px-Enchiridion_Epictetus.jpg',
    description: 'Enchiridion by Epictetus'
  },
  {
    name: 'stoic-philosophy-classic',
    url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=640&h=800&fit=crop',
    description: 'Classic Stoic Philosophy Book'
  }
];

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
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
  });
}

async function downloadAllCovers() {
  console.log('Creating output directory:', OUTPUT_DIR);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  for (const book of BOOK_COVERS) {
    const outputPath = path.join(OUTPUT_DIR, `${book.name}.jpg`);
    console.log(`\nDownloading: ${book.description}`);
    console.log(`URL: ${book.url}`);
    console.log(`Output: ${outputPath}`);
    
    try {
      await downloadFile(book.url, outputPath);
      const stats = fs.statSync(outputPath);
      console.log(`✓ Downloaded (${(stats.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error(`✗ Failed: ${error.message}`);
    }
  }
  
  console.log('\n=== Download Complete ===');
  console.log(`Files saved to: ${OUTPUT_DIR}`);
}

downloadAllCovers().catch(console.error);
