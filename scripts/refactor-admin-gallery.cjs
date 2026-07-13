const fs = require('fs');
const path = require('path');

console.log("Refactoring AdminDashboard.tsx for media gallery integrations...");
const adminPath = path.join(__dirname, '../src/components/AdminDashboard.tsx');
let adminContent = fs.readFileSync(adminPath, 'utf8');

// Normalize to LF
adminContent = adminContent.replace(/\r\n/g, '\n');

// 1. Extend AdminDashboardProps and destructured parameters
console.log("Step 1: Extending props and signature for darkMode/branches...");
const propsSearch = `  activeStaff?: any;
  onLogout?: () => void;
}`;
const propsReplace = `  activeStaff?: any;
  onLogout?: () => void;
  darkMode?: boolean;
  setDarkMode?: (dark: boolean) => void;
  setBranches?: React.Dispatch<React.SetStateAction<Branch[]>>;
}`;
adminContent = adminContent.replace(propsSearch, propsReplace);

const destructureSearch = `  activeStaff,
  onLogout
}: AdminDashboardProps) {`;
const destructureReplace = `  activeStaff,
  onLogout,
  darkMode,
  setDarkMode,
  setBranches
}: AdminDashboardProps) {`;
adminContent = adminContent.replace(destructureSearch, destructureReplace);

// 2. Add style tag and sidebar logo check
console.log("Step 2: Adding style tag and sidebar logo conditional check...");
const returnSearch = `  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden text-gray-800 dark:text-gray-100 font-sans bg-gray-50/50 dark:bg-gray-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>`;
const returnReplace = `  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden text-gray-800 dark:text-gray-100 font-sans bg-gray-50/50 dark:bg-gray-950" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <style dangerouslySetInnerHTML={{ __html: \`
        :root {
          --tenant-primary: \${tenant.primaryColor || '#e11d48'};
          --tenant-secondary: \${tenant.secondaryColor || '#fb7185'};
        }
        .text-rose-600 { color: var(--tenant-primary) !important; }
        .text-rose-500 { color: var(--tenant-primary) !important; }
        .bg-rose-600 { background-color: var(--tenant-primary) !important; }
        .bg-rose-500 { background-color: var(--tenant-primary) !important; }
        .border-rose-600 { border-color: var(--tenant-primary) !important; }
        .border-rose-500 { border-color: var(--tenant-primary) !important; }
        .bg-rose-50 { background-color: var(--tenant-primary)1a !important; }
        .hover\\\\:bg-rose-700:hover { background-color: var(--tenant-primary) !important; filter: brightness(0.9); }
        .bg-rose-100 { background-color: var(--tenant-primary)20 !important; }
      \` }} />`;
adminContent = adminContent.replace(returnSearch, returnReplace);

const sidebarLogoSearch = `          <div className="flex items-center gap-3 pb-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center font-black text-lg">
              MP
            </div>`;
const sidebarLogoReplace = `          <div className="flex items-center gap-3 pb-4 mb-2">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.nameEn} className="w-10 h-10 rounded-xl object-cover bg-white shadow-xs border border-gray-100" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-rose-600/10 text-rose-600 flex items-center justify-center font-black text-lg">
                MP
              </div>
            )}`;
adminContent = adminContent.replace(sidebarLogoSearch, sidebarLogoReplace);

// 3. Add state variables and image upload functions
console.log("Step 3: Adding state variables and image upload helpers...");
const uploadHelpersSearch = `  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, base64Data })
        });
        const data = await res.json();
        if (data.success) {
          setProdImageUrl(data.url);
          setGalleryImages(prev => [data.url, ...prev.filter(img => img !== data.url)]);
        } else {
          alert(lang === 'ar' ? 'فشل الرفع: ' + data.error : 'Upload failed: ' + data.error);
        }
      } catch (err) {
        alert(lang === 'ar' ? 'خطأ أثناء الرفع' : 'Error uploading image');
      }
    };
    reader.readAsDataURL(file);
  };`;

