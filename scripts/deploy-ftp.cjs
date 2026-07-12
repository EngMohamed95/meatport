const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

const DIST_DIR = path.join(__dirname, '..', 'dist');

async function run() {
  // 1. Ensure basic-ftp is installed
  try {
    require.resolve('basic-ftp');
  } catch (e) {
    console.log('Installing "basic-ftp" deployment library...');
    execSync('npm install basic-ftp', { stdio: 'inherit' });
  }

  const ftp = require('basic-ftp');

  // 2. Load and validate FTP configuration
  const host = 'ftp.meatport.net';
  const user = 'u177160961.meatport';
  const password = process.env.FTP_PASSWORD;
  const remoteDir = '/home/u177160961/domains/meatport.net/public_html';

  if (!password) {
    console.error('\nError: FTP_PASSWORD is not set in the environment or .env file.');
    console.error('Please add the password to your .env file like this:');
    console.error('FTP_PASSWORD="your_ftp_password_here"\n');
    process.exit(1);
  }

  // 3. Build the application first
  console.log('Building project for production (npm run build)...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (e) {
    console.error('Build failed. Aborting deployment.');
    process.exit(1);
  }

  // 4. FTP Upload
  const client = new ftp.Client();
  client.ftp.verbose = true; // Output FTP logs

  try {
    console.log(`Connecting to FTP server: ${host}...`);
    await client.access({
      host: host,
      user: user,
      password: password,
      secure: false // Standard FTP
    });

    console.log(`Navigating to remote directory: ${remoteDir}...`);
    await client.ensureDir(remoteDir);

    console.log('Uploading compiled build files (contents of dist/)...');
    await client.uploadFromDir(DIST_DIR);

    console.log('\n🎉 SUCCESS: Deployment completed successfully to meatport.net!');
  } catch (err) {
    console.error('\n❌ FTP Deployment Error:', err.message);
  } finally {
    client.close();
  }
}

run().catch(err => {
  console.error('Fatal deployment error:', err);
});
