const ftp = require('basic-ftp');
const path = require('path');
require('dotenv').config();

async function run() {
  const host = 'ftp.meatport.net';
  const user = 'u177160961.meatport';
  const password = process.env.FTP_PASSWORD || '~8TTDVloIgu';
  const remoteDir = '/home/u177160961/domains/meatport.net/public_html';

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log(`Connecting to ${host}...`);
    await client.access({
      host,
      user,
      password,
      secure: false
    });

    // (FTP user is already jailed in the domain root, no need to CD to absolute path)
    const list = await client.list();
    console.log('Remote files:', list.map(f => f.name));

    // Delete Index.html (capitalized) if it exists
    const hasUpperIndex = list.some(f => f.name === 'Index.html');
    if (hasUpperIndex) {
      console.log('Found capitalized Index.html on server. Deleting it...');
      await client.remove('Index.html');
      console.log('Deleted Index.html.');
    } else {
      console.log('No capitalized Index.html found.');
    }

    // Upload index.html (lowercase)
    const localIndexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log(`Uploading lowercase index.html from ${localIndexPath}...`);
    await client.uploadFrom(localIndexPath, 'index.html');

    console.log('Lowercase index.html uploaded successfully!');
  } catch (err) {
    console.error('Error during FTP cleanup:', err.message);
  } finally {
    client.close();
  }
}

run();
