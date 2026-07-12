const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Since meatportCatalog.ts is a TypeScript ES Module, we can read it as text and parse the products array
// or import it if running via tsx. Running via tsx supports require() for TS files.
const CATALOG_TS_PATH = path.join(__dirname, '..', 'src', 'meatportCatalog.ts');
const DESCRIPTIONS_JSON_PATH = path.join(__dirname, 'product-descriptions-ar.json');
const DUMP_JSON_PATH = path.join(__dirname, '..', 'public', 'tenants', 'meatport', 'database_dump.json');

function hasArabic(text) {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
}

// Strip BOM
function readJsonFileSync(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.startsWith('\ufeff')) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not set. Please set it in your environment or .env file.');
    process.exit(1);
  }

  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  console.log('Loading catalog products...');
  // Import the TS file dynamically using tsx compatibility
  const { meatportProducts } = require(CATALOG_TS_PATH);

  let cachedDescriptions = {};
  if (fs.existsSync(DESCRIPTIONS_JSON_PATH)) {
    try {
      cachedDescriptions = JSON.parse(fs.readFileSync(DESCRIPTIONS_JSON_PATH, 'utf8'));
    } catch (e) {
      console.warn('Error reading descriptions cache:', e.message);
    }
  }

  const updatedDescriptions = { ...cachedDescriptions };
  let translateCount = 0;

  console.log(`Checking ${meatportProducts.length} products for descriptions...`);

  for (const product of meatportProducts) {
    const productId = product.id;
    const descEn = product.descriptionEn || '';
    const descAr = product.descriptionAr || '';

    // If we already have a cached Arabic translation, use it
    if (updatedDescriptions[productId] && hasArabic(updatedDescriptions[productId])) {
      continue;
    }

    // If the catalog already has a valid Arabic translation (not just English text copied over), cache it and continue
    if (hasArabic(descAr)) {
      updatedDescriptions[productId] = descAr;
      continue;
    }

    // Otherwise, we need to translate!
    if (!descEn || descEn === product.nameEn) {
      // No description or it is just the name, translate name or use simple term
      updatedDescriptions[productId] = product.nameAr || descEn;
      continue;
    }

    console.log(`[${productId}] Translating: "${descEn.substring(0, 50)}..."`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following restaurant menu item description from English to Arabic. Provide only the translated Arabic text, without any introductory words or English text: "${descEn}"`,
      });

      const translation = response.text.trim();
      if (translation && hasArabic(translation)) {
        updatedDescriptions[productId] = translation;
        console.log(`   Result: "${translation}"\n`);
        translateCount++;
        // Polite delay
        await new Promise(resolve => setTimeout(resolve, 300));
      } else {
        console.warn(`   Warning: Translation returned invalid text: "${translation}"`);
        updatedDescriptions[productId] = product.nameAr || descEn;
      }
    } catch (err) {
      console.error(`   Error translating product ${productId}:`, err.message);
      updatedDescriptions[productId] = product.nameAr || descEn;
    }
  }

  // Save descriptions cache
  console.log(`Writing descriptions to ${DESCRIPTIONS_JSON_PATH}...`);
  fs.writeFileSync(DESCRIPTIONS_JSON_PATH, JSON.stringify(updatedDescriptions, null, 2), 'utf8');

  // Update meatportCatalog.ts
  console.log(`Updating ${CATALOG_TS_PATH}...`);
  let catalogContent = fs.readFileSync(CATALOG_TS_PATH, 'utf8');

  meatportProducts.forEach(product => {
    const productId = product.id;
    const arabicDesc = updatedDescriptions[productId];
    if (!arabicDesc) return;

    // Regex to locate the product block and its descriptionAr property
    const productBlockRegex = new RegExp(`(id:\\s*'${productId}',[\\s\\S]*?descriptionAr:\\s*")[^"]+(")`);
    if (productBlockRegex.test(catalogContent)) {
      catalogContent = catalogContent.replace(productBlockRegex, `$1${arabicDesc}$2`);
    } else {
      // Try single quotes fallback
      const productBlockRegexSingle = new RegExp(`(id:\\s*'${productId}',[\\s\\S]*?descriptionAr:\\s*')[^']+(')`);
      if (productBlockRegexSingle.test(catalogContent)) {
        catalogContent = catalogContent.replace(productBlockRegexSingle, `$1${arabicDesc}$2`);
      }
    }
  });

  const dateStr = new Date().toISOString().split('T')[0];
  const newVersion = `meatport-imported-catalog-${dateStr}-ar-desc-translated`;
  catalogContent = catalogContent.replace(
    /export const meatportCatalogVersion = '[^']+';/,
    `export const meatportCatalogVersion = '${newVersion}';`
  );

  fs.writeFileSync(CATALOG_TS_PATH, catalogContent, 'utf8');
  console.log(`Updated catalog version to '${newVersion}'`);

  // Update database_dump.json
  if (fs.existsSync(DUMP_JSON_PATH)) {
    console.log(`Updating ${DUMP_JSON_PATH}...`);
    try {
      const dump = readJsonFileSync(DUMP_JSON_PATH);
      if (dump.products && Array.isArray(dump.products)) {
        dump.products.forEach(p => {
          if (updatedDescriptions[p.id]) {
            p.descriptionAr = updatedDescriptions[p.id];
          }
        });
      }
      fs.writeFileSync(DUMP_JSON_PATH, '\ufeff' + JSON.stringify(dump, null, 2), 'utf8');
      console.log('Successfully updated database dump.');
    } catch (e) {
      console.error('Error updating database dump:', e.message);
    }
  }

  console.log(`Finished translating. Total translated products: ${translateCount}`);
}

run().catch(err => {
  console.error('Fatal error in translation run:', err);
});
