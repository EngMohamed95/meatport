const fs = require('fs');
const path = require('path');

console.log("Refactoring AdminDashboard.tsx for mobile responsiveness...");
const adminPath = path.join(__dirname, '../src/components/AdminDashboard.tsx');
let adminContent = fs.readFileSync(adminPath, 'utf8');

// Normalize to LF
adminContent = adminContent.replace(/\r\n/g, '\n');

// 1. Add icons to lucide-react imports
const importSearch = `  Settings, Layers, DollarSign, Package, AlertTriangle, ListFilter, FileText,
  TrendingUp, Activity, Shuffle, Eye, EyeOff, Tag, Clock, Flame, Percent,
  Warehouse, Users, ChefHat`;
const importReplace = `  Settings, Layers, DollarSign, Package, AlertTriangle, ListFilter, FileText,
  TrendingUp, Activity, Shuffle, Eye, EyeOff, Tag, Clock, Flame, Percent,
  Warehouse, Users, ChefHat, Menu, ShoppingBag, Archive, ClipboardList`;
adminContent = adminContent.replace(importSearch, importReplace);

// 2. Add mobileMenuOpen state variable
const stateSearch = `  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<'product' | 'category' | 'logo' | null>(null);`;
const stateReplace = `  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<'product' | 'category' | 'logo' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);`;
adminContent = adminContent.replace(stateSearch, stateReplace);

// 3. Make main desktop sidebar hidden on mobile
const sidebarSearch = `      {/* Sidebar: Fixed, full height */}
      <aside className="w-72 h-screen shrink-0 bg-white dark:bg-gray-900 flex flex-col justify-between p-6 shadow-2xl z-10 select-none">`;
const sidebarReplace = `      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={\`fixed top-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 flex flex-col justify-between p-6 shadow-2xl select-none transition-transform duration-300 lg:hidden \${
        lang === 'ar'
          ? (mobileMenuOpen ? 'right-0 translate-x-0' : 'right-0 translate-x-full')
          : (mobileMenuOpen ? 'left-0 translate-x-0' : 'left-0 -translate-x-full')
      }\`}>
        <div className="space-y-6 overflow-y-auto no-scrollbar flex-1">
          <div className="flex justify-between items-center pb-2 border-b border-gray-100/10 mb-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 font-mono">{lang === 'ar' ? 'القائمة' : 'Navigation'}</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 pb-4 mb-2">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.nameEn} className="w-10 h-10 rounded-xl object-cover bg-white shadow-xs border border-gray-100" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center font-black text-lg">
                MP
              </div>
            )}
            <div>
              <h1 className="text-sm font-black text-gray-955 dark:text-white leading-none">
                {lang === 'ar' ? tenant.nameAr : tenant.nameEn}
              </h1>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                {lang === 'ar' ? 'لوحة الإدارة والمستودعات' : 'Enterprise Control Panel'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono block px-2 mb-2">
              {lang === 'ar' ? 'أقسام لوحة التحكم' : 'Console Modules'}
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'products' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إدارة المنتجات' : 'Products catalog'}</span>
              </button>

              <button
                onClick={() => { setActiveTab('categories'); setMobileMenuOpen(false); }}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'categories' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <Layers className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إدارة الفئات' : 'Categories & Groups'}</span>
              </button>

              <button
                onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'inventory' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <Archive className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إدارة المخزن والمستودع' : 'Stock & Inventory'}</span>
              </button>

              <button
                onClick={() => { setActiveTab('kitchen'); setMobileMenuOpen(false); }}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'kitchen' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>{lang === 'ar' ? 'عمليات المطبخ والطلبات' : 'Kitchen Operations'}</span>
              </button>

              <button
                onClick={() => { setActiveTab('hr'); setMobileMenuOpen(false); }}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'hr' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <Users className="w-4 h-4" />
                <span>{lang === 'ar' ? 'شؤون الموظفين (HR)' : 'HR & Roster'}</span>
              </button>

              <button
                onClick={() => { setActiveTab('logs'); setMobileMenuOpen(false); }}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'logs' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <FileText className="w-4 h-4" />
                <span>{lang === 'ar' ? 'سجل العمليات والتدقيق' : 'Tenant Logs'}</span>
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className={\`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 cursor-pointer \${
                  activeTab === 'settings' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
                }\`}
              >
                <Settings className="w-4 h-4" />
                <span>{lang === 'ar' ? 'إعدادات النظام العامة' : 'General Settings'}</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="pt-4 space-y-3 border-t border-gray-100/10">
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

      {/* Sidebar: Fixed, full height (Desktop view only) */}
      <aside className="hidden lg:flex w-72 h-screen shrink-0 bg-white dark:bg-gray-900 flex flex-col justify-between p-6 shadow-2xl z-10 select-none">`;
adminContent = adminContent.replace(sidebarSearch, sidebarReplace);

// 4. Update Main Content area header layout to add Hamburger button
const headerSearch = `      {/* Main Content Area */}
      <div className="flex-1 h-screen flex flex-col overflow-hidden bg-gray-50/30 dark:bg-gray-950/30">
        
        {/* Top Navbar Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-gray-900 px-8 flex items-center justify-between shadow-md z-10">
          <div>
            <h1 className="text-sm font-black text-gray-955 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {lang === 'ar' ? 'بوابة إدارة كتالوج القائمة' : 'Menu Catalog Administration Portal'}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">
              {lang === 'ar' ? \`المستأجر النشط: \${tenant.nameAr}\` : \`Active SaaS Tenant: \${tenant.nameEn}\`}
            </p>
          </div>`;

const headerReplace = `      {/* Main Content Area */}
      <div className="flex-1 h-screen flex flex-col overflow-hidden bg-gray-50/30 dark:bg-gray-950/30">
        
        {/* Top Navbar Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-gray-900 px-4 lg:px-8 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              type="button"
              className="lg:hidden p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-xs sm:text-sm font-black text-gray-955 dark:text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0" />
                <span className="hidden sm:inline">{lang === 'ar' ? 'بوابة إدارة كتالوج القائمة' : 'Menu Catalog Administration Portal'}</span>
                <span className="sm:hidden">{lang === 'ar' ? 'بوابة الإدارة' : 'Catalog Control'}</span>
              </h1>
              <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold mt-0.5">
                {lang === 'ar' ? \`المستأجر النشط: \${tenant.nameAr}\` : \`Active SaaS Tenant: \${tenant.nameEn}\`}
              </p>
            </div>
          </div>`;
adminContent = adminContent.replace(headerSearch, headerReplace);

fs.writeFileSync(adminPath, adminContent, 'utf8');
console.log("AdminDashboard mobile responsive layout successfully applied!");
