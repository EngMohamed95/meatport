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
const PRODUCTS_DIR = path.join(root, 'public', 'tenants', 'meatport', 'assets', 'products');

// Ensure output directory exists
fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

// Strongly food-focused search queries mapped directly to product IDs (100% control, no places or landscapes)
const productSearchQueries = {
  // Steaks & Meats (Steaks sheet)
  'mp-p-001': 'porterhouse steak cooked',
  'mp-p-002': 'grilled beef steak food', // Florentina
  'mp-p-003': 't-bone steak cooked',
  'mp-p-004': 'sirloin beef steak', // New York
  'mp-p-005': 'ribeye steak cooked',
  'mp-p-006': 'entrecote steak food',
  'mp-p-007': 'grilled ribeye steak food', // Dallas
  'mp-p-008': 'tomahawk steak cooked',
  'mp-p-009': 'beef tenderloin steak cooked', // Lokum
  'mp-p-010': 'filet mignon steak cooked',
  'mp-p-011': 'beef shish kebab plate', // Shashlik
  'mp-p-012': 'chateaubriand steak plate',
  'mp-p-013': 'chateaubriand steak plate',
  'mp-p-014': 'asado beef ribs cooked',
  'mp-p-015': 'asado beef ribs cooked',
  'mp-p-016': 'beef spaghetti pasta',
  // Kebabs
  'mp-p-017': 'adana kebab plate',
  'mp-p-018': 'turkish kebab plate', // Urfa
  'mp-p-019': 'beyti kebab plate',
  'mp-p-020': 'turkish kebab food', // Pistachio
  'mp-p-021': 'grilled kebab plate food', // Galata Chef's
  'mp-p-022': 'beef kebab skewers',
  'mp-p-023': 'chicken kebab skewers',
  'mp-p-024': 'lamb kebab skewers', // Kusleme
  'mp-p-025': 'ali nazik kebab food',
  'mp-p-026': 'whole roast chicken cooked',
  'mp-p-027': 'half roast chicken cooked',
  'mp-p-028': 'turkish kebab skewer', // Pipe
  'mp-p-029': 'long kebab plate', // Meter
  'mp-p-030': 'chicken shish kebab plate',
  'mp-p-031': 'grilled chicken wings plate',
  // Meats
  'mp-p-032': 'lamb chops cooked plate',
  'mp-p-033': 'lamb tenderloin steak cooked', // Lokum Istanbul
  'mp-p-034': 'lamb shish kebab plate',
  'mp-p-035': 'lamb ribs cooked',
  'mp-p-036': 'fried liver dish food', // Lamb Liver
  'mp-p-037': 'rack of lamb roast cooked',
  'mp-p-038': 'lamb crown roast cooked',
  'mp-p-039': 'mixed grill plate food',
  'mp-p-040': 'beef saute pan cooked',
  // Mezes
  'mp-p-041': 'hummus dip plate',
  'mp-p-042': 'baba ganoush eggplant dip', // Mouttebel
  'mp-p-043': 'avocado dip mash food',
  'mp-p-044': 'spinach dip yogurt food', // Spinach Borani
  'mp-p-045': 'turkish meze yogurt dip', // Atom
  'mp-p-046': 'ezme salad dip plate', // Spicy Puree
  'mp-p-047': 'muhammara red pepper dip',
  'mp-p-048': 'shakshuka eggs pan',
  'mp-p-049': 'stuffed grape leaves dolma',
  'mp-p-050': 'haydari yogurt dip food',
  // Hot Appetizers
  'mp-p-051': 'stuffed eggplant turkish food',
  'mp-p-052': 'kibbeh meatballs food',
  'mp-p-053': 'french fries plate',
  'mp-p-054': 'lahmacun turkish pizza',
  'mp-p-055': 'pide cheese turkish flatbread',
  'mp-p-056': 'pide meat turkish flatbread',
  // Salads
  'mp-p-057': 'cheese salad bowl',
  'mp-p-058': 'burrata salad plate',
  'mp-p-059': 'tabouli salad bowl',
  'mp-p-060': 'caesar salad plate',
  'mp-p-061': 'turkish salad bowl', // Gavurdagi
  'mp-p-062': 'lettuce salad bowl', // Iceberg
  'mp-p-063': 'quinoa salad bowl',
  'mp-p-064': 'shepherd salad bowl',
  // Meat Port Menu
  'mp-p-065': 'beef carpaccio plate',
  'mp-p-066': 'steak tartare plate',
  'mp-p-067': 'soup bowl food',
  'mp-p-068': 'pickles jar food',
  'mp-p-069': 'turkish soup bowl', // Yuvalama
  'mp-p-070': 'meat soup bowl food', // Kelle Paca
  'mp-p-071': 'pickles plate food',
  // Meatballs
  'mp-p-072': 'turkish kofte meatballs plate',
  'mp-p-073': 'cheese meatballs plate cooked',
  // Specials
  'mp-p-074': 'lamb roast cooked', // Lamb Tandoor
  'mp-p-075': 'lamb shoulder roast cooked',
  'mp-p-076': 'lamb shank roast cooked',
  'mp-p-077': 'lamb rack roast cooked',
  // Shawarmas
  'mp-p-078': 'beef shawarma plate',
  'mp-p-079': 'iskender kebab plate food',
  'mp-p-080': 'shawarma sandwich pita',
  'mp-p-081': 'shawarma wrap roll food',
  // Burgers
  'mp-p-082': 'hamburger food',
  'mp-p-083': 'cheeseburger plate food',
  'mp-p-084': 'gourmet burger plate',
  'mp-p-085': 'sliders burger plate',
  // Sauces
  'mp-p-086': 'cheese sauce dip bowl',
  'mp-p-087': 'butter sauce food',
  'mp-p-088': 'demi glace sauce cooked',
  'mp-p-089': 'black pepper sauce dip',
  // Desserts
  'mp-p-090': 'baklava dessert plate',
  'mp-p-091': 'baklava pistachio sarma',
  'mp-p-092': 'cold baklava dessert plate',
  'mp-p-093': 'walnut baklava dessert',
  'mp-p-094': 'baklava sweet dessert',
  'mp-p-095': 'turkish baklava dessert plate',
  'mp-p-096': 'katmer dessert pistachio plate',
  'mp-p-097': 'rice pudding baked dessert',
  'mp-p-098': 'kunafa cheese dessert plate',
  'mp-p-099': 'chocolate souffle dessert',
  'mp-p-100': 'ice cream cup scoop',
  'mp-p-101': 'sliced pineapple fresh',
  // Drinks
  'mp-p-102': 'pina colada drink glass',
  'mp-p-103': 'pineapple juice fresh glass',
  'mp-p-104': 'orange juice glass drink',
  'mp-p-105': 'fruit punch glass drink',
  'mp-p-106': 'lavender drink glass',
  'mp-p-107': 'strawberry lemonade glass',
  'mp-p-108': 'mint lemonade fresh glass',
  'mp-p-109': 'oreo milkshake glass',
  'mp-p-110': 'mango juice glass drink',
  'mp-p-111': 'apple smoothie glass drink',
  'mp-p-112': 'passion fruit mojito glass',
  'mp-p-113': 'coconut drink glass',
  'mp-p-114': 'carrot juice fresh glass',
  'mp-p-115': 'soda drink can',
  'mp-p-116': 'pepsi can drink',
  'mp-p-117': 'pepsi can drink',
  'mp-p-118': 'pepsi can drink',
  'mp-p-119': '7up can drink',
  'mp-p-120': 'mirinda can drink',
  'mp-p-121': 'coca cola can drink',
  'mp-p-122': 'water bottle drink',
  'mp-p-123': 'sparkling water glass drink',
  'mp-p-124': 'water bottle drink',
  'mp-p-125': 'coca cola can drink',
  'mp-p-126': 'club soda glass drink',
  'mp-p-127': 'turkish ayran yogurt drink'
};

