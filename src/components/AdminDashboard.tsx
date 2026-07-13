import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, ArrowUp, ArrowDown, Download, Upload, Check, X, 
  Settings, Layers, DollarSign, Package, AlertTriangle, ListFilter, FileText,
  TrendingUp, Activity, Shuffle, Eye, EyeOff, Tag, Clock, Flame, Percent,
  Warehouse, Users, ChefHat
} from 'lucide-react';
import { Product, Category, ModifierGroup, AuditLog, Tenant, Branch, Ingredient, RecipeItem, Order, OrderItem } from '../types';

interface AdminDashboardProps {
  tenant: Tenant;
  setTenants?: React.Dispatch<React.SetStateAction<Tenant[]>>;
  branches: Branch[];
  products: Product[];
  categories: Category[];
  modifierGroups: ModifierGroup[];
  auditLogs: AuditLog[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  addAuditLog: (action: string, entityName: string, entityId: string, details: string) => void;
  lang: 'en' | 'ar';
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  recipes: RecipeItem[];
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  orderItems: OrderItem[];
  currentPath: string;
  navigateTo: (path: string) => void;
}

export default function AdminDashboard({
  tenant,
  setTenants,
  branches,
  products,
  categories,
  modifierGroups,
  auditLogs,
  setProducts,
  setCategories,
  addAuditLog,
  lang,
  ingredients,
  setIngredients,
  recipes,
  orders,
  setOrders,
  orderItems,
  currentPath,
  navigateTo
}: AdminDashboardProps) {
  // Dynamically calculate the active tab from the URL pathname
  const activeTab = (() => {
    if (currentPath === '/staff/categories') return 'categories';
    if (currentPath === '/staff/inventory') return 'inventory';
    if (currentPath === '/staff/kitchen-analytics') return 'kitchen_analytics';
    if (currentPath === '/staff/hr') return 'hr';
    if (currentPath === '/staff/logs') return 'logs';
    if (currentPath === '/staff/settings') return 'settings';
    return 'products'; // fallback for /staff or /staff/products
  })();

  const setActiveTab = (tab: 'products' | 'categories' | 'inventory' | 'hr' | 'logs' | 'kitchen_analytics' | 'settings') => {
    if (tab === 'products') navigateTo('/staff/products');
    else if (tab === 'categories') navigateTo('/staff/categories');
    else if (tab === 'inventory') navigateTo('/staff/inventory');
    else if (tab === 'kitchen_analytics') navigateTo('/staff/kitchen-analytics');
    else if (tab === 'hr') navigateTo('/staff/hr');
    else if (tab === 'logs') navigateTo('/staff/logs');
    else if (tab === 'settings') navigateTo('/staff/settings');
  };

  const [selectedBranch, setSelectedBranch] = useState<string>(branches[0]?.id || '');

  // HR employee state with tenant localStorage persistence
  const [employees, setEmployees] = useState<{
    id: string;
    nameEn: string;
    nameAr: string;
    roleEn: string;
    roleAr: string;
    contractType: 'full_time' | 'part_time';
    salary: number;
    shiftEn: string;
    shiftAr: string;
    phone: string;
    status: 'active' | 'on_leave' | 'suspended';
    pinCode?: string;
    systemRole?: 'manager' | 'cashier' | 'kitchen';
  }[]>(() => {
    const saved = localStorage.getItem(`saas_employees_${tenant.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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
          if (modified) {
            localStorage.setItem(`saas_employees_${tenant.id}`, JSON.stringify(updated));
          }
          return updated;
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    // Default dynamic list containing only the main Manager per tenant
    const defaultList = [
      { id: 'emp-admin-1', nameEn: 'Meatport Manager', nameAr: 'مدير Meatport', roleEn: 'Restaurant Manager', roleAr: 'مدير المطعم', contractType: 'full_time', salary: 10000, shiftEn: 'General', shiftAr: 'عامة', phone: '+966500000000', status: 'active', pinCode: '0000', systemRole: 'manager' },
      { id: 'emp-cashier-1', nameEn: 'Meatport Cashier', nameAr: 'كاشير Meatport', roleEn: 'Cashier', roleAr: 'كاشير', contractType: 'full_time', salary: 5000, shiftEn: 'General', shiftAr: 'عامة', phone: '+966500000001', status: 'active', pinCode: '1234', systemRole: 'cashier' }
    ];
    localStorage.setItem(`saas_employees_${tenant.id}`, JSON.stringify(defaultList));
    return defaultList;
  });

  // Sync to local storage when employees state changes for this tenant
  useEffect(() => {
    localStorage.setItem(`saas_employees_${tenant.id}`, JSON.stringify(employees));
  }, [employees, tenant.id]);

  // Reload employee roster if tenant changes
  useEffect(() => {
    const saved = localStorage.getItem(`saas_employees_${tenant.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
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
          if (modified) {
            localStorage.setItem(`saas_employees_${tenant.id}`, JSON.stringify(updated));
          }
          setEmployees(updated);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    const defaultList = [
      { id: 'emp-admin-1', nameEn: 'Meatport Manager', nameAr: 'مدير Meatport', roleEn: 'Restaurant Manager', roleAr: 'مدير المطعم', contractType: 'full_time', salary: 10000, shiftEn: 'General', shiftAr: 'عامة', phone: '+966500000000', status: 'active', pinCode: '0000', systemRole: 'manager' },
      { id: 'emp-cashier-1', nameEn: 'Meatport Cashier', nameAr: 'كاشير Meatport', roleEn: 'Cashier', roleAr: 'كاشير', contractType: 'full_time', salary: 5000, shiftEn: 'General', shiftAr: 'عامة', phone: '+966500000001', status: 'active', pinCode: '1234', systemRole: 'cashier' }
    ];
    setEmployees(defaultList);
    localStorage.setItem(`saas_employees_${tenant.id}`, JSON.stringify(defaultList));
  }, [tenant.id]);

  // Map local state inventoryItems references to global database state
  const inventoryItems = ingredients;
  const setInventoryItems = setIngredients;

  // State hooks for Add Inventory modal/form
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [invNameEn, setInvNameEn] = useState('');
  const [invNameAr, setInvNameAr] = useState('');
  const [invSku, setInvSku] = useState('');
  const [invStock, setInvStock] = useState('100');
  const [invUnitEn, setInvUnitEn] = useState('pcs');
  const [invUnitAr, setInvUnitAr] = useState('حبة');
  const [invCost, setInvCost] = useState('1.5');
  const [invSupplier, setInvSupplier] = useState('');
  const [invReorder, setInvReorder] = useState('20');

  // State hooks for Add HR Employee modal/form
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [empNameEn, setEmpNameEn] = useState('');
  const [empNameAr, setEmpNameAr] = useState('');
  const [empRoleEn, setEmpRoleEn] = useState('');
  const [empRoleAr, setEmpRoleAr] = useState('');
  const [empContract, setEmpContract] = useState<'full_time' | 'part_time'>('full_time');
  const [empSalary, setEmpSalary] = useState('4500');
  const [empShiftEn, setEmpShiftEn] = useState('Morning Shift');
  const [empShiftAr, setEmpShiftAr] = useState('الوردية الصباحية');
  const [empPhone, setEmpPhone] = useState('');
  const [empStatus, setEmpStatus] = useState<'active' | 'on_leave' | 'suspended'>('active');
  const [empPinCode, setEmpPinCode] = useState('');
  const [empSystemRole, setEmpSystemRole] = useState<'manager' | 'cashier' | 'kitchen'>('cashier');

  const startEditEmployee = (emp: any) => {
    setEditingEmployee(emp);
    setEmpNameEn(emp.nameEn || '');
    setEmpNameAr(emp.nameAr || '');
    setEmpRoleEn(emp.roleEn || '');
    setEmpRoleAr(emp.roleAr || '');
    setEmpContract(emp.contractType || 'full_time');
    setEmpSalary((emp.salary || 4500).toString());
    setEmpShiftEn(emp.shiftEn || 'Morning Shift');
    setEmpShiftAr(emp.shiftAr || 'الوردية الصباحية');
    setEmpPhone(emp.phone || '');
    setEmpStatus(emp.status || 'active');
    setEmpPinCode(emp.pinCode || '');
    setEmpSystemRole(emp.systemRole || 'cashier');
    setShowEmployeeModal(true);
  };

  const startHireEmployee = () => {
    setEditingEmployee(null);
    setEmpNameEn('');
    setEmpNameAr('');
    setEmpRoleEn('');
    setEmpRoleAr('');
    setEmpContract('full_time');
    setEmpSalary('4500');
    setEmpShiftEn('Morning Shift');
    setEmpShiftAr('الوردية الصباحية');
    setEmpPhone('');
    setEmpStatus('active');
    setEmpPinCode('');
    setEmpSystemRole('cashier');
    setShowEmployeeModal(true);
  };
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Multi-select for bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modals / Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // File Inputs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields - Product
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodDescAr, setProdDescAr] = useState('');
  const [prodPrice, setProdPrice] = useState('0');
  const [prodCost, setProdCost] = useState('0');
  const [prodCategory, setProdCategory] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodBarcode, setProdBarcode] = useState('');
  const [prodCalories, setProdCalories] = useState('');
  const [prodPrepTime, setProdPrepTime] = useState('10');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodVideoUrl, setProdVideoUrl] = useState('');
  const [prodTrackStock, setProdTrackStock] = useState(true);
  const [prodStock, setProdStock] = useState('50');
  const [prodAllergens, setProdAllergens] = useState<string[]>([]);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodRecommended, setProdRecommended] = useState(false);
  const [prodPopular, setProdPopular] = useState(false);
  const [prodModifierGroupIds, setProdModifierGroupIds] = useState<string[]>([]);
  const [prodSizes, setProdSizes] = useState<{ nameEn: string; nameAr: string; priceDifference: number; calories: number }[]>([]);

  // Size sub-form temporary state
  const [newSizeNameEn, setNewSizeNameEn] = useState('');
  const [newSizeNameAr, setNewSizeNameAr] = useState('');
  const [newSizePriceDiff, setNewSizePriceDiff] = useState('0');
  const [newSizeCalories, setNewSizeCalories] = useState('0');

  // Media Gallery / Image Library states
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Load local images list when opening media gallery
  useEffect(() => {
    if (showMediaGallery) {
      setGalleryLoading(true);
      fetch('/api/list-images')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.images)) {
            setGalleryImages(data.images);
          }
        })
        .catch(err => console.error('Error fetching gallery images:', err))
        .finally(() => setGalleryLoading(false));
    }
  }, [showMediaGallery]);

  // Filter gallery images by search text
  const filteredGalleryImages = useMemo(() => {
    return galleryImages.filter(img => 
      img.toLowerCase().includes(gallerySearch.toLowerCase())
    );
  }, [galleryImages, gallerySearch]);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Form Fields - Category
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameAr, setCatNameAr] = useState('');
  const [catDescEn, setCatDescEn] = useState('');
  const [catDescAr, setCatDescAr] = useState('');
  const [catImageUrl, setCatImageUrl] = useState('');

  // Auto Calculations
  const computedProfit = Math.max(0, parseFloat(prodPrice) - parseFloat(prodCost));
  const computedMargin = parseFloat(prodPrice) > 0 ? (computedProfit / parseFloat(prodPrice)) * 100 : 0;

  // Filtered lists
  const tenantCategories = useMemo(() => {
    return categories.filter(c => c.tenantId === tenant.id);
  }, [categories, tenant]);

  const tenantProducts = useMemo(() => {
    return products.filter(p => p.tenantId === tenant.id)
      .filter(p => {
        const matchesSearch = p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.nameAr.includes(searchQuery) ||
                              p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
        return matchesSearch && matchesCategory;
      });
  }, [products, tenant, searchQuery, categoryFilter]);

  // Key Metrics Calculations
  const metrics = useMemo(() => {
    const tProds = products.filter(p => p.tenantId === tenant.id);
    const totalCount = tProds.length;
    const avgMargin = totalCount > 0 
      ? tProds.reduce((acc, p) => acc + p.margin, 0) / totalCount 
      : 0;
    const lowStockCount = tProds.filter(p => p.trackStock && p.stockQuantity <= 10).length;
    const totalCategories = tenantCategories.length;

    return { totalCount, avgMargin, lowStockCount, totalCategories };
  }, [products, tenant, tenantCategories]);

  // Open modal for Product Add/Edit
  const openProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProdNameEn(product.nameEn);
      setProdNameAr(product.nameAr);
      setProdDescEn(product.descriptionEn || '');
      setProdDescAr(product.descriptionAr || '');
      setProdPrice(product.price.toString());
      setProdCost(product.costPrice.toString());
      setProdCategory(product.categoryId);
      setProdSku(product.sku);
      setProdBarcode(product.barcode || '');
      setProdCalories(product.calories?.toString() || '');
      setProdPrepTime(product.preparationTime.toString());
      setProdImageUrl(product.imageUrl || '');
      setProdVideoUrl(product.videoUrl || '');
      setProdTrackStock(product.trackStock);
      setProdStock(product.stockQuantity.toString());
      setProdAllergens(product.allergens);
      setProdFeatured(product.isFeatured);
      setProdRecommended(product.isRecommended);
      setProdPopular(product.isPopular);
      setProdModifierGroupIds(product.modifierGroupIds || []);
      setProdSizes(product.sizes.map(s => ({
        nameEn: s.nameEn,
        nameAr: s.nameAr,
        priceDifference: s.priceDifference,
        calories: s.calories || 0
      })));
    } else {
      setEditingProduct(null);
      setProdNameEn('');
      setProdNameAr('');
      setProdDescEn('');
      setProdDescAr('');
      setProdPrice('45');
      setProdCost('15');
      setProdCategory(tenantCategories[0]?.id || '');
      setProdSku(`SKU-${tenant.slug.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setProdBarcode('');
      setProdCalories('450');
      setProdPrepTime('10');
      setProdImageUrl('');
      setProdVideoUrl('');
      setProdTrackStock(true);
      setProdStock('50');
      setProdAllergens([]);
      setProdFeatured(false);
      setProdRecommended(false);
      setProdPopular(false);
      setProdModifierGroupIds([]);
      setProdSizes([]);
    }
    setShowProductModal(true);
  };

  // Open modal for Category Add/Edit
  const openCategoryModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setCatNameEn(category.nameEn);
      setCatNameAr(category.nameAr);
      setCatDescEn(category.descriptionEn || '');
      setCatDescAr(category.descriptionAr || '');
      setCatImageUrl(category.imageUrl || '');
    } else {
      setEditingCategory(null);
      setCatNameEn('');
      setCatNameAr('');
      setCatDescEn('');
      setCatDescAr('');
      setCatImageUrl('');
    }
    setShowCategoryModal(true);
  };

  // Add Size Option to Product Form
  const handleAddSize = () => {
    if (!newSizeNameEn || !newSizeNameAr) return;
    setProdSizes([...prodSizes, {
      nameEn: newSizeNameEn,
      nameAr: newSizeNameAr,
      priceDifference: parseFloat(newSizePriceDiff) || 0,
      calories: parseInt(newSizeCalories) || 0
    }]);
    setNewSizeNameEn('');
    setNewSizeNameAr('');
    setNewSizePriceDiff('0');
    setNewSizeCalories('0');
  };

  // Remove Size Option
  const handleRemoveSize = (index: number) => {
    setProdSizes(prodSizes.filter((_, i) => i !== index));
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameEn || !prodNameAr || !prodCategory || !prodSku) return;

    const basePrice = parseFloat(prodPrice) || 0;
    const baseCost = parseFloat(prodCost) || 0;
    const profit = Math.max(0, basePrice - baseCost);
    const margin = basePrice > 0 ? (profit / basePrice) * 100 : 0;

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `p-${Date.now()}`,
      tenantId: tenant.id,
      categoryId: prodCategory,
      nameEn: prodNameEn,
      nameAr: prodNameAr,
      descriptionEn: prodDescEn,
      descriptionAr: prodDescAr,
      price: basePrice,
      costPrice: baseCost,
      profit,
      margin,
      calories: parseInt(prodCalories) || undefined,
      preparationTime: parseInt(prodPrepTime) || 10,
      sku: prodSku,
      barcode: prodBarcode || undefined,
      imageUrl: prodImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80',
      videoUrl: prodVideoUrl || undefined,
      displayOrder: editingProduct ? editingProduct.displayOrder : products.length + 1,
      isVisible: editingProduct ? editingProduct.isVisible : true,
      isFeatured: prodFeatured,
      isRecommended: prodRecommended,
      isPopular: prodPopular,
      trackStock: prodTrackStock,
      stockQuantity: parseInt(prodStock) || 0,
      allergens: prodAllergens,
      nutrition: {
        carbs: Math.floor(Math.random() * 60) + 10,
        protein: Math.floor(Math.random() * 30) + 5,
        fat: Math.floor(Math.random() * 25) + 5
      },
      modifierGroupIds: prodModifierGroupIds,
      sizes: prodSizes.map((s, idx) => ({
        id: `s-opt-${idx}-${Date.now()}`,
        nameEn: s.nameEn,
        nameAr: s.nameAr,
        priceDifference: s.priceDifference,
        calories: s.calories,
        sku: `${prodSku}-S${idx}`
      })),
      taxRate: tenant.id === 't-1' ? 0.15 : 0.05,
      discountRate: editingProduct ? editingProduct.discountRate : 0
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productPayload : p));
      addAuditLog('UPDATE_PRODUCT', 'Product', productPayload.id, `Updated product detail: ${productPayload.nameEn} (SKU: ${productPayload.sku})`);
    } else {
      setProducts(prev => [...prev, productPayload]);
      addAuditLog('CREATE_PRODUCT', 'Product', productPayload.id, `Created product: ${productPayload.nameEn} (SKU: ${productPayload.sku})`);
    }

    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameEn || !catNameAr) return;

    const categoryPayload: Category = {
      id: editingCategory ? editingCategory.id : `c-${Date.now()}`,
      tenantId: tenant.id,
      nameEn: catNameEn,
      nameAr: catNameAr,
      descriptionEn: catDescEn || undefined,
      descriptionAr: catDescAr || undefined,
      displayOrder: editingCategory ? editingCategory.displayOrder : categories.length + 1,
      isVisible: editingCategory ? editingCategory.isVisible : true,
      imageUrl: catImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80'
    };

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? categoryPayload : c));
      addAuditLog('UPDATE_CATEGORY', 'Category', categoryPayload.id, `Updated category: ${categoryPayload.nameEn}`);
    } else {
      setCategories(prev => [...prev, categoryPayload]);
      addAuditLog('CREATE_CATEGORY', 'Category', categoryPayload.id, `Created new category: ${categoryPayload.nameEn}`);
    }

    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  // Delete Product
  const handleDeleteProduct = (id: string) => {
    const target = products.find(p => p.id === id);
    if (!target) return;
    if (confirm(lang === 'ar' ? `هل أنت متأكد من حذف ${target.nameAr}؟` : `Are you sure you want to delete ${target.nameEn}?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      addAuditLog('DELETE_PRODUCT', 'Product', id, `Soft deleted product: ${target.nameEn}`);
    }
  };

  // Delete Category
  const handleDeleteCategory = (id: string) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;
    if (confirm(lang === 'ar' ? `هل أنت متأكد من حذف فئة ${target.nameAr}؟` : `Are you sure you want to delete category ${target.nameEn}?`)) {
      setCategories(prev => prev.filter(c => c.id !== id));
      addAuditLog('DELETE_CATEGORY', 'Category', id, `Soft deleted category: ${target.nameEn}`);
    }
  };

  // Sorter helpers
  const handleMoveProductOrder = (index: number, direction: 'up' | 'down') => {
    const reordered = [...tenantProducts];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === reordered.length - 1) return;

    const swapTarget = direction === 'up' ? index - 1 : index + 1;
    const tempOrder = reordered[index].displayOrder;
    reordered[index].displayOrder = reordered[swapTarget].displayOrder;
    reordered[swapTarget].displayOrder = tempOrder;

    // Merge back into original state
    setProducts(prev => prev.map(p => {
      const match = reordered.find(r => r.id === p.id);
      return match ? { ...p, displayOrder: match.displayOrder } : p;
    }));
  };

  // Select / Deselect Product
  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectAllProducts = () => {
    if (selectedProductIds.length === tenantProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(tenantProducts.map(p => p.id));
    }
  };

  // Bulk Actions
  const handleBulkVisibility = (isVisible: boolean) => {
    if (selectedProductIds.length === 0) return;
    setProducts(prev => prev.map(p => {
      if (selectedProductIds.includes(p.id)) {
        return { ...p, isVisible };
      }
      return p;
    }));
    addAuditLog('BULK_UPDATE_VISIBILITY', 'Product', 'bulk', `Toggled visibility to ${isVisible} for ${selectedProductIds.length} items.`);
    setSelectedProductIds([]);
  };

  const handleBulkDiscount = () => {
    if (selectedProductIds.length === 0) return;
    setProducts(prev => prev.map(p => {
      if (selectedProductIds.includes(p.id)) {
        return { ...p, discountRate: 0.15 }; // apply 15% discount
      }
      return p;
    }));
    addAuditLog('BULK_APPLY_DISCOUNT', 'Product', 'bulk', `Applied 15% Bulk Discount promo to ${selectedProductIds.length} items.`);
    setSelectedProductIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(lang === 'ar' ? `هل أنت متأكد من حذف ${selectedProductIds.length} منتجات مجمعة؟` : `Are you sure you want to delete ${selectedProductIds.length} selected items?`)) {
      setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
      addAuditLog('BULK_DELETE_PRODUCTS', 'Product', 'bulk', `Bulk soft deleted ${selectedProductIds.length} items.`);
      setSelectedProductIds([]);
    }
  };

  // Export current menu to CSV
  const handleExportCSV = () => {
    const headers = 'ID,Name_EN,Name_AR,SKU,Price,CostPrice,Margin,Calories,StockQuantity,IsVisible,IsFeatured';
    const rows = tenantProducts.map(p => 
      `"${p.id}","${p.nameEn.replace(/"/g, '""')}","${p.nameAr.replace(/"/g, '""')}","${p.sku}",${p.price},${p.costPrice},${p.margin.toFixed(2)},${p.calories || 0},${p.stockQuantity},${p.isVisible},${p.isFeatured}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\ufeff' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${tenant.slug}-menu-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('EXPORT_MENU_CSV', 'Product', 'bulk', `Exported current product catalog containing ${tenantProducts.length} items to CSV format.`);
  };

  // Import menu from CSV
  const handleImportCSVClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split('\n');
        // Simple verification of headers
        if (lines.length < 2) throw new Error('Empty CSV file format');
        
        const newProductsAdded: Product[] = [];
        
        // Parse lines skipping header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV parser supporting double quotes
          const columns = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
          if (columns.length < 5) continue;

          const id = `p-csv-${Date.now()}-${i}`;
          const nameEn = columns[1] || 'CSV Imported Item';
          const nameAr = columns[2] || 'منتج مستورد';
          const sku = columns[3] || `SKU-IMP-${Math.floor(1000 + Math.random() * 9000)}`;
          const price = parseFloat(columns[4]) || 10;
          const costPrice = parseFloat(columns[5]) || 3;
          const profit = Math.max(0, price - costPrice);
          const margin = price > 0 ? (profit / price) * 100 : 0;
          const calories = parseInt(columns[7]) || 200;
          const stockQuantity = parseInt(columns[8]) || 50;

          const parsedProduct: Product = {
            id,
            tenantId: tenant.id,
            categoryId: tenantCategories[0]?.id || 'c-1',
            nameEn,
            nameAr,
            descriptionEn: 'Imported via CSV Catalog upload',
            descriptionAr: 'تم استيراده عبر تحميل ملف كتالوج CSV',
            price,
            costPrice,
            profit,
            margin,
            calories,
            preparationTime: 12,
            sku,
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&q=80',
            displayOrder: products.length + i,
            isVisible: true,
            isFeatured: false,
            isRecommended: false,
            isPopular: false,
            trackStock: true,
            stockQuantity,
            allergens: [],
            modifierGroupIds: [],
            sizes: [],
            taxRate: tenant.id === 't-1' ? 0.15 : 0.05,
            discountRate: 0
          };
          newProductsAdded.push(parsedProduct);
        }

        if (newProductsAdded.length > 0) {
          setProducts(prev => [...prev, ...newProductsAdded]);
          addAuditLog('IMPORT_MENU_CSV', 'Product', 'bulk', `Successfully bulk imported ${newProductsAdded.length} new items into catalog via CSV parse.`);
          alert(lang === 'ar' ? `تم استيراد ${newProductsAdded.length} منتجات بنجاح!` : `Successfully imported ${newProductsAdded.length} products!`);
        }
      } catch (err) {
        alert(lang === 'ar' ? 'فشل استيراد CSV. يرجى التحقق من صياغة الملف.' : 'Failed to import CSV. Please verify file formatting.');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  return (
    <div className="space-y-6 text-gray-800 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-rose-600 animate-spin-slow" />
            {lang === 'ar' ? 'بوابة إدارة كتالوج القائمة' : 'Menu Catalog Administration Portal'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            {lang === 'ar' ? `المستأجر النشط: ${tenant.nameAr}` : `Active SaaS Tenant: ${tenant.nameEn}`}
            <span className="text-gray-300">|</span>
            {lang === 'ar' ? 'الموقع: الرياض العليا' : 'HQ Store Node: Riyadh Main'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export / Import Buttons */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm text-gray-700"
          >
            <Download className="w-3.5 h-3.5" />
            {lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}
          </button>
          
          <button 
            onClick={handleImportCSVClick}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm text-gray-700"
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
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'products' 
              ? (lang === 'ar' ? 'إضافة منتج' : 'Add Product') 
              : (lang === 'ar' ? 'إضافة فئة' : 'Add Category')}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              {lang === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
            </span>
            <span className="text-xl font-bold text-gray-900">{metrics.totalCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              {lang === 'ar' ? 'إجمالي الفئات' : 'Total Categories'}
            </span>
            <span className="text-xl font-bold text-gray-900">{metrics.totalCategories}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              {lang === 'ar' ? 'متوسط الربح' : 'Avg. Margin'}
            </span>
            <span className="text-xl font-bold text-gray-900">{metrics.avgMargin.toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <AlertTriangle className="w-5 h-5 animate-bounce-slow" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              {lang === 'ar' ? 'نقص المخزون' : 'Stock Alerts'}
            </span>
            <span className="text-xl font-bold text-gray-900">{metrics.lowStockCount}</span>
          </div>
        </div>
      </div>

      {/* Sidebar Layout Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Sidebar Panel (Col 3) */}
        <aside className="md:col-span-3 bg-white dark:bg-gray-905 border border-gray-150 dark:border-gray-800 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="border-b border-gray-100/10 pb-2.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
              {lang === 'ar' ? 'أقسام لوحة التحكم' : 'Console Modules'}
            </span>
          </div>

          <nav className="flex flex-col space-y-1.5">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'products'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إدارة المنتجات' : 'Products Grid'}</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'categories'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إدارة الفئات' : 'Categories Deck'}</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'inventory'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إدارة المخازن' : 'Inventory & Stocks'}</span>
            </button>

            <button
              onClick={() => setActiveTab('kitchen_analytics')}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'kitchen_analytics'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تحليلات ومخازن المطبخ' : 'Kitchen Operations'}</span>
            </button>

            <button
              onClick={() => setActiveTab('hr')}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'hr'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{lang === 'ar' ? 'شؤون الموظفين (HR)' : 'HR & Roster'}</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'logs'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{lang === 'ar' ? 'سجل العمليات والتدقيق' : 'Tenant Logs'}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 ${
                activeTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إعدادات النظام العامة' : 'General Settings'}</span>
            </button>
          </nav>
        </aside>

        {/* Main Tab Content Panel (Col 9) */}
        <main className="md:col-span-9 space-y-6">
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Table Utilities */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 w-full md:max-w-md">
              <input 
                type="text"
                placeholder={lang === 'ar' ? 'البحث بالاسم أو SKU...' : 'Search by name, code or SKU...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:border-rose-600 transition"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:border-rose-600 transition text-gray-600"
              >
                <option value="all">{lang === 'ar' ? 'كل الفئات' : 'All Categories'}</option>
                {tenantCategories.map(c => (
                  <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>
                ))}
              </select>
            </div>

            {/* Bulk actions list */}
            {selectedProductIds.length > 0 && (
              <div className="flex items-center gap-1.5 p-1 bg-rose-50/50 border border-rose-100 rounded-lg animate-fade-in text-xs">
                <span className="font-semibold text-rose-700 px-2">
                  {lang === 'ar' ? `${selectedProductIds.length} محددة` : `${selectedProductIds.length} selected`}
                </span>
                <button 
                  onClick={() => handleBulkVisibility(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition"
                >
                  <Eye className="w-3 h-3" />
                  {lang === 'ar' ? 'إظهار' : 'Show'}
                </button>
                <button 
                  onClick={() => handleBulkVisibility(false)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition"
                >
                  <EyeOff className="w-3 h-3" />
                  {lang === 'ar' ? 'إخفاء' : 'Hide'}
                </button>
                <button 
                  onClick={handleBulkDiscount}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-green-700 bg-white border border-green-200 rounded hover:bg-green-50/50 transition"
                >
                  <Percent className="w-3 h-3" />
                  -15%
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  {lang === 'ar' ? 'حذف' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500">
                <thead className="bg-gray-50/70 text-[11px] uppercase text-gray-400 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-4 w-10">
                      <input 
                        type="checkbox" 
                        checked={tenantProducts.length > 0 && selectedProductIds.length === tenantProducts.length}
                        onChange={toggleSelectAllProducts}
                        className="rounded accent-rose-600"
                      />
                    </th>
                    <th className="p-4">{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                    <th className="p-4">SKU / Barcode</th>
                    <th className="p-4">{lang === 'ar' ? 'الفئة' : 'Category'}</th>
                    <th className="p-4">{lang === 'ar' ? 'السعر / التكلفة' : 'Price / Cost'}</th>
                    <th className="p-4">{lang === 'ar' ? 'هامش الربح' : 'Margin / Profit'}</th>
                    <th className="p-4">{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                    <th className="p-4">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="p-4 text-center">{lang === 'ar' ? 'الترتيب' : 'Sort'}</th>
                    <th className="p-4 text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600 font-sans">
                  {tenantProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-400">
                        {lang === 'ar' ? 'لم يتم العثور على منتجات مطابقة.' : 'No matching products found.'}
                      </td>
                    </tr>
                  ) : (
                    tenantProducts.map((p, index) => {
                      const cat = categories.find(c => c.id === p.categoryId);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-4">
                            <input 
                              type="checkbox" 
                              checked={selectedProductIds.includes(p.id)}
                              onChange={() => toggleSelectProduct(p.id)}
                              className="rounded accent-rose-600"
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={p.imageUrl} 
                                alt={p.nameEn} 
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900">{lang === 'ar' ? p.nameAr : p.nameEn}</h4>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                                  {p.calories && <span className="flex items-center gap-0.5"><Flame className="w-2.5 h-2.5 text-amber-500" /> {p.calories} Cal</span>}
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5 text-blue-500" /> {p.preparationTime} Min</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-xs text-gray-700 block">{p.sku}</span>
                            {p.barcode && <span className="font-mono text-[10px] text-gray-400">{p.barcode}</span>}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 text-[10px] font-semibold bg-gray-50 rounded-full text-gray-600 border border-gray-100">
                              {cat ? (lang === 'ar' ? cat.nameAr : cat.nameEn) : 'Unknown'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-gray-900 font-semibold">{p.price.toFixed(2)} {tenant.currencyEn}</div>
                            <div className="text-[10px] text-gray-400">{lang === 'ar' ? 'التكلفة:' : 'Cost:'} {p.costPrice.toFixed(2)}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-emerald-600 font-semibold">+{p.profit.toFixed(2)} {tenant.currencyEn}</div>
                            <div className="text-[10px] font-medium text-gray-400">{p.margin.toFixed(1)}% {lang === 'ar' ? 'هامش' : 'margin'}</div>
                          </td>
                          <td className="p-4">
                            {p.trackStock ? (
                              <span className={`font-semibold ${p.stockQuantity <= 10 ? 'text-amber-600 animate-pulse' : 'text-gray-700'}`}>
                                {p.stockQuantity} {lang === 'ar' ? 'حبة' : 'units'}
                              </span>
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
                          </td>
                          <td className="p-4">
                            {p.isVisible ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {lang === 'ar' ? 'نشط' : 'Visible'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-50 rounded border border-gray-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                {lang === 'ar' ? 'مخفي' : 'Hidden'}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1">
                              <button 
                                onClick={() => handleMoveProductOrder(index, 'up')}
                                disabled={index === 0}
                                className="p-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30"
                              >
                                <ArrowUp className="w-3 h-3 text-gray-500" />
                              </button>
                              <button 
                                onClick={() => handleMoveProductOrder(index, 'down')}
                                disabled={index === tenantProducts.length - 1}
                                className="p-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-30"
                              >
                                <ArrowDown className="w-3 h-3 text-gray-500" />
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => openProductModal(p)}
                                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                title="Edit Item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500">
                <thead className="bg-gray-50/70 text-[11px] uppercase text-gray-400 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="p-4">{lang === 'ar' ? 'الفئة' : 'Category'}</th>
                    <th className="p-4">{lang === 'ar' ? 'الوصف' : 'Description'}</th>
                    <th className="p-4">{lang === 'ar' ? 'الترتيب' : 'Order'}</th>
                    <th className="p-4">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="p-4 text-right">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {tenantCategories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        {lang === 'ar' ? 'لم يتم العثور على فئات مطابقة.' : 'No categories found.'}
                      </td>
                    </tr>
                  ) : (
                    tenantCategories.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={c.imageUrl} 
                              alt={c.nameEn} 
                              className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">{lang === 'ar' ? c.nameAr : c.nameEn}</h4>
                              <span className="text-[10px] text-rose-600 font-medium">
                                {products.filter(p => p.categoryId === c.id).length} {lang === 'ar' ? 'منتجات' : 'items'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 max-w-xs truncate text-gray-500">
                          {lang === 'ar' ? c.descriptionAr : c.descriptionEn}
                        </td>
                        <td className="p-4 font-mono text-gray-700 font-semibold">
                          #{c.displayOrder}
                        </td>
                        <td className="p-4">
                          {c.isVisible ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded border border-emerald-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {lang === 'ar' ? 'نشط' : 'Visible'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-50 rounded border border-gray-100">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              {lang === 'ar' ? 'مخفي' : 'Hidden'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => openCategoryModal(c)}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(c.id)}
                              className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600" />
                {lang === 'ar' ? 'سجل العمليات والتدقيق الأمني' : 'Security Audits & Multi-Tenant Registry'}
              </h3>
              <span className="text-xs bg-gray-50 border border-gray-100 px-2.5 py-1 rounded text-gray-500 font-mono">
                {lang === 'ar' ? 'قفل الخادم النشط' : 'Secure Session Logged'}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {auditLogs.filter(log => log.tenantId === tenant.id).map((log) => (
                <div key={log.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-sans flex items-start justify-between gap-4 hover:bg-white transition hover:shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                        log.action.includes('CREATE') ? 'bg-green-100 text-green-700 border border-green-200' :
                        log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-semibold text-gray-800">{log.details}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 flex items-center gap-2">
                      <span className="font-medium text-gray-500">{log.userEmail} ({log.userRole})</span>
                      <span>•</span>
                      <span className="font-mono">ID: {log.entityId}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INVENTORY MANAGEMENT SYSTEM */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">{lang === 'ar' ? 'إجمالي المواد المخزنة' : 'Total Ingredients'}</span>
                <span className="text-lg font-black text-gray-900">{inventoryItems.length}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">{lang === 'ar' ? 'مواد شارفت على النفاد' : 'Low Stock Alerts'}</span>
                <span className="text-lg font-black text-gray-900">
                  {inventoryItems.filter(item => item.stockQuantity <= item.reorderLevel && item.stockQuantity > 0).length}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-50 text-red-600">
                <X className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">{lang === 'ar' ? 'مواد منتهية / نافدة' : 'Out of Stock'}</span>
                <span className="text-lg font-black text-gray-900">
                  {inventoryItems.filter(item => item.stockQuantity === 0).length}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">{lang === 'ar' ? 'قيمة الأصول المخزنية' : 'Net Asset Value'}</span>
                <span className="text-lg font-black text-gray-900">
                  {inventoryItems.reduce((sum, item) => sum + (item.stockQuantity * item.costPerUnit), 0).toFixed(2)} {tenant.currencyEn}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT PANEL: INVENTORY ITEMS DIRECTORY (Col 2) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/40">
                <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 uppercase">
                  <Warehouse className="w-4 h-4 text-rose-600" />
                  {lang === 'ar' ? 'دليل المخازن والمستودع المركزي' : 'Central Ingredients & Stock Ledger'}
                </h3>
                <button
                  onClick={() => setShowInventoryModal(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'إضافة مادة جديدة' : 'Add Custom Material'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  <thead className="bg-gray-50 text-gray-400 font-bold border-b border-gray-100 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">{lang === 'ar' ? 'المادة / الصنف' : 'Item Name'}</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">{lang === 'ar' ? 'الكمية الحالية' : 'Stock Qty'}</th>
                      <th className="p-3">{lang === 'ar' ? 'التكلفة / الوحدة' : 'Unit Cost'}</th>
                      <th className="p-3">{lang === 'ar' ? 'المورد الرئيسي' : 'Primary Supplier'}</th>
                      <th className="p-3">{lang === 'ar' ? 'حالة المخزون' : 'Stock Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inventoryItems.map(item => {
                      const isOutOfStock = item.stockQuantity === 0;
                      const isLowStock = item.stockQuantity <= item.reorderLevel && item.stockQuantity > 0;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-3 font-semibold text-gray-900">
                            {lang === 'ar' ? item.nameAr : item.nameEn}
                          </td>
                          <td className="p-3 font-mono text-gray-400 text-[10px]">{item.sku}</td>
                          <td className="p-3 font-bold text-gray-700">
                            {item.stockQuantity} <span className="text-[10px] text-gray-400 font-medium">{lang === 'ar' ? item.unitAr : item.unitEn}</span>
                          </td>
                          <td className="p-3 font-mono text-rose-600 font-bold">{item.costPerUnit.toFixed(2)} {tenant.currencyEn}</td>
                          <td className="p-3 text-gray-500 font-medium">{item.supplierName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isOutOfStock ? 'bg-red-50 text-red-700 border border-red-100' :
                              isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse' :
                              'bg-green-50 text-green-700 border border-green-100'
                            }`}>
                              {isOutOfStock ? (lang === 'ar' ? 'منتهي' : 'Out of Stock') :
                               isLowStock ? (lang === 'ar' ? 'منخفض' : 'Low Stock') :
                               (lang === 'ar' ? 'متوفر' : 'In Stock')}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT PANEL: SUPPLY ORDER REFILL (Col 1) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 uppercase border-b pb-2">
                <Plus className="w-4 h-4 text-emerald-500" />
                {lang === 'ar' ? 'أمر توريد مخزني سريع' : 'Quick Stock Supply Inflow'}
              </h3>
              <p className="text-[11px] text-gray-400">
                {lang === 'ar' ? 'اختر المادة المخزنية لتسجيل شحنة توريد جديدة وزيادة مستويات المخزون فورا.' : 'Select ingredient item to register incoming supply batch and instantly increment quantities.'}
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const itemSelect = form.elements.namedItem('refillItem') as HTMLSelectElement;
                  const qtyInput = form.elements.namedItem('refillQty') as HTMLInputElement;
                  
                  const targetId = itemSelect.value;
                  const qtyToAdd = parseInt(qtyInput.value) || 0;

                  if (!targetId || qtyToAdd <= 0) return;

                  setInventoryItems(prev => prev.map(item => {
                    if (item.id === targetId) {
                      const newQty = item.stockQuantity + qtyToAdd;
                      const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= item.reorderLevel ? 'low_stock' : 'in_stock';
                      addAuditLog('STOCK_REFILL', 'Inventory', item.id, `Supplied +${qtyToAdd} ${item.unitEn} of ${item.nameEn}. New Stock: ${newQty}`);
                      return { ...item, stockQuantity: newQty, status: newStatus };
                    }
                    return item;
                  }));

                  // Also check if there's an app product with matching stock to sync
                  const targetItem = inventoryItems.find(i => i.id === targetId);
                  if (targetItem) {
                    setProducts(prevProds => prevProds.map(p => {
                      if (p.nameEn.toLowerCase() === targetItem.nameEn.toLowerCase() || p.sku === targetItem.sku) {
                        return { ...p, stockQuantity: p.stockQuantity + qtyToAdd };
                      }
                      return p;
                    }));
                  }

                  alert(lang === 'ar' ? 'تم توريد الشحنة وتحديث المستويات بنجاح!' : 'Supply receipt logged and stock updated!');
                  form.reset();
                }}
                className="space-y-3.5 text-xs text-left"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              >
                <div>
                  <label className="block font-bold text-gray-500 mb-1">{lang === 'ar' ? 'المادة المستهدفة' : 'Select Target Item'}</label>
                  <select 
                    name="refillItem" 
                    required
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-rose-600 font-semibold"
                  >
                    {inventoryItems.map(i => (
                      <option key={i.id} value={i.id}>{lang === 'ar' ? i.nameAr : i.nameEn} ({i.sku})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-500 mb-1">{lang === 'ar' ? 'كمية التوريد الجديدة' : 'Add Quantity'}</label>
                  <input 
                    type="number" 
                    name="refillQty" 
                    required 
                    min="1" 
                    defaultValue="50"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-rose-600 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition uppercase"
                >
                  {lang === 'ar' ? 'تسجيل شحنة التوريد' : 'Submit Supply Batch'}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* HR MANAGEMENT SYSTEM */}
      {activeTab === 'hr' && (
        <div className="space-y-6">
          {/* HR Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">{lang === 'ar' ? 'طاقم العمل المسجل' : 'Registered Roster'}</span>
                <span className="text-lg font-black text-gray-900">{employees.length} {lang === 'ar' ? 'موظفين' : 'Staff'}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">{lang === 'ar' ? 'الموظفين على رأس العمل' : 'Active On Duty'}</span>
                <span className="text-lg font-black text-gray-900">{employees.filter(e => e.status === 'active').length}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">{lang === 'ar' ? 'أقسام المناوبات' : 'Active Roster Shifts'}</span>
                <span className="text-lg font-black text-gray-900">3 {lang === 'ar' ? 'ورديات' : 'Shifts'}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">{lang === 'ar' ? 'إجمالي الرواتب الشهرية' : 'Monthly Payroll Commitment'}</span>
                <span className="text-lg font-black text-gray-900">
                  {employees.reduce((sum, e) => sum + e.salary, 0).toLocaleString()} {tenant.currencyEn}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/40">
              <div>
                <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5 uppercase">
                  <Users className="w-4 h-4 text-rose-600" />
                  {lang === 'ar' ? 'شؤون الموظفين وجدولة المناوبات' : 'Employee Directory & Roster Grid'}
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">
                  {lang === 'ar' ? 'تحكم في الموظفين، الرواتب، والمناوبات اليومية.' : 'Control active branch workforce contracts, salary lists, and schedules.'}
                </p>
              </div>

              <div className="flex gap-2">
                {/* Simulated Payroll Button */}
                <button
                  onClick={() => {
                    const totalPaid = employees.reduce((sum, e) => sum + e.salary, 0);
                    addAuditLog('PAYROLL_DISBURSEMENT', 'HR_Finance', 'PAY-' + Date.now().toString().slice(-4), 
                      `Issued monthly payroll of ${totalPaid.toLocaleString()} ${tenant.currencyEn} to ${employees.length} active employee profiles`
                    );
                    alert(lang === 'ar' 
                      ? `تم صرف رواتب هذا الشهر بقيمة ${totalPaid.toLocaleString()} ريال بنجاح!` 
                      : `Successfully disbursed monthly payroll of ${totalPaid.toLocaleString()} ${tenant.currencyEn} to all staff ledger!`);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'صرف الرواتب الشهرية' : 'Disburse Payroll'}
                </button>

                <button
                  onClick={startHireEmployee}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'إضافة موظف جديد' : 'Hire Employee'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <thead className="bg-gray-50 text-gray-450 font-bold border-b border-gray-100 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">{lang === 'ar' ? 'اسم الموظف' : 'Employee Name'}</th>
                    <th className="p-3">{lang === 'ar' ? 'الدور الوظيفي' : 'Role'}</th>
                    <th className="p-3">{lang === 'ar' ? 'المناوبة' : 'Duty Shift'}</th>
                    <th className="p-3">{lang === 'ar' ? 'رمز الـ PIN للدخول' : 'Access PIN'}</th>
                    <th className="p-3">{lang === 'ar' ? 'صلاحية النظام' : 'System Permission'}</th>
                    <th className="p-3">{lang === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}</th>
                    <th className="p-3">{lang === 'ar' ? 'نوع العقد' : 'Contract'}</th>
                    <th className="p-3">{lang === 'ar' ? 'الراتب الشهري' : 'Base Salary'}</th>
                    <th className="p-3">{lang === 'ar' ? 'حالة الموظف' : 'Status'}</th>
                    <th className="p-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-3 font-semibold text-gray-900">{lang === 'ar' ? emp.nameAr : emp.nameEn}</td>
                      <td className="p-3 font-medium text-gray-650">{lang === 'ar' ? emp.roleAr : emp.roleEn}</td>
                      <td className="p-3">
                        <span className="bg-slate-50 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded border border-slate-100">
                          {lang === 'ar' ? emp.shiftAr : emp.shiftEn}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-rose-600">{emp.pinCode || '1234'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          emp.systemRole === 'manager' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          emp.systemRole === 'kitchen' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          {emp.systemRole === 'manager' ? (lang === 'ar' ? 'مدير المطعم' : 'Manager') :
                           emp.systemRole === 'kitchen' ? (lang === 'ar' ? 'مدير المطبخ / طاهي' : 'Kitchen Chef') :
                           (lang === 'ar' ? 'كاشير (POS)' : 'Cashier')}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-gray-400">{emp.phone}</td>
                      <td className="p-3 font-bold">
                        {emp.contractType === 'full_time' 
                          ? (lang === 'ar' ? 'دوام كامل 🟢' : 'Full-time 🟢') 
                          : (lang === 'ar' ? 'دوام جزئي 🔵' : 'Part-time 🔵')}
                      </td>
                      <td className="p-3 font-mono font-bold text-rose-600">{emp.salary.toLocaleString()} {tenant.currencyEn}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          emp.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' :
                          emp.status === 'on_leave' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {emp.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') :
                           emp.status === 'on_leave' ? (lang === 'ar' ? 'إجازة' : 'On Leave') :
                           (lang === 'ar' ? 'موقوف' : 'Suspended')}
                        </span>
                      </td>
                      <td className="p-3 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEditEmployee(emp)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded transition"
                          title={lang === 'ar' ? 'تعديل البيانات / الرمز السري' : 'Edit Employee / PIN'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {emp.id !== 'emp-admin-1' && emp.id !== 'emp-admin-2' && (
                          <button
                            onClick={() => {
                              if (confirm(lang === 'ar' ? `هل أنت متأكد من رغبتك في إنهاء خدمات الموظف ${emp.nameAr || emp.nameEn}؟` : `Are you sure you want to terminate/delete employee ${emp.nameEn}?`)) {
                                setEmployees(prev => prev.filter(e => e.id !== emp.id));
                                addAuditLog('TERMINATE_EMPLOYEE', 'HR_Workforce', emp.id, `Terminated employee profile for ${emp.nameEn}`);
                              }
                            }}
                            className="p-1 hover:bg-red-50 text-red-650 rounded transition"
                            title={lang === 'ar' ? 'إنهاء الخدمات / حذف' : 'Terminate / Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NEW MATERIAL INVENTORY DIALOG MODAL */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden text-xs text-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">
                {lang === 'ar' ? 'تسجيل مادة خام جديدة' : 'Add New Raw Stock Material'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowInventoryModal(false)}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const newId = `inv-${Date.now()}`;
                const parsedQty = parseFloat(invStock) || 0;
                const parsedCost = parseFloat(invCost) || 0;
                const parsedReorder = parseFloat(invReorder) || 10;
                const newStatus = parsedQty === 0 ? 'out_of_stock' : parsedQty <= parsedReorder ? 'low_stock' : 'in_stock';

                const newItem = {
                  id: newId,
                  nameEn: invNameEn,
                  nameAr: invNameAr,
                  sku: invSku || `SKU-${invNameEn.toUpperCase().slice(0,4)}-${Date.now().toString().slice(-3)}`,
                  stockQuantity: parsedQty,
                  unitEn: invUnitEn,
                  unitAr: invUnitAr,
                  costPerUnit: parsedCost,
                  supplierName: invSupplier || 'Local Farm Market',
                  status: newStatus as 'in_stock' | 'low_stock' | 'out_of_stock',
                  reorderLevel: parsedReorder
                };

                setInventoryItems(prev => [...prev, newItem]);
                addAuditLog('CREATE_INVENTORY_ITEM', 'Inventory', newId, `Registered raw material: ${invNameEn} with initial stock ${parsedQty}`);
                setShowInventoryModal(false);

                // Reset
                setInvNameEn('');
                setInvNameAr('');
                setInvSku('');
                setInvStock('100');
                setInvSupplier('');
                alert(lang === 'ar' ? 'تم تسجيل الصنف المخزني الجديد!' : 'Material added to inventory ledger!');
              }}
              className="p-5 space-y-4 text-left text-xs"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'اسم الصنف بالإنجليزية *' : 'Name (English) *'}</label>
                  <input type="text" required value={invNameEn} onChange={(e) => setInvNameEn(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'الاسم بالعربية *' : 'Name (Arabic) *'}</label>
                  <input type="text" required value={invNameAr} onChange={(e) => setInvNameAr(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">SKU Code</label>
                  <input type="text" value={invSku} onChange={(e) => setInvSku(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" placeholder="e.g. SKU-CHEESE" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'الكمية الابتدائية' : 'Initial Stock Qty'}</label>
                  <input type="number" required value={invStock} onChange={(e) => setInvStock(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'الوحدة (إنجليزية)' : 'Unit En'}</label>
                  <input type="text" value={invUnitEn} onChange={(e) => setInvUnitEn(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'الوحدة (عربية)' : 'Unit Ar'}</label>
                  <input type="text" value={invUnitAr} onChange={(e) => setInvUnitAr(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'تكلفة الشراء / الوحدة' : 'Purchase Cost/Unit'}</label>
                  <input type="number" step="0.01" value={invCost} onChange={(e) => setInvCost(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'حد إعادة الطلب' : 'Reorder Alert Threshold'}</label>
                  <input type="number" value={invReorder} onChange={(e) => setInvReorder(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500">{lang === 'ar' ? 'اسم المورد الرئيسي' : 'Supplier Name'}</label>
                <input type="text" value={invSupplier} onChange={(e) => setInvSupplier(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
              </div>

              <div className="flex gap-2 pt-2 bg-gray-50 p-4 -mx-5 -mb-5 mt-4">
                <button type="button" onClick={() => setShowInventoryModal(false)} className="w-1/2 py-2 border rounded-lg hover:bg-gray-100 transition">
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition">
                  {lang === 'ar' ? 'حفظ وتثبيت' : 'Register Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW EMPLOYEE HR DIALOG MODAL */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden text-xs text-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">
                {editingEmployee 
                  ? (lang === 'ar' ? 'تعديل بيانات الموظف والرمز السري' : 'Edit Employee Details & PIN') 
                  : (lang === 'ar' ? 'توظيف موظف جديد' : 'Hire & Register Employee')}
              </h3>
              <button 
                type="button"
                onClick={() => {
                  setShowEmployeeModal(false);
                  setEditingEmployee(null);
                }}
                className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const parsedSalary = parseFloat(empSalary) || 3000;

                if (editingEmployee) {
                  const updatedEmp = {
                    ...editingEmployee,
                    nameEn: empNameEn,
                    nameAr: empNameAr,
                    roleEn: empRoleEn,
                    roleAr: empRoleAr,
                    contractType: empContract,
                    salary: parsedSalary,
                    shiftEn: empShiftEn,
                    shiftAr: empShiftAr,
                    phone: empPhone || '+96650000000',
                    status: empStatus,
                    pinCode: empPinCode || '1234',
                    systemRole: empSystemRole
                  };

                  setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? updatedEmp : emp));
                  addAuditLog('EDIT_EMPLOYEE', 'HR_Workforce', editingEmployee.id, `Updated employee profile for ${empNameEn} (PIN changed/updated)`);
                } else {
                  const newId = `emp-${Date.now()}`;
                  const newEmp = {
                    id: newId,
                    nameEn: empNameEn,
                    nameAr: empNameAr,
                    roleEn: empRoleEn,
                    roleAr: empRoleAr,
                    contractType: empContract,
                    salary: parsedSalary,
                    shiftEn: empShiftEn,
                    shiftAr: empShiftAr,
                    phone: empPhone || '+96650000000',
                    status: empStatus,
                    pinCode: empPinCode || '1234',
                    systemRole: empSystemRole
                  };

                  setEmployees(prev => [...prev, newEmp]);
                  addAuditLog('HIRE_EMPLOYEE', 'HR_Workforce', newId, `Registered hire profile for ${empNameEn} with monthly salary ${parsedSalary} and login PIN ${empPinCode || '1234'}`);
                }

                setShowEmployeeModal(false);
                setEditingEmployee(null);

                // Reset
                setEmpNameEn('');
                setEmpNameAr('');
                setEmpRoleEn('');
                setEmpRoleAr('');
                setEmpPhone('');
                setEmpSalary('4500');
                setEmpPinCode('');
                setEmpSystemRole('cashier');
                alert(lang === 'ar' ? 'تم حفظ بيانات الموظف بنجاح!' : 'Employee information saved successfully!');
              }}
              className="p-5 space-y-4 text-left text-xs"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'الاسم بالإنجليزية *' : 'Name (English) *'}</label>
                  <input type="text" required value={empNameEn} onChange={(e) => setEmpNameEn(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'الاسم بالعربية *' : 'Name (Arabic) *'}</label>
                  <input type="text" required value={empNameAr} onChange={(e) => setEmpNameAr(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'الدور بالإنجليزية *' : 'Role (English) *'}</label>
                  <input type="text" required value={empRoleEn} onChange={(e) => setEmpRoleEn(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" placeholder="e.g. Line Chef" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'الدور بالعربية *' : 'Role (Arabic) *'}</label>
                  <input type="text" required value={empRoleAr} onChange={(e) => setEmpRoleAr(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" placeholder="مثل: طاهي خط" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'نوع العقد' : 'Contract Type'}</label>
                  <select value={empContract} onChange={(e) => setEmpContract(e.target.value as 'full_time' | 'part_time')} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none">
                    <option value="full_time">{lang === 'ar' ? 'دوام كامل' : 'Full-time'}</option>
                    <option value="part_time">{lang === 'ar' ? 'دوام جزئي' : 'Part-time'}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'الراتب الشهري الأساسي' : 'Base Salary'}</label>
                  <input type="number" required value={empSalary} onChange={(e) => setEmpSalary(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'المناوبة (إنجليزية)' : 'Shift (English)'}</label>
                  <input type="text" value={empShiftEn} onChange={(e) => setEmpShiftEn(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'المناوبة (عربية)' : 'Shift (Arabic)'}</label>
                  <input type="text" value={empShiftAr} onChange={(e) => setEmpShiftAr(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'رمز الـ PIN للدخول (4 أرقام) *' : 'Login PIN Code (4 Digits) *'}</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={empPinCode} 
                    onChange={(e) => setEmpPinCode(e.target.value.replace(/[^0-9]/g, ''))} 
                    placeholder="e.g. 1234"
                    className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none font-mono font-bold text-center text-xs text-gray-900" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'رقم الاتصال' : 'Phone Number'}</label>
                  <input type="text" value={empPhone} onChange={(e) => setEmpPhone(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'حالة الموظف' : 'Status'}</label>
                  <select value={empStatus} onChange={(e) => setEmpStatus(e.target.value as 'active' | 'on_leave' | 'suspended')} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none">
                    <option value="active">{lang === 'ar' ? 'نشط على رأس العمل' : 'Active'}</option>
                    <option value="on_leave">{lang === 'ar' ? 'في إجازة مأذونة' : 'On Leave'}</option>
                    <option value="suspended">{lang === 'ar' ? 'موقوف إدارياً' : 'Suspended'}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-500">{lang === 'ar' ? 'صلاحية النظام *' : 'System Access *'}</label>
                  <select value={empSystemRole} onChange={(e) => setEmpSystemRole(e.target.value as 'manager' | 'cashier' | 'kitchen')} className="w-full px-3 py-1.5 bg-gray-50 border rounded-lg focus:outline-none text-rose-600 font-bold">
                    <option value="cashier">{lang === 'ar' ? 'كاشير / صراف (POS)' : 'Cashier (POS)'}</option>
                    <option value="manager">{lang === 'ar' ? 'مدير المطعم / إداري' : 'Restaurant Manager'}</option>
                    <option value="kitchen">{lang === 'ar' ? 'طاقم المطبخ / طاهي' : 'Kitchen Staff / Chef'}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 bg-gray-50 p-4 -mx-5 -mb-5 mt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEmployeeModal(false);
                    setEditingEmployee(null);
                  }} 
                  className="w-1/2 py-2 border rounded-lg hover:bg-gray-100 transition"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition">
                  {editingEmployee 
                    ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes') 
                    : (lang === 'ar' ? 'توظيف وتسجيل' : 'Hire Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'kitchen_analytics' && (
        <div className="space-y-6 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          
          {/* Section Heading */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6 text-rose-500" />
              <div>
                <h2 className="text-sm font-bold">{lang === 'ar' ? 'تحليلات المطبخ وتوقعات نفاد المكونات' : 'Kitchen Monitor & Depletion Forecast'}</h2>
                <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'تحليل مباشر لسرعة التحضير وتوقعات نفاد المكونات في المستودعات' : 'Live tracking of prep velocity and ingredients stock exhaustion times'}</p>
              </div>
            </div>
            <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-mono">FORECAST ENGINE ACTIVE</span>
          </div>

          {/* Kitchen KPIs Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
              <span className="text-[10px] text-gray-400 uppercase block">{lang === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</span>
              <span className="text-lg font-black text-gray-900 dark:text-white">{orders.filter(o => o.tenantId === tenant.id).length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
              <span className="text-[10px] text-gray-400 uppercase block">{lang === 'ar' ? 'طلبات نشطة بالمطبخ' : 'Active KDS Queue'}</span>
              <span className="text-lg font-black text-amber-600">{orders.filter(o => o.tenantId === tenant.id && (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')).length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
              <span className="text-[10px] text-gray-400 uppercase block">{lang === 'ar' ? 'طلبات تم تسليمها' : 'Delivered Today'}</span>
              <span className="text-lg font-black text-emerald-600">{orders.filter(o => o.tenantId === tenant.id && o.status === 'completed').length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800 shadow-xs">
              <span className="text-[10px] text-gray-400 uppercase block">{lang === 'ar' ? 'سرعة التحضير التقريبية' : 'Est. Prep Velocity'}</span>
              <span className="text-lg font-black text-rose-500">9.5 {lang === 'ar' ? 'دقيقة' : 'mins'}</span>
            </div>
          </div>

          {/* Depletion Forecast & Ingredient Inventory */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="text-right">
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase flex items-center gap-1.5 justify-start">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {lang === 'ar' ? 'جدول التنبؤ بنفاد مكونات المطبخ والمخازن' : 'Ingredients Depletion Forecast Engine'}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">{lang === 'ar' ? 'يعتمد هذا التنبؤ على الكمية المتبقية مقسمة على متوسط الاستهلاك لكل طلب.' : 'Exhaustion estimate calculated by dividing current stock by avg consumption per order.'}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold text-right">
                    <th className="py-2.5 px-3 text-right">{lang === 'ar' ? 'المكون الخام' : 'Raw Ingredient'}</th>
                    <th className="py-2.5 px-3 text-right font-mono">SKU</th>
                    <th className="py-2.5 px-3 text-right">{lang === 'ar' ? 'المخزون الحالي' : 'Current Stock'}</th>
                    <th className="py-2.5 px-3 text-right">{lang === 'ar' ? 'الاستهلاك الإجمالي' : 'Total Consumed'}</th>
                    <th className="py-2.5 px-3 text-right">{lang === 'ar' ? 'متوسط الطلب الواحد' : 'Avg / Order'}</th>
                    <th className="py-2.5 px-3 text-right">{lang === 'ar' ? 'متبقي كم طلب؟' : 'Orders Remaining'}</th>
                    <th className="py-2.5 px-3 text-right">{lang === 'ar' ? 'توقعات النفاد' : 'Exhaustion Forecast'}</th>
                    <th className="py-2.5 px-3 text-center">{lang === 'ar' ? 'إجراء' : 'Quick Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map(ing => {
                    const totalTenantOrders = orders.filter(o => o.tenantId === tenant.id).length || 1;
                    const totalConsumed = ing.totalConsumedCount || 0;
                    const avgPerOrder = totalConsumed / totalTenantOrders;
                    const ordersRemaining = avgPerOrder > 0 ? Math.floor(ing.stockQuantity / avgPerOrder) : Infinity;

                    // Days remaining assuming 25 orders per day
                    const daysRemaining = ordersRemaining !== Infinity ? parseFloat((ordersRemaining / 25).toFixed(1)) : Infinity;

                    let statusBadge = '';
                    let forecastText = '';
                    if (ing.stockQuantity === 0) {
                      statusBadge = lang === 'ar' ? 'نفد 🔴' : 'Out of Stock 🔴';
                      forecastText = lang === 'ar' ? 'نفد بالفعل!' : 'Exhausted!';
                    } else if (ordersRemaining === Infinity || totalConsumed === 0) {
                      statusBadge = lang === 'ar' ? 'آمن 🟢' : 'Safe 🟢';
                      forecastText = lang === 'ar' ? 'كافٍ لفترة طويلة' : 'Sufficient';
                    } else if (ordersRemaining <= 50 || ing.stockQuantity <= ing.reorderLevel) {
                      statusBadge = lang === 'ar' ? 'حرج ⚠️' : 'Critical ⚠️';
                      forecastText = lang === 'ar' 
                        ? `خلال ${ordersRemaining} طلبات (~${daysRemaining} يوم)`
                        : `In ${ordersRemaining} orders (~${daysRemaining} days)`;
                    } else {
                      statusBadge = lang === 'ar' ? 'آمن 🟢' : 'Safe 🟢';
                      forecastText = lang === 'ar'
                        ? `خلال ${ordersRemaining} طلبات (~${daysRemaining} يوم)`
                        : `In ${ordersRemaining} orders (~${daysRemaining} days)`;
                    }

                    return (
                      <tr key={ing.id} className="border-b border-gray-50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                        <td className="py-3 px-3 font-bold text-gray-900 dark:text-white text-right">
                          {lang === 'ar' ? ing.nameAr : ing.nameEn}
                        </td>
                        <td className="py-3 px-3 text-gray-400 font-mono text-right">{ing.sku}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-bold">{ing.stockQuantity}</span> {lang === 'ar' ? ing.unitAr : ing.unitEn}
                        </td>
                        <td className="py-3 px-3 text-gray-550 text-right">
                          {totalConsumed.toFixed(2)} {lang === 'ar' ? ing.unitAr : ing.unitEn}
                        </td>
                        <td className="py-3 px-3 text-gray-500 font-mono text-right">
                          {avgPerOrder.toFixed(3)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-bold ${ordersRemaining <= 50 ? 'text-rose-600 font-extrabold' : 'text-gray-700 dark:text-gray-300'}`}>
                            {ordersRemaining === Infinity ? '∞' : ordersRemaining}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ing.stockQuantity === 0 ? 'bg-red-55/20 text-red-650' : (ordersRemaining <= 50 ? 'bg-amber-50/50 text-amber-600' : 'bg-green-50/50 text-green-600')
                          }`}>
                            {forecastText} ({statusBadge})
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setIngredients(prev => prev.map(i => {
                                if (i.id === ing.id) {
                                  const newQty = i.stockQuantity + 100;
                                  return { ...i, stockQuantity: newQty, status: 'in_stock' };
                                }
                                return i;
                              }));
                              addAuditLog('SUPPLY_ORDER', 'Ingredient', ing.id, `Restocked 100 units of ${ing.nameEn} via depletion control panel`);
                              alert(lang === 'ar' ? `تم توريد 100 وحدة للمكون: ${ing.nameAr}` : `Restocked 100 units for: ${ing.nameEn}`);
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold transition"
                          >
                            {lang === 'ar' ? 'طلب توريد سريع' : 'Restock +100'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recipes Matrix list */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="text-right">
              <h3 className="font-extrabold text-xs text-gray-900 dark:text-white uppercase flex items-center gap-1.5 justify-start">
                <ChefHat className="w-4 h-4 text-rose-500" />
                {lang === 'ar' ? 'مصفوفة وصفات المطبخ والمواد الخام المخصصة للمنتجات' : 'Product Recipe to Raw Material Ingredient Links'}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">{lang === 'ar' ? 'تظهر هذه القائمة المواد الخام التي سيتم سحبها تلقائياً عند بيع كل صنف' : 'View the raw ingredients decremented automatically upon catalog checkout.'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
              {products.filter(p => p.tenantId === tenant.id).map(prod => {
                const prodRecipes = recipes.filter(r => r.productId === prod.id);
                return (
                  <div key={prod.id} className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl space-y-2">
                    <div className="flex items-center gap-3">
                      <img src={prod.imageUrl} alt={prod.nameEn} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="text-right">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">{lang === 'ar' ? prod.nameAr : prod.nameEn}</h4>
                        <span className="text-[9px] text-gray-400 block font-mono">SKU: {prod.sku}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100/10 pt-2 space-y-1">
                      <span className="text-[9px] font-bold text-gray-400 block">{lang === 'ar' ? 'المكونات المطلوبة للتصنيع:' : 'Recipe Ingredients:'}</span>
                      {prodRecipes.length === 0 ? (
                        <span className="text-[9px] text-gray-400 italic block">{lang === 'ar' ? 'لا توجد وصفة مدخلة (لا يستهلك مواد خام)' : 'No raw recipe items mapped.'}</span>
                      ) : (
                        prodRecipes.map((r, idx) => {
                          const ing = ingredients.find(i => i.id === r.ingredientId);
                          return (
                            <div key={idx} className="flex justify-between text-[10px] text-gray-700 dark:text-gray-300">
                              <span>• {ing ? (lang === 'ar' ? ing.nameAr : ing.nameEn) : 'Unknown Ingredient'}</span>
                              <span className="font-bold font-mono">{r.quantityRequired} {ing ? (lang === 'ar' ? ing.unitAr : ing.unitEn) : ''}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-gray-905 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-xs space-y-6 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="border-b border-gray-100/10 pb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>⚙️</span>
              {lang === 'ar' ? 'إعدادات النظام العامة' : 'General System Settings'}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">
              {lang === 'ar' ? 'التحكم في خيارات العمليات والخدمات المفعلة في المنصة' : 'Control operational features and services active on the platform'}
            </p>
          </div>

          <div className="space-y-4">
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
                    addAuditLog('TOGGLE_DELIVERY_SERVICE', 'Tenant', tenant.id, `Toggled delivery service to ${tenant.enableDelivery === false ? 'ENABLED' : 'DISABLED'}`);
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  tenant.enableDelivery !== false ? 'bg-rose-600' : 'bg-gray-200 dark:bg-gray-850'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    tenant.enableDelivery !== false ? (lang === 'ar' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>

      {/* Product Form Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">
                {editingProduct 
                  ? (lang === 'ar' ? `تعديل منتج: ${editingProduct.nameAr}` : `Edit Product: ${editingProduct.nameEn}`)
                  : (lang === 'ar' ? 'إضافة منتج جديد' : 'Create New Menu Product')}
              </h3>
              <button 
                onClick={() => setShowProductModal(false)}
                className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5 text-xs text-gray-700 text-left rtl:text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              
              {/* Product Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'اسم المنتج بالإنجليزية *' : 'Product Name (English) *'}</label>
                  <input 
                    type="text" 
                    value={prodNameEn}
                    onChange={(e) => setProdNameEn(e.target.value)}
                    placeholder="e.g. Wagyu Truffle Burger"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'اسم المنتج بالعربية *' : 'Product Name (Arabic) *'}</label>
                  <input 
                    type="text" 
                    value={prodNameAr}
                    onChange={(e) => setProdNameAr(e.target.value)}
                    placeholder="مثال: برجر واغيو بالكمأة"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition"
                    required
                  />
                </div>
              </div>

              {/* Product Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'الوصف بالإنجليزية' : 'Description (English)'}</label>
                  <textarea 
                    value={prodDescEn}
                    onChange={(e) => setProdDescEn(e.target.value)}
                    placeholder="Provide a delightful detailed description..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'الوصف بالعربية' : 'Description (Arabic)'}</label>
                  <textarea 
                    value={prodDescAr}
                    onChange={(e) => setProdDescAr(e.target.value)}
                    placeholder="اكتب وصفاً جذاباً وتفصيلياً للمنتج..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition resize-none"
                  />
                </div>
              </div>

              {/* Financial Fields */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-rose-600" />
                  {lang === 'ar' ? 'التسعير وحساب الهامش' : 'Pricing & Financial Engineering'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-600">{lang === 'ar' ? 'سعر البيع *' : 'Selling Price *'}</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-rose-600 transition font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-600">{lang === 'ar' ? 'تكلفة الإنتاج *' : 'Cost of Goods *'}</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={prodCost}
                      onChange={(e) => setProdCost(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-rose-600 transition font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-400">{lang === 'ar' ? 'صافي الربح المتوقع' : 'Expected Profit'}</label>
                    <div className="w-full px-3 py-2 border border-gray-100 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-center">
                      {computedProfit.toFixed(2)} {tenant.currencyEn}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-gray-400">{lang === 'ar' ? 'هامش الربح (%)' : 'Profit Margin (%)'}</label>
                    <div className="w-full px-3 py-2 border border-gray-100 rounded-lg bg-green-50 text-green-700 font-bold text-center">
                      {computedMargin.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Sourcing & Categories & Inventory */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'فئة المنتج المحددة *' : 'Target Category *'}</label>
                  <select 
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition text-gray-600"
                    required
                  >
                    {tenantCategories.map(c => (
                      <option key={c.id} value={c.id}>{lang === 'ar' ? c.nameAr : c.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">SKU / Code *</label>
                  <input 
                    type="text" 
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'الباركود' : 'Barcode EAN'}</label>
                  <input 
                    type="text" 
                    value={prodBarcode}
                    onChange={(e) => setProdBarcode(e.target.value)}
                    placeholder="e.g. 6281100..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition font-mono"
                  />
                </div>
              </div>

              {/* Nutrition & Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'السعرات الحرارية' : 'Total Calories'}</label>
                  <input 
                    type="number" 
                    value={prodCalories}
                    onChange={(e) => setProdCalories(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'وقت التحضير (بالدقائق)' : 'Preparation Time (Minutes)'}</label>
                  <input 
                    type="number" 
                    value={prodPrepTime}
                    onChange={(e) => setProdPrepTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'تتبع كمية المخزون' : 'Active Stock Tracking'}</label>
                  <div className="flex items-center gap-3 py-1.5">
                    <input 
                      type="checkbox" 
                      id="trackStock"
                      checked={prodTrackStock}
                      onChange={(e) => setProdTrackStock(e.target.checked)}
                      className="rounded accent-rose-600 w-4 h-4"
                    />
                    <label htmlFor="trackStock" className="text-gray-500 font-medium">
                      {lang === 'ar' ? 'تفعيل جرد المستودع' : 'Track stock levels'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Image & Video Upload Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="font-semibold text-gray-700 block">{lang === 'ar' ? 'صورة المنتج' : 'Product Image'}</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={prodImageUrl}
                      onChange={(e) => setProdImageUrl(e.target.value)}
                      placeholder="/tenants/meatport/assets/products/..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMediaGallery(true)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      <Layers className="w-4 h-4" />
                      {lang === 'ar' ? 'معرض الصور' : 'Browse Gallery'}
                    </button>
                    <label className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-4 h-4" />
                      {lang === 'ar' ? 'رفع صورة' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProductImageUpload}
                      />
                    </label>
                  </div>
                  <span className="text-[10px] text-gray-400 block">{lang === 'ar' ? 'يمكنك تحديد صورة من معرض الأكل المحلي، أو رفع ملف صورة جديدة مباشرة.' : 'Select a food photo from the local gallery or upload a new photo directly.'}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'رابط فيديو للمنتج (اختياري)' : 'Promo Video URL (Optional)'}</label>
                  <input 
                    type="text" 
                    value={prodVideoUrl}
                    onChange={(e) => setProdVideoUrl(e.target.value)}
                    placeholder="https://assets.mixkit.co/..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition text-xs"
                  />
                </div>
              </div>

              {/* Sizes / Product Variants builder */}
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <Shuffle className="w-4 h-4 text-rose-600" />
                  {lang === 'ar' ? 'أحجام وخيارات المنتج الإضافية' : 'Product Sizes & Pricing Variations'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <input 
                    type="text" 
                    placeholder={lang === 'ar' ? 'الحجم بالإنجليزية (مثال: Medium)' : 'Size EN (e.g. Large)'}
                    value={newSizeNameEn}
                    onChange={(e) => setNewSizeNameEn(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-200 rounded bg-white text-xs"
                  />
                  <input 
                    type="text" 
                    placeholder={lang === 'ar' ? 'الحجم بالعربية (مثال: وسط)' : 'Size AR (e.g. كبير)'}
                    value={newSizeNameAr}
                    onChange={(e) => setNewSizeNameAr(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-200 rounded bg-white text-xs"
                  />
                  <input 
                    type="number" 
                    placeholder={lang === 'ar' ? 'فرق السعر (مثال: +10)' : 'Price Diff (e.g. +15)'}
                    value={newSizePriceDiff}
                    onChange={(e) => setNewSizePriceDiff(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-200 rounded bg-white text-xs"
                  />
                  <button 
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 py-1.5 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700 transition"
                  >
                    {lang === 'ar' ? 'أضف الحجم' : 'Add Option'}
                  </button>
                </div>

                {prodSizes.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {prodSizes.map((size, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 text-[11px]">
                        <span className="font-semibold text-gray-700">{size.nameEn} | {size.nameAr}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-rose-600">+{size.priceDifference.toFixed(2)} {tenant.currencyEn}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSize(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modifiers & Multi-Select lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'ربط مجموعات المعدلات' : 'Link Modifier Groups'}</label>
                  <div className="p-3 border border-gray-200 rounded-lg max-h-32 overflow-y-auto space-y-2 bg-white">
                    {modifierGroups.filter(mg => mg.tenantId === tenant.id).map(mg => (
                      <label key={mg.id} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={prodModifierGroupIds.includes(mg.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProdModifierGroupIds([...prodModifierGroupIds, mg.id]);
                            } else {
                              setProdModifierGroupIds(prodModifierGroupIds.filter(id => id !== mg.id));
                            }
                          }}
                          className="rounded accent-rose-600"
                        />
                        <span>{lang === 'ar' ? mg.nameAr : mg.nameEn}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">{lang === 'ar' ? 'مسببات الحساسية' : 'Allergen Tags'}</label>
                  <div className="grid grid-cols-2 gap-2 p-3 border border-gray-200 rounded-lg bg-white">
                    {['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Seafood', 'Soy', 'Mustard'].map(allergen => (
                      <label key={allergen} className="flex items-center gap-2 cursor-pointer text-xs">
                        <input 
                          type="checkbox"
                          checked={prodAllergens.includes(allergen)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProdAllergens([...prodAllergens, allergen]);
                            } else {
                              setProdAllergens(prodAllergens.filter(a => a !== allergen));
                            }
                          }}
                          className="rounded accent-rose-600"
                        />
                        <span>{allergen}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Marketing flags */}
              <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="rounded accent-rose-600"
                  />
                  <span className="font-semibold text-gray-700">{lang === 'ar' ? 'منتج مميز (Featured)' : 'Featured Item'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={prodRecommended}
                    onChange={(e) => setProdRecommended(e.target.checked)}
                    className="rounded accent-rose-600"
                  />
                  <span className="font-semibold text-gray-700">{lang === 'ar' ? 'موصى به (Recommended)' : 'Recommended'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={prodPopular}
                    onChange={(e) => setProdPopular(e.target.checked)}
                    className="rounded accent-rose-600"
                  />
                  <span className="font-semibold text-gray-700">{lang === 'ar' ? 'شائع الاستخدام (Popular)' : 'Popular / Bestseller'}</span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
                <button 
                  type="button" 
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-semibold text-gray-500 hover:bg-gray-50 transition"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition shadow-sm"
                >
                  {lang === 'ar' ? 'حفظ التغييرات' : 'Save Product Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">
                {editingCategory 
                  ? (lang === 'ar' ? 'تعديل الفئة' : 'Edit Category')
                  : (lang === 'ar' ? 'إضافة فئة جديدة' : 'Create Category')}
              </h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs text-left rtl:text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700">{lang === 'ar' ? 'اسم الفئة بالإنجليزية *' : 'Category Title EN *'}</label>
                <input 
                  type="text" 
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
                  placeholder="e.g. Beverages"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700">{lang === 'ar' ? 'اسم الفئة بالعربية *' : 'Category Title AR *'}</label>
                <input 
                  type="text" 
                  value={catNameAr}
                  onChange={(e) => setCatNameAr(e.target.value)}
                  placeholder="مثال: المشروبات"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700">{lang === 'ar' ? 'الوصف بالإنجليزية' : 'Description EN'}</label>
                <textarea 
                  value={catDescEn}
                  onChange={(e) => setCatDescEn(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700">{lang === 'ar' ? 'الوصف بالعربية' : 'Description AR'}</label>
                <textarea 
                  value={catDescAr}
                  onChange={(e) => setCatDescAr(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700">{lang === 'ar' ? 'رابط صورة للفئة' : 'Category Cover Image URL'}</label>
                <input 
                  type="text" 
                  value={catImageUrl}
                  onChange={(e) => setCatImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 mt-5">
                <button 
                  type="button" 
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition"
                >
                  {lang === 'ar' ? 'حفظ الفئة' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Gallery / Image Library Modal Overlay */}
      {showMediaGallery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-rose-50/50">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  {lang === 'ar' ? 'معرض صور الأكل' : 'Food Media Library'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowMediaGallery(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Images */}
                <div className="relative w-full sm:w-72">
                  <input 
                    type="text" 
                    placeholder={lang === 'ar' ? 'بحث في الصور...' : 'Search images...'}
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-rose-600 text-sm transition"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400">
                    <ListFilter className="w-4 h-4" />
                  </span>
                </div>

                {/* Quick upload in gallery */}
                <label className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  {lang === 'ar' ? 'رفع صورة جديدة للمعرض' : 'Upload New Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProductImageUpload}
                  />
                </label>
              </div>

              {/* Gallery Grid */}
              {galleryLoading ? (
                <div className="py-12 flex justify-center items-center">
                  <Activity className="w-8 h-8 text-rose-600 animate-spin" />
                </div>
              ) : filteredGalleryImages.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  {lang === 'ar' ? 'لا توجد صور مطابقة لبحثك' : 'No images match your search'}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                  {filteredGalleryImages.map((imgUrl, i) => {
                    const fileName = imgUrl.split('/').pop() || '';
                    const isSelected = prodImageUrl === imgUrl;
                    return (
                      <div 
                        key={i}
                        onClick={() => {
                          setProdImageUrl(imgUrl);
                          setShowMediaGallery(false);
                        }}
                        className={`group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition hover:scale-[1.02] shadow-sm hover:shadow-md ${
                          isSelected ? 'border-rose-600 ring-2 ring-rose-100' : 'border-gray-200 hover:border-rose-300'
                        }`}
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
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <div>
                {lang === 'ar' 
                  ? `إجمالي الصور المتوفرة: ${galleryImages.length} صورة` 
                  : `Total available images: ${galleryImages.length} photos`}
              </div>
              <button
                type="button"
                onClick={() => setShowMediaGallery(false)}
                className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-lg font-semibold text-gray-700 transition"
              >
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
