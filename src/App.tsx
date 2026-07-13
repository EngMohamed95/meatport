import React, { useState, useEffect } from 'react';
import { 
  initialTenants, initialBranches, initialCategories, 
  initialModifierGroups, initialProducts, initialAuditLogs,
  initialIngredients, initialRecipes, initialOrders, initialOrderItems
} from './initialData';
import { meatportCatalogVersion } from './meatportCatalog';
import { Tenant, Branch, Category, ModifierGroup, Product, AuditLog, Ingredient, RecipeItem, Order, OrderItem } from './types';
import AdminDashboard from './components/AdminDashboard';
import DigitalMenu from './components/DigitalMenu';
import PosSystem from './components/PosSystem';
import ArchitectureDocs from './components/ArchitectureDocs';
import KitchenKds from './components/KitchenKds';
import { 
  Building, Settings, Eye, HelpCircle, Layers, Globe, Moon, Sun, ShieldAlert,
  User, Key, Lock, ShieldCheck, LogOut, ClipboardList, ShoppingBag, ChefHat
} from 'lucide-react';

const normalizeMeatportTenants = (savedTenants?: Tenant[]): Tenant[] => {
  const savedMeatport = savedTenants?.find(t => t.id === 't-1');
  return [{
    ...initialTenants[0],
    ...savedMeatport
  }];
};

