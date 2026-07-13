import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Flame, Clock, Plus, Minus, Share2, Heart, Info, AlertCircle, 
  ChevronRight, ShoppingBag, X, Check, Star, Moon, Sun, Languages,
  Phone, MapPin, MessageCircle, Facebook, Instagram, Menu, LayoutGrid, List, Mail, Globe
} from 'lucide-react';
import { Product, Category, ModifierGroup, Tenant, Branch } from '../types';

const SaudiRiyalIcon = ({ className = "h-[0.8em] w-auto inline-block align-middle ml-1" }: { className?: string }) => {
  return (
    <svg className={className} viewBox="0 0 1124.14 1256.39" fill="currentColor" style={{ height: '0.9em', verticalAlign: 'middle' }}>
      <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
      <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
    </svg>
  );
};

const highlightText = (text: string, highlight: string) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\interface DigitalMenuProps {')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) 
          ? <mark key={i} className="bg-amber-500/25 text-amber-600 rounded px-0.5 dark:bg-amber-500/35 dark:text-amber-400 font-extrabold">{part}</mark> 
          : part
      )}
    </span>
  );
};

interface DigitalMenuProps {
  tenant: Tenant;
  branches: Branch[];
  products: Product[];
  categories: Category[];
  modifierGroups: ModifierGroup[];
  lang: 'en' | 'ar';
  setLang: (l: 'en' | 'ar') => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  onPlaceOrder: (
    orderMetadata: {
      receiptNumber: string;
      customerName?: string;
      customerType: 'dine_in' | 'takeaway' | 'delivery';
      paymentMethod: 'cash' | 'card' | 'apple_pay' | 'online';
      subtotal: number;
      discountAmount: number;
      taxAmount: number;
      total: number;
      source: 'DigitalMenu' | 'POS';
      tableNumber?: string;
      customerPhone?: string;
      deliveryAddress?: string;
    },
    items: {
      productId: string;
      productNameEn: string;
      productNameAr: string;
      sizeNameEn?: string;
      sizeNameAr?: string;
      pricePerItem: number;
      quantity: number;
      modifiers: {
        nameEn: string;
        nameAr: string;
        price: number;
      }[];
    }[]
  ) => void;
}

