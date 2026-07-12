import React, { useState } from 'react';
import { BookOpen, Shield, Server, Database, Code, Cpu, GitBranch, Terminal } from 'lucide-react';

export default function ArchitectureDocs() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'api' | 'security' | 'devops'>('architecture');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden font-sans">
      <div className="border-b border-gray-100 bg-gray-50/50 p-6">
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-rose-600" />
          Enterprise SaaS Architecture & Blueprint Hub
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Complete structural specifications, database schemas, and deployment pipelines designed for global scale.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto bg-white">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'border-rose-600 text-rose-600 bg-rose-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
          }`}
        >
          <Server className="w-4 h-4" />
          System Architecture & Roadmap
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'database'
              ? 'border-rose-600 text-rose-600 bg-rose-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
          }`}
        >
          <Database className="w-4 h-4" />
          ERD & Normalized Database Schemas
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-rose-600 text-rose-600 bg-rose-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
          }`}
        >
          <Code className="w-4 h-4" />
          API & Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-rose-600 text-rose-600 bg-rose-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security Hardening & Coding Standards
        </button>
        <button
          onClick={() => setActiveTab('devops')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'devops'
              ? 'border-rose-600 text-rose-600 bg-rose-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50/50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          DevOps, Docker & CI/CD Strategy
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'architecture' && (
          <div className="space-y-8 animate-fade-in">
            {/* System Architecture */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                1. System Architecture Overview
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                The platform is architected as a **Modular Monolith** designed for subsequent transition to a **Microservices Architecture**. By partitioning modules along strict domain boundaries, communication is constrained to transactional event buses or direct interfaces, ensuring database isolation.
              </p>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                {`+-------------------------------------------------------------------------+
|                          Web App / Mobile POS Client                    |
+-------------------------------------------------------------------------+
                                     | (GraphQL / REST API via HTTPS)
                                     v
+-------------------------------------------------------------------------+
|                  Nginx Reverse Proxy & Cloudflare WAF                    |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                     API Gateway (Rate Limiter & JWT Validator)           |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                   Enterprise NestJS Modular Monolith Application         |
|                                                                         |
|  +------------------+  +-------------------+  +----------------------+  |
|  |   Menu Module    |  |    POS Module     |  |   Kitchen Display    |  |
|  | (Active Phase)   |  | (Message Queue)   |  |     (WebSockets)     |  |
|  +------------------+  +-------------------+  +----------------------+  |
|           |                      |                        |             |
|           v                      v                        v             |
|  +------------------+  +-------------------+  +----------------------+  |
|  | Menu Repositories|  | POS Repositories  |  | Kitchen Repositories |  |
|  +------------------+  +-------------------+  +----------------------+  |
+-------------------------------------------------------------------------+
       |                           |                           |
       v (Prisma Schema-Per-Service Connection Pooling)         |
+-------------------------------------------------------------+ |
|            PostgreSQL (Row-Level Security Tenant Isolated)  | |
+-------------------------------------------------------------+ |
       ^                                                       v
       | (Pub/Sub Event Bus for Async State Synchronization)   |