const uploadHelpersReplace = `  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, base64Data })
        });
        const data = await res.json();
        if (data.success) {
          setProdImageUrl(data.url);
          setGalleryImages(prev => [data.url, ...prev.filter(img => img !== data.url)]);
        } else {
          alert(lang === 'ar' ? 'فشل الرفع: ' + data.error : 'Upload failed: ' + data.error);
        }
      } catch (err) {
        alert(lang === 'ar' ? 'خطأ أثناء الرفع' : 'Error uploading image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, base64Data })
        });
        const data = await res.json();
        if (data.success) {
          setCatImageUrl(data.url);
          setGalleryImages(prev => [data.url, ...prev.filter(img => img !== data.url)]);
        } else {
          alert(lang === 'ar' ? 'فشل الرفع: ' + data.error : 'Upload failed: ' + data.error);
        }
      } catch (err) {
        alert(lang === 'ar' ? 'خطأ أثناء الرفع' : 'Error uploading image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, base64Data })
        });
        const data = await res.json();
        if (data.success) {
          setGalleryImages(prev => [data.url, ...prev.filter(img => img !== data.url)]);
          if (setTenants) {
            setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, logoUrl: data.url } : t));
          }
        } else {
          alert(lang === 'ar' ? 'فشل الرفع: ' + data.error : 'Upload failed: ' + data.error);
        }
      } catch (err) {
        alert(lang === 'ar' ? 'خطأ أثناء الرفع' : 'Error uploading image');
      }
    };
    reader.readAsDataURL(file);
  };`;
adminContent = adminContent.replace(uploadHelpersSearch, uploadHelpersReplace);

const stateSearch = `  const [showMediaGallery, setShowMediaGallery] = useState(false);`;
const stateReplace = `  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<'product' | 'category' | 'logo' | null>(null);`;
adminContent = adminContent.replace(stateSearch, stateReplace);

// 4. Update Settings Tab and add custom inputs (using single quotes and escaping)
console.log("Step 4: Updating brand and aesthetics inputs inside Settings tab...");
const settingsSearch = [
  '          <div className="space-y-4">',
  '            {/* Delivery toggle row */}',
  '            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40">',
  '              <div className="space-y-1 text-right">',
  '                <span className="text-xs font-bold text-gray-800 dark:text-white block">',
  '                  {lang === \'ar\' ? \'تفعيل خدمة التوصيل للمنازل (Delivery)\' : \'Enable Home Delivery Service\'}',
  '                </span>',
  '                <p className="text-[10px] text-gray-400">',
  '                  {lang === \'ar\' ',
  '                    ? \'عند تعطيله، سيتم إخفاء خيار التوصيل تماماً من المنيو الرقمي للعميل، ولن يتمكن الكاشير من قبول أو عرض طلبات التوصيل.\'',
  '                    : \'When disabled, delivery options will be completely hidden from the digital menu and POS checkout.\'}',
  '                </p>',
  '              </div>',
  '',
  '              <button',
  '                onClick={() => {',
  '                  if (setTenants) {',
  '                    setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, enableDelivery: t.enableDelivery === false ? true : false } : t));',
  '                    addAuditLog(\'TOGGLE_DELIVERY_SERVICE\', \'Tenant\', tenant.id, `Toggled delivery service to ${tenant.enableDelivery === false ? \'ENABLED\' : \'DISABLED\'}`);',
  '                  }',
  '                }}',
  '                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${',
  '                  tenant.enableDelivery !== false ? \'bg-rose-600\' : \'bg-gray-200 dark:bg-gray-855\'',
  '                }`}',
  '              >',
  '                <span',
  '                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${',
  '                    tenant.enableDelivery !== false ? (lang === \'ar\' ? \'-translate-x-5\' : \'translate-x-5\') : \'translate-x-0\'',
  '                  }`}',
  '                />',
  '              </button>',
  '            </div>',
  '          </div>'
].join('\n');

// Try with dark:bg-gray-850 since that is in the file!
const settingsSearch850 = settingsSearch.replace("dark:bg-gray-855", "dark:bg-gray-850");

