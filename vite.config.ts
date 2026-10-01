import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import fs from 'fs';

export default defineConfig(() => {
  const readRequestBody = (req: any) => new Promise<any>((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });

  const applyCashierMenuCorrections = (database: any) => {
    const priceOverrides: Record<string, number> = {
      'mp-p-057': 22,
      'mp-p-060': 39,
      'mp-p-062': 22,
      'mp-p-new-fattoush': 22,
      'mp-p-042': 19,
      'mp-p-052': 12,
      'mp-p-053': 15,
      'mp-p-027': 48,
      'mp-p-039': 140,
      'mp-p-067': 19,
      'mp-p-078': 59,
      'mp-p-079': 95,
      'mp-p-081': 35,
    };
    database.products = Array.isArray(database.products) ? database.products.map((product: any) => {
      const price = priceOverrides[product.id];
      const corrected = price === undefined ? { ...product } : {
        ...product,
        price,
        profit: Math.max(0, price - Number(product.costPrice || 0)),
        margin: price > 0 ? (Math.max(0, price - Number(product.costPrice || 0)) / price) * 100 : 0,
      };
      if (product.id === 'mp-p-067') {
        return { ...corrected, nameEn: 'CHEF SOUP', nameAr: 'شوربة الشيف', descriptionEn: "Chef's daily soup.", descriptionAr: 'شوربة الشيف اليومية.', isVisible: true };
      }
      if (product.id === 'mp-p-069' || product.id === 'mp-p-070') return { ...corrected, isVisible: false };
      return corrected;
    }) : [];
    return database;
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'tenant-folder-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const requestPath = (req.url || '').split('?')[0];

            // Development equivalent of the PHP endpoint used by the live site.
            if (requestPath === '/api/menu-data.php') {
              const databasePath = path.resolve(__dirname, 'public', 'tenants', 'meatport', 'database_dump.json');
              // Kept outside `public/` on purpose: Vite's dev server full-reloads the page
              // whenever a file under publicDir changes, which would wipe the logged-in
              // admin session every time this toggle saves. Menu data still lives under
              // public/ (unchanged, pre-existing behavior).
              const settingsPath = path.resolve(__dirname, '.national-day-theme.local.json');
              const readSettings = () => {
                try {
                  return { nationalDayTheme: false, ...JSON.parse(fs.readFileSync(settingsPath, 'utf8')) };
                } catch {
                  return { nationalDayTheme: false };
                }
              };
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

              try {
                if (req.method === 'GET') {
                  const contents = applyCashierMenuCorrections(JSON.parse(fs.readFileSync(databasePath, 'utf8')));
                  res.writeHead(200);
                  res.end(JSON.stringify({ ...contents, settings: readSettings() }));
                  return;
                }

                if (req.method === 'POST') {
                  const data = await readRequestBody(req);
                  const suppliedPin = String(req.headers['x-admin-pin'] || data.pin || '');
                  if (suppliedPin !== '0000' && suppliedPin !== '1234') {
                    res.writeHead(401);
                    res.end(JSON.stringify({ success: false, error: 'Invalid manager PIN' }));
                    return;
                  }

                  if (data.action === 'login') {
                    res.writeHead(200);
                    res.end(JSON.stringify({ success: true }));
                    return;
                  }

                  if (data.settings && typeof data.settings === 'object' && !Array.isArray(data.categories)) {
                    const updatedSettings = { ...readSettings(), ...data.settings };
                    fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2), 'utf8');
                    res.writeHead(200);
                    res.end(JSON.stringify({ success: true, settings: updatedSettings }));
                    return;
                  }

                  if (!Array.isArray(data.categories) || !Array.isArray(data.products)) {
                    throw new Error('Categories and products must be arrays');
                  }

                  const existing = fs.existsSync(databasePath)
                    ? JSON.parse(fs.readFileSync(databasePath, 'utf8'))
                    : {};
                  if (data.settings && typeof data.settings === 'object') {
                    fs.writeFileSync(settingsPath, JSON.stringify({ ...readSettings(), ...data.settings }, null, 2), 'utf8');
                  }
                  const updated = {
                    ...existing,
                    categories: data.categories,
                    products: data.products,
                    updatedAt: new Date().toISOString()
                  };
                  fs.writeFileSync(databasePath, JSON.stringify(updated, null, 2), 'utf8');
                  res.writeHead(200);
                  res.end(JSON.stringify({ success: true, updatedAt: updated.updatedAt, settings: readSettings() }));
                  return;
                }

                res.writeHead(405);
                res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
              } catch (error) {
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, error: String(error) }));
              }
              return;
            }

            if (req.url === '/api/create-tenant-folder' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body);
                  const {
                    slug,
                    tenantInfo,
                    branches = [],
                    categories = [],
                    products = [],
                    modifierGroups = [],
                    ingredients = [],
                    recipes = [],
                    orders = [],
                    orderItems = [],
                    auditLogs = [],
                    logoBase64
                  } = data;
                  const safeSlug = String(slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
                  if (!safeSlug) {
                    throw new Error('Invalid tenant slug');
                  }
                  
                  const tenantsRoot = path.resolve(__dirname, 'public', 'tenants');
                  const tenantDir = path.resolve(tenantsRoot, safeSlug);
                  if (!tenantDir.startsWith(tenantsRoot + path.sep)) {
                    throw new Error('Tenant path escaped public tenants directory');
                  }
                  const assetsDir = path.join(tenantDir, 'assets');
                  
                  // Create directories
                  fs.mkdirSync(assetsDir, { recursive: true });
                  
                  // Save settings.json
                  fs.writeFileSync(
                    path.join(tenantDir, 'settings.json'), 
                    JSON.stringify(tenantInfo, null, 2)
                  );
                  
                  // Save database_dump.json
                  const dbDump = {
                    branches,
                    categories,
                    products,
                    modifierGroups,
                    ingredients,
                    recipes,
                    orders,
                    orderItems,
                    auditLogs
                  };
                  fs.writeFileSync(
                    path.join(tenantDir, 'database_dump.json'),
                    JSON.stringify(dbDump, null, 2)
                  );
                  
                  // Save logo image
                  if (logoBase64 && logoBase64.includes(';base64,')) {
                    const base64Data = logoBase64.split(';base64,').pop();
                    fs.writeFileSync(path.join(assetsDir, 'logo.png'), base64Data, { encoding: 'base64' });
                  } else if (logoBase64 && logoBase64.startsWith('http')) {
                    try {
                      const response = await fetch(logoBase64);
                      const buffer = await response.arrayBuffer();
                      fs.writeFileSync(path.join(assetsDir, 'logo.png'), Buffer.from(buffer));
                    } catch (e) {
                      fs.writeFileSync(path.join(assetsDir, 'logo.url'), logoBase64);
                    }
                  } else if (logoBase64) {
                    fs.writeFileSync(path.join(assetsDir, 'logo.url'), logoBase64);
                  }
                  
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, path: `/tenants/${slug}` }));
                } catch (error) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: String(error) }));
                }
              });
              return;
            }
            if (req.url === '/api/list-images' && req.method === 'GET') {
              try {
                const dir = path.resolve(__dirname, 'public', 'tenants', 'meatport', 'assets', 'products');
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir, { recursive: true });
                }
                const files = fs.readdirSync(dir);
                const urls = files
                  .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
                  .map(f => `/tenants/meatport/assets/products/${f}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, images: urls }));
              } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: String(e) }));
              }
              return;
            }
            if (req.url === '/api/upload-image' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  const { fileName, base64Data } = data;
                  if (!fileName || !base64Data) {
                    throw new Error('Missing fileName or base64Data');
                  }
                  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
                  const dir = path.resolve(__dirname, 'public', 'tenants', 'meatport', 'assets', 'products');
                  if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                  }
                  const base64Clean = base64Data.split(';base64,').pop();
                  const targetPath = path.join(dir, safeName);
                  fs.writeFileSync(targetPath, base64Clean, { encoding: 'base64' });
                  const url = `/tenants/meatport/assets/products/${safeName}`;
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, url }));
                } catch (e) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: String(e) }));
                }
              });
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
