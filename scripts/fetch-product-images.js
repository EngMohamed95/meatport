import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { meatportProducts } from '../src/meatportCatalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const IMAGES_JSON_PATH = path.join(root, 'scripts', 'product-images.json');
const CATALOG_TS_PATH = path.join(root, 'src', 'meatportCatalog.ts');
const DUMP_JSON_PATH = path.join(root, 'public', 'tenants', 'meatport', 'database_dump.json');

// Category fallbacks to use when search fails
const categoryQueries = {
  'c-mp-steaks': 'grilled steak',
  'c-mp-kebabs': 'shish kebab',
  'c-mp-meats': 'grilled meat lamb',
  'c-mp-mezes': 'turkish meze dip',
  'c-mp-hot-appetizers': 'turkish appetizer food',
  'c-mp-salads': 'fresh salad',
  'c-mp-meat-port-menu': 'steak meat dish',
  'c-mp-meatballs': 'kofte meatballs',
  'c-mp-specials': 'roasted lamb meat',
  'c-mp-shawarmas': 'shawarma wrap plate',
  'c-mp-burgers': 'gourmet burger cheeseburger',
  'c-mp-sauces': 'dipping sauce',
  'c-mp-desserts': 'turkish sweet dessert',
  'c-mp-drinks': 'cold beverage drink'
};

// Custom terms for hard-to-match or specialized Turkish/Middle Eastern items
const customSearchTerms = {
  'mp-p-012': 'chateaubriand steak',
  'mp-p-013': 'chateaubriand steak',
  'mp-p-014': 'asado beef ribs',
  'mp-p-015': 'asado beef ribs',
  'mp-p-020': 'pistachio kebab',
  'mp-p-024': 'lamb tenderloin shish kebab', // KUŞLEME KEBAB
  'mp-p-025': 'ali nazik kebab',
  'mp-p-033': 'lamb tenderloin meat', // LAMB TANDERLOIN
  'mp-p-038': 'lamb crown roast', // LAMB CROWN
  'mp-p-041': 'hummus plate',
  'mp-p-042': 'baba ganoush eggplant dip', // MOUTTEBELl
  'mp-p-043': 'avocado dip mash',
  'mp-p-044': 'spinach borani dip', // SPINACH BORANI
  'mp-p-045': 'turkish yogurt hot butter dip', // ATOM
  'mp-p-046': 'ezme salad spicy puree', // SPICY PUREE
  'mp-p-047': 'muhammara red pepper dip',
  'mp-p-048': 'shakshuka eggs tomatoes',
  'mp-p-049': 'stuffed grape leaves dolma',
  'mp-p-050': 'haydari yogurt dip garlic',
  'mp-p-051': 'stuffed dried eggplant',
  'mp-p-052': 'kibbeh bulgur meatball',
  'mp-p-054': 'lahmacun turkish pizza',
  'mp-p-055': 'pide cheese turkish flatbread',
  'mp-p-056': 'pide meat turkish flatbread',
  'mp-p-064': 'turkish shepherd salad gavurdagi',
  'mp-p-068': 'pickles jar cucumber',
  'mp-p-069': 'turkish soup bowl', // YUVALAMA SOUP
  'mp-p-070': 'meat soup bowl broth', // KELLE PAÇA
  'mp-p-071': 'pickles plate mixed',
  'mp-p-072': 'turkish kofte meatballs',
  'mp-p-073': 'cheese stuffed meatballs',
  'mp-p-080': 'iskender kebab plate',
  'mp-p-081': 'shawarma sandwich pita',
  'mp-p-082': 'shawarma wrap roll',
  'mp-p-084': 'turkish burger',
  'mp-p-085': 'gourmet cheeseburger',
  'mp-p-086': 'mini burger sliders',
  'mp-p-090': 'carrot slice baklava dessert',
  'mp-p-091': 'pistachio baklava sarma',
  'mp-p-092': 'cold baklava dessert',
  'mp-p-093': 'walnut baklava dessert',
  'mp-p-094': 'baklava birds nest dessert',
  'mp-p-095': 'turkish baklava plate',
  'mp-p-096': 'katmer dessert pistachio',
  'mp-p-097': 'rice pudding baked dessert',
  'mp-p-098': 'kunafa cheese dessert',
  'mp-p-100': 'ice cream dondurma',
  'mp-p-101': 'sliced pineapple fresh',
  'mp-p-103': 'pineapple juice fresh',
  'mp-p-105': 'summer punch fruit juice',
  'mp-p-106': 'lavender lemonade drink',
  'mp-p-107': 'strawberry lemonade drink',
  'mp-p-108': 'mint lemonade fresh drink',
  'mp-p-109': 'oreo milkshake',
  'mp-p-111': 'apple milkshake smoothie',
  'mp-p-112': 'passion fruit mojito cocktail',
  'mp-p-113': 'coconut vanilla drink milkshake',
  'mp-p-114': 'carrot juice fresh',
  'mp-p-127': 'turkish ayran yogurt drink'
};