+---------------------------------------------------------------+
|               Redis Cache Cluster & BullMQ Event Queue        |
+---------------------------------------------------------------+`}
              </div>
            </div>

            {/* Folder Structure */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                2. Hexagonal Modular Monolith Folder Structure
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                All business modules maintain a rigid decoupling pattern inside the repository to isolate domains.
              </p>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 font-mono text-xs text-gray-700">
                <ul className="space-y-1">
                  <li>📂 <span className="font-semibold text-rose-600">src/</span> - Monolith Application Root</li>
                  <li className="pl-4">📂 <span className="font-semibold text-blue-600">modules/</span> - Domain Specific Bound Contexts</li>
                  <li className="pl-8">📂 <span className="font-semibold text-amber-600">menu/</span> - Isolated Menu Module</li>
                  <li className="pl-12">📂 <span className="font-medium">domain/</span> - Pure Business Entities (Category, Product, Modifier)</li>
                  <li className="pl-12">📂 <span className="font-medium">application/</span> - Use Cases, Handlers, Services, and Ports</li>
                  <li className="pl-12">📂 <span className="font-medium">infrastructure/</span> - Prisma Adapter, Controllers, DTOs, Serialization</li>
                  <li className="pl-8">📂 <span className="font-semibold text-gray-400">pos/</span>, <span className="font-semibold text-gray-400">kitchen/</span>, <span className="font-semibold text-gray-400">inventory/</span> - Future Plug-in Modules</li>
                  <li className="pl-4">📂 <span className="font-semibold text-green-600">common/</span> - Global Shared Libraries (Interceptors, Middlewares, Auth Guards)</li>
                  <li className="pl-8">📂 <span className="font-medium">guards/</span> - Multi-Tenant TenantResolverGuard, RBACGuard</li>
                  <li className="pl-8">📂 <span className="font-medium">exceptions/</span> - EnterpriseExceptionFilters</li>
                  <li className="pl-8">📂 <span className="font-medium">interceptors/</span> - ResponseWrappingInterceptor</li>
                </ul>
              </div>
            </div>

            {/* Development Roadmap */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                3. Enterprise Delivery Roadmap
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                <div className="p-4 border border-rose-200 bg-rose-50/30 rounded-xl">
                  <span className="text-xs font-semibold text-rose-600 uppercase tracking-widest">Phase 1 (Active)</span>
                  <h4 className="font-semibold text-gray-900 mt-1 text-sm">Menu Management</h4>
                  <p className="text-xs text-gray-500 mt-1">Multi-tenant catalog engine, digital menus, modifiers, variants, and localized layout builders.</p>
                </div>
                <div className="p-4 border border-gray-100 bg-white rounded-xl">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Phase 2</span>
                  <h4 className="font-semibold text-gray-900 mt-1 text-sm">POS & KDS System</h4>
                  <p className="text-xs text-gray-500 mt-1">Order capture engine, ticket state routing, kitchen dispatch board, and real-time WebSockets.</p>
                </div>
                <div className="p-4 border border-gray-100 bg-white rounded-xl">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Phase 3</span>
                  <h4 className="font-semibold text-gray-900 mt-1 text-sm">Inventory & Recipes</h4>
                  <p className="text-xs text-gray-500 mt-1">Ingredient level tracking, auto stock depletion on POS sale, purchase logs, waste control.</p>
                </div>
                <div className="p-4 border border-gray-100 bg-white rounded-xl">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Phase 4</span>
                  <h4 className="font-semibold text-gray-900 mt-1 text-sm">Finance & CRM</h4>
                  <p className="text-xs text-gray-500 mt-1">Double-entry accounting, staff payroll calculation, loyalty tier points, and customer CRM.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-8 animate-fade-in">
            {/* Database ERD Design */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                Database ERD Relational Map
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                To enable absolute multi-tenancy separation without performance bottlenecks, composite primary indexing is applied. Every transactional table contains both `tenant_id` and `branch_id` combined with standard constraints.
              </p>
              <div className="bg-gray-900 text-gray-100 p-6 rounded-lg font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
                {`+-------------------+            +-------------------+            +-----------------------+
|     tenants       |            |     branches      |            |      categories       |
+-------------------+            +-------------------+            +-----------------------+
| PK  id: uuid      |-----------<| PK  id: uuid      |            | PK  id: uuid          |
|     name_en: varchar|          | FK  tenant_id: uuid|            | FK  tenant_id: uuid   |
|     name_ar: varchar|          |     name_en: varchar|            |     name_en: varchar  |
|     slug: varchar |            +-------------------+            |     name_ar: varchar  |
+-------------------+                      |                      |     display_order: int|
                                           v                      +-----------------------+
+-------------------+            +-------------------+                        |
|  modifier_groups  |            |     products      |                        |
+-------------------+            +-------------------+                        v
| PK  id: uuid      |<-----------| PK  id: uuid      |>-----------------------+
| FK  tenant_id: uuid|           | FK  tenant_id: uuid|
|     name_en: varchar|          | FK  category_id: uuid|          +-----------------------+
|     name_ar: varchar|          |     name_en: varchar|          |     product_sizes     |
|     min_select: int|           |     name_ar: varchar|          +-----------------------+
|     max_select: int|           |     price: decimal  |--------< | PK  id: uuid          |
+-------------------+            |     sku: varchar    |          | FK  product_id: uuid  |
          |                      |     barcode: varchar|          |     name_en: varchar  |
          v                      +-------------------+          |     price_diff: decimal|