const settingsReplace = `          <div className="space-y-4">
            {/* Delivery toggle row */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40">
              <div className="space-y-1 text-right">
                <span className="text-xs font-bold text-gray-800 dark:text-white block">
                  {lang === 'ar' ? 'تفعيل خدمة التوصيل للمنازل (Delivery)' : 'Enable Home Delivery Service'}
                </span>
                <p className="text-[10px] text-gray-400">
                  {lang === 'ar' 
                    ? 'عند تعطيله، سيتم إخفاء خيار التوصيل تماماً من المنيو الرقمي للعميل، ولن يتمكن الكاشير من قبول أو عرض طلبات التوصيل.'
                    : 'When disabled, delivery options will be completely hidden from the digital menu and POS checkout.'}
                </p>
              </div>

              <button
                onClick={() => {
                  if (setTenants) {
                    setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, enableDelivery: t.enableDelivery === false ? true : false } : t));
                    addAuditLog('TOGGLE_DELIVERY_SERVICE', 'Tenant', tenant.id, \`Toggled delivery service to \${tenant.enableDelivery === false ? 'ENABLED' : 'DISABLED'}\`);
                  }
                }}
                className={\`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer \${
                  tenant.enableDelivery !== false ? 'bg-rose-600' : 'bg-gray-200 dark:bg-gray-850'
                }\`}
              >
                <span
                  className={\`inline-block h-4 w-4 transform rounded-full bg-white transition-transform \${
                    tenant.enableDelivery !== false ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                  }\`}
                />
              </button>
            </div>

            {/* Store Brand & Appearance Settings */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6 space-y-4">
              <div>
                <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                  {lang === 'ar' ? 'مظهر وهواية المتجر (الماركة)' : 'Store Branding & Aesthetics'}
                </h4>
                <p className="text-[10px] text-gray-400 mt-1">
                  {lang === 'ar' ? 'تخصيص ألوان الهوية والشعار ومعلومات الاتصال وعناوين الفروع الأساسية للمتجر' : 'Customize identity colors, logo, default theme, phone and branch addresses'}
                </p>
              </div>

              {/* Theme Selector */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40">
                <div className="space-y-1 text-right">
                  <span className="text-xs font-bold text-gray-800 dark:text-white block">
                    {lang === 'ar' ? 'وضع مظهر الموقع الافتراضي' : 'Default Theme Mode'}
                  </span>
                  <p className="text-[10px] text-gray-400">
                    {lang === 'ar' ? 'اختر مظهر الموقع الافتراضي للمستخدمين والمدراء.' : 'Select the default theme mode for users and managers.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (setDarkMode) setDarkMode(false);
                      if (setTenants) {
                        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, darkMode: false } : t));
                      }
                    }}
                    className={\`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer \${
                      !darkMode 
                        ? 'bg-rose-600 text-white shadow-xs' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }\`}
                  >
                    ☀️ {lang === 'ar' ? 'فاتح' : 'Light'}
                  </button>
                  <button
                    onClick={() => {
                      if (setDarkMode) setDarkMode(true);
                      if (setTenants) {
                        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, darkMode: true } : t));
                      }
                    }}
                    className={\`px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer \${
                      darkMode 
                        ? 'bg-rose-600 text-white shadow-xs' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }\`}
                  >
                    🌙 {lang === 'ar' ? 'داكن' : 'Dark'}
                  </button>
                </div>
              </div>

              {/* Color Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40 space-y-2 text-right">
                  <label className="text-xs font-bold text-gray-800 dark:text-white block">
                    {lang === 'ar' ? 'اللون الأساسي للهوية' : 'Primary Brand Color'}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={tenant.primaryColor || '#e11d48'}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, primaryColor: e.target.value } : t));
                        }
                      }}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={tenant.primaryColor || '#e11d48'}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, primaryColor: e.target.value } : t));
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40 space-y-2 text-right">
                  <label className="text-xs font-bold text-gray-800 dark:text-white block">
                    {lang === 'ar' ? 'اللون الثانوي للهوية' : 'Secondary Brand Color'}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={tenant.secondaryColor || '#fb7185'}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, secondaryColor: e.target.value } : t));
                        }
                      }}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={tenant.secondaryColor || '#fb7185'}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, secondaryColor: e.target.value } : t));
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Settings */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40 space-y-4 text-right">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-800 dark:text-white block">
                      {lang === 'ar' ? 'شعار المتجر (Logo)' : 'Store Brand Logo'}
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={tenant.logoUrl || ''}
                        onChange={(e) => {
                          if (setTenants) {
                            setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, logoUrl: e.target.value } : t));
                          }
                        }}
                        placeholder="https://example.com/logo.png"
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-left"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryTarget('logo');
                          setShowMediaGallery(true);
                        }}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Layers className="w-4 h-4" />
                        {lang === 'ar' ? 'المعرض' : 'Gallery'}
                      </button>
                      <label className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-255 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-755 transition cursor-pointer select-none shrink-0">
                        <Upload className="w-3.5 h-3.5 text-gray-500" />
                        <span>{lang === 'ar' ? 'رفع الشعار' : 'Upload Logo'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoImageUpload}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-3 h-24 bg-white dark:bg-gray-855">
                    {tenant.logoUrl ? (
                      <img src={tenant.logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain rounded-lg shadow-xs bg-white" />
                    ) : (
                      <span className="text-[10px] text-gray-400">{lang === 'ar' ? 'لا يوجد شعار' : 'No logo preview'}</span>
                    )}
                  </div>
                </div>

                {/* Logo visibility options */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-gray-100/10">
                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={tenant.showLogoInHeader !== false}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, showLogoInHeader: e.target.checked } : t));
                        }
                      }}
                      className="rounded-sm border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>{lang === 'ar' ? 'عرض اللوجو في الهيدر (Header)' : 'Show Logo in Sticky Header'}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={tenant.showLogoInFooter !== false}
                      onChange={(e) => {
                        if (setTenants) {
                          setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, showLogoInFooter: e.target.checked } : t));
                        }
                      }}
                      className="rounded-sm border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>{lang === 'ar' ? 'عرض اللوجو في الفوتر (Footer)' : 'Show Logo in Main Footer'}</span>
                  </label>
                </div>
              </div>

              {/* Phone & Address Contact details */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-150/45 dark:border-gray-800/40 space-y-4 text-right">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 dark:text-white block">
                    {lang === 'ar' ? 'رقم الهاتف الموحد للمتجر' : 'Unified Brand Phone'}
                  </label>
                  <input
                    type="text"
                    value={tenant.phone || ''}
                    onChange={(e) => {
                      const newPhone = e.target.value;
                      if (setTenants) {
                        setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, phone: newPhone } : t));
                      }
                      if (setBranches && branches.length > 0) {
                        setBranches(prev => prev.map((b, idx) => idx === 0 ? { ...b, phone: newPhone } : b));
                      }
                    }}
                    placeholder="+966 50 000 0000"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-800 dark:text-white block">
                      {lang === 'ar' ? 'عنوان الفرع الرئيسي (بالعربية)' : 'Main Branch Address (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={branches[0]?.addressAr || ''}
                      onChange={(e) => {
                        const newAddress = e.target.value;
                        if (setBranches && branches.length > 0) {
                          setBranches(prev => prev.map((b, idx) => idx === 0 ? { ...b, addressAr: newAddress } : b));
                        }
                      }}
                      placeholder="شارع العليا، الرياض، المملكة العربية السعودية"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-800 dark:text-white block">
                      {lang === 'ar' ? 'عنوان الفرع الرئيسي (بالإنجليزية)' : 'Main Branch Address (English)'}
                    </label>
                    <input
                      type="text"
                      value={branches[0]?.addressEn || ''}
                      onChange={(e) => {
                        const newAddress = e.target.value;
                        if (setBranches && branches.length > 0) {
                          setBranches(prev => prev.map((b, idx) => idx === 0 ? { ...b, addressEn: newAddress } : b));
                        }
                      }}
                      placeholder="Olaya Street, Riyadh, KSA"
                      className="w-full px-3 py-2 bg-white dark:bg-gray-80 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>`;