// Base duplicate placeholder IDs that we want to avoid using again
const placeholderIds = new Set([
  'photo-1544025162-d76694265947',
  'photo-1529692236671-f1f6cf9683ba',
  'photo-1558030006-450675393462',
  'photo-1541592106381-b31e9677c0e5',
  'photo-1541519227354-08fa5d50c44d',
  'photo-1512621776951-a57141f2eefd',
  'photo-1568901346375-23c9450c58cd',
  'photo-1472476443507-c7a5948772fc',
  'photo-1551024601-bec78aea704b',
  'photo-1513558161293-cdaf765ed2fd',
  'photo-1555396273-367ea4eb4db5'
]);

function getCleanSearchTerm(nameEn, categoryId) {
  let term = nameEn.toLowerCase();
  
  // normalize and strip standard diacritics
  term = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // manual replacements for remaining specific Turkish characters/typos
  term = term.replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g');
  
  // Remove parentheses contents like (2 Personly) or (Yoghurt with...)
  term = term.replace(/\([^)]*\)/g, '');
  
  // Remove colons/semicolons and everything after them
  term = term.replace(/[:;].*$/, '');
  
  // Remove numbers and words like "1 Pcs." or "200 :ML." or "1LT." or "200 ml"
  term = term.replace(/\b\d+\s*(pcs|ml|lt|g|gr|grams|meter|soda)\b/gi, '');
  term = term.replace(/\b\d+\b/g, '');
  
  // Clean special characters (anything not letters, numbers, spaces, hyphens)
  term = term.replace(/[^a-z0-9\s-]/g, '');
  
  // Specific typos
  term = term.replace(/\bportehouse\b/g, 'porterhouse');
  term = term.replace(/\bflorentina\b/g, 'florentine');
  term = term.replace(/\bmouttebell\b/g, 'mutabal');
  term = term.replace(/\bliverr\b/g, 'liver');
  term = term.replace(/\bcheff\b/g, 'chef');
  term = term.replace(/\blimonaden\b/g, 'lemonade');
  
  term = term.trim().replace(/\s+/g, ' ');

  const cat = categoryId.replace('c-mp-', '');
  if (cat === 'drinks' && !term.includes('juice') && !term.includes('shake') && !term.includes('mojito') && !term.includes('cola') && !term.includes('pepsi') && !term.includes('water') && !term.includes('soda') && !term.includes('ayran')) {
    term += ' drink';
  } else if (cat === 'sauces' && !term.includes('sauce') && !term.includes('butter') && !term.includes('glace')) {
    term += ' sauce';
  } else if (cat === 'kebabs' && !term.includes('kebab') && !term.includes('chicken') && !term.includes('shish') && !term.includes('wing') && !term.includes('wrap')) {
    term += ' kebab';
  } else if (cat === 'meats' && !term.includes('lamb') && !term.includes('beef') && !term.includes('grill') && !term.includes('chops') && !term.includes('ribs') && !term.includes('liver') && !term.includes('saute')) {
    term += ' meat';
  } else if (cat === 'mezes' && !term.includes('hummus') && !term.includes('dip') && !term.includes('salad') && !term.includes('puree') && !term.includes('muhammara') && !term.includes('shakshouka') && !term.includes('borani') && !term.includes('haydari') && !term.includes('leaves')) {
    term += ' meze';
  }

  return term;
}

// Extract base photo ID from Unsplash URL
function getPhotoId(url) {
  const match = url.match(/photo-([a-zA-Z0-9-]+)/);
  return match ? `photo-${match[1]}` : null;
}