export default function DigitalMenu({
  tenant,
  branches,
  products,
  categories,
  modifierGroups,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  onPlaceOrder
}: DigitalMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search utility states
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  const placeholdersAr = useMemo(() => ['ستيك تندرلوين طازج...', 'كباب لحم مشوي عالتيس...', 'سلطات مشكلة ولذيذة...', 'مقبلات ساخنة وبطاطس مقرمشة...', 'أطباق خاصة وكرات اللحم...'], []);
  const placeholdersEn = useMemo(() => ['Fresh tenderloin steak...', 'Grilled meat kebab...', 'Crispy fresh salads...', 'Hot appetizers & fries...', 'Meatport special meatballs...'], []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholdersAr.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [placeholdersAr.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Design layout configuration
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Dialog selection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Custom states inside dialog
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>({}); // mgId -> modifierIds
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Order checkout details states
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Redirect orderType if delivery is disabled
  useEffect(() => {
    if (tenant.enableDelivery === false && orderType === 'delivery') {
      setOrderType('dine_in');
    }
  }, [tenant.enableDelivery, orderType]);

  // Simple cart state
  const [cart, setCart] = useState<{
    id: string;
    product: Product;
    sizeName?: string;
    modifiersList: { nameEn: string; nameAr: string; price: number }[];
    pricePerItem: number;
    quantity: number;
  }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Toggle favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  // Share menu link
  const handleShare = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = lang === 'ar' 
      ? `شاهد ${product.nameAr} في ${tenant.nameAr}!`
      : `Check out ${product.nameEn} at ${tenant.nameEn}!`;
    if (navigator.share) {
      navigator.share({
        title: product.nameEn,
        text: shareText,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(lang === 'ar' ? 'تم نسخ رابط القائمة!' : 'Menu link copied to clipboard!');
    }
  };

  // Filtered Categories & Products for active Tenant
  const tenantCategories = useMemo(() => {
    return categories.filter(c => c.tenantId === tenant.id && c.isVisible);
  }, [categories, tenant]);

  const productCountByCategory = useMemo(() => {
    return products
      .filter(p => p.tenantId === tenant.id && p.isVisible)
      .reduce<Record<string, number>>((counts, product) => {
        counts[product.categoryId] = (counts[product.categoryId] || 0) + 1;
        return counts;
      }, {});
  }, [products, tenant]);

  const tenantProducts = useMemo(() => {
    const activeProducts = products.filter(p => p.tenantId === tenant.id && p.isVisible);
    
    if (!searchQuery.trim()) {
      return activeProducts.filter(p => selectedCategory === 'all' || p.categoryId === selectedCategory);
    }
    
    const query = searchQuery.toLowerCase().trim();
    
    // Fuzzy Scoring: compute score and filter matching items
    return activeProducts
      .map(p => {
        let score = 0;
        const nameEn = p.nameEn.toLowerCase();
        const nameAr = p.nameAr;
        const descEn = (p.descriptionEn || '').toLowerCase();
        const descAr = p.descriptionAr || '';
        
        // Exact name match (highest)
        if (nameEn === query || nameAr === query) score += 100;
        // Starts with match
        else if (nameEn.startsWith(query) || nameAr.startsWith(query)) score += 80;
        // Word boundary match
        else if (nameEn.includes(' ' + query) || nameAr.includes(' ' + query)) score += 60;
        // Substring name match
        else if (nameEn.includes(query) || nameAr.includes(query)) score += 40;
        
        // Description match (lower weight)
        if (descEn.includes(query) || descAr.includes(query)) score += 20;
        
        return { product: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .filter(p => selectedCategory === 'all' || p.categoryId === selectedCategory);
  }, [products, tenant, selectedCategory, searchQuery]);

  const selectedCategoryInfo = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return tenantCategories.find(category => category.id === selectedCategory) || null;
  }, [selectedCategory, tenantCategories]);

  const featuredProducts = useMemo(() => {
    return products.filter(p => p.tenantId === tenant.id && p.isVisible && p.isFeatured);
  }, [products, tenant]);

  const getCategoryVisual = (category?: Category) => {
    const key = `${category?.id || ''} ${category?.nameEn || ''} ${category?.nameAr || ''}`.toLowerCase();

    if (!category) {
      return { icon: '🍽️', glow: 'from-rose-500 to-red-700', ring: 'shadow-rose-500/30' };
    }
    if (key.includes('steak')) return { icon: '🥩', glow: 'from-red-600 to-stone-950', ring: 'shadow-red-500/30' };
    if (key.includes('kebab')) return { icon: '🍢', glow: 'from-orange-500 to-red-800', ring: 'shadow-orange-500/30' };
    if (key.includes('meatball')) return { icon: '🧆', glow: 'from-amber-600 to-red-800', ring: 'shadow-amber-500/30' };
    if (key.includes('meat port') || key.includes('menu')) return { icon: '👨‍🍳', glow: 'from-rose-600 to-slate-950', ring: 'shadow-rose-500/30' };
    if (key.includes('meat') || key.includes('grill')) return { icon: '🔥', glow: 'from-red-500 to-orange-900', ring: 'shadow-red-500/30' };
    if (key.includes('meze') || key.includes('mezze')) return { icon: '🥙', glow: 'from-emerald-500 to-teal-900', ring: 'shadow-emerald-500/30' };
    if (key.includes('hot') || key.includes('appetizer')) return { icon: '🍟', glow: 'from-yellow-500 to-orange-800', ring: 'shadow-yellow-500/30' };
    if (key.includes('salad')) return { icon: '🥗', glow: 'from-lime-500 to-emerald-800', ring: 'shadow-lime-500/30' };
    if (key.includes('special')) return { icon: '⭐', glow: 'from-yellow-400 to-rose-700', ring: 'shadow-yellow-500/30' };
    if (key.includes('shawarma')) return { icon: '🌯', glow: 'from-amber-500 to-orange-900', ring: 'shadow-amber-500/30' };
    if (key.includes('burger')) return { icon: '🍔', glow: 'from-orange-500 to-stone-900', ring: 'shadow-orange-500/30' };
    if (key.includes('sauce')) return { icon: '🥣', glow: 'from-red-500 to-purple-900', ring: 'shadow-red-500/30' };
    if (key.includes('dessert') || key.includes('sweet')) return { icon: '🍰', glow: 'from-pink-400 to-fuchsia-800', ring: 'shadow-pink-500/30' };
    if (key.includes('drink') || key.includes('juice') || key.includes('beverage')) return { icon: '🍹', glow: 'from-sky-400 to-blue-800', ring: 'shadow-sky-500/30' };

    return { icon: '🍽️', glow: 'from-rose-500 to-red-800', ring: 'shadow-rose-500/30' };
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Open item modal & load initial selections
  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSizeId(product.sizes[0]?.id || '');
    setSelectedModifiers({});
    setQuantity(1);
  };

  // Handle Modifier Selections
  const handleSelectModifier = (mgId: string, modifierId: string, isRequired: boolean, maxSelect: number) => {
    setSelectedModifiers(prev => {
      const currentSelection = prev[mgId] || [];
      if (maxSelect === 1) {
        // Radio behavior
        return { ...prev, [mgId]: [modifierId] };
      } else {
        // Checkbox behavior with bounds limit
        if (currentSelection.includes(modifierId)) {
          return { ...prev, [mgId]: currentSelection.filter(id => id !== modifierId) };
        } else {
          if (currentSelection.length < maxSelect) {
            return { ...prev, [mgId]: [...currentSelection, modifierId] };
          }
          return prev;
        }
      }
    });
  };

  // Calculate dynamic pricing inside dialog
  const calculatedDialogPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    let price = selectedProduct.price;

    // Size adjustment
    const activeSize = selectedProduct.sizes.find(s => s.id === selectedSizeId);
    if (activeSize) {
      price += activeSize.priceDifference;
    }

    // Modifiers adjustment
    Object.keys(selectedModifiers).forEach(mgId => {
      const modIds = selectedModifiers[mgId] || [];
      const group = modifierGroups.find(mg => mg.id === mgId);
      if (group) {
        modIds.forEach(mId => {
          const mod = group.modifiers.find(m => m.id === mId);
          if (mod) price += mod.price;
        });
      }
    });

    // Discount promo rate
    if (selectedProduct.discountRate > 0) {
      price = price * (1 - selectedProduct.discountRate);
    }

    return price * quantity;
  }, [selectedProduct, selectedSizeId, selectedModifiers, quantity, modifierGroups]);

  // Add Item to cart
  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Validate required modifier groups
    const missingGroupIds: string[] = [];
    selectedProduct.modifierGroupIds.forEach(mgId => {
      const group = modifierGroups.find(mg => mg.id === mgId);
      if (group && group.isRequired) {
        const selection = selectedModifiers[mgId] || [];
        if (selection.length < group.minSelect) {
          missingGroupIds.push(mgId);
        }
      }
    });

    if (missingGroupIds.length > 0) {
      const firstMissing = modifierGroups.find(mg => mg.id === missingGroupIds[0]);
      alert(lang === 'ar' 
        ? `يرجى اختيار ميزة مطلوبة لـ: ${firstMissing?.nameAr}` 
        : `Please complete required choices for: ${firstMissing?.nameEn}`);
      return;
    }

    const sizeOpt = selectedProduct.sizes.find(s => s.id === selectedSizeId);
    const selectedModsFlat: { nameEn: string; nameAr: string; price: number }[] = [];

    Object.keys(selectedModifiers).forEach(mgId => {
      const modIds = selectedModifiers[mgId] || [];
      const group = modifierGroups.find(mg => mg.id === mgId);
      if (group) {
        modIds.forEach(mId => {
          const mod = group.modifiers.find(m => m.id === mId);
          if (mod) {
            selectedModsFlat.push({
              nameEn: mod.nameEn,
              nameAr: mod.nameAr,
              price: mod.price
            });
          }
        });
      }
    });

    const itemPrice = calculatedDialogPrice / quantity;

    setCart(prev => [
      ...prev,
      {
        id: `cart-item-${Date.now()}`,
        product: selectedProduct,
        sizeName: sizeOpt ? (lang === 'ar' ? sizeOpt.nameAr : sizeOpt.nameEn) : undefined,
        modifiersList: selectedModsFlat,
        pricePerItem: itemPrice,
        quantity
      }
    ]);

    setSelectedProduct(null);
    if (window.innerWidth >= 768) {
      setShowCartDrawer(true);
    }
  };

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.pricePerItem * item.quantity), 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    // 15% VAT for Meatport, 5% for Pizza Al-Forno
    const rate = tenant.id === 't-1' ? 0.15 : 0.05;
    return cartSubtotal * rate;
  }, [cartSubtotal, tenant]);

  const cartTotal = cartSubtotal + taxAmount;

  return (
    <div 
      className={`min-h-screen font-sans transition-colors duration-300 ${
        darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50/50 text-gray-800'
      }`} 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --tenant-primary: ${tenant.primaryColor || '#e11d48'};
        }
        .text-rose-600 { color: var(--tenant-primary) !important; }
        .text-rose-500 { color: var(--tenant-primary) !important; }
        .bg-rose-600 { background-color: var(--tenant-primary) !important; }
        .bg-rose-500 { background-color: var(--tenant-primary) !important; }
        .hover\\:bg-rose-700:hover { filter: brightness(0.9) !important; }
        .hover\\:bg-rose-600:hover { filter: brightness(0.9) !important; }
        .border-rose-600 { border-color: var(--tenant-primary) !important; }
        .border-rose-500 { border-color: var(--tenant-primary) !important; }
        .bg-rose-5 { background-color: ${tenant.primaryColor || '#e11d48'}1a !important; }
        .text-rose-900 { color: var(--tenant-primary) !important; }
        .hover\\:text-rose-400:hover { color: var(--tenant-primary) !important; }
        .focus\\:border-rose-600:focus { border-color: var(--tenant-primary) !important; }
        .focus\\:ring-rose-600:focus { --tw-ring-color: var(--tenant-primary) !important; }
        
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s infinite ease-in-out;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />
      
      {/* Standalone Responsive Website Sticky Header */}
      <nav className={`sticky top-0 z-45 w-full px-4 sm:px-6 py-3.5 shadow-sm border-b transition-colors duration-300 ${
        darkMode ? 'bg-gray-900/95 border-gray-800 backdrop-blur-md text-white' : 'bg-white/95 border-gray-100 backdrop-blur-md text-gray-800'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2.5">
            <img 
              src={tenant.logoUrl} 
              alt={tenant.nameEn} 
              className="w-10 h-10 rounded-xl object-cover border border-gray-250 shadow-xs bg-white"
              referrerPolicy="no-referrer"
            />
            <div className="text-right">
              <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none mb-0.5">
                {lang === 'ar' ? tenant.nameAr : tenant.nameEn}
              </h1>
              <p className="text-[8px] sm:text-[9px] text-gray-400 flex items-center gap-1 font-bold leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {lang === 'ar' ? 'مفتوح للطلبات الآن' : 'Open for orders now'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-500 dark:text-gray-400">
            <a href="#hero" className="hover:text-[var(--tenant-primary)] transition">{lang === 'ar' ? 'الرئيسية' : 'Home'}</a>
            <a href="#menu" className="hover:text-[var(--tenant-primary)] transition">{lang === 'ar' ? 'قائمة الطعام' : 'Menu'}</a>
            {featuredProducts.length > 0 && (
              <a href="#featured" className="hover:text-[var(--tenant-primary)] transition">{lang === 'ar' ? 'توصيات الشيف' : 'Chef’s Specials'}</a>
            )}
            <a href="#footer" className="hover:text-[var(--tenant-primary)] transition">{lang === 'ar' ? 'اتصل بنا' : 'Contact'}</a>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2">
            
            {/* Desktop Direct Call Support Link */}
            {tenant.phone && (
              <a 
                href={`tel:${tenant.phone}`} 
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black bg-emerald-500/5 hover:bg-emerald-500/10 transition leading-none"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{tenant.phone}</span>
              </a>
            )}

            {/* Language Switcher (Desktop Only) */}
            <button 
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className={`hidden md:block text-[9px] font-extrabold uppercase px-2.5 py-1.5 rounded-lg border transition ${
                darkMode 
                  ? 'border-gray-800 text-gray-300 hover:text-white hover:bg-gray-850' 
                  : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>

            {/* Dark Mode toggle (Desktop Only) */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`hidden md:block p-1.5 rounded-lg border transition ${
                darkMode 
                  ? 'border-gray-800 text-gray-300 hover:text-yellow-400 hover:bg-gray-850' 
                  : 'border-gray-200 text-gray-600 hover:text-yellow-500 hover:bg-gray-50'
              }`}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button 
              onClick={() => setShowCartDrawer(true)}
              className="relative p-2.5 rounded-lg bg-[var(--tenant-primary)] hover:opacity-95 text-white transition shadow-sm flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-600 text-[8px] font-bold text-white flex items-center justify-center animate-bounce shadow-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Hamburger Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className={`p-2 rounded-lg border transition md:hidden ${
                darkMode 
                  ? 'border-gray-800 text-gray-300 hover:bg-gray-850' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Menu className="w-4 h-4" />
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Hamburger Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className={`w-72 h-full shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 transform translate-x-0 ${
            darkMode ? 'bg-gray-900 text-gray-100 border-l border-gray-850' : 'bg-white text-gray-800 border-l border-gray-100'
          }`}>
            <div className="space-y-6">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <img 
                    src={tenant.logoUrl} 
                    alt={tenant.nameEn} 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span className="text-xs font-black">{lang === 'ar' ? tenant.nameAr : tenant.nameEn}</span>
                </div>
                <button 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg border dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Stacked Navigation Links */}
              <div className="flex flex-col gap-3 text-right">
                <a 
                  href="#hero" 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-xs font-extrabold py-2 px-3 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 transition"
                >
                  {lang === 'ar' ? 'الرئيسية' : 'Home'}
                </a>
                <a 
                  href="#menu" 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-xs font-extrabold py-2 px-3 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 transition"
                >
                  {lang === 'ar' ? 'منيو الطعام' : 'Menu'}
                </a>
                {featuredProducts.length > 0 && (
                  <a 
                    href="#featured" 
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="text-xs font-extrabold py-2 px-3 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 transition"
                  >
                    {lang === 'ar' ? 'توصيات الشيف' : 'Chef Specials'}
                  </a>
                )}
                <a 
                  href="#footer" 
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-xs font-extrabold py-2 px-3 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 transition"
                >
                  {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                </a>
              </div>

              {/* Direct Call / Contact Options */}
              <div className="space-y-3 pt-4 border-t dark:border-gray-800 text-right">
                <h5 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider">
                  {lang === 'ar' ? 'اتصال مباشر وسريع' : 'Quick Actions'}
                </h5>
                <a 
                  href={`tel:${tenant.phone}`}
                  className="flex items-center justify-center gap-2.5 p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-black transition border border-blue-500/15"
                >
                  <Phone className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'اتصال هاتفي بالفروع' : 'Call Phone'}</span>
                </a>
                <a 
                  href={`https://wa.me/${tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '966500000000'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black transition border border-emerald-500/15"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'راسلنا واتساب' : 'WhatsApp Us'}</span>
                </a>
              </div>
            </div>

            {/* Controls at bottom of drawer */}
            <div className="space-y-4 pt-4 border-t dark:border-gray-800">
              {/* Language Switcher Grid */}
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => { setLang(lang === 'en' ? 'ar' : 'en'); setIsMobileDrawerOpen(false); }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border dark:border-gray-850 text-[10px] font-black"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === 'en' ? 'العربية' : 'English'}</span>
                </button>
                <button 
                  onClick={() => { setDarkMode(!darkMode); setIsMobileDrawerOpen(false); }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border dark:border-gray-850 text-[10px] font-black"
                >
                  {darkMode ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{darkMode ? (lang === 'ar' ? 'نهاري' : 'Light') : (lang === 'ar' ? 'ليلي' : 'Dark')}</span>
                </button>
              </div>

              {/* Working hours display */}
              <div className="text-[9px] text-gray-400 flex items-center justify-center gap-1 font-bold">
                <Clock className="w-3 h-3 text-[var(--tenant-primary)] animate-pulse" />
                <span>{lang === 'ar' ? 'ساعات العمل: ١٢ ظهراً - ١٢ ليلاً' : 'Hours: 12 PM - 12 AM'}</span>
              </div>
            </div>
          </div>
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setIsMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Brand Hero Banner */}
      <div 
        id="hero"
        className="relative h-56 md:h-64 bg-cover bg-center overflow-hidden flex items-end"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url(${
            tenant.id === 't-1' 
              ? 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1600&q=80' 
              : 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600&q=80'
          })` 
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-6 pb-6 flex items-center gap-4">
          <div className="text-right">
            <span className="text-[8px] font-bold uppercase tracking-wider text-white bg-[var(--tenant-primary)] px-2.5 py-0.5 rounded-full inline-block">
              {lang === 'ar' ? 'أفضل المأكولات الطازجة' : 'PREMIUM FOOD EXPERIENCE'}
            </span>
            <h2 className="text-lg md:text-xl font-black text-white tracking-tight mt-1.5">
              {lang === 'ar' ? `مرحباً بك في ${tenant.nameAr}` : `Welcome to ${tenant.nameEn}`}
            </h2>
            <p className="text-[9px] md:text-xs text-gray-300 mt-1 max-w-xl leading-relaxed font-medium">
              {lang === 'ar' 
                ? 'نقدّم لكم أشهى الوجبات المجهزة يدوياً وبأعلى معايير الجودة والطهو الإيطالي والشرقي الفاخر، باستخدام الخضروات واللحوم الطازجة يومياً.' 
                : 'Indulge in our carefully crafted menu, prepared fresh daily by premium chefs using locally sourced fresh ingredients and traditional recipes.'}
            </p>
            <div className="mt-2.5 flex items-center gap-2.5 text-[8px] text-gray-400 font-semibold">
              <span>⏰ {lang === 'ar' ? '١٢ ظهراً - ١٢ ليلاً' : '12 PM - 12 AM'}</span>
              <span>•</span>
              <span>📍 {lang === 'ar' ? 'الفرع الرئيسي' : 'Main Hub Branch'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Body */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Search bar & utilities */}
        <div className="relative max-w-xl mx-auto space-y-3.5">
          {/* Creative Search Bar */}
          <div className="relative group">
            {/* Ambient background glow on focus/hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition duration-300 pointer-events-none" />
            
            <div className="relative">
              <Search className={`absolute top-4 left-4 w-4.5 h-4.5 transition-colors duration-300 ${searchQuery ? 'text-rose-500' : 'text-gray-400'}`} />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder={lang === 'ar' ? placeholdersAr[placeholderIndex] : placeholdersEn[placeholderIndex]}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-3.5 pl-11 pr-16 text-sm rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
                  darkMode 
                    ? 'bg-gray-900/90 border-gray-800 text-gray-100 placeholder-gray-500 focus:border-rose-500' 
                    : 'bg-white/95 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-rose-500 shadow-sm'
                }`}
              />
              
              {/* Keyboard Shortcut Indicator & Clear Button */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery ? (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title={lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[9px] font-black text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200/80 dark:border-gray-700/80 leading-none">
                    <span>⌘</span>
                    <span>K</span>
                  </kbd>
                )}
              </div>
            </div>
          </div>
          
          {/* Creative suggestion tags / chips under search input */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 transition-all duration-300">
            <span>{lang === 'ar' ? 'بحث سريع:' : 'Quick search:'}</span>
            {['ستيك 🥩', 'كباب 🍢', 'لحوم 🔥', 'مقبلات 🍟', 'سلطة 🥗', 'كرات اللحم 🧆'].map(tag => {
              const term = tag.split(' ')[0]; // extract steak/kebab/meat/salad
              return (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(term)}
                  className="px-2.5 py-1 rounded-full border border-gray-200/60 dark:border-gray-800/80 bg-white/40 dark:bg-gray-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-300 cursor-pointer"
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Search Result Count Indicator */}
          {searchQuery && (
            <div className="text-center text-xs font-semibold text-rose-500 animate-fade-in flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>
                {lang === 'ar' 
                  ? `تم العثور على ${tenantProducts.length} منتجات مطابقة` 
                  : `Found ${tenantProducts.length} matching items`}
              </span>
            </div>
          )}
        </div>
        {/* Two-Column Sidebar Layout */}
        <div className="flex flex-row gap-4 md:gap-6 items-start relative select-none">
          
          {/* Categories Sidebar */}
          <aside className="w-20 sm:w-24 md:w-64 shrink-0 sticky top-[78px] z-30 max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar space-y-4">
            
            {/* Desktop Sidebar Title */}
            <div className="hidden md:block px-2">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">
                {lang === 'ar' ? 'الفئات' : 'Categories'}
              </p>
              <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {lang === 'ar' ? 'اسحب واختار القسم' : 'Choose Category'}
              </h4>
            </div>
            
            {/* Categories container */}
            <div className="flex flex-col gap-2.5">
              
              {/* All Items Button */}
              <button
                onClick={() => handleCategorySelect('all')}
                className={`group relative rounded-2xl border p-2 md:p-3 text-center md:text-right transition-all duration-300 flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'border-transparent bg-gradient-to-br from-rose-600 to-red-800 text-white shadow-lg shadow-rose-500/25'
                    : darkMode 
                      ? 'border-white/10 bg-gray-900/80 text-gray-200 hover:border-rose-500/50' 
                      : 'border-gray-200 bg-white text-gray-900 hover:border-rose-200 hover:shadow-md'
                }`}
              >
                <div className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl text-lg md:text-xl transition duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-white/20'
                    : 'bg-rose-500/10 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                }`}>
                  🍽️
                </div>
                <div className="min-w-0 md:text-right">
                  <span className="block text-[10px] md:text-xs font-black truncate w-full md:w-auto">
                    {lang === 'ar' ? 'كل الوجبات' : 'All Items'}
                  </span>
                  <span className={`hidden md:block text-[9px] font-bold ${selectedCategory === 'all' ? 'text-white/75' : 'text-gray-400'}`}>
                    {products.filter(p => p.tenantId === tenant.id && p.isVisible).length} {lang === 'ar' ? 'صنف' : 'items'}
                  </span>
                </div>
              </button>

              {/* Dynamic Categories Map */}
              {tenantCategories.map(c => {
                const visual = getCategoryVisual(c);
                const isSelected = selectedCategory === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => handleCategorySelect(c.id)}
                    className={`group relative rounded-2xl border p-2 md:p-3 text-center md:text-right transition-all duration-300 flex flex-col md:flex-row items-center gap-2 md:gap-3 w-full cursor-pointer ${
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${visual.glow} text-white shadow-lg ${visual.ring}`
                        : darkMode 
                          ? 'border-white/10 bg-gray-900/80 text-gray-200 hover:border-rose-500/50' 
                          : 'border-gray-200 bg-white text-gray-900 hover:border-rose-200 hover:shadow-md'
                    }`}
                  >
                    <div className={`flex h-9 w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-xl text-lg md:text-xl transition duration-300 ${
                      isSelected ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {visual.icon}
                    </div>
                    <div className="min-w-0 md:text-right w-full">
                      <span className="block text-[10px] md:text-xs font-black truncate w-full md:w-auto">
                        {lang === 'ar' ? c.nameAr : c.nameEn}
                      </span>
                      <span className={`hidden md:block text-[9px] font-bold ${isSelected ? 'text-white/75' : 'text-gray-400'}`}>
                        {productCountByCategory[c.id] || 0} {lang === 'ar' ? 'صنف' : 'items'}
                      </span>
                    </div>
                  </button>
                );
              })}

            </div>
          </aside>

          {/* Main Content Column */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Products Grid Deck */}
            <div className="flex items-center justify-between gap-3 rounded-3xl border border-gray-100 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-gray-900/60">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
                  {lang === 'ar' ? 'القسم الحالي' : 'Current Category'}
                </p>
                <h4 className="mt-1 text-base font-black text-gray-900 dark:text-white">
                  {selectedCategoryInfo
                    ? (lang === 'ar' ? selectedCategoryInfo.nameAr : selectedCategoryInfo.nameEn)
                    : (lang === 'ar' ? 'كل الوجبات' : 'All Items')}
                </h4>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-black text-white shadow-lg shadow-rose-500/20">
                  {tenantProducts.length} {lang === 'ar' ? 'منتج' : 'items'}
                </span>
                
                {/* View Switcher toggle */}
                <div className="flex items-center gap-1 border rounded-xl p-1 bg-white dark:bg-gray-900 border-gray-200/50 dark:border-gray-800 shrink-0 shadow-xs">
                  <button 
                    onClick={() => setLayoutMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      layoutMode === 'grid' 
                        ? 'bg-[var(--tenant-primary)] text-white shadow-xs' 
                        : 'text-gray-650 hover:text-gray-855'
                    }`}
                    title={lang === 'ar' ? 'عرض شبكي' : 'Grid View'}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setLayoutMode('list')}
                    className={`p-1.5 rounded-lg transition ${
                      layoutMode === 'list' 
                        ? 'bg-[var(--tenant-primary)] text-white shadow-xs' 
                        : 'text-gray-650 hover:text-gray-855'
                    }`}
                    title={lang === 'ar' ? 'عرض طولي مضغوط' : 'List View'}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Loop */}
            {layoutMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                 {tenantProducts.map(p => {
              const isFav = favorites.includes(p.id);
              return (
                <div 
                  key={p.id}
                  onClick={() => handleOpenProduct(p)}
                  className={`product-card group rounded-[2rem] overflow-hidden border cursor-pointer transition-all duration-500 hover:translate-y-[-4px] hover:shadow-2xl flex flex-col justify-between ${
                    darkMode 
                      ? 'bg-gray-900/70 border-white/10 hover:border-rose-500/40 hover:shadow-rose-950/20' 
                      : 'bg-white border-gray-100 hover:border-rose-200 hover:shadow-rose-100/70'
                  }`}
                >
                  {/* Product Cover image */}
                  <div className="relative h-56 sm:h-52 overflow-hidden bg-gray-100">
                    <img 
                      src={p.imageUrl} 
                      alt={p.nameEn} 
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent opacity-80" />
                    
                    {/* Floating tags */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      {p.discountRate > 0 ? (
                        <span className="bg-green-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm pointer-events-auto">
                          -{p.discountRate * 100}% {lang === 'ar' ? 'خصم' : 'OFF'}
                        </span>
                      ) : (
                        <span />
                      )}

                      <div className="flex gap-1.5 pointer-events-auto">
                        <button 
                          onClick={(e) => toggleFavorite(p.id, e)}
                          className={`p-2 rounded-full backdrop-blur-md shadow-sm transition ${
                            isFav ? 'bg-rose-600 text-white' : 'bg-black/30 text-white hover:bg-black/50'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleShare(p, e)}
                          className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition shadow-sm"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Text body */}
                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5 text-right">
                      <h4 className="product-title font-black text-lg sm:text-base transition">
                        {highlightText(lang === 'ar' ? p.nameAr : p.nameEn, searchQuery)}
                      </h4>
                      <p className={`text-sm sm:text-xs line-clamp-2 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {highlightText(lang === 'ar' ? p.descriptionAr : p.descriptionEn, searchQuery)}
                      </p>
                    </div>

                    {/* Attributes & Cart triggering */}
                    <div className="border-t border-gray-100/10 pt-4 flex items-center justify-between gap-3">
                      <div>
                        {p.discountRate > 0 && (
                          <span className="text-[10px] line-through text-gray-400 block">
                            {(p.price).toFixed(2)} <SaudiRiyalIcon />
                          </span>
                        )}
                        <span className="text-lg sm:text-base font-black text-rose-600">
                          {(p.price * (1 - p.discountRate)).toFixed(2)} <SaudiRiyalIcon />
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                        {p.calories && (
                          <span className="hidden sm:flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-amber-500" />
                            {p.calories} Cal
                          </span>
                        )}
                        <span className="product-add-button flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition group-hover:scale-110">
                          <Plus className="w-5 h-5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                 {tenantProducts.map(p => {
              const isFav = favorites.includes(p.id);
              return (
                <div 
                  key={p.id}
                  onClick={() => handleOpenProduct(p)}
                  className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all hover:translate-y-[-1px] hover:shadow-sm flex items-center p-3 sm:p-4 gap-4 ${
                    darkMode 
                      ? 'bg-gray-900/40 border-gray-900 hover:border-gray-800' 
                      : 'bg-white border-gray-100 hover:border-rose-100'
                  }`}
                >
                  {/* Left: Product Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img 
                      src={p.imageUrl} 
                      alt={p.nameEn} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {p.discountRate > 0 && (
                      <span className="absolute top-1 left-1 bg-green-600 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">
                        -{p.discountRate * 100}%
                      </span>
                    )}
                  </div>

                  {/* Middle: Text details */}
                  <div className="flex-1 min-w-0 space-y-1 text-right">
                    <div className="flex items-center gap-1.5">
                      <h4 className="product-title font-extrabold text-xs sm:text-sm transition truncate">
                        {highlightText(lang === 'ar' ? p.nameAr : p.nameEn, searchQuery)}
                      </h4>
                      {p.isFeatured && (
                        <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-bold rounded">
                          ★
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] sm:text-xs line-clamp-2 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {highlightText(lang === 'ar' ? p.descriptionAr : p.descriptionEn, searchQuery)}
                    </p>
                    
                    <div className="flex items-center gap-2 pt-1 font-bold">
                      {p.calories && (
                        <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {p.calories} Cal
                        </span>
                      )}
                      {p.preparationTime && (
                        <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                          <Clock className="w-3 h-3 text-blue-400" />
                          {p.preparationTime} {lang === 'ar' ? 'دقائق' : 'mins'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Price & Add Button */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0 min-h-full">
                    {/* Share / Favorite */}
                    <div className="flex gap-1">
                      <button 
                        onClick={(e) => toggleFavorite(p.id, e)}
                        className={`p-1.5 rounded-full transition ${
                          isFav ? 'text-rose-600' : 'text-gray-300 hover:text-gray-500'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Price & Plus Button */}
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="text-right">
                        {p.discountRate > 0 && (
                          <span className="text-[9px] line-through text-gray-400 block leading-none">
                            {(p.price).toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-black text-rose-600 block leading-none">
                          {(p.price * (1 - p.discountRate)).toFixed(2)} <span className="text-[8px] font-bold"><SaudiRiyalIcon /></span>
                        </span>
                      </div>
                      
                      <span className="product-add-button p-2 rounded-xl transition shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
              </div>
            )}

          </div>
        </div>      </main>

      {/* Custom Premium Restaurant Website Footer */}
      <footer id="footer" className={`border-t transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-900 border-gray-800 text-gray-300' 
          : 'bg-white border-gray-150 text-gray-700'
      }`}>
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          
          {/* Column 1: Brand & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={tenant.logoUrl} 
                alt={tenant.nameEn} 
                className="w-12 h-12 rounded-2xl object-cover border shadow-xs bg-white"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-sm font-black tracking-tight text-gray-900 dark:text-white">
                  {lang === 'ar' ? tenant.nameAr : tenant.nameEn}
                </h3>
                <p className="text-[9px] text-gray-400 font-semibold">{lang === 'ar' ? 'أفضل جودة وخدمة ممتازة' : 'Premium Quality & Experience'}</p>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
              {lang === 'ar' 
                ? 'فخورون بتقديم أشهى المأكولات المعدة بحب وشغف طيلة أيام الأسبوع، مع خدمة سريعة وآمنة تماماً.'
                : 'Proudly serving handcrafted meals prepared with fresh ingredients, with clean contact-free pickup & delivery.'}
            </p>

            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
              <Clock className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
              <span>{lang === 'ar' ? 'ساعات العمل: ١٢ ظهراً - ١٢ ليلاً' : 'Opening Hours: 12 PM - 12 AM'}</span>
            </div>
          </div>

          {/* Column 2: Branches & Addresses (Dynamic based on Database) */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase text-gray-900 dark:text-white tracking-widest pb-1 border-b border-gray-100/10 inline-block">
              {lang === 'ar' ? 'فروعنا وعناويننا' : 'Our Branches & Locations'}
            </h4>
            <div className="space-y-4">
              {branches.filter(b => b.tenantId === tenant.id).map(branch => (
                <div key={branch.id} className="space-y-1 text-[10px] text-gray-400 font-semibold">
                  <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-bold">
                    <MapPin className="w-3.5 h-3.5 text-[var(--tenant-primary)]" />
                    <span>{lang === 'ar' ? branch.nameAr : branch.nameEn}</span>
                  </div>
                  <p className="mr-5">{lang === 'ar' ? branch.addressAr : branch.addressEn}</p>
                  {branch.phone && (
                    <a href={`tel:${branch.phone}`} className="flex items-center gap-1 mr-5 hover:text-[var(--tenant-primary)] text-slate-500 dark:hover:text-[var(--tenant-primary)] transition text-[9px]">
                      <Phone className="w-3 h-3 text-emerald-500" />
                      <span>{branch.phone}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Customer Care & Chat Options */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase text-gray-900 dark:text-white tracking-widest pb-1 border-b border-gray-100/10 inline-block">
              {lang === 'ar' ? 'خدمة العملاء والاتصال المباشر' : 'Customer Support & Contact'}
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">
              {lang === 'ar'
                ? 'هل لديك أي استفسار أو ترغب في تقديم طلب خاص؟ تواصل معنا مباشرة:'
                : 'Have any questions or special orders? Contact our support channels directly:'}
            </p>
            <div className="space-y-2.5">
              {/* WhatsApp Button */}
              <a 
                href={`https://wa.me/${tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '966500000000'}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-550/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black transition border border-emerald-500/20"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'ar' ? 'دردشة واتساب مباشرة' : 'Direct WhatsApp Chat'}</span>
              </a>
              {/* Phone call button */}
              {tenant.phone && (
                <a 
                  href={`tel:${tenant.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[var(--tenant-primary)]/10 hover:bg-[var(--tenant-primary)]/20 text-rose-600 text-[10px] font-black transition border border-[var(--tenant-primary)]/20"
                >
                  <Phone className="w-4 h-4 text-[var(--tenant-primary)]" />
                  <span>{lang === 'ar' ? `اتصل بنا: ${tenant.phone}` : `Call Support: ${tenant.phone}`}</span>
                </a>
              )}
            </div>
          </div>

          {/* Column 4: Follow Us & Social Media */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase text-gray-900 dark:text-white tracking-widest pb-1 border-b border-gray-100/10 inline-block">
              {lang === 'ar' ? 'تابعنا على مواقع التواصل' : 'Follow Our Social Media'}
            </h4>
            <p className="text-[10px] text-gray-400 font-medium">
              {lang === 'ar'
                ? 'ابقَ على اطلاع بأحدث عروضنا الموسمية وأطباقنا الجديدة وخصوماتنا الحصرية.'
                : 'Stay tuned for seasonal discounts, new menu arrivals, and exclusive promos.'}
            </p>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Instagram */}
              <a 
                href={`https://instagram.com/${tenant.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 flex items-center justify-center hover:bg-rose-600 hover:text-white transition shadow-sm border border-rose-100/10"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              {/* Facebook */}
              <a 
                href={`https://facebook.com/${tenant.slug}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition shadow-sm border border-blue-100/10"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              {/* WhatsApp Icon for channel */}
              <a 
                href={`https://wa.me/${tenant.phone ? tenant.phone.replace(/[^0-9]/g, '') : '966500000000'}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition shadow-sm border border-emerald-100/10"
                title="WhatsApp Channel"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              {/* Twitter / X */}
              <a 
                href={`https://twitter.com/${tenant.slug}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200 flex items-center justify-center hover:bg-slate-650 hover:text-white transition shadow-sm border border-slate-100/10"
                title="X / Twitter"
              >
                <span className="text-[11px] font-bold font-mono">X</span>
              </a>
            </div>
            <div className="pt-2 text-[9px] text-gray-500 font-mono">
              <span>{lang === 'ar' ? 'المعرف الرسمي:' : 'Branded Handle:'}</span>
              <span className="block font-bold text-gray-450">@{tenant.slug}.restaurant</span>
            </div>
          </div>

        </div>

        {/* Copyright sub-bar */}
        <div className={`py-4 px-6 border-t text-center text-[9px] font-bold transition-colors duration-300 ${
          darkMode ? 'bg-gray-950 border-gray-900 text-gray-500' : 'bg-gray-50 border-gray-150 text-gray-400'
        }`}>
          <p>
            {lang === 'ar'
              ? `جميع الحقوق محفوظة © ٢٠٢٦ للمطعم الفاخر ${tenant.nameAr}. مدعوم بواسطة نظام فوديكس SaaS.`
              : `All Rights Reserved © 2026 for ${tenant.nameEn}. Powered by Foodics SaaS Monolith System.`}
          </p>
          <a
            href="/staff"
            className="mt-2 inline-flex items-center justify-center text-[10px] font-black text-gray-400 hover:text-[var(--tenant-primary)] transition"
          >
            {lang === 'ar' ? 'تسجيل دخول' : 'Staff Login'}
          </a>
        </div>
      </footer>

      {/* Product Selection Overlay Dialog */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xs p-0 md:p-4">
          <div className={`rounded-t-[32px] md:rounded-3xl border border-gray-150/10 dark:border-gray-850 shadow-2xl w-full max-w-lg max-h-[92vh] md:max-h-[90vh] overflow-y-auto flex flex-col justify-between mt-auto md:mt-0 ${
            darkMode ? 'bg-gray-950 text-gray-100' : 'bg-white text-gray-800'
          }`}>
            
            {/* Image banner with embedded video support! */}
            <div className="relative h-56 md:h-64 overflow-hidden flex-shrink-0 bg-black">
              {selectedProduct.videoUrl ? (
                <video 
                  src={selectedProduct.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.nameEn} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Close Button */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-black/45 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition shadow"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-white flex items-center gap-1 text-[11px] font-bold">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {selectedProduct.preparationTime} {lang === 'ar' ? 'دقائق للتحضير' : 'Mins prep time'}
              </div>
            </div>

            {/* Selection Body */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto text-left rtl:text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold tracking-tight">{lang === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}</h3>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {lang === 'ar' ? selectedProduct.descriptionAr : selectedProduct.descriptionEn}
                </p>
              </div>

              {/* Allergens warning */}
              {selectedProduct.allergens.length > 0 && (
                <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-2 text-[10px] text-amber-700">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">{lang === 'ar' ? 'تحذير الحساسية: ' : 'Allergy Warning: '}</span>
                    {lang === 'ar' ? 'يحتوي هذا المنتج على ' : 'Contains '} 
                    <span className="font-semibold">{selectedProduct.allergens.join(', ')}</span>
                  </div>
                </div>
              )}

              {/* Sizes Selection */}
              {selectedProduct.sizes.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">{lang === 'ar' ? 'اختر الحجم' : 'Select Size Option'}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProduct.sizes.map(size => {
                      const isSelected = size.id === selectedSizeId;
                      return (
                        <div
                          key={size.id}
                          onClick={() => setSelectedSizeId(size.id)}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition text-center flex flex-col justify-center ${
                            isSelected 
                              ? 'border-rose-600 bg-rose-50/10' 
                              : darkMode ? 'border-gray-800 hover:border-gray-700 bg-gray-900/20' : 'border-gray-100 hover:border-gray-200 bg-white'
                          }`}
                        >
                          <span className="font-bold text-xs">{lang === 'ar' ? size.nameAr : size.nameEn}</span>
                          <span className="text-[10px] text-gray-400 mt-1">
                            {size.priceDifference === 0 
                              ? (lang === 'ar' ? 'السعر الأساسي' : 'Base Price') 
                              : `+${size.priceDifference.toFixed(2)} $<SaudiRiyalIcon />`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modifier groups */}
              {selectedProduct.modifierGroupIds.map(mgId => {
                const group = modifierGroups.find(mg => mg.id === mgId);
                if (!group) return null;

                const selectedList = selectedModifiers[mgId] || [];

                return (
                  <div key={group.id} className="space-y-2.5 border-t border-gray-100/10 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                          {lang === 'ar' ? group.nameAr : group.nameEn}
                        </h4>
                        <span className="text-[9px] text-gray-400 font-medium">
                          {lang === 'ar' 
                            ? `اختر من ${group.minSelect} إلى ${group.maxSelect}` 
                            : `Select ${group.minSelect} to ${group.maxSelect} options`}
                        </span>
                      </div>
                      {group.isRequired && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/40 dark:text-rose-400">
                          {lang === 'ar' ? 'إجباري' : 'Required'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {group.modifiers.map(mod => {
                        const isSelected = selectedList.includes(mod.id);
                        return (
                          <div
                            key={mod.id}
                            onClick={() => handleSelectModifier(group.id, mod.id, group.isRequired, group.maxSelect)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                              isSelected 
                                ? 'border-rose-600 bg-rose-50/5 dark:bg-rose-950/10' 
                                : darkMode ? 'border-gray-800 hover:border-gray-700 bg-gray-900/10' : 'border-gray-100 hover:border-gray-200 bg-white'
                            }`}
                          >
                            <span className="font-semibold text-xs">{lang === 'ar' ? mod.nameAr : mod.nameEn}</span>
                            <div className="flex items-center gap-2">
                              {mod.price > 0 && (
                                <span className="text-[10px] font-bold text-rose-600">+{mod.price.toFixed(2)} <SaudiRiyalIcon /></span>
                              )}
                              <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Nutrition Facts */}
              {selectedProduct.nutrition && (
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 dark:bg-gray-900/30 dark:border-gray-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    {lang === 'ar' ? 'الحقائق الغذائية التقريبية' : 'Approximate Nutrition Facts'}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-white p-2 rounded-xl dark:bg-gray-900">
                      <span className="text-gray-400 block">{lang === 'ar' ? 'كاربوهايدرات' : 'Carbs'}</span>
                      <span className="font-bold text-gray-800 dark:text-white">{selectedProduct.nutrition.carbs}g</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl dark:bg-gray-900">
                      <span className="text-gray-400 block">{lang === 'ar' ? 'بروتين' : 'Protein'}</span>
                      <span className="font-bold text-gray-800 dark:text-white">{selectedProduct.nutrition.protein}g</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl dark:bg-gray-900">
                      <span className="text-gray-400 block">{lang === 'ar' ? 'دهون' : 'Fat'}</span>
                      <span className="font-bold text-gray-800 dark:text-white">{selectedProduct.nutrition.fat}g</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Row */}
            <div className={`p-6 border-t flex items-center justify-between gap-4 flex-shrink-0 ${
              darkMode ? 'border-gray-900 bg-gray-950' : 'border-gray-100 bg-gray-50/50'
            }`}>
              
              {/* Quantity Changer */}
              <div className="flex items-center gap-3 bg-white border border-gray-200/50 rounded-full px-3 py-1.5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-800 dark:hover:text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-800 dark:hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-full hover:bg-rose-700 transition shadow-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {lang === 'ar' ? 'إضافة للطلب' : 'Add to Order'}
                <span>•</span>
                <span>{calculatedDialogPrice.toFixed(2)} <SaudiRiyalIcon /></span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex items-end md:items-stretch justify-end bg-black/60 backdrop-blur-xs font-sans p-0">
          <div className={`w-full max-w-md h-[90vh] md:h-full rounded-t-[32px] md:rounded-none shadow-2xl flex flex-col justify-between ${
            darkMode ? 'bg-gray-950 text-gray-100 md:border-l border-gray-900' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between border-b border-gray-100/15 p-5 bg-gray-50/50 dark:bg-gray-900">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                {lang === 'ar' ? 'طلبك الحالي' : 'Your Digital Order'}
              </h3>
              <button 
                onClick={() => setShowCartDrawer(false)}
                className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4 text-left rtl:text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 stroke-1" />
                  <p className="text-xs font-medium">{lang === 'ar' ? 'سلة تسوقك فارغة حالياً.' : 'Your checkout bag is empty.'}</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex gap-3 dark:bg-gray-900/30 dark:border-gray-800">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.nameEn} 
                      className="w-16 h-16 rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white">{lang === 'ar' ? item.product.nameAr : item.product.nameEn}</h4>
                        <span className="font-bold text-rose-600 text-xs">{(item.pricePerItem * item.quantity).toFixed(2)} <SaudiRiyalIcon /></span>
                      </div>
                      
                      {item.sizeName && (
                        <div className="text-[10px] text-gray-400">
                          {lang === 'ar' ? 'الحجم: ' : 'Size: '} <span className="font-semibold">{item.sizeName}</span>
                        </div>
                      )}

                      {item.modifiersList.length > 0 && (
                        <div className="text-[10px] text-gray-400 flex flex-wrap gap-1">
                          {lang === 'ar' ? 'الإضافات: ' : 'Add-ons: '}
                          {item.modifiersList.map((m, idx) => (
                            <span key={idx} className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] dark:bg-gray-800">
                              {lang === 'ar' ? m.nameAr : m.nameEn}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1.5">
                        <span className="text-[10px] text-gray-400">{lang === 'ar' ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}</span>
                        <button 
                          onClick={() => setCart(prev => prev.filter(c => c.id !== item.id))}
                          className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                        >
                          {lang === 'ar' ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Order Trigger */}
            {cart.length > 0 && (
              <div className={`p-6 border-t space-y-4 ${
                darkMode ? 'border-gray-900 bg-gray-950' : 'border-gray-100 bg-gray-50/50'
              }`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {/* Order Details Form */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-150/40 dark:border-gray-800 space-y-3.5">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-right">
                      {lang === 'ar' ? 'نوع الطلب' : 'Order Type'}
                    </span>
                    <div className={`grid gap-2 bg-gray-100 p-1 rounded-xl dark:bg-gray-900/80 border dark:border-gray-800 ${
                      tenant.enableDelivery !== false ? 'grid-cols-3' : 'grid-cols-2'
                    }`}>
                      <button
                        onClick={() => { setOrderType('dine_in'); setFormErrors({}); }}
                        className={`py-1.5 rounded-lg text-[10px] font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                          orderType === 'dine_in'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-850 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        <span>🍽️</span>
                        <span>{lang === 'ar' ? 'محلي' : 'Dine-in'}</span>
                      </button>
                      <button
                        onClick={() => { setOrderType('takeaway'); setFormErrors({}); }}
                        className={`py-1.5 rounded-lg text-[10px] font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                          orderType === 'takeaway'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-gray-500 hover:text-gray-850 dark:text-gray-400 dark:hover:text-white'
                        }`}
                      >
                        <span>🛍️</span>
                        <span>{lang === 'ar' ? 'سفري' : 'Takeaway'}</span>
                      </button>
                      {tenant.enableDelivery !== false && (
                        <button
                          onClick={() => { setOrderType('delivery'); setFormErrors({}); }}
                          className={`py-1.5 rounded-lg text-[10px] font-black transition flex items-center justify-center gap-1 cursor-pointer ${
                            orderType === 'delivery'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-gray-500 hover:text-gray-850 dark:text-gray-400 dark:hover:text-white'
                          }`}
                        >
                          <span>🚗</span>
                          <span>{lang === 'ar' ? 'توصيل' : 'Delivery'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3.5 border-t border-gray-100/10 pt-3.5">
                    {orderType === 'dine_in' && (
                      <div className="space-y-1.5 text-right">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          {lang === 'ar' ? 'رقم الطاولة *' : 'Table Number *'}
                        </label>
                        <input
                          type="text"
                          placeholder={lang === 'ar' ? 'أدخل رقم الطاولة (مثال: 5)' : 'e.g. 5'}
                          value={tableNumber}
                          onChange={(e) => { setTableNumber(e.target.value); if (e.target.value) setFormErrors(prev => ({ ...prev, tableNumber: '' })); }}
                          className={`w-full py-2 px-3 text-xs bg-white dark:bg-gray-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 dark:text-white ${
                            formErrors.tableNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-250 dark:border-gray-800'
                          }`}
                        />
                        {formErrors.tableNumber && (
                          <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.tableNumber}</span>
                        )}
                      </div>
                    )}

                    {orderType === 'takeaway' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5 text-right">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {lang === 'ar' ? 'الاسم بالكامل *' : 'Customer Name *'}
                          </label>
                          <input
                            type="text"
                            placeholder={lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                            value={customerName}
                            onChange={(e) => { setCustomerName(e.target.value); if (e.target.value) setFormErrors(prev => ({ ...prev, customerName: '' })); }}
                            className={`w-full py-2 px-3 text-xs bg-white dark:bg-gray-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 dark:text-white ${
                              formErrors.customerName ? 'border-red-500 focus:ring-red-500' : 'border-gray-250 dark:border-gray-800'
                            }`}
                          />
                          {formErrors.customerName && (
                            <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.customerName}</span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-right">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {lang === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                          </label>
                          <input
                            type="tel"
                            placeholder={lang === 'ar' ? 'مثال: 0500000000' : 'e.g. 0500000000'}
                            value={customerPhone}
                            onChange={(e) => { setCustomerPhone(e.target.value); if (e.target.value) setFormErrors(prev => ({ ...prev, customerPhone: '' })); }}
                            className={`w-full py-2 px-3 text-xs bg-white dark:bg-gray-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 dark:text-white ${
                              formErrors.customerPhone ? 'border-red-500 focus:ring-red-500' : 'border-gray-250 dark:border-gray-800'
                            }`}
                          />
                          {formErrors.customerPhone && (
                            <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.customerPhone}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {orderType === 'delivery' && (
                      <div className="space-y-3">
                        <div className="space-y-1.5 text-right">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {lang === 'ar' ? 'الاسم بالكامل *' : 'Customer Name *'}
                          </label>
                          <input
                            type="text"
                            placeholder={lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                            value={customerName}
                            onChange={(e) => { setCustomerName(e.target.value); if (e.target.value) setFormErrors(prev => ({ ...prev, customerName: '' })); }}
                            className={`w-full py-2 px-3 text-xs bg-white dark:bg-gray-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 dark:text-white ${
                              formErrors.customerName ? 'border-red-500 focus:ring-red-500' : 'border-gray-250 dark:border-gray-800'
                            }`}
                          />
                          {formErrors.customerName && (
                            <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.customerName}</span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-right">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {lang === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                          </label>
                          <input
                            type="tel"
                            placeholder={lang === 'ar' ? 'مثال: 0500000000' : 'e.g. 0500000000'}
                            value={customerPhone}
                            onChange={(e) => { setCustomerPhone(e.target.value); if (e.target.value) setFormErrors(prev => ({ ...prev, customerPhone: '' })); }}
                            className={`w-full py-2 px-3 text-xs bg-white dark:bg-gray-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 dark:text-white ${
                              formErrors.customerPhone ? 'border-red-500 focus:ring-red-500' : 'border-gray-250 dark:border-gray-800'
                            }`}
                          />
                          {formErrors.customerPhone && (
                            <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.customerPhone}</span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-right">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {lang === 'ar' ? 'عنوان التوصيل بالتفصيل *' : 'Detailed Delivery Address *'}
                          </label>
                          <textarea
                            rows={2}
                            placeholder={lang === 'ar' ? 'الحي، الشارع، رقم المنزل، تفاصيل المعلم...' : 'District, street name, building no...'}
                            value={deliveryAddress}
                            onChange={(e) => { setDeliveryAddress(e.target.value); if (e.target.value) setFormErrors(prev => ({ ...prev, deliveryAddress: '' })); }}
                            className={`w-full py-2 px-3 text-xs bg-white dark:bg-gray-950 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-600 dark:text-white resize-none ${
                              formErrors.deliveryAddress ? 'border-red-500 focus:ring-red-500' : 'border-gray-250 dark:border-gray-800'
                            }`}
                          />
                          {formErrors.deliveryAddress && (
                            <span className="text-[9px] text-red-500 font-bold block mt-0.5">{formErrors.deliveryAddress}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1.5 text-xs text-right">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{cartSubtotal.toFixed(2)} <SaudiRiyalIcon /></span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400">
                    <span>{lang === 'ar' ? `ضريبة القيمة المضافة (${tenant.id === 't-1' ? '١٥٪' : '٥٪'})` : `Tax / VAT (${tenant.id === 't-1' ? '15%' : '5%'})`}</span>
                    <span>{taxAmount.toFixed(2)} <SaudiRiyalIcon /></span>
                  </div>
                  <div className="border-t border-gray-200/50 my-2" />
                  <div className="flex items-center justify-between font-black text-sm text-gray-900 dark:text-white">
                    <span>{lang === 'ar' ? 'المجموع النهائي' : 'Order Total'}</span>
                    <span className="text-rose-600">{cartTotal.toFixed(2)} <SaudiRiyalIcon /></span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    const errors: Record<string, string> = {};
                    if (orderType === 'dine_in') {
                      if (!tableNumber.trim()) {
                        errors.tableNumber = lang === 'ar' ? 'يرجى إدخال رقم الطاولة' : 'Please enter your table number';
                      }
                    } else if (orderType === 'takeaway') {
                      if (!customerName.trim()) {
                        errors.customerName = lang === 'ar' ? 'يرجى إدخال الاسم بالكامل' : 'Please enter your full name';
                      }
                      if (!customerPhone.trim()) {
                        errors.customerPhone = lang === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number';
                      }
                    } else if (orderType === 'delivery') {
                      if (!customerName.trim()) {
                        errors.customerName = lang === 'ar' ? 'يرجى إدخال الاسم بالكامل' : 'Please enter your full name';
                      }
                      if (!customerPhone.trim()) {
                        errors.customerPhone = lang === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number';
                      }
                      if (!deliveryAddress.trim()) {
                        errors.deliveryAddress = lang === 'ar' ? 'يرجى إدخال عنوان التوصيل بالتفصيل' : 'Please enter delivery address';
                      }
                    }

                    if (Object.keys(errors).length > 0) {
                      setFormErrors(errors);
                      return;
                    }

                    const receiptNum = `REC-MENU-${Date.now().toString().slice(-6)}`;
                    
                    const items = cart.map(item => ({
                      productId: item.product.id,
                      productNameEn: item.product.nameEn,
                      productNameAr: item.product.nameAr,
                      sizeNameEn: item.sizeName,
                      sizeNameAr: item.sizeName,
                      pricePerItem: item.pricePerItem,
                      quantity: item.quantity,
                      modifiers: item.modifiersList.map(mod => ({
                        nameEn: mod.nameEn,
                        nameAr: mod.nameAr,
                        price: mod.price
                      }))
                    }));

                    const finalCustomerName = orderType === 'dine_in'
                      ? (lang === 'ar' ? `طاولة ${tableNumber}` : `Table ${tableNumber}`)
                      : customerName;

                    onPlaceOrder({
                      receiptNumber: receiptNum,
                      customerName: finalCustomerName,
                      customerType: orderType,
                      paymentMethod: 'online',
                      subtotal: cartSubtotal,
                      discountAmount: 0,
                      taxAmount: taxAmount,
                      total: cartTotal,
                      source: 'DigitalMenu',
                      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
                      customerPhone: orderType !== 'dine_in' ? customerPhone : undefined,
                      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined
                    }, items);

                    alert(lang === 'ar' 
                      ? 'تم تسجيل طلبك بنجاح وسيتم إرساله إلى المطبخ والـ POS!' 
                      : 'Your contactless order has been placed successfully & transmitted to Kitchen and POS!');
                    
                    // Reset fields
                    setCart([]);
                    setTableNumber('');
                    setCustomerName('');
                    setCustomerPhone('');
                    setDeliveryAddress('');
                    setFormErrors({});
                    setShowCartDrawer(false);
                  }}
                  className="w-full py-3 bg-rose-600 text-white font-bold text-xs rounded-full hover:bg-rose-700 transition shadow-sm uppercase tracking-wider cursor-pointer"
                >
                  {lang === 'ar' ? 'إرسال الطلب للمطبخ والـ POS 🚀' : 'Transmit Order to Kitchen & POS 🚀'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Mobile Cart FAB */}
      {cart.length > 0 && !showCartDrawer && (
        <div className="fixed bottom-6 left-4 right-4 z-40 md:hidden animate-bounce-short shadow-xl">
          <button 
            onClick={() => setShowCartDrawer(true)}
            className="w-full bg-[var(--tenant-primary)] hover:opacity-95 text-white py-3.5 px-6 rounded-2xl flex items-center justify-between font-bold text-sm shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] font-bold text-white flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
              <span>{lang === 'ar' ? 'الذهاب للدفع وإرسال الطلب 🚀' : 'Go to Checkout & Transmit Order 🚀'}</span>
            </div>
            
            <div className="flex items-center gap-2 font-bold">
              <span className="opacity-50">|</span>
              <span>{cartTotal.toFixed(2)} <SaudiRiyalIcon /></span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

    </div>
  );
}