if (adminContent.includes(settingsSearch850)) {
  console.log("Found 850 search version. Replacing settings section...");
  adminContent = adminContent.replace(settingsSearch850, settingsReplace);
} else if (adminContent.includes(settingsSearch)) {
  console.log("Found 855 search version. Replacing settings section...");
  adminContent = adminContent.replace(settingsSearch, settingsReplace);
} else {
  console.log("WARNING: Could not find settings tab container in AdminDashboard.tsx to inject store branding settings.");
}

// 5. Update Product Page Browse Gallery button onClick handler
console.log("Step 5: Updating Product tab Browse Gallery onClick action...");
const productGallerySearch = `                    <button
                      type="button"
                      onClick={() => setShowMediaGallery(true)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 shrink-0"
                    >`;
const productGalleryReplace = `                    <button
                      type="button"
                      onClick={() => {
                        setGalleryTarget('product');
                        setShowMediaGallery(true);
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 shrink-0"
                    >`;
adminContent = adminContent.replace(productGallerySearch, productGalleryReplace);

// 6. Update Category Modal Image input to support dynamic browse gallery
console.log("Step 6: Adding Browse Gallery button to Category Modal...");
const categoryImageSearch = `              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">{lang === 'ar' ? 'صورة الفئة' : 'Category Cover Image'}</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition text-xs font-mono"
                  />
                  <label className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-255 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer select-none">
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>{lang === 'ar' ? 'رفع صورة' : 'Upload Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCategoryImageUpload}
                      className="hidden" 
                    />
                  </label>
                </div>`;

const categoryImageReplace = `              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700 block">{lang === 'ar' ? 'صورة الفئة' : 'Category Cover Image'}</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryTarget('category');
                      setShowMediaGallery(true);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Layers className="w-4 h-4" />
                    {lang === 'ar' ? 'المعرض' : 'Gallery'}
                  </button>
                  <label className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-255 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer select-none shrink-0">
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>{lang === 'ar' ? 'رفع صورة' : 'Upload Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleCategoryImageUpload}
                      className="hidden" 
                    />
                  </label>
                </div>`;
