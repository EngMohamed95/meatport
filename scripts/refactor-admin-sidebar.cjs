const fs = require('fs');
const path = require('path');

console.log("Refactoring AdminDashboard.tsx...");
const adminPath = path.join(__dirname, '../src/components/AdminDashboard.tsx');
let adminContent = fs.readFileSync(adminPath, 'utf8');

// Normalize to LF for clean processing
adminContent = adminContent.replace(/\r\n/g, '\n');

// 1. Extend AdminDashboardProps to accept activeStaff and onLogout
console.log("Step 1: Extending AdminDashboardProps...");
const propsSearch = `  currentPath: string;
  navigateTo: (path: string) => void;
}`;
const propsReplace = `  currentPath: string;
  navigateTo: (path: string) => void;
  activeStaff?: any;
  onLogout?: () => void;
}`;
adminContent = adminContent.replace(propsSearch, propsReplace);

// 2. Destructure activeStaff and onLogout in parameters
console.log("Step 2: Destructuring props in AdminDashboard component...");
const destructureSearch = `  currentPath,
  navigateTo
}: AdminDashboardProps) {`;
const destructureReplace = `  currentPath,
  navigateTo,
  activeStaff,
  onLogout
}: AdminDashboardProps) {`;
adminContent = adminContent.replace(destructureSearch, destructureReplace);

// 3. Replace the JSX layout structure
console.log("Step 3: Replacing JSX layout structure...");

const returnSearch = `  return (
    <div className="space-y-6 text-gray-800 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>`;

const mainOpenSearch = `        <main className="md:col-span-9 space-y-6">`;

const returnIndex = adminContent.indexOf(returnSearch);
const mainOpenIndex = adminContent.indexOf(mainOpenSearch, returnIndex);

if (returnIndex === -1 || mainOpenIndex === -1) {
  console.error("Error: Could not find return statement or main open tag in AdminDashboard.tsx.");
  process.exit(1);
}

const newLayoutHeaderAndSidebar = `  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden text-gray-800 dark:text-gray-100 font-sans bg-gray-50/50 dark:bg-gray-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Sidebar: Fixed, full height */}
      <aside className="w-72 h-screen shrink-0 bg-white dark:bg-gray-900 border-l border-r border-gray-150 dark:border-gray-800 flex flex-col justify-between p-6 shadow-xs select-none">
        <div className="space-y-6 overflow-y-auto no-scrollbar">
          {/* Logo & Brand title */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center font-black text-lg">
              MP
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-955 dark:text-white leading-none">
                {lang === 'ar' ? tenant.nameAr : tenant.nameEn}
              </h1>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                {lang === 'ar' ? 'لوحة الإدارة والمستودعات' : 'Enterprise Control Panel'}
              </span>
            </div>
          </div>

          {/* Nav menu links */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono block px-2 mb-2">
              {lang === 'ar' ? 'أقسام لوحة التحكم' : 'Console Modules'}
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('products')}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'products'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <Package className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إدارة المنتجات' : 'Products Grid'}</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'categories'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <Layers className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إدارة الفئات' : 'Categories Deck'}</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'inventory'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <Warehouse className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إدارة المخازن' : 'Inventory & Stocks'}</span>
              </button>

              <button
                onClick={() => setActiveTab('kitchen_analytics')}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'kitchen_analytics'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <ChefHat className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تحليلات ومخازن المطبخ' : 'Kitchen Operations'}</span>
              </button>

              <button
                onClick={() => setActiveTab('hr')}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'hr'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <Users className="w-4 h-4" />
                <span>{lang === 'ar' ? 'شؤون الموظفين (HR)' : 'HR & Roster'}</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'logs'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <FileText className="w-4 h-4" />
                <span>{lang === 'ar' ? 'سجل العمليات والتدقيق' : 'Tenant Logs'}</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'settings'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <Settings className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إعدادات النظام العامة' : 'General Settings'}</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Active Session / Logout */}
        <div className="pt-4 border-t border-gray-150 dark:border-gray-800 space-y-3">
          {activeStaff && (
            <div className="flex items-center gap-2 px-1">
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold text-xs">
                M
              </div>
              <div className="min-w-0 text-right">
                <span className="block text-[11px] font-black text-gray-900 dark:text-white truncate">
                  {activeStaff.name}
                </span>
                <span className="block text-[9px] text-gray-400 truncate">
                  {lang === 'ar' ? 'مدير معتمد' : 'Manager'}
                </span>
              </div>
            </div>
          )}
          
          {onLogout && (
            <button
              onClick={onLogout}
              type="button"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50/60 dark:bg-red-950/10 hover:bg-red-100 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-black rounded-xl text-[10px] transition cursor-pointer"
            >
              <span>🚪</span>
              {lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 h-screen flex flex-col overflow-hidden bg-gray-50/30 dark:bg-gray-950/30">
        
        {/* Top Navbar Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-gray-900 border-b border-gray-150 dark:border-gray-800 px-8 flex items-center justify-between shadow-xs">
          <div>
            <h1 className="text-sm font-black text-gray-950 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {lang === 'ar' ? 'بوابة إدارة كتالوج القائمة' : 'Menu Catalog Administration Portal'}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">
              {lang === 'ar' ? \`المستأجر النشط: \${tenant.nameAr}\` : \`Active SaaS Tenant: \${tenant.nameEn}\`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export / Import Buttons */}
            <button 
              onClick={handleExportCSV}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm text-gray-700 dark:text-gray-202 cursor-pointer animate-in fade-in"
            >
              <Download className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </button>
            
            <button 
              onClick={handleImportCSVClick}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm text-gray-700 dark:text-gray-202 cursor-pointer animate-in fade-in"
            >
              <Upload className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'استيراد CSV' : 'Import CSV'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportCSVFile} 
              accept=".csv" 
              className="hidden" 
            />

            <button 
              onClick={() => activeTab === 'products' ? openProductModal() : openCategoryModal()}
              type="button"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'products' 
                ? (lang === 'ar' ? 'إضافة منتج' : 'Add Product') 
                : (lang === 'ar' ? 'إضافة فئة' : 'Add Category')}
            </button>
          </div>
        </header>

        {/* Scrollable Content Pane */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  {lang === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{metrics.totalCount}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  {lang === 'ar' ? 'إجمالي الفئات' : 'Total Categories'}
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{metrics.totalCategories}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  {lang === 'ar' ? 'متوسط الربح' : 'Avg. Margin'}
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{metrics.avgMargin.toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg">
                <AlertTriangle className="w-5 h-5 animate-bounce-slow" />
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  {lang === 'ar' ? 'نقص المخزون' : 'Stock Alerts'}
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{metrics.lowStockCount}</span>
              </div>
            </div>
          </div>
`;

// Make the replacement
adminContent = adminContent.substring(0, returnIndex) + newLayoutHeaderAndSidebar + adminContent.substring(mainOpenIndex + mainOpenSearch.length);

fs.writeFileSync(adminPath, adminContent, 'utf8');
console.log("Successfully refactored AdminDashboard.tsx with programmatically safe replacement!");