+-------------------+                      |                      +-----------------------+
|     modifiers     |                      v
+-------------------+            +-------------------+
| PK  id: uuid      |            |    audit_logs     |
| FK  group_id: uuid|            +-------------------+
|     name_en: varchar|            | PK  id: uuid      |
|     price: decimal|            | FK  tenant_id: uuid|
+-------------------+            |     action: varchar|
                                 +-------------------+`}
              </div>
            </div>

            {/* DDL Specifications */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                PostgreSQL Tables & Schema Definition (DDL)
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded border-l-4 border-rose-600">Table: products</h4>
                  <div className="bg-gray-50 border border-gray-100 rounded p-4 font-mono text-[11px] text-gray-700 mt-1">
                    {`CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  sub_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  cost_price DECIMAL(10, 2) NOT NULL CHECK (cost_price >= 0),
  margin DECIMAL(5, 2) NOT NULL GENERATED ALWAYS AS (((price - cost_price) / NULLIF(price, 0)) * 100) STORED,
  calories INTEGER CHECK (calories >= 0),
  preparation_time INTEGER NOT NULL DEFAULT 10,
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(100),
  image_url VARCHAR(512),
  video_url VARCHAR(512),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_recommended BOOLEAN NOT NULL DEFAULT FALSE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  track_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  allergens VARCHAR(100)[] DEFAULT '{}'::VARCHAR[],
  carbs DECIMAL(5,2),
  protein DECIMAL(5,2),
  fat DECIMAL(5,2),
  tax_rate DECIMAL(4, 2) NOT NULL DEFAULT 0.15,
  discount_rate DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_products_tenant_id ON products(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category_id ON products(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_sku ON products(sku);`}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded border-l-4 border-rose-600">Table: modifiers</h4>
                  <div className="bg-gray-50 border border-gray-100 rounded p-4 font-mono text-[11px] text-gray-700 mt-1">
                    {`CREATE TABLE modifier_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  min_select INTEGER NOT NULL DEFAULT 0,
  max_select INTEGER NOT NULL DEFAULT 1,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  calories INTEGER DEFAULT 0,
  sku VARCHAR(100)
);`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-8 animate-fade-in">
            {/* REST API Definition */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                API Route Endpoint Specifications (v1)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                The API uses REST principles with custom Express / NestJS validation decorators. All requests require `x-tenant-id` header validation for multi-tenant mapping.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-100 rounded-lg">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3 border-b border-gray-100">Method</th>
                      <th className="p-3 border-b border-gray-100">Endpoint</th>
                      <th className="p-3 border-b border-gray-100">Payload / Query Parameters</th>
                      <th className="p-3 border-b border-gray-100">Access Tier</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 divide-y divide-gray-100">
                    <tr>
                      <td className="p-3 font-semibold text-green-600">GET</td>
                      <td className="p-3 font-mono">/api/v1/menu/categories</td>
                      <td className="p-3">tenantId (header)</td>
                      <td className="p-3 bg-gray-50 text-gray-500 text-[11px] font-medium text-center">Public</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-green-600">GET</td>
                      <td className="p-3 font-mono">/api/v1/menu/products</td>
                      <td className="p-3">category, search, page=1, limit=20</td>
                      <td className="p-3 bg-gray-50 text-gray-500 text-[11px] font-medium text-center">Public</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-blue-600">POST</td>
                      <td className="p-3 font-mono">/api/v1/menu/products</td>
                      <td className="p-3">ProductDTO (Zod validated body)</td>
                      <td className="p-3 bg-amber-50 text-amber-700 text-[11px] font-medium text-center">BranchManager+</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-amber-600">PUT</td>
                      <td className="p-3 font-mono">/api/v1/menu/products/:id</td>
                      <td className="p-3">Partial&lt;ProductDTO&gt;</td>
                      <td className="p-3 bg-amber-50 text-amber-700 text-[11px] font-medium text-center">BranchManager+</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-red-600">DELETE</td>
                      <td className="p-3 font-mono">/api/v1/menu/products/:id</td>
                      <td className="p-3">softDelete=true</td>
                      <td className="p-3 bg-rose-50 text-rose-700 text-[11px] font-medium text-center">SuperAdmin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Permission Matrix */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                Role-Based Access Control (RBAC) Permission Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-100 rounded-lg">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3 border-b border-gray-100">Capability</th>
                      <th className="p-3 border-b border-gray-100 text-center">SuperAdmin</th>
                      <th className="p-3 border-b border-gray-100 text-center">BranchManager</th>
                      <th className="p-3 border-b border-gray-100 text-center">Cashier</th>
                      <th className="p-3 border-b border-gray-100 text-center">Customer</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 divide-y divide-gray-100">
                    <tr>
                      <td className="p-3 font-medium">Configure Multi-Tenant Settings</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                      <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                      <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Add/Edit Categories & Products</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                      <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Modify Item Price & Cost Structures</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-red-600 font-bold">✘ No (HQ Only)</td>
                      <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                      <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Update Live Item Stock State</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-red-600 font-bold">✘ No</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Read Digital Menu & Add to Cart</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                      <td className="p-3 text-center text-green-600 font-bold">✔ Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8 animate-fade-in">
            {/* Security Audit Checklist */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                Enterprise Security Hardening Blueprint
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                The system relies on defense-in-depth principles. All input bodies must map to Zod validation classes to block SQL injection and cross-site scripting (XSS).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/30">
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Input Sanitization & Injection Defense
                  </h4>
                  <ul className="text-xs text-gray-600 mt-2 space-y-2 list-disc pl-4">
                    <li>**Parameterized SQL Execution**: Handled out-of-the-box by Prisma Query Engine to prevent dynamic text string injection.</li>
                    <li>**XSS Protection**: Implement Helmet middleware for custom HTTP header configurations (CSP, HSTS).</li>
                    <li>**JWT Cryptographic Verification**: Signed using HS512 with hourly token rotations.</li>
                  </ul>
                </div>

                <div className="p-5 border border-gray-100 rounded-xl bg-gray-50/30">
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Row-Level Tenant Isolation
                  </h4>
                  <ul className="text-xs text-gray-600 mt-2 space-y-2 list-disc pl-4">
                    <li>**Prisma Row Filtering**: Middleware auto-injects `tenant_id` into queries matching database profiles.</li>
                    <li>**Audit Logs**: Mandatory system log generation on any mutable state action, storing client IP and actor ID.</li>
                    <li>**Safe File Store**: Asset uploads (S3) run through pre-signed hash uploads with MIME validation (only images/MP4 allowed).</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Coding Standards */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                Strict Coding Standards & Guidelines
              </h3>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 font-mono text-xs text-gray-700 leading-relaxed">
                <p className="font-bold text-gray-900 mb-2">// TypeScript Coding Rules</p>
                <p>1. Always declare precise types. No `any` type casting allowed.</p>
                <p>2. Prefer standard enums over raw string bindings for roles and status codes.</p>
                <p>3. Use functional programming constructs (filter, map, reduce) to clean calculations.</p>
                <p>4. Encapsulate business rules exclusively in pure Domain Model classes.</p>
                <p>5. Format file names using kebab-case (e.g. `product-card.tsx`).</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'devops' && (
          <div className="space-y-8 animate-fade-in">
            {/* Multi-stage Docker Container */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                Multi-Stage Docker Structure
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                To keep container images lightweight and secure, we use a multi-stage Dockerfile dividing the build and execution phases.
              </p>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 font-mono text-xs text-gray-700">
                {`# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production Runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

EXPOSE 3000
CMD ["node", "dist/server.js"]`}
              </div>
            </div>

            {/* Deployment & CI/CD */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-rose-600 rounded-full" />
                CI/CD Delivery Strategy (GitHub Actions)
              </h3>
              <div className="bg-gray-950 p-5 rounded-lg border border-gray-800 text-[11px] font-mono text-gray-300 leading-relaxed">
                {`name: Prod Delivery Pipeline
on:
  push:
    branches: [ main ]

jobs:
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run test

  build-and-push-gcr:
    needs: validate-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Auth GCP
        uses: google-github-actions/auth@v2
        with: { credentials_json: \'\${{ secrets.GCP_SA_KEY }}\' }
      - name: Deploy to Cloud Run
        run: gcloud run deploy saas-restaurant-pos --image gcr.io/saas-pos:latest --region us-central1`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
