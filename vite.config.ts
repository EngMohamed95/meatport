import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import fs from 'fs';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'tenant-folder-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
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