const categoryQueries = {
  'c-mp-steaks': 'grilled steak food',
  'c-mp-kebabs': 'kebab plate food',
  'c-mp-meats': 'lamb meat dish',
  'c-mp-mezes': 'turkish meze dip food',
  'c-mp-hot-appetizers': 'turkish hot appetizer dish',
  'c-mp-salads': 'fresh salad food',
  'c-mp-meat-port-menu': 'cooked steak meat dish',
  'c-mp-meatballs': 'kofte meatballs plate',
  'c-mp-specials': 'roasted meat dish',
  'c-mp-shawarmas': 'shawarma plate food',
  'c-mp-burgers': 'gourmet cheeseburger food',
  'c-mp-sauces': 'sauce dipping bowl',
  'c-mp-desserts': 'turkish sweet dessert plate',
  'c-mp-drinks': 'cold drink beverage'
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
  'photo-1555396273-367ea4eb4db5',
  'photo-1546069901-ba9599a7e63c' // default plate
]);

function getPhotoId(url) {
  const match = url.match(/photo-([a-zA-Z0-9-]+)/);
  return match ? `photo-${match[1]}` : null;
}

async function fetchUnsplashImagesForQuery(query) {
  const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`   Unsplash fetch failed for "${query}": Status ${res.status}`);
      return [];
    }
    const html = await res.text();
    const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g;
    const matches = html.match(regex) || [];
    const ids = [];
    for (const match of matches) {
      const id = getPhotoId(match);
      if (id && !ids.includes(id)) {
        ids.push(id);
      }
    }
    // Return empty if there are fewer than 3 unique matches (indicates a zero results page displaying trending landscape items)
    if (ids.length < 3) {
      console.warn(`   Search page returned too few results (${ids.length}) for "${query}". Treating as failed.`);
      return [];
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

async function downloadImage(imageUrl, destPath) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (e) {
    console.error(`   Failed to download image ${imageUrl} to ${destPath}:`, e.message);
    return false;
  }
}

