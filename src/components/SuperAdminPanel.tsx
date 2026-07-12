import React, { useState } from 'react';
import { 
  Plus, Globe, Building, Shield, Trash2, Users, CreditCard, 
  TrendingUp, Check, AlertCircle, X, ExternalLink, Lock, Settings,
  Folder, File, RefreshCw, FolderOpen, ChevronRight, LayoutGrid
} from 'lucide-react';
import { Tenant } from '../types';

interface SuperAdminPanelProps {
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  lang: 'en' | 'ar';
  darkMode: boolean;
  addAuditLog: (action: string, entityName: string, entityId: string, details: string) => void;
  syncTenantToDisk: (tenant: Tenant) => Promise<any>;
}

export default function SuperAdminPanel({
  tenants,
  setTenants,
  lang,
  darkMode,
  addAuditLog,
  syncTenantToDisk
}: SuperAdminPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [addressAr, setAddressAr] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<'free' | 'basic' | 'premium' | 'enterprise'>('basic');
  const [managerUsername, setManagerUsername] = useState('');
  const [managerPassword, setManagerPassword] = useState('');

  // Directory & DB explorer states
  const [exploringTenantId, setExploringTenantId] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<'settings' | 'database' | 'logo' | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [explorerError, setExplorerError] = useState<string>('');

  const exploreTenantFiles = async (tenant: Tenant, fileName: 'settings' | 'database' | 'logo') => {
    setActiveFile(fileName);
    setFileContent('');
    setExplorerError('');
    setIsLoadingFile(true);

    try {
      const url = fileName === 'settings' 
        ? `/tenants/${tenant.slug}/settings.json` 
        : fileName === 'database' 
          ? `/tenants/${tenant.slug}/database_dump.json`
          : tenant.logoUrl || '';

      if (fileName === 'logo') {
        setFileContent(url);
      } else {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(lang === 'ar' ? 'الملف لم يُنشأ بعد على القرص. يرجى الضغط على زر المزامنة للكتابة.' : 'File not found on disk. Please click Sync to generate.');
        }
        const json = await response.json();
        setFileContent(JSON.stringify(json, null, 2));
      }
    } catch (err: any) {
      setExplorerError(err.message || String(err));
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleSyncTenant = async (tenant: Tenant) => {
    setIsLoadingFile(true);
    const result = await syncTenantToDisk(tenant);
    setIsLoadingFile(false);
    if (result && result.success) {
      alert(lang === 'ar' ? 'تمت مزامنة مجلد المنشأة وملفاتها بنجاح!' : 'Successfully synced tenant folder!');
      if (activeFile) {
        exploreTenantFiles(tenant, activeFile);
      }
    } else {
      alert(lang === 'ar' ? 'فشلت المزامنة: ' + (result?.error || 'خطأ غير معروف') : 'Sync failed: ' + (result?.error || 'Unknown error'));
    }
  };

  const handleSyncAll = async () => {
    try {
      for (const t of tenants) {
        await syncTenantToDisk(t);
      }
      alert(lang === 'ar' ? 'تمت مزامنة مجلدات وقواعد بيانات كافة المنشآت بنجاح على القرص! 📂' : 'Synced directories and databases for all tenants successfully to local disk! 📂');
    } catch (e) {
      alert('Error: ' + String(e));
    }
  };

  // Pre-configured Unsplash logos for easier onboarding
  const presetLogos = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80', // Restaurant interior
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80', // Burger joint
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80', // Pizzeria
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80', // Steakhouse
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&auto=format&fit=crop&q=80', // General Buffet
  ];

  // Auto-generate manager credentials and slug based on English name input
  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    const cleaned = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    setSlug(cleaned);
    setManagerUsername(`${cleaned}_manager`);
    setManagerPassword(`${cleaned}123`);
  };

  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !nameAr || !slug) {
      alert(lang === 'ar' ? 'الرجاء إدخال الحقول المطلوبة' : 'Please input required fields');
      return;
    }

    const exists = tenants.some(t => t.slug === slug);
    if (exists) {
      alert(lang === 'ar' ? 'هذا النطاق الفرعي (Subdomain Slug) مستخدم بالفعل!' : 'This subdomain handle is already taken!');
      return;
    }

    const defaultLogo = logoUrl || presetLogos[Math.floor(Math.random() * presetLogos.length)];

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      nameEn,
      nameAr,
      slug,
      logoUrl: defaultLogo,
      primaryColor: '#e11d48', // Default rose-600
      currencyEn: 'SAR',
      currencyAr: 'ر.س',
      managerUsername,
      managerPassword,
      addressEn,
      addressAr,
      phone,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year free trial
      plan,
      status: 'active'
    };

    const updated = [newTenant, ...tenants];
    setTenants(updated);
    // Save to local storage
    localStorage.setItem('saas_tenants', JSON.stringify(updated));

    // Physically create the tenant folder and database files on local disk
    syncTenantToDisk(newTenant).then(res => {
      console.log('Isolated tenant directory created:', res);
    });

    addAuditLog('TENANT_ONBOARD', 'Tenant', newTenant.id, `SuperAdmin onboarded new tenant ${newTenant.nameEn} with slug ${newTenant.slug}`);
    
    // Reset Form
    setShowAddModal(false);
    setNameEn('');
    setNameAr('');
    setSlug('');
    setLogoUrl('');
    setAddressEn('');
    setAddressAr('');
    setPhone('');
    setPlan('basic');
    setManagerUsername('');
    setManagerPassword('');

    alert(lang === 'ar' ? `تم تسجيل منشأة ${nameAr} بنجاح!` : `Tenant ${nameEn} onboarded successfully!`);
  };

  const handleDeleteTenant = (id: string, name: string) => {
    if (!confirm(lang === 'ar' ? `هل أنت متأكد من حذف المنشأة ${name} بالكامل؟` : `Are you sure you want to permanently delete tenant ${name}?`)) return;
    
    const updated = tenants.filter(t => t.id !== id);
    setTenants(updated);
    localStorage.setItem('saas_tenants', JSON.stringify(updated));
    addAuditLog('TENANT_DELETE', 'Tenant', id, `SuperAdmin deleted tenant ${name}`);
  };

  const toggleTenantStatus = (id: string, currentStatus: Tenant['status']) => {
    const nextStatus: Tenant['status'] = currentStatus === 'active' ? 'suspended' : 'active';
    const updated = tenants.map(t => {
      if (t.id === id) {
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem('saas_tenants', JSON.stringify(updated));
    addAuditLog('TENANT_STATUS', 'Tenant', id, `SuperAdmin toggled status for tenant ID ${id} to ${nextStatus}`);
  };

  // Simulated metrics
  const activeCount = tenants.filter(t => t.status === 'active').length;
  const mrr = tenants.reduce((total, t) => {
    if (t.status !== 'active') return total;
    if (t.plan === 'basic') return total + 199;
    if (t.plan === 'premium') return total + 399;
    if (t.plan === 'enterprise') return total + 799;
    return total;
  }, 0);

  return (
    <div className={`space-y-6 text-gray-800 font-sans ${darkMode ? 'dark text-white' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* SaaS Executive KPI Deck */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-rose-600 rounded-2xl text-white shadow-lg">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight">{lang === 'ar' ? 'بوابة الآدمن العام ومنصة الساس (Super Admin Panel)' : 'Enterprise SaaS Portal / Super Admin Console'}</h2>
            <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'إدارة تراخيص المنشآت وحساب المشتركين الإجمالي ومراقبة الاشتراكات' : 'Orchestrate global restaurant tenants, monitor subscription tiers, and configure subdomains'}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSyncAll}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCw className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'ar' ? 'مزامنة جميع المطاعم للقرص 🔄' : 'Sync All to Disk 🔄'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'ar' ? 'تسجيل منشأة جديدة (عميل ساس)' : 'Onboard New Tenant'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        <div className="bg-white p-5 rounded-2xl border border-gray-150 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase block font-bold">{lang === 'ar' ? 'إجمالي المنشآت النشطة' : 'Active Tenant Base'}</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{activeCount} / {tenants.length}</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase block font-bold">{lang === 'ar' ? 'إجمالي الدخل الشهري المتوقع' : 'Est. Monthly Recurring Revenue (MRR)'}</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{mrr.toLocaleString()} SAR</span>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-150 dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase block font-bold">{lang === 'ar' ? 'متوسط سعر العضوية' : 'Average Plan Value'}</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{tenants.length > 0 ? Math.floor(mrr / tenants.length) : 0} SAR / mo</span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-xl">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tenants Table & Details */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase flex items-center gap-1.5 justify-start">
          <Globe className="w-4 h-4 text-rose-500" />
          {lang === 'ar' ? 'دليل المنشآت والمشتركين المسجلين' : 'Tenant Registry & Subdomain Management'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map(t => {
            const menuLink = `${window.location.origin}/menu?tenant=${t.slug}`;
            
            return (
              <div key={t.id} className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-2xl space-y-3.5 text-right relative overflow-hidden">
                
                {/* Plan Badge watermark */}
                <div className="absolute top-2.5 left-2.5">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                    t.plan === 'enterprise' ? 'bg-indigo-100 text-indigo-700' :
                    t.plan === 'premium' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {t.plan}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img src={t.logoUrl || presetLogos[0]} alt={t.nameEn} className="w-12 h-12 rounded-xl object-cover border border-gray-200" />
                  <div className="text-right">
                    <h4 className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      {lang === 'ar' ? t.nameAr : t.nameEn}
                      <span className={`w-2 h-2 rounded-full ${t.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono">Subdomain: {t.slug}.localhost</p>
                  </div>
                </div>

                {/* Info Deck */}
                <div className="bg-white dark:bg-gray-905 border border-gray-150 dark:border-gray-800 rounded-xl p-3.5 space-y-2 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-450">{lang === 'ar' ? 'بيانات دخول المدير:' : 'Manager login details:'}</span>
                    <span className="font-bold font-mono text-gray-900 dark:text-white">{t.managerUsername} / {t.managerPassword}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100/10 pt-2">
                    <span className="text-gray-450">{lang === 'ar' ? 'العنوان وتليفون الاتصال:' : 'Address & Hotline:'}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-300">{lang === 'ar' ? t.addressAr : t.addressEn} ({t.phone || 'N/A'})</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100/10 pt-2">
                    <span className="text-gray-450">{lang === 'ar' ? 'رابط المنيو الفرعي (Subdomain):' : 'Dedicated Menu URL:'}</span>
                    <a href={menuLink} target="_blank" rel="noopener noreferrer" className="font-bold text-rose-600 hover:underline flex items-center gap-1">
                      <span>{t.slug}/menu</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Operations Toolbar */}
                <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-850 pt-3">
                  
                  {/* Explore Folder Button */}
                  <button
                    onClick={() => {
                      if (exploringTenantId === t.id) {
                        setExploringTenantId(null);
                        setActiveFile(null);
                      } else {
                        setExploringTenantId(t.id);
                        exploreTenantFiles(t, 'settings');
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                      exploringTenantId === t.id
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                    }`}
                  >
                    <Folder className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'استكشاف الملفات 📁' : 'Explore Files 📁'}</span>
                  </button>

                  {/* Status Toggle */}
                  <button
                    onClick={() => toggleTenantStatus(t.id, t.status || 'active')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                      t.status === 'active' 
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' 
                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                    }`}
                  >
                    {t.status === 'active' 
                      ? (lang === 'ar' ? 'تجميد الاشتراك ⏸️' : 'Suspend Plan')
                      : (lang === 'ar' ? 'تنشيط الترخيص ▶️' : 'Activate Plan')
                    }
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTenant(t.id, t.nameEn)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                    title={lang === 'ar' ? 'حذف العميل نهائياً' : 'Delete Tenant'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {exploringTenantId === t.id && (
                  <div className="mt-4 border-t border-gray-250 dark:border-gray-800 pt-4 space-y-3.5 text-right animate-fade-in text-xs">
                    <h5 className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                      <span>{lang === 'ar' ? 'مستكشف ملفات المنشأة الحقيقي على القرص' : 'Tenant Disk Directory explorer'}</span>
                    </h5>
                    
                    <div className="bg-slate-900 border border-slate-950 rounded-xl p-3 text-slate-300 font-mono text-[9px] overflow-hidden space-y-2">
                      <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5">
                        <span className="flex items-center gap-1">
                          <Folder className="w-3 h-3 text-amber-500" />
                          <span>public/tenants/{t.slug}/</span>
                        </span>
                        <button
                          onClick={() => handleSyncTenant(t)}
                          className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[8px] flex items-center gap-1 font-sans transition"
                          title={lang === 'ar' ? 'مزامنة وتوليد المجلد على القرص' : 'Sync directory files to local disk'}
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>{lang === 'ar' ? 'مزامنة المجلد 🔄' : 'Sync Folder 🔄'}</span>
                        </button>
                      </div>

                      {/* File Tree list */}
                      <div className="space-y-1 pl-2">
                        {/* settings.json */}
                        <div 
                          onClick={() => exploreTenantFiles(t, 'settings')}
                          className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition ${
                            activeFile === 'settings' ? 'bg-slate-800 text-white' : 'hover:bg-slate-850 text-slate-400'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <File className="w-3 h-3 text-blue-400" />
                            <span>settings.json</span>
                          </span>
                          <span className="text-[8px] text-gray-500">{lang === 'ar' ? 'ملف الإعدادات' : 'Config File'}</span>
                        </div>

                        {/* database_dump.json */}
                        <div 
                          onClick={() => exploreTenantFiles(t, 'database')}
                          className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition ${
                            activeFile === 'database' ? 'bg-slate-800 text-white' : 'hover:bg-slate-850 text-slate-400'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <File className="w-3 h-3 text-emerald-400" />
                            <span>database_dump.json</span>
                          </span>
                          <span className="text-[8px] text-gray-500">{lang === 'ar' ? 'قاعدة بيانات المنيو المعزولة' : 'Isolated Catalog DB'}</span>
                        </div>

                        {/* logo.png */}
                        <div 
                          onClick={() => exploreTenantFiles(t, 'logo')}
                          className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition ${
                            activeFile === 'logo' ? 'bg-slate-800 text-white' : 'hover:bg-slate-850 text-slate-400'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <File className="w-3 h-3 text-amber-400" />
                            <span>assets/logo.png</span>
                          </span>
                          <span className="text-[8px] text-gray-500">{lang === 'ar' ? 'شعار المطعم' : 'Logo image'}</span>
                        </div>
                      </div>
                    </div>

                    {/* File Contents Preview Panel */}
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-[9px] font-mono text-emerald-450 uppercase tracking-widest font-bold">
                          {lang === 'ar' ? 'معاينة محتوى الملف المفتوح:' : 'Active File Contents:'} {activeFile === 'settings' ? 'settings.json' : activeFile === 'database' ? 'database_dump.json' : 'logo.png'}
                        </span>
                      </div>

                      {isLoadingFile ? (
                        <p className="text-[10px] text-slate-500 font-mono animate-pulse text-left">Reading file from disk...</p>
                      ) : explorerError ? (
                        <div className="text-left font-mono text-rose-400 text-[10px] space-y-1.5 py-1">
                          <p>⚠️ {explorerError}</p>
                          <button
                            onClick={() => handleSyncTenant(t)}
                            className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-900 rounded text-[8px]"
                          >
                            {lang === 'ar' ? 'اضغط هنا لإنشاء المجلد والملفات الآن 🛠️' : 'Create Folder & Database Now 🛠️'}
                          </button>
                        </div>
                      ) : activeFile === 'logo' ? (
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-lg border border-slate-800">
                          <img src={fileContent} alt="logo preview" className="w-16 h-16 object-cover rounded-xl border border-slate-700 mb-2" />
                          <span className="text-[8px] text-slate-500 font-mono break-all">{fileContent}</span>
                        </div>
                      ) : fileContent ? (
                        <pre className="text-left text-emerald-450 font-mono text-[9px] overflow-x-auto max-h-48 leading-relaxed scrollbar-thin">
                          {fileContent}
                        </pre>
                      ) : (
                        <p className="text-[9px] text-slate-500 font-mono text-center py-2">{lang === 'ar' ? 'اختر ملفاً من الشجرة أعلاه لعرضه' : 'Select a file from the tree to read contents'}</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Onboarding Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-150 p-5 bg-gray-50/50 dark:bg-gray-850/50">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {lang === 'ar' ? 'تسجيل شريك SaaS جديد وتوليد المنيو' : 'Onboard New SaaS Restaurant Client'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition dark:border-gray-800 dark:hover:bg-gray-850"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTenant} className="p-6 space-y-4 text-xs text-gray-750 dark:text-gray-300 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              
              {/* Restaurant Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'الاسم التجاري بالإنجليزية *' : 'Business Name (English) *'}</label>
                  <input 
                    type="text" 
                    value={nameEn} 
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    placeholder="Meatport"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rose-600 bg-white dark:bg-gray-950 dark:border-gray-800"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'الاسم التجاري بالعربية *' : 'Business Name (Arabic) *'}</label>
                  <input 
                    type="text" 
                    value={nameAr} 
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: بيتزا لذيذة"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rose-600 bg-white dark:bg-gray-950 dark:border-gray-800"
                    required
                  />
                </div>
              </div>

              {/* Subdomain slug & plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'النطاق الفرعي (Subdomain Slug) *' : 'Unique Subdomain Slug *'}</label>
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="meatport"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-rose-600 bg-white dark:bg-gray-950 dark:border-gray-800 font-mono"
                      required
                    />
                    <span className="px-2 font-mono text-gray-400 text-[10px]">.localhost</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'خطة العضوية والترخيص' : 'Subscription Tier'}</label>
                  <select 
                    value={plan} 
                    onChange={(e) => setPlan(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-950 dark:border-gray-800"
                  >
                    <option value="free">Free Trial (0 SAR)</option>
                    <option value="basic">SaaS Basic (199 SAR / mo)</option>
                    <option value="premium">SaaS Premium (399 SAR / mo)</option>
                    <option value="enterprise">SaaS Enterprise (799 SAR / mo)</option>
                  </select>
                </div>
              </div>

              {/* Address & Hotline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'العنوان بالإنجليزية' : 'Address (English)'}</label>
                  <input 
                    type="text" 
                    value={addressEn} 
                    onChange={(e) => setAddressEn(e.target.value)}
                    placeholder="e.g. King Fahd Rd, Riyadh"
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none bg-white dark:bg-gray-950 dark:border-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'العنوان بالعربية' : 'العنوان بالعربية'}</label>
                  <input 
                    type="text" 
                    value={addressAr} 
                    onChange={(e) => setAddressAr(e.target.value)}
                    placeholder="مثال: طريق الملك فهد، الرياض"
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none bg-white dark:bg-gray-950 dark:border-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-600 dark:text-gray-400">{lang === 'ar' ? 'هاتف التواصل الساخن' : 'Hotline Phone'}</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966..."
                    className="w-full px-3 py-1.5 border rounded-lg focus:outline-none bg-white dark:bg-gray-950 dark:border-gray-800"
                  />
                </div>
              </div>

              {/* Generated Manager Credentials info */}
              <div className="bg-slate-50 dark:bg-gray-950 border border-slate-100 dark:border-gray-850 p-4 rounded-xl space-y-3">
                <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-rose-600" />
                  {lang === 'ar' ? 'بيانات حساب تسجيل الدخول للمدير الخاص بالمطعم' : 'Auto-generated Manager Login Credentials'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500">{lang === 'ar' ? 'اسم مستخدم المدير' : 'Manager Username'}</label>
                    <input 
                      type="text" 
                      value={managerUsername}
                      onChange={(e) => setManagerUsername(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded bg-white dark:bg-gray-900 dark:border-gray-850 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500">{lang === 'ar' ? 'الرقم السري للمدير' : 'Manager Password'}</label>
                    <input 
                      type="text" 
                      value={managerPassword}
                      onChange={(e) => setManagerPassword(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded bg-white dark:bg-gray-900 dark:border-gray-850 font-semibold"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{lang === 'ar' ? 'تلميح: يستطيع هذا الحساب تسجيل الدخول في بوابة الإدارة ومن ثم إنشاء حسابات الكاشير والمطبخ.' : 'Hint: The manager will use these to log into their customized restaurant portal.'}</p>
              </div>

              {/* Logo selection deck */}
              <div className="space-y-1">
                <label className="font-semibold text-gray-600 dark:text-gray-400 block">{lang === 'ar' ? 'صورة شعار المطعم (أو اختر من المقترحة)' : 'Restaurant Logo URL (or select from presets)'}</label>
                <input 
                  type="text" 
                  value={logoUrl} 
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-white dark:bg-gray-950 dark:border-gray-800 text-[10px]"
                />
                
                <div className="flex gap-2 pt-2.5">
                  {presetLogos.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLogoUrl(url)}
                      className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition ${logoUrl === url ? 'border-rose-600 scale-105' : 'border-transparent'}`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Save / Cancel buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-150 pt-5 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition"
                >
                  {lang === 'ar' ? 'إطلاق وترخيص المطعم 🚀' : 'Onboard Client & Launch 🚀'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
