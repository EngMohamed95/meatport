const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'public', '.htaccess');
const dest = path.join(__dirname, '..', 'dist', '.htaccess');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Successfully copied .htaccess to dist/ folder.');
} else {
  console.error('Error: Source file public/.htaccess not found.');
}