adminContent = adminContent.replace(categoryImageSearch, categoryImageReplace);

// 7. Refactor Media Gallery selection click and checkmarks to support target switching
console.log("Step 7: Modifying Media Gallery modal overlay to support multiple select targets...");
const fullGalleryBlockSearch = `                  {filteredGalleryImages.map((imgUrl, i) => {
                    const fileName = imgUrl.split('/').pop() || '';
                    const isSelected = prodImageUrl === imgUrl;
                    return (
                      <div 
                        key={i}
                        onClick={() => {
                          setProdImageUrl(imgUrl);
                          setShowMediaGallery(false);
                        }}
                        className={\`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition hover:scale-[1.02] shadow-sm hover:shadow-md \${
                          isSelected ? 'border-rose-600 ring-2 ring-rose-100' : 'border-gray-200 hover:border-rose-300'
                        }\`}
                      >
                        <img 
                          src={imgUrl} 
                          alt={fileName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Hover overlay with filename */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-150 flex flex-col justify-end p-2">
                          <p className="text-[10px] text-white font-medium truncate">{fileName}</p>
                        </div>
                        {/* Selected checkmark */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}`;

const galleryClickReplace = `                  {filteredGalleryImages.map((imgUrl, i) => {
                    const fileName = imgUrl.split('/').pop() || '';
                    const isSelected = galleryTarget === 'product'
                      ? prodImageUrl === imgUrl
                      : galleryTarget === 'category'
                      ? catImageUrl === imgUrl
                      : tenant.logoUrl === imgUrl;
                    return (
                      <div 
                        key={i}
                        onClick={() => {
                          if (galleryTarget === 'product') {
                            setProdImageUrl(imgUrl);
                          } else if (galleryTarget === 'category') {
                            setCatImageUrl(imgUrl);
                          } else if (galleryTarget === 'logo') {
                            if (setTenants) {
                              setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, logoUrl: imgUrl } : t));
                            }
                          }
                          setShowMediaGallery(false);
                          setGalleryTarget(null);
                        }}
                        className={\`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition hover:scale-[1.02] shadow-sm hover:shadow-md \${
                          isSelected ? 'border-rose-600 ring-2 ring-rose-100' : 'border-gray-200 hover:border-rose-300'
                        }\`}
                      >
                        <img 
                          src={imgUrl} 
                          alt={fileName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Hover overlay with filename */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-150 flex flex-col justify-end p-2">
                          <p className="text-[10px] text-white font-medium truncate">{fileName}</p>
                        </div>
                        {/* Selected checkmark */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full p-0.5 shadow-sm animate-in zoom-in-50">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}`;

adminContent = adminContent.replace(fullGalleryBlockSearch, galleryClickReplace);

// 8. Update quick upload in media gallery modal to set selected image correctly
console.log("Step 8: Updating quick upload inside Media Gallery modal to use target switcher callback...");
const galleryQuickUploadSearch = `                {/* Quick upload in gallery */}
                <label className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  {lang === 'ar' ? 'رفع صورة جديدة للمعرض' : 'Upload New Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProductImageUpload}
                  />
                </label>`;

const galleryQuickUploadReplace = `                {/* Quick upload in gallery */}
                <label className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  {lang === 'ar' ? 'رفع صورة جديدة للمعرض' : 'Upload New Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        const base64Data = event.target?.result as string;
                        try {
                          const res = await fetch('/api/upload-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fileName: file.name, base64Data })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setGalleryImages(prev => [data.url, ...prev.filter(img => img !== data.url)]);
                            if (galleryTarget === 'product') {
                              setProdImageUrl(data.url);
                            } else if (galleryTarget === 'category') {
                              setCatImageUrl(data.url);
                            } else if (galleryTarget === 'logo') {
                              if (setTenants) {
                                setTenants(prev => prev.map(t => t.id === tenant.id ? { ...t, logoUrl: data.url } : t));
                              }
                            }
                            setShowMediaGallery(false);
                            setGalleryTarget(null);
                          } else {
                            alert(lang === 'ar' ? 'فشل الرفع: ' + data.error : 'Upload failed: ' + data.error);
                          }
                        } catch (err) {
                          alert(lang === 'ar' ? 'خطأ أثناء الرفع' : 'Error uploading image');
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>`;
adminContent = adminContent.replace(galleryQuickUploadSearch, galleryQuickUploadReplace);

fs.writeFileSync(adminPath, adminContent, 'utf8');
console.log("Media gallery refactor successfully applied!");