export default function App() {
  // Global States
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem(`saas_tenants`);
    const normalized = normalizeMeatportTenants(saved ? JSON.parse(saved) : undefined);
    localStorage.setItem(`saas_tenants`, JSON.stringify(normalized));
    return normalized;
  });

  useEffect(() => {
    const normalized = normalizeMeatportTenants(tenants);
    if (
      tenants.length !== 1 ||
      tenants[0]?.id !== 't-1' ||
      tenants[0]?.nameEn !== 'Meatport' ||
      tenants[0]?.nameAr !== 'Meatport' ||
      tenants[0]?.slug !== 'meatport'
    ) {
      setTenants(normalized);
      return;
    }
    localStorage.setItem(`saas_tenants`, JSON.stringify(normalized));
  }, [tenants]);

  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = localStorage.getItem(`saas_branches`);
    return saved ? JSON.parse(saved) : initialBranches;
  });

  useEffect(() => {
    localStorage.setItem(`saas_branches`, JSON.stringify(branches));
  }, [branches]);

  const selectedTenantId: string = 't-1';
  const initialTenantId = 't-1';

  // Interactive Database Arrays (Using LocalStorage Persistence isolated by tenant)
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`saas_categories_t-1`);
    const savedVersion = localStorage.getItem(`saas_categories_version_t-1`);
    const initial = initialCategories.filter(c => c.tenantId === 't-1');
    if (saved && savedVersion === meatportCatalogVersion) {
      const parsed = JSON.parse(saved);
      let modified = false;
      initial.forEach(initCat => {
        if (!parsed.some((c: any) => c.id === initCat.id)) {
          parsed.push(initCat);
          modified = true;
        }
      });
      if (modified) {
        localStorage.setItem(`saas_categories_t-1`, JSON.stringify(parsed));
      }
      return parsed;
    }
    localStorage.setItem(`saas_categories_t-1`, JSON.stringify(initial));
    localStorage.setItem(`saas_categories_version_t-1`, meatportCatalogVersion);
    return initial;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`saas_products_t-1`);
    const savedVersion = localStorage.getItem(`saas_products_version_t-1`);
    const initial = initialProducts.filter(p => p.tenantId === 't-1');
    if (saved && savedVersion === meatportCatalogVersion) {
      const parsed = JSON.parse(saved);
      let modified = false;
      initial.forEach(initProd => {
        if (!parsed.some((p: any) => p.id === initProd.id)) {
          parsed.push(initProd);
          modified = true;
        }
      });
      if (modified) {
        localStorage.setItem(`saas_products_t-1`, JSON.stringify(parsed));
      }
      return parsed;
    }
    localStorage.setItem(`saas_products_t-1`, JSON.stringify(initial));
    localStorage.setItem(`saas_products_version_t-1`, meatportCatalogVersion);
    return initial;
  });

  const [modifierGroups] = useState<ModifierGroup[]>(() => {
    const saved = localStorage.getItem(`saas_modifier_groups_t-1`);
    if (saved) return JSON.parse(saved);
    const initial = initialModifierGroups.filter(mg => mg.tenantId === 't-1');
    localStorage.setItem(`saas_modifier_groups_t-1`, JSON.stringify(initial));
    return initial;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem(`saas_ingredients_t-1`);
    if (saved) return JSON.parse(saved);
    const initial = initialIngredients.filter(ing => ing.tenantId === 't-1');
    localStorage.setItem(`saas_ingredients_t-1`, JSON.stringify(initial));
    return initial;
  });

  const [recipes] = useState<RecipeItem[]>(() => {
    const saved = localStorage.getItem(`saas_recipes_t-1`);
    if (saved) return JSON.parse(saved);
    const initial = initialRecipes.filter(r => {
      const prod = initialProducts.find(p => p.id === r.productId);
      return prod && prod.tenantId === 't-1';
    });
    localStorage.setItem(`saas_recipes_t-1`, JSON.stringify(initial));
    return initial;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`saas_orders_t-1`);
    if (saved) return JSON.parse(saved);
    const initial = initialOrders.filter(o => o.tenantId === 't-1');
    localStorage.setItem(`saas_orders_t-1`, JSON.stringify(initial));
    return initial;
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem(`saas_order_items_t-1`);
    if (saved) return JSON.parse(saved);
    const initial = initialOrderItems.filter(oi => {
      const order = initialOrders.find(o => o.id === oi.orderId);
      return order && order.tenantId === 't-1';
    });
    localStorage.setItem(`saas_order_items_t-1`, JSON.stringify(initial));
    return initial;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`saas_audit_logs_t-1`);
    if (saved) return JSON.parse(saved);
    const initial = initialAuditLogs.filter(log => log.tenantId === 't-1');
    localStorage.setItem(`saas_audit_logs_t-1`, JSON.stringify(initial));
    return initial;
  });

  // Simple router based on window.location.pathname
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync state with URL path updates
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
    };
  }, []);

  // Listen to changes from other tabs (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `saas_orders_${selectedTenantId}`) {
        const saved = localStorage.getItem(`saas_orders_${selectedTenantId}`);
        if (saved) setOrders(JSON.parse(saved));
      }
      if (e.key === `saas_order_items_${selectedTenantId}`) {
        const saved = localStorage.getItem(`saas_order_items_${selectedTenantId}`);
        if (saved) setOrderItems(JSON.parse(saved));
      }
      if (e.key === `saas_ingredients_${selectedTenantId}`) {
        const saved = localStorage.getItem(`saas_ingredients_${selectedTenantId}`);
        if (saved) setIngredients(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedTenantId]);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.dispatchEvent(new Event('pushstate'));
  };

  // Map pathname to views
  const currentView = (() => {
    if (currentPath.startsWith('/staff')) return 'admin';
    if (currentPath === '/pos') return 'admin';
    if (currentPath === '/kitchen') return 'kitchen';
    if (currentPath === '/architecture') return 'architecture';
    return 'digital-menu';
  })();

  // Redirect root path '/' to '/menu' for cleaner URLs
  useEffect(() => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      navigateTo('/menu');
    }
  }, []);

  const [lang, setLang] = useState<'en' | 'ar'>('ar'); // Default to Arabic as requested
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);


  // Active Staff Member session
  const [activeStaff, setActiveStaff] = useState<{
    name: string;
    role: 'cashier' | 'manager' | 'kitchen';
    email: string;
    phone: string;
  } | null>(null);

  // Helper to load employees list dynamically by active tenant
  const getTenantEmployees = (): any[] => {
    const saved = localStorage.getItem(`saas_employees_${selectedTenantId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Force clean reset if it contains old default employees
        const hasOldDefaults = parsed.some((e: any) => e.id === 'emp-1' || e.id === 'emp-20');
        if (!hasOldDefaults && parsed.length > 0) {
          let modified = false;
          let updated = parsed.map((e: any) => {
            if (e.id === 'emp-admin-1' && (e.nameAr === 'مدير بيت الذواقة' || e.nameEn === 'Gourmet Manager')) {
              modified = true;
              return { ...e, nameEn: 'Meatport Manager', nameAr: 'مدير Meatport' };
            }
            return e;
          });
          const hasCashier = updated.some((e: any) => e.systemRole === 'cashier');
          if (!hasCashier) {
            modified = true;
            const defaultCashier = { id: 'emp-cashier-1', nameEn: 'Meatport Cashier', nameAr: 'كاشير Meatport', roleEn: 'Cashier', roleAr: 'كاشير', contractType: 'full_time', salary: 5000, shiftEn: 'General', shiftAr: 'عامة', phone: '+966500000001', status: 'active', pinCode: '1234', systemRole: 'cashier' };
            updated.push(defaultCashier);
          }
          const hasKitchen = updated.some((e: any) => e.systemRole === 'kitchen');
          if (!hasKitchen) {
            modified = true;
            const defaultKitchen = { id: 'emp-kitchen-1', nameEn: 'Meatport Chef', nameAr: 'طاهي Meatport', roleEn: 'Kitchen Staff', roleAr: 'طاهي المطبخ', contractType: 'full_time', salary: 6000, shiftEn: 'General', shiftAr: 'عامة', phone: '+966500000002', status: 'active', pinCode: '4321', systemRole: 'kitchen' };
            updated.push(defaultKitchen);
          }
          if (modified) {
            localStorage.setItem(`saas_employees_${selectedTenantId}`, JSON.stringify(updated));
          }
          return updated;
        }
      } catch (err) {
        console.error(err);
      }
    }
    const defaultList = [
      { id: 'emp-admin-1', nameEn: 'Meatport Manager', nameAr: 'مدير Meatport', roleEn: 'Restaurant Manager', roleAr: 'مدير المطعم', contractType: 'full_time', salary: 10000, shiftEn: 'General', shiftAr: 'عامة', phone: '+966500000000', status: 'active', pinCode: '0000', systemRole: 'manager' },
      { id: 'emp-cashier-1', nameEn: 'Meatport Cashier', nameAr: 'كاشير Meatport', roleEn: 'Cashier', roleAr: 'كاشير', contractType: 'full_time', salary: 5000, shiftEn: 'General', shiftAr: 'عامة', phone: '+966500000001', status: 'active', pinCode: '1234', systemRole: 'cashier' },
      { id: 'emp-kitchen-1', nameEn: 'Meatport Chef', nameAr: 'طاهي Meatport', roleEn: 'Kitchen Staff', roleAr: 'طاهي المطبخ', contractType: 'full_time', salary: 6000, shiftEn: 'General', shiftAr: 'عامة', phone: '+966500000002', status: 'active', pinCode: '4321', systemRole: 'kitchen' }
    ];
    localStorage.setItem(`saas_employees_${selectedTenantId}`, JSON.stringify(defaultList));
    return defaultList;
  };

  const [loginEmpId, setLoginEmpId] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Sync to local storage (isolated by tenant)
  useEffect(() => {
    if (!selectedTenantId) return;
    localStorage.setItem(`saas_categories_${selectedTenantId}`, JSON.stringify(categories));
  }, [categories, selectedTenantId]);

  useEffect(() => {
    if (!selectedTenantId) return;
    localStorage.setItem(`saas_products_${selectedTenantId}`, JSON.stringify(products));
  }, [products, selectedTenantId]);

  useEffect(() => {
    if (!selectedTenantId) return;
    localStorage.setItem(`saas_ingredients_${selectedTenantId}`, JSON.stringify(ingredients));
  }, [ingredients, selectedTenantId]);

  useEffect(() => {
    if (!selectedTenantId) return;
    localStorage.setItem(`saas_orders_${selectedTenantId}`, JSON.stringify(orders));
  }, [orders, selectedTenantId]);

  useEffect(() => {
    if (!selectedTenantId) return;
    localStorage.setItem(`saas_order_items_${selectedTenantId}`, JSON.stringify(orderItems));
  }, [orderItems, selectedTenantId]);

  useEffect(() => {
    if (!selectedTenantId) return;
    localStorage.setItem(`saas_audit_logs_${selectedTenantId}`, JSON.stringify(auditLogs));
  }, [auditLogs, selectedTenantId]);

  // Active Tenant details
  const activeTenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];
  const activeTenantBranches = branches.filter(b => b.tenantId === selectedTenantId);

  // Dynamic Title & Favicon updates for branded dedicated site feel
  useEffect(() => {
    if (activeTenant) {
      document.title = lang === 'ar' ? activeTenant.nameAr : activeTenant.nameEn;
      let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      if (activeTenant.logoUrl) {
        favicon.href = activeTenant.logoUrl;
      }
    }
  }, [activeTenant, lang]);

  // Helper to add audit actions
  const addAuditLog = (action: string, entityName: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      tenantId: selectedTenantId,
      userId: activeStaff ? (activeStaff.role === 'manager' ? 'u-manager' : 'u-cashier') : 'u-guest',
      userEmail: activeStaff ? activeStaff.email : 'guest@foodics.saas',
      userRole: activeStaff ? (activeStaff.role === 'manager' ? 'BranchManager' : 'Cashier') : 'Guest',
      action,
      entityName,
      entityId,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // placeOrder: registers order relational records & deducts raw ingredients based on recipes
  const placeOrder = (
    orderMetadata: Omit<Order, 'id' | 'createdAt' | 'tenantId' | 'branchId' | 'status' | 'preparationTimeEstimate'>,
    items: Omit<OrderItem, 'id' | 'orderId'>[]
  ) => {
    const orderId = `ord-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Calculate maximum preparation time of items in order
    let maxPrepTime = 5;
    items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod && prod.preparationTime > maxPrepTime) {
        maxPrepTime = prod.preparationTime;
      }
    });

    const newOrder: Order = {
      ...orderMetadata,
      id: orderId,
      tenantId: selectedTenantId,
      branchId: 'b-1',
      status: 'pending',
      createdAt: timestamp,
      preparationTimeEstimate: maxPrepTime
    };

    const newOrderItems: OrderItem[] = items.map((item, idx) => ({
      ...item,
      id: `oi-${orderId}-${idx}`,
      orderId: orderId
    }));

    // Relation logic: deduct ingredient stock from recipes
    setIngredients(prevIngredients => {
      return prevIngredients.map(ing => {
        let qtyToDeduct = 0;
        newOrderItems.forEach(item => {
          const itemRecipe = recipes.filter(r => r.productId === item.productId && r.ingredientId === ing.id);
          itemRecipe.forEach(r => {
            qtyToDeduct += r.quantityRequired * item.quantity;
          });
        });

        if (qtyToDeduct > 0) {
          const newQty = Math.max(0, ing.stockQuantity - qtyToDeduct);
          const newConsumed = ing.totalConsumedCount + qtyToDeduct;
          const status = newQty === 0 ? 'out_of_stock' : (newQty <= ing.reorderLevel ? 'low_stock' : 'in_stock');

          if (newQty <= ing.reorderLevel) {
            addAuditLog('LOW_STOCK_WARNING', 'Ingredient', ing.id, `Stock level alert: Ingredient ${ing.nameEn} is running low! Remaining: ${newQty.toFixed(2)} ${ing.unitEn}`);
          }

          return {
            ...ing,
            stockQuantity: parseFloat(newQty.toFixed(2)),
            totalConsumedCount: parseFloat(newConsumed.toFixed(2)),
            status
          };
        }
        return ing;
      });
    });

    setOrders(prev => [newOrder, ...prev]);
    setOrderItems(prev => [...prev, ...newOrderItems]);

    addAuditLog('PLACE_ORDER', 'Order', orderId, `Relational order transaction registered (${newOrder.receiptNumber}) via ${newOrder.source.toUpperCase()}. Items: ${items.length}, Total: ${newOrder.total.toFixed(2)}`);

    return orderId;
  };

  // Handle Login Authorization
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    const emps = getTenantEmployees();
    const targetEmp = emps.find((emp: any) => emp.id === (loginEmpId || (emps[0] ? emps[0].id : '')));

    if (targetEmp) {
      const correctPin = targetEmp.pinCode || '1234';
      if (pinInput === correctPin) {
        const systemRole = targetEmp.systemRole || 'cashier';
        const staff = {
          name: lang === 'ar' ? targetEmp.nameAr : targetEmp.nameEn,
          role: systemRole as 'cashier' | 'manager' | 'kitchen',
          email: targetEmp.phone ? `${targetEmp.phone.replace('+', '')}@restaurant.com` : 'staff@restaurant.com',
          phone: targetEmp.phone || ''
        };
        setActiveStaff(staff);
        addAuditLog('STAFF_LOGIN', 'UserSession', targetEmp.id, `Staff member ${staff.name} (${systemRole.toUpperCase()}) successfully authenticated`);
        setPinInput('');
        setLoginEmpId('');
      } else {
        setPinError(lang === 'ar' ? 'رمز المرور غير صحيح!' : 'Incorrect passcode!');
      }
    } else {
      setPinError(lang === 'ar' ? 'لا يوجد موظفين مسجلين!' : 'No registered staff members found!');
    }
  };

  const handleLogout = () => {
    if (activeStaff) {
      addAuditLog('STAFF_LOGOUT', 'UserSession', activeStaff.role === 'manager' ? 'manager-1' : 'cashier-1', `Staff member ${activeStaff.name} logged out`);
    }
    setActiveStaff(null);
  };

  const syncTenantToDisk = async (tenant: Tenant) => {
    try {
      const savedCats = localStorage.getItem(`saas_categories_${tenant.id}`);
      const cats = savedCats ? JSON.parse(savedCats) : initialCategories.filter(c => c.tenantId === tenant.id);
      
      const savedProds = localStorage.getItem(`saas_products_${tenant.id}`);
      let prods = savedProds ? JSON.parse(savedProds) : initialProducts.filter(p => p.tenantId === tenant.id);
      if (savedProds && prods.length < 15) {
        prods = initialProducts.filter(p => p.tenantId === tenant.id);
        localStorage.setItem(`saas_products_${tenant.id}`, JSON.stringify(prods));
      }
      
      const savedIngs = localStorage.getItem(`saas_ingredients_${tenant.id}`);
      const ings = savedIngs ? JSON.parse(savedIngs) : initialIngredients.filter(ing => ing.tenantId === tenant.id);

      const savedModifierGroups = localStorage.getItem(`saas_modifier_groups_${tenant.id}`);
      const tenantModifierGroups = savedModifierGroups ? JSON.parse(savedModifierGroups) : initialModifierGroups.filter(mg => mg.tenantId === tenant.id);

      const savedOrders = localStorage.getItem(`saas_orders_${tenant.id}`);
      const tenantOrders = savedOrders ? JSON.parse(savedOrders) : initialOrders.filter(o => o.tenantId === tenant.id);

      const savedOrderItems = localStorage.getItem(`saas_order_items_${tenant.id}`);
      const tenantOrderItems = savedOrderItems ? JSON.parse(savedOrderItems) : initialOrderItems.filter(oi => {
        const order = tenantOrders.find((o: Order) => o.id === oi.orderId);
        return Boolean(order);
      });

      const savedRecipes = localStorage.getItem(`saas_recipes_${tenant.id}`);
      const tenantRecipes = savedRecipes ? JSON.parse(savedRecipes) : initialRecipes.filter(r => {
        const prod = prods.find((p: Product) => p.id === r.productId);
        return Boolean(prod);
      });

      const savedAuditLogs = localStorage.getItem(`saas_audit_logs_${tenant.id}`);
      const tenantAuditLogs = savedAuditLogs ? JSON.parse(savedAuditLogs) : initialAuditLogs.filter(log => log.tenantId === tenant.id);

      const response = await fetch('/api/create-tenant-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slug: tenant.slug,
          tenantInfo: tenant,
          branches: branches.filter(b => b.tenantId === tenant.id),
          categories: cats,
          products: prods,
          modifierGroups: tenantModifierGroups,
          ingredients: ings,
          recipes: tenantRecipes,
          orders: tenantOrders,
          orderItems: tenantOrderItems,
          auditLogs: tenantAuditLogs,
          logoBase64: tenant.logoUrl
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error syncing tenant to disk:', error);
      return { success: false, error: String(error) };
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50/50 text-gray-800'
    }`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Removed Global SaaS Navbar for a clean standalone white-label website experience. Users access sections directly via URLs. */}

      {/* Conditionally wrap based on view for edge-to-edge customer digital menu */}
      {currentView === 'digital-menu' ? (
        <div className="flex-1 w-full flex flex-col">
          <DigitalMenu 
            tenant={activeTenant}
            branches={activeTenantBranches}
            products={products}
            categories={categories}
            modifierGroups={modifierGroups}
            lang={lang}
            setLang={setLang}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onPlaceOrder={placeOrder}
          />
        </div>
      ) : currentView === 'admin' && activeStaff !== null && activeStaff.role === 'manager' ? (
        <AdminDashboard 
          tenant={activeTenant}
          setTenants={setTenants}
          branches={activeTenantBranches}
          setBranches={setBranches}
          products={products}
          categories={categories}
          modifierGroups={modifierGroups}
          auditLogs={auditLogs}
          setProducts={setProducts}
          setCategories={setCategories}
          addAuditLog={addAuditLog}
          lang={lang}
          ingredients={ingredients}
          setIngredients={setIngredients}
          recipes={recipes}
          orders={orders}
          setOrders={setOrders}
          orderItems={orderItems}
          currentPath={currentPath}
          navigateTo={navigateTo}
          activeStaff={activeStaff}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      ) : (
        <>
          {/* Main Workspace Body */}
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
            
            {/* Unified Login Gating for all staff routes (admin / kitchen) */}
            {activeStaff === null && (currentView === 'admin' || currentView === 'kitchen') ? (
              <div className="max-w-2xl mx-auto py-12 space-y-8">
                    
                    <div className="text-center space-y-2">
                      <span className="px-3 py-1 bg-rose-500/10 text-rose-600 text-xs font-extrabold rounded-full border border-rose-500/20 uppercase tracking-wide">
                        {lang === 'ar' ? 'نظام الحماية والوصول الموحد' : 'Unified Security Identity Gate'}
                      </span>
                      <h2 className="text-2xl font-black text-gray-950 dark:text-white">
                        {lang === 'ar' ? 'بوابة تسجيل دخول طاقم العمل الموحدة' : 'Unified Foodics Staff Portal'}
                      </h2>
                      <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                        {lang === 'ar' 
                          ? 'الرجاء اختيار ملف المستخدم وإدخال رمز الـ PIN لفتح صلاحيات العمل الخاصة بك.' 
                          : 'Please choose your staff profile account and enter your PIN code to unlock your authorization role.'}
                      </p>
                    </div>

                    {/* Unified Login Form for Tenant */}
                    <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-200/90 p-8 shadow-xl space-y-6 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-rose-50 border border-slate-100 flex items-center justify-center p-1">
                          <img 
                            src={activeTenant.logoUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&h=150&fit=crop&q=80"} 
                            alt={activeTenant.nameEn} 
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-gray-950">
                            {lang === 'ar' ? activeTenant.nameAr : activeTenant.nameEn}
                          </h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                            {lang === 'ar' ? 'بوابة التحقق الموحدة للموظفين' : 'Unified Staff Gate'}
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handlePinSubmit} className="space-y-4 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                        
                        {/* 1. Employee Dropdown Selection */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-black text-gray-500">
                            {lang === 'ar' ? 'اختر الحساب / الملف الشخصي' : 'Select Staff Account Profile'}
                          </label>
                          <div className="relative">
                            <select
                              value={loginEmpId || (getTenantEmployees()[0] ? getTenantEmployees()[0].id : '')}
                              onChange={(e) => {
                                setLoginEmpId(e.target.value);
                                setPinError('');
                                setPinInput('');
                              }}
                              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-600 font-bold text-gray-800 text-xs appearance-none"
                            >
                              {getTenantEmployees().map((emp: any) => (
                                <option key={emp.id} value={emp.id}>
                                  {lang === 'ar' 
                                    ? `${emp.nameAr} (${emp.systemRole === 'manager' ? 'إدارة' : emp.systemRole === 'kitchen' ? 'مطبخ' : 'كاشير'})` 
                                    : `${emp.nameEn} (${emp.systemRole === 'manager' ? 'Admin' : emp.systemRole === 'kitchen' ? 'Kitchen' : 'POS'})`}
                                </option>
                              ))}
                            </select>
                            <div className={`absolute inset-y-0 ${lang === 'ar' ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-gray-400`}>
                              <User className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* 2. PIN Entry Dots indicator */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-black text-gray-500">
                            {lang === 'ar' ? 'أدخل الرمز السري (PIN)' : 'Enter Passcode (PIN)'}
                          </label>
                          
                          <div className="relative flex justify-center items-center gap-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                            <input 
                              type="password"
                              maxLength={4}
                              required
                              value={pinInput}
                              onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
                              placeholder="••••"
                              className="w-full text-center tracking-widest text-base font-mono font-black px-4 py-1 bg-transparent focus:outline-none text-gray-900"
                              autoFocus
                            />
                            <div className={`absolute inset-y-0 ${lang === 'ar' ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-gray-400`}>
                              <Lock className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {pinError && (
                          <p className="text-red-600 text-[10px] font-black text-center">{pinError}</p>
                        )}

                        {/* Custom touch digital keypad */}
                        <div className="grid grid-cols-3 gap-2 pt-2 max-w-[280px] mx-auto" dir="ltr">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                if (pinInput.length < 4) {
                                  setPinInput(prev => prev + num);
                                  setPinError('');
                                }
                              }}
                              className="py-2.5 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 active:scale-95 text-gray-800 font-extrabold text-sm rounded-xl border border-gray-150/70 transition"
                            >
                              {num}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setPinInput('');
                              setPinError('');
                            }}
                            className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-650 font-bold text-xs rounded-xl active:scale-95 transition"
                          >
                            {lang === 'ar' ? 'مسح' : 'Clear'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (pinInput.length < 4) {
                                setPinInput(prev => prev + '0');
                                setPinError('');
                              }
                            }}
                            className="py-2.5 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 active:scale-95 text-gray-800 font-extrabold text-sm rounded-xl border border-gray-150/70 transition"
                          >
                            0
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPinInput(prev => prev.slice(0, -1));
                              setPinError('');
                            }}
                            className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-650 font-bold text-xs rounded-xl active:scale-95 transition flex items-center justify-center"
                          >
                            ⌫
                          </button>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-lg shadow-rose-600/10 active:scale-95"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {lang === 'ar' ? 'تسجيل دخول للنظام' : 'Verify & Access System'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
            ) : (
              <>
                {/* VIEW 1: STAFF PORTAL & POS GATING */}
                {currentView === 'admin' && (
                  <div className="space-y-6">
                    {/* Case B: Cashier Role Logged In -> Render PosSystem */}
                    {activeStaff !== null && activeStaff.role === 'cashier' && (
                  <div className="space-y-4">
                    <PosSystem 
                      tenant={activeTenant}
                      products={products}
                      categories={categories}
                      modifierGroups={modifierGroups}
                      setProducts={setProducts}
                      addAuditLog={addAuditLog}
                      lang={lang}
                      onLogout={handleLogout}
                      onPlaceOrder={placeOrder}
                      orders={orders}
                      setOrders={setOrders}
                      orderItems={orderItems}
                    />
                  </div>
                )}

                {/* Case C: Manager Role Logged In -> Render AdminDashboard */}
                {activeStaff !== null && activeStaff.role === 'manager' && (
                  <div className="space-y-6">
                    
                    {/* Active User session alert bar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-100 text-xs">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
                        <div>
                          <span className="font-bold">{lang === 'ar' ? 'جلسة المدير العام معتمدة' : 'MANAGER ACCESS SECURITY AUTHENTICATED'}</span>
                          <span className="text-slate-400 block sm:inline sm:ml-2">
                            {lang === 'ar' ? `المستخدم: ${activeStaff.name} (${activeStaff.email})` : `Active session: ${activeStaff.name} (${activeStaff.email})`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400">
                        <span>{lang === 'ar' ? 'الفرع: الرياض الرئيسي' : 'Node: Riyadh Center'}</span>
                        <span>•</span>
                        <button 
                          onClick={handleLogout}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[10px] flex items-center gap-1 transition"
                        >
                          <LogOut className="w-3 h-3" />
                          {lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
                        </button>
                      </div>
                    </div>

                    <AdminDashboard 
                      tenant={activeTenant}
                      setTenants={setTenants}
                      branches={activeTenantBranches}
                      products={products}
                      categories={categories}
                      modifierGroups={modifierGroups}
                      auditLogs={auditLogs}
                      setProducts={setProducts}
                      setCategories={setCategories}
                      addAuditLog={addAuditLog}
                      lang={lang}
                      ingredients={ingredients}
                      setIngredients={setIngredients}
                      recipes={recipes}
                      orders={orders}
                      setOrders={setOrders}
                      orderItems={orderItems}
                      currentPath={currentPath}
                      navigateTo={navigateTo}
                    />
                  </div>
                )}

                {/* Case D: Kitchen Role Logged In -> Render KitchenKds */}
                {activeStaff !== null && activeStaff.role === 'kitchen' && (
                  <div className="space-y-4">
                    {/* Active User session alert bar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-100 text-xs">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
                        <div>
                          <span className="font-bold">{lang === 'ar' ? 'جلسة طاقم المطبخ معتمدة' : 'KITCHEN ACCESS SECURITY AUTHENTICATED'}</span>
                          <span className="text-slate-400 block sm:inline sm:ml-2">
                            {lang === 'ar' ? `الموظف: ${activeStaff.name}` : `Active session: ${activeStaff.name}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-400">
                        <button 
                          onClick={handleLogout}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[10px] flex items-center gap-1 transition"
                        >
                          <LogOut className="w-3 h-3" />
                          {lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
                        </button>
                      </div>
                    </div>
                    <KitchenKds 
                      tenant={activeTenant}
                      orders={orders}
                      setOrders={setOrders}
                      orderItems={orderItems}
                      lang={lang}
                      darkMode={darkMode}
                    />
                  </div>
                )}

              </div>
            )}

            {/* VIEW 3: ARCHITECTURE DOCS */}
            {currentView === 'architecture' && (
              <div className="space-y-6">
                <ArchitectureDocs />
              </div>
            )}

            {/* VIEW 4: KITCHEN DISPLAY SYSTEM */}
            {currentView === 'kitchen' && (
              <div className="space-y-4">
                {/* Active User session alert bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 animate-pulse text-sm">🔒</span>
                    <div>
                      <span className="font-bold">{lang === 'ar' ? 'جلسة المطبخ معتمدة وآمنة' : 'KITCHEN SYSTEM ACCESS SECURED'}</span>
                      <span className="text-slate-400 block sm:inline sm:ml-2">
                        {lang === 'ar' ? `الموظف: ${activeStaff?.name}` : `Staff Profile: ${activeStaff?.name}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <button 
                      onClick={handleLogout}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[10px] flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>🚪</span>
                      <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                    </button>
                  </div>
                </div>

                <KitchenKds 
                  tenant={activeTenant}
                  orders={orders}
                  setOrders={setOrders}
                  orderItems={orderItems}
                  lang={lang}
                  darkMode={darkMode}
                />
              </div>
            )}

              </>
            )}

          </div>

          {/* Universal Footer */}
          <footer className="py-6 border-t border-gray-100 text-center text-xs text-gray-400 bg-white/50 dark:bg-gray-950/20 dark:border-gray-900">
            <p>© 2026 Foodics SaaS Monolith Corp. Designed for global high-traffic restaurant operations.</p>
          </footer>
        </>
      )}

    </div>
  );
}