async function run() {
  const usedIds = new Set();
  placeholderIds.forEach(id => usedIds.add(id));
  
  const finalMapping = {};
  let fetchCount = 0;

  console.log(`Starting clean image downloader for ${meatportProducts.length} products...`);

  for (const product of meatportProducts) {
    const productId = product.id;
    const localFileName = `${productId}.jpg`;
    const localFilePath = path.join(PRODUCTS_DIR, localFileName);
    const localUrlPath = `/tenants/meatport/assets/products/${localFileName}`;

    const searchTerm = productSearchQueries[productId] || 'cooked food plate';
    console.log(`[${productId}] Searching Unsplash for "${product.nameEn}" -> Query: "${searchTerm}"`);

    let foundImageId = null;
    
    // 1. Try search with product term
    let scrapedIds = await fetchUnsplashImagesForQuery(searchTerm);
    fetchCount++;
    await sleep(400);

    for (const id of scrapedIds) {
      if (!usedIds.has(id)) {
        foundImageId = id;
        break;
      }
    }

    // 2. Try category fallback
    if (!foundImageId) {
      const categoryQuery = categoryQueries[product.categoryId] || 'food dish';
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

    // 3. Try generic food fallback
    if (!foundImageId) {
      const genericQuery = product.categoryId.includes('drink') ? 'cold drink beverage' : 'cooked food plate';
      console.log(`   No unique match. Trying generic fallback: "${genericQuery}"`);
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

    // 4. Default backup ID if all searches returned zero results
    if (!foundImageId) {
      // Pick first matched or a delicious steak photo as ultimate backup
      foundImageId = scrapedIds.length > 0 ? scrapedIds[0] : 'photo-1544025162-d76694265947';
    }

    usedIds.add(foundImageId);
    const unsplashUrl = `https://images.unsplash.com/${foundImageId}?w=600&h=450&fit=crop&q=80`;
    
    console.log(`   Downloading image: ${unsplashUrl} -> ${localFileName}...`);
    const success = await downloadImage(unsplashUrl, localFilePath);

    if (success) {
      finalMapping[productId] = localUrlPath;
      console.log(`   SUCCESS: Saved to ${localUrlPath}\n`);
    } else {
      finalMapping[productId] = unsplashUrl;
      console.log(`   WARNING: Saved fallback Unsplash URL: ${unsplashUrl}\n`);
    }
  }

  // Save the mapping to JSON
  console.log(`Writing mapping to ${IMAGES_JSON_PATH}...`);
  fs.writeFileSync(IMAGES_JSON_PATH, JSON.stringify(finalMapping, null, 2), 'utf8');

  // Update meatportCatalog.ts
  console.log(`Updating ${CATALOG_TS_PATH}...`);
  let catalogContent = fs.readFileSync(CATALOG_TS_PATH, 'utf8');

  meatportProducts.forEach(product => {
    const productId = product.id;
    const newImageUrl = finalMapping[productId];
    if (!newImageUrl) return;

    const productBlockRegex = new RegExp(`(id:\\s*'${productId}',[\\s\\S]*?imageUrl:\\s*')[^']+(')`);
    if (productBlockRegex.test(catalogContent)) {
      catalogContent = catalogContent.replace(productBlockRegex, `$1${newImageUrl}$2`);
    }
  });

  const dateStr = new Date().toISOString().split('T')[0];
  const newVersion = `meatport-imported-catalog-${dateStr}-ar-desc-local-img-final`;
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
      fs.writeFileSync(DUMP_JSON_PATH, '\ufeff' + JSON.stringify(dump, null, 2), 'utf8');
      console.log('Successfully updated database dump.');
    } catch (e) {
      console.error('Error updating database dump:', e.message);
    }
  }

  console.log(`Finished downloading and updating all product images locally. Total Unsplash fetches: ${fetchCount}`);
}

run().catch(err => {
  console.error('Fatal error in downloader run:', err);
});