// Fetch image IDs from Unsplash search page
async function fetchUnsplashImagesForQuery(query) {
  const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`   Unsplash fetch failed for "${query}": Status ${res.status}`);
      return [];
    }
    const html = await res.text();
    // Match base photo URLs
    const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g;
    const matches = html.match(regex) || [];
    const ids = [];
    for (const match of matches) {
      const id = getPhotoId(match);
      if (id && !ids.includes(id)) {
        ids.push(id);
      }
    }
    return ids;
  } catch (err) {
    console.error(`   Error scraping Unsplash for query "${query}":`, err.message);
    return [];
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Loading existing mapping...');
  let existingMapping = {};
  if (fs.existsSync(IMAGES_JSON_PATH)) {
    try {
      existingMapping = JSON.parse(fs.readFileSync(IMAGES_JSON_PATH, 'utf8'));
    } catch (e) {
      console.warn('Error reading images JSON:', e.message);
    }
  }

  // Keep track of used image IDs to ensure uniqueness
  const usedIds = new Set();
  
  // Initialize with placeholder IDs we want to avoid
  placeholderIds.forEach(id => usedIds.add(id));

  // Also seed with any existing unique mappings that we want to keep
  // (but only if they are not placeholders!)
  Object.keys(existingMapping).forEach(productId => {
    const url = existingMapping[productId];
    const id = getPhotoId(url);
    if (id && !placeholderIds.has(id)) {
      usedIds.add(id);
    } else {
      // It was a placeholder, delete it so we re-fetch a unique one
      delete existingMapping[productId];
    }
  });

  console.log(`Starting image updates. Initial used unique images count: ${usedIds.size - placeholderIds.size}`);
  
  const finalMapping = { ...existingMapping };
  let fetchCount = 0;

  for (const product of meatportProducts) {
    const productId = product.id;
    const currentUrl = product.imageUrl;
    const currentId = getPhotoId(currentUrl);

    // If we already have a custom, unique image in our mapping, skip it
    if (finalMapping[productId] && !placeholderIds.has(getPhotoId(finalMapping[productId]))) {
      const savedId = getPhotoId(finalMapping[productId]);
      usedIds.add(savedId);
      continue;
    }

    // Otherwise, we need to fetch a unique image!
    const customTerm = customSearchTerms[productId];
    const searchTerm = customTerm || getCleanSearchTerm(product.nameEn, product.categoryId);
    console.log(`[${productId}] Querying Unsplash for "${product.nameEn}" -> Search term: "${searchTerm}"`);

    let foundImageId = null;
    
    // 1. Try search with product term
    let scrapedIds = await fetchUnsplashImagesForQuery(searchTerm);
    fetchCount++;
    await sleep(400); // polite delay

    for (const id of scrapedIds) {
      if (!usedIds.has(id)) {
        foundImageId = id;
        break;
      }
    }

    // 2. If no unique image found, try category query
    if (!foundImageId) {
      const categoryQuery = categoryQueries[product.categoryId] || 'food';
      console.log(`   No unique match for "${searchTerm}". Trying category fallback: "${categoryQuery}"`);
      scrapedIds = await fetchUnsplashImagesForQuery(categoryQuery);
      fetchCount++;
      await sleep(400);

      for (const id of scrapedIds) {
        if (!usedIds.has(id)) {
          foundImageId = id;
          break;
        }
      }
    }

    // 3. If still nothing, try generic food/drink term
    if (!foundImageId) {
      const genericQuery = product.categoryId.includes('drink') ? 'cold beverage' : 'delicious food plating';
      console.log(`   Still no unique match. Trying generic fallback: "${genericQuery}"`);
      scrapedIds = await fetchUnsplashImagesForQuery(genericQuery);
      fetchCount++;
      await sleep(400);

      for (const id of scrapedIds) {
        if (!usedIds.has(id)) {
          foundImageId = id;
          break;
        }
      }
    }

    // 4. Ultimate fallback (just pick first available, even if duplicate, but log it)
    if (!foundImageId && scrapedIds.length > 0) {
      foundImageId = scrapedIds[0];
      console.warn(`   WARNING: No unique image could be found. Reusing: ${foundImageId}`);
    } else if (!foundImageId) {
      // fallback to a random default ID if scrape returned absolutely nothing
      foundImageId = 'photo-1546069901-ba9599a7e63c'; // delicious salad/plate
      console.warn(`   WARNING: Absolutely no image matches. Using default photo: ${foundImageId}`);
    }

    usedIds.add(foundImageId);
    const finalImageUrl = `https://images.unsplash.com/${foundImageId}?w=600&h=450&fit=crop&q=80`;
    finalMapping[productId] = finalImageUrl;
    console.log(`   SUCCESS: Selected image: ${finalImageUrl}\n`);
  }

  // Save the mapping to JSON
  console.log(`Writing mapping to ${IMAGES_JSON_PATH}...`);
  fs.writeFileSync(IMAGES_JSON_PATH, JSON.stringify(finalMapping, null, 2), 'utf8');

  // Update meatportCatalog.ts
  console.log(`Updating ${CATALOG_TS_PATH}...`);
  let catalogContent = fs.readFileSync(CATALOG_TS_PATH, 'utf8');

  // We will find each product by matching "id: 'mp-p-XXX'" and replace its imageUrl
  meatportProducts.forEach(product => {
    const productId = product.id;
    const newImageUrl = finalMapping[productId];
    if (!newImageUrl) return;

    const productBlockRegex = new RegExp(`(id:\\s*'${productId}',[\\s\\S]*?imageUrl:\\s*')[^']+(')`);
    if (productBlockRegex.test(catalogContent)) {
      catalogContent = catalogContent.replace(productBlockRegex, `$1${newImageUrl}$2`);
    } else {
      console.warn(`Could not find product block in catalog file for: ${productId}`);
    }
  });

  // Also update version string so changes take effect (clear localStorage cache)
  const dateStr = new Date().toISOString().split('T')[0];
  const newVersion = `meatport-imported-catalog-${dateStr}-ar-desc-unique-img`;
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
      let content = fs.readFileSync(DUMP_JSON_PATH, 'utf8');
      if (content.startsWith('\ufeff')) {
        content = content.slice(1);
      }
      const dump = JSON.parse(content);
      if (dump.products && Array.isArray(dump.products)) {
        dump.products.forEach(p => {
          if (finalMapping[p.id]) {
            p.imageUrl = finalMapping[p.id];
          }
        });
      }
      fs.writeFileSync(DUMP_JSON_PATH, JSON.stringify(dump, null, 2), 'utf8');
      console.log('Successfully updated database dump.');
    } catch (e) {
      console.error('Error updating database dump:', e.message);
    }
  }

  console.log(`Finished processing. Total API fetches: ${fetchCount}`);
}

run().catch(err => {
  console.error('Fatal error in scraper run:', err);
});
