import React, { useState, useMemo } from 'react';
import { 
  Search, ShoppingCart, User, Ticket, CreditCard, RotateCcw, Play, Check, 
  Trash2, Plus, Minus, Tag, Landmark, Smartphone, Receipt, Layers, 
  AlertTriangle, Users, Flame, Clock, RefreshCw, LogOut, ArrowRightLeft,
  DollarSign, MapPin, HandPlatter, X
} from 'lucide-react';
import { Product, Category, ModifierGroup, Tenant, Order, OrderItem } from '../types';

interface PosSystemProps {
  tenant: Tenant;
  products: Product[];
  categories: Category[];
  modifierGroups: ModifierGroup[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addAuditLog: (action: string, entityName: string, entityId: string, details: string) => void;
  lang: 'en' | 'ar';
  onLogout: () => void;
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
  orders?: Order[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  orderItems?: OrderItem[];
}

interface CartItem {
  id: string; // Unique for cart line item
  product: Product;
  selectedSize?: { nameEn: string; nameAr: string; priceDifference: number };
  selectedModifiers: { nameEn: string; nameAr: string; price: number }[];
  pricePerUnit: number;
  quantity: number;
}

interface SuspendedOrder {
  id: string;
  timestamp: string;
  items: CartItem[];
  customerName: string;
}

export default function PosSystem({
  tenant,
  products,
  categories,
  modifierGroups,
  setProducts,
  addAuditLog,
  lang,
  onLogout,
  onPlaceOrder,
  orders = [],
  setOrders,
  orderItems = []
}: PosSystemProps) {
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerType, setCustomerType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [customerName, setCustomerName] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountInput, setDiscountInput] = useState('0');
  
  // Suspend/Resume states
  const [suspendedOrders, setSuspendedOrders] = useState<SuspendedOrder[]>([]);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  // Online Orders state
  const [showOnlineOrdersModal, setShowOnlineOrdersModal] = useState(false);

  // Active product modifier modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSizeId, setActiveSizeId] = useState<string>('');
  const [activeModifiers, setActiveModifiers] = useState<Record<string, string[]>>({}); // mgId -> modId[]

  // Payment states
  const [showPaymentReceipt, setShowPaymentReceipt] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'apple_pay'>('cash');
  const [receivedCashAmount, setReceivedCashAmount] = useState<string>('');
  const [lastOrderDetails, setLastOrderDetails] = useState<{
    items: CartItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;
    receiptNumber: string;
    timestamp: string;
    customerType: string;
    paymentMethod: string;
    changeAmount: number;
    tableNumber?: string;
    customerPhone?: string;
    deliveryAddress?: string;
  } | null>(null);

  // Self-correct customerType if delivery is disabled
  React.useEffect(() => {
    if (tenant.enableDelivery === false && customerType === 'delivery') {
      setCustomerType('dine_in');
    }
  }, [tenant.enableDelivery, customerType]);

  // Filter Categories
  const tenantCategories = useMemo(() => {
    return categories.filter(c => c.tenantId === tenant.id && c.isVisible);
  }, [categories, tenant]);

  // Filter Products
  const tenantProducts = useMemo(() => {
    return products
      .filter(p => p.tenantId === tenant.id && p.isVisible)
      .filter(p => {
        const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
        const matchesSearch = p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.nameAr.includes(searchQuery) ||
                             p.sku.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      });
  }, [products, tenant, selectedCategory, searchQuery]);

  // Handle product click
  const handleProductClick = (product: Product) => {
    if (product.sizes.length > 0 || product.modifierGroupIds.length > 0) {
      setSelectedProduct(product);
      setActiveSizeId(product.sizes[0]?.id || '');
      setActiveModifiers({});
    } else {
      // Direct add to cart
      addDirectToCart(product);
    }
  };

  const addDirectToCart = (product: Product) => {
    if (product.trackStock && product.stockQuantity <= 0) {
      alert(lang === 'ar' ? 'عذراً، هذا المنتج غير متوفر في المخزن!' : 'Sorry, this product is out of stock!');
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && !item.selectedSize && item.selectedModifiers.length === 0);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, {
          id: `pos-item-${Date.now()}-${Math.random()}`,
          product,
          pricePerUnit: product.price * (1 - product.discountRate),
          selectedModifiers: [],
          quantity: 1
        }];
      }
    });
  };

  const handleSelectModifier = (mgId: string, modifierId: string, isRequired: boolean, maxSelect: number) => {
    setActiveModifiers(prev => {
      const currentSelection = prev[mgId] || [];
      if (maxSelect === 1) {
        return { ...prev, [mgId]: [modifierId] };
      } else {
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

  // Confirm custom item selection
  const handleConfirmModifiers = () => {
    if (!selectedProduct) return;

    // Validate required groups
    const missingGroupIds: string[] = [];
    selectedProduct.modifierGroupIds.forEach(mgId => {
      const group = modifierGroups.find(mg => mg.id === mgId);
      if (group && group.isRequired) {
        const selection = activeModifiers[mgId] || [];
        if (selection.length < group.minSelect) {
          missingGroupIds.push(mgId);
        }
      }
    });

    if (missingGroupIds.length > 0) {
      const firstMissing = modifierGroups.find(mg => mg.id === missingGroupIds[0]);
      alert(lang === 'ar' 
        ? `يرجى إكمال خيارات: ${firstMissing?.nameAr}` 
        : `Please select required options for: ${firstMissing?.nameEn}`);
      return;
    }

    const selectedSize = selectedProduct.sizes.find(s => s.id === activeSizeId);
    let itemPrice = selectedProduct.price;

    if (selectedSize) {
      itemPrice += selectedSize.priceDifference;
    }

    const selectedModsFlat: { nameEn: string; nameAr: string; price: number }[] = [];
    Object.keys(activeModifiers).forEach(mgId => {
      const group = modifierGroups.find(mg => mg.id === mgId);
      if (group) {
        const modIds = activeModifiers[mgId] || [];
        modIds.forEach(mId => {
          const mod = group.modifiers.find(m => m.id === mId);
          if (mod) {
            selectedModsFlat.push({
              nameEn: mod.nameEn,
              nameAr: mod.nameAr,
              price: mod.price
            });
            itemPrice += mod.price;
          }
        });
      }
    });

    // Apply specific product discount
    itemPrice = itemPrice * (1 - selectedProduct.discountRate);

    setCart(prev => [
      ...prev,
      {
        id: `pos-item-${Date.now()}-${Math.random()}`,
        product: selectedProduct,
        selectedSize: selectedSize ? {
          nameEn: selectedSize.nameEn,
          nameAr: selectedSize.nameAr,
          priceDifference: selectedSize.priceDifference
        } : undefined,
        selectedModifiers: selectedModsFlat,
        pricePerUnit: itemPrice,
        quantity: 1
      }
    ]);

    setSelectedProduct(null);
  };

  // View receipt for an online order in the thermal printer simulator
  const handleViewOnlineOrderReceipt = (order: Order) => {
    const itemsForOrder = orderItems.filter(oi => oi.orderId === order.id);
    
    const mappedItems = itemsForOrder.map(oi => ({
      id: oi.id,
      product: {
        id: oi.productId,
        nameEn: oi.productNameEn,
        nameAr: oi.productNameAr,
        price: oi.pricePerItem,
        costPrice: 0,
        profit: 0,
        margin: 0,
        sku: '',
        displayOrder: 0,
        isVisible: true,
        isFeatured: false,
        isRecommended: false,
        isPopular: false,
        trackStock: false,
        stockQuantity: 0,
        allergens: [],
        sizes: [],
        modifierGroupIds: [],
        taxRate: 0,
        discountRate: 0,
        categoryId: ''
      },
      selectedSize: oi.sizeNameEn ? { nameEn: oi.sizeNameEn, nameAr: oi.sizeNameAr || oi.sizeNameEn, priceDifference: 0 } : undefined,
      selectedModifiers: oi.modifiers.map(m => ({ nameEn: m.nameEn, nameAr: m.nameAr, price: m.price })),
      pricePerUnit: oi.pricePerItem,
      quantity: oi.quantity
    }));

    setLastOrderDetails({
      items: mappedItems as any,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount || 0,
      taxAmount: order.taxAmount,
      total: order.total,
      receiptNumber: order.receiptNumber,
      timestamp: new Date(order.createdAt).toLocaleString(),
      customerType: order.customerType,
      paymentMethod: order.paymentMethod,
      changeAmount: 0,
      tableNumber: order.tableNumber,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      customerName: order.customerName
    });
    setShowPaymentReceipt(true);
  };

  // Adjust Cart quantity
  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        
        // Stock validation check
        if (delta > 0 && item.product.trackStock && item.product.stockQuantity < newQty) {
          alert(lang === 'ar' 
            ? `عذراً! الكمية المطلوبة تتجاوز المتاح في المخزون (${item.product.stockQuantity})` 
            : `Sorry! Requested quantity exceeds available stock (${item.product.stockQuantity})`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return subtotal * (discountPercent / 100);
  }, [subtotal, discountPercent]);

  const taxAmount = useMemo(() => {
    // Standard tax based on active tenant
    const rate = tenant.id === 't-1' ? 0.15 : 0.05;
    return (subtotal - discountAmount) * rate;
  }, [subtotal, discountAmount, tenant]);

  const grandTotal = subtotal - discountAmount + taxAmount;

  // Suspend order
  const handleSuspendOrder = () => {
    if (cart.length === 0) return;
    const name = customerName.trim() || (lang === 'ar' ? `زبون #${Date.now().toString().slice(-4)}` : `Customer #${Date.now().toString().slice(-4)}`);
    const newSuspended: SuspendedOrder = {
      id: `suspended-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      items: cart,
      customerName: name
    };
    setSuspendedOrders(prev => [...prev, newSuspended]);
    addAuditLog('SUSPEND_ORDER', 'POS_Ticket', newSuspended.id, `Suspended active order for ${name} containing ${cart.length} items`);
    setCart([]);
    setCustomerName('');
    setDiscountPercent(0);
    alert(lang === 'ar' ? 'تم تعليق الطلب بنجاح!' : 'Order suspended successfully!');
  };

  // Resume suspended order
  const handleResumeOrder = (order: SuspendedOrder) => {
    setCart(order.items);
    setCustomerName(order.customerName);
    setSuspendedOrders(prev => prev.filter(o => o.id !== order.id));
    setShowSuspendedModal(false);
    addAuditLog('RESUME_ORDER', 'POS_Ticket', order.id, `Retrieved suspended order for ${order.customerName}`);
  };

  // Save/Complete Order & Update Inventory
  const handleCompleteCheckout = () => {
    if (cart.length === 0) return;

    const receiptNum = `REC-${tenant.slug.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const changeAmt = parseFloat(receivedCashAmount) > grandTotal ? parseFloat(receivedCashAmount) - grandTotal : 0;

    // Deduct stock in local state
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(p => {
        // Find if this product was sold in the cart
        const cartLines = cart.filter(item => item.product.id === p.id);
        if (cartLines.length > 0 && p.trackStock) {
          const totalSold = cartLines.reduce((sum, item) => sum + item.quantity, 0);
          const newStock = Math.max(0, p.stockQuantity - totalSold);
          
          // Log automated inventory audit if below reorder alert
          if (newStock <= 10) {
            addAuditLog('LOW_STOCK_WARNING', 'Inventory', p.id, `Stock alert for ${p.nameEn}: Remaining quantity is ${newStock}`);
          }
          return { ...p, stockQuantity: newStock };
        }
        return p;
      });
      return updatedProducts;
    });

    // Save checkout log details for receipt simulator
    setLastOrderDetails({
      items: cart,
      subtotal,
      discountAmount,
      taxAmount,
      total: grandTotal,
      receiptNumber: receiptNum,
      timestamp: new Date().toLocaleString(),
      customerType,
      paymentMethod: selectedPaymentMethod,
      changeAmount: changeAmt
    });

    // Map checkout cart items to database relational items for kitchen queue
    const mappedItems = cart.map(item => ({
      productId: item.product.id,
      productNameEn: item.product.nameEn,
      productNameAr: item.product.nameAr,
      sizeNameEn: item.selectedSize ? item.selectedSize.nameEn : undefined,
      sizeNameAr: item.selectedSize ? item.selectedSize.nameAr : undefined,
      pricePerItem: item.pricePerUnit,
      quantity: item.quantity,
      modifiers: item.selectedModifiers.map(mod => ({
        nameEn: mod.nameEn,
        nameAr: mod.nameAr,
        price: mod.price
      }))
    }));

    onPlaceOrder({
      receiptNumber: receiptNum,
      customerName: customerName || (lang === 'ar' ? 'زبون سفري' : 'POS Guest'),
      customerType: customerType,
      paymentMethod: selectedPaymentMethod,
      subtotal: subtotal,
      discountAmount: discountAmount,
      taxAmount: taxAmount,
      total: grandTotal,
      source: 'POS'
    }, mappedItems);

    addAuditLog('POS_TRANSACTION', 'POS_Ticket', receiptNum, 
      `Completed checkout transaction ${receiptNum} via ${selectedPaymentMethod.toUpperCase()} for total: ${grandTotal.toFixed(2)} ${tenant.currencyEn}`
    );

    setShowPaymentReceipt(true);
    setCart([]);
    setCustomerName('');
    setDiscountPercent(0);
    setReceivedCashAmount('');
  };

  return (
    <div className="bg-gray-100 min-h-[85vh] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* LEFT COLUMN: PRODUCT GRID (Col 7) */}
      <div className="lg:col-span-7 p-5 flex flex-col justify-between space-y-4">
        
        {/* Upper search & fast selection header */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-rose-600" />
                {lang === 'ar' ? 'نظام نقطة البيع السريع (POS)' : 'Cloud Express POS Hub'}
              </h2>
              <p className="text-xs text-gray-400">
                {lang === 'ar' ? `المستخدم الحالي: كاشير نشط • فرع: الرياض` : `Current Session: Cashier Mode • Node: Riyadh Main`}
              </p>
            </div>

            {/* Suspend & Online Menu Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowOnlineOrdersModal(true)}
                className="relative px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>🌐</span>
                <span>{lang === 'ar' ? 'طلبات المنيو' : 'Menu Orders'}</span>
                {orders.filter(o => o.source === 'DigitalMenu' && o.status !== 'completed' && o.status !== 'cancelled').length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    {orders.filter(o => o.source === 'DigitalMenu' && o.status !== 'completed' && o.status !== 'cancelled').length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setShowSuspendedModal(true)}
                className="relative px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'الطلبات المعلقة' : 'Suspended List'}
                {suspendedOrders.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {suspendedOrders.length}
                  </span>
                )}
              </button>

              <button 
                onClick={onLogout}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'خروج الموظف' : 'Staff Logout'}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder={lang === 'ar' ? 'ابحث باسم المنتج أو الـ SKU...' : 'Scan barcode or type product name...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-rose-600"
            />
          </div>

          {/* Categories Tab Roller */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {lang === 'ar' ? 'الكل 🍽️' : 'All Items 🍽️'}
            </button>

            {tenantCategories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1 ${
                  selectedCategory === c.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{lang === 'ar' ? c.nameAr : c.nameEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* POS Products Touch Grid */}
        <div className="flex-1 overflow-y-auto max-h-[55vh] min-h-[350px] grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
          {tenantProducts.length === 0 ? (
            <div className="col-span-full h-48 flex flex-col items-center justify-center text-center text-gray-400">
              <Layers className="w-10 h-10 stroke-1" />
              <p className="text-xs mt-2">{lang === 'ar' ? 'لا يوجد منتجات متاحة.' : 'No products found'}</p>
            </div>
          ) : (
            tenantProducts.map(p => {
              const isLowStock = p.trackStock && p.stockQuantity <= 10;
              const isOutOfStock = p.trackStock && p.stockQuantity <= 0;

              return (
                <div 
                  key={p.id}
                  onClick={() => handleProductClick(p)}
                  className={`bg-white p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition hover:border-rose-500 hover:shadow-xs relative ${
                    isOutOfStock ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  {/* Floating badge for discount/warnings */}
                  {isLowStock && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                      {lang === 'ar' ? `مخزون ${p.stockQuantity}` : `Only ${p.stockQuantity}`}
                    </span>
                  )}

                  {/* Product Header details */}
                  <div className="space-y-1">
                    <img 
                      src={p.imageUrl} 
                      alt={p.nameEn} 
                      className="w-full h-16 object-cover rounded-lg bg-gray-50 mb-2"
                      referrerPolicy="no-referrer"
                    />
                    <h3 className="font-bold text-xs text-gray-900 line-clamp-2 leading-snug">
                      {lang === 'ar' ? p.nameAr : p.nameEn}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono block truncate">{p.sku}</span>
                  </div>

                  {/* Price and Stock indicators */}
                  <div className="border-t border-gray-100 mt-2.5 pt-2 flex items-center justify-between">
                    <div>
                      {p.discountRate > 0 && (
                        <span className="text-[9px] line-through text-gray-400 block">
                          {p.price.toFixed(2)}
                        </span>
                      )}
                      <span className="text-xs font-extrabold text-rose-600">
                        {(p.price * (1 - p.discountRate)).toFixed(2)} {tenant.currencyEn}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400 font-medium">
                      {p.calories} Cal
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick bottom operational info */}
        <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between text-[11px] font-mono">
          <span className="flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            {lang === 'ar' ? 'متصل ومصاحب فوديكس KDS' : 'ONLINE • KITCHEN CONNECTED'}
          </span>
          <span>
            {lang === 'ar' ? 'التحديث الأخير: تلقائي' : 'SYNC: Realtime Cloud'}
          </span>
        </div>

      </div>

      {/* RIGHT COLUMN: ACTIVE TICKET (Col 5) */}
      <div className="lg:col-span-5 bg-white border-l border-gray-200 p-5 flex flex-col justify-between space-y-4">
        
        {/* Customer Detail Input section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Receipt className="w-4.5 h-4.5 text-rose-600" />
              {lang === 'ar' ? 'الفاتورة الحالية' : 'Active Ticket'}
            </h3>
          </div>
          
          {/* Quick options */}
          <div className={`grid gap-1.5 text-center ${
            tenant.enableDelivery !== false ? 'grid-cols-3' : 'grid-cols-2'
          }`}>
            <button
              onClick={() => setCustomerType('dine_in')}
              className={`p-2 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                customerType === 'dine_in'
                  ? 'border-rose-600 bg-rose-50/10 text-rose-600'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <HandPlatter className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'محلي' : 'Dine In'}
            </button>
            
            <button
              onClick={() => setCustomerType('takeaway')}
              className={`p-2 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                customerType === 'takeaway'
                  ? 'border-rose-600 bg-rose-50/10 text-rose-600'
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'سفري' : 'Takeaway'}
            </button>
            
            {tenant.enableDelivery !== false && (
              <button
                onClick={() => setCustomerType('delivery')}
                className={`p-2 rounded-lg border text-[10px] font-bold flex flex-col items-center gap-1 transition ${
                  customerType === 'delivery'
                    ? 'border-rose-600 bg-rose-50/10 text-rose-600'
                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'توصيل' : 'Delivery'}
              </button>
            )}
          </div>
          {/* Customer Metadata info */}
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" 
              placeholder={lang === 'ar' ? 'اسم العميل (اختياري)' : 'Customer Name (Optional)'}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 w-full focus:outline-none focus:border-rose-600 bg-gray-50/40"
            />
            <button
              onClick={() => {
                setDiscountInput(discountPercent.toString());
                setShowDiscountModal(true);
              }}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 w-full hover:bg-gray-50 transition flex items-center justify-center gap-1 text-gray-600 font-bold"
            >
              <Tag className="w-3.5 h-3.5 text-rose-600" />
              {discountPercent > 0 ? `${discountPercent}% Off` : (lang === 'ar' ? 'تطبيق خصم' : 'Add Discount')}
            </button>
          </div>
        </div>

        {/* Cart Listing */}
        <div className="flex-1 overflow-y-auto max-h-[35vh] min-h-[180px] space-y-2 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-300 py-10">
              <ShoppingCart className="w-12 h-12 stroke-1 text-gray-200" />
              <p className="text-xs font-semibold mt-2">{lang === 'ar' ? 'السلة فارغة. ابدأ بإضافة وجبات!' : 'Ticket is empty. Tap items to add'}</p>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.id}
                className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl flex gap-2.5 items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-gray-900">
                    {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                  </h4>
                  
                  {/* Size and Modifier text */}
                  {item.selectedSize && (
                    <span className="text-[10px] text-gray-400 block">
                      {lang === 'ar' ? `الحجم: ${item.selectedSize.nameAr}` : `Size: ${item.selectedSize.nameEn}`}
                    </span>
                  )}

                  {item.selectedModifiers.length > 0 && (
                    <div className="text-[9px] text-gray-400 flex flex-wrap gap-1 mt-0.5">
                      {item.selectedModifiers.map((m, idx) => (
                        <span key={idx} className="bg-white border border-gray-100 px-1 py-0.2 rounded">
                          {lang === 'ar' ? m.nameAr : m.nameEn} (+{m.price.toFixed(1)})
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-[11px] font-extrabold text-rose-600 mt-1 block">
                    {(item.pricePerUnit * item.quantity).toFixed(2)} {tenant.currencyEn}
                  </span>
                </div>

                {/* Counter controls */}
                <div className="flex items-center gap-1.5 bg-white border rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="p-1 hover:bg-gray-50 text-gray-400 rounded transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="p-1 hover:bg-gray-50 text-gray-400 rounded transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Calculations summary */}
        <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 space-y-2 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span className="font-mono">{subtotal.toFixed(2)} {tenant.currencyEn}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>{lang === 'ar' ? `الخصم (${discountPercent}%)` : `Discount (${discountPercent}%)`}</span>
              <span className="font-mono">-{discountAmount.toFixed(2)} {tenant.currencyEn}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-400">
            <span>{lang === 'ar' ? `الضريبة (${tenant.id === 't-1' ? '١٥٪' : '٥٪'})` : `VAT Tax (${tenant.id === 't-1' ? '15%' : '5%'})`}</span>
            <span className="font-mono">{taxAmount.toFixed(2)} {tenant.currencyEn}</span>
          </div>

          <div className="border-t border-gray-200/60 my-1.5" />

          <div className="flex justify-between items-center text-sm font-black text-gray-900">
            <span>{lang === 'ar' ? 'المجموع النهائي' : 'Order Total'}</span>
            <span className="text-rose-600 font-mono text-base">{grandTotal.toFixed(2)} {tenant.currencyEn}</span>
          </div>
        </div>

        {/* Operational buttons row */}
        <div className="grid grid-cols-12 gap-2">
          
          {/* Suspend button */}
          <button
            onClick={handleSuspendOrder}
            disabled={cart.length === 0}
            className="col-span-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex flex-col items-center justify-center gap-0.5"
          >
            <Clock className="w-4 h-4" />
            {lang === 'ar' ? 'تعليق الطلب' : 'Suspend'}
          </button>

          {/* Void / Clear button */}
          <button
            onClick={() => {
              if (cart.length === 0) return;
              if (confirm(lang === 'ar' ? 'هل تود مسح الفاتورة بالكامل؟' : 'Clear current ticket?')) {
                setCart([]);
                setCustomerName('');
                setDiscountPercent(0);
              }
            }}
            disabled={cart.length === 0}
            className="col-span-3 py-2.5 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-600 font-bold text-xs rounded-xl shadow-xs transition flex flex-col items-center justify-center gap-0.5"
          >
            <Trash2 className="w-4 h-4" />
            {lang === 'ar' ? 'إلغاء' : 'Void'}
          </button>

          {/* Pay Trigger button */}
          <button
            onClick={() => {
              if (cart.length === 0) return;
              setSelectedPaymentMethod('cash');
              setReceivedCashAmount(Math.ceil(grandTotal).toString());
              handleCompleteCheckout();
            }}
            disabled={cart.length === 0}
            className="col-span-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition flex flex-col items-center justify-center gap-0.5 uppercase tracking-wide animate-pulse"
          >
            <Check className="w-5 h-5" />
            {lang === 'ar' ? 'إرسال ودفع' : 'Pay & Print'}
          </button>

        </div>

      </div>

      {/* MODAL 1: SIZES & MODIFIERS COMPONENT POPUP */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto flex flex-col justify-between border border-gray-100 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {lang === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">{selectedProduct.sku}</span>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selection Options Body */}
            <div className="p-5 space-y-5 overflow-y-auto flex-1">
              {/* Sizes Selection */}
              {selectedProduct.sizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">
                    {lang === 'ar' ? 'خيارات الحجم' : 'Select Size Option'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.sizes.map(size => {
                      const isSelected = size.id === activeSizeId;
                      return (
                        <div
                          key={size.id}
                          onClick={() => setActiveSizeId(size.id)}
                          className={`p-2.5 rounded-lg border-2 cursor-pointer transition text-center flex flex-col justify-center ${
                            isSelected 
                              ? 'border-rose-600 bg-rose-50/10' 
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <span className="font-bold text-xs">{lang === 'ar' ? size.nameAr : size.nameEn}</span>
                          <span className="text-[9px] text-gray-400 mt-0.5">
                            {size.priceDifference === 0 
                              ? (lang === 'ar' ? 'السعر الأساسي' : 'Base') 
                              : `+${size.priceDifference.toFixed(2)} ${tenant.currencyEn}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modifier groups list */}
              {selectedProduct.modifierGroupIds.map(mgId => {
                const group = modifierGroups.find(mg => mg.id === mgId);
                if (!group) return null;

                const selectedList = activeModifiers[mgId] || [];

                return (
                  <div key={group.id} className="space-y-2 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">
                          {lang === 'ar' ? group.nameAr : group.nameEn}
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {lang === 'ar' 
                            ? `اختر من ${group.minSelect} إلى ${group.maxSelect}` 
                            : `Select ${group.minSelect} to ${group.maxSelect}`}
                        </span>
                      </div>
                      {group.isRequired && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100">
                          {lang === 'ar' ? 'مطلوب' : 'Required'}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {group.modifiers.map(mod => {
                        const isSelected = selectedList.includes(mod.id);
                        return (
                          <div
                            key={mod.id}
                            onClick={() => handleSelectModifier(group.id, mod.id, group.isRequired, group.maxSelect)}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                              isSelected 
                                ? 'border-rose-600 bg-rose-50/5' 
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <span className="font-semibold text-xs">{lang === 'ar' ? mod.nameAr : mod.nameEn}</span>
                            <div className="flex items-center gap-1.5">
                              {mod.price > 0 && (
                                <span className="text-[10px] font-bold text-rose-600">+{mod.price.toFixed(2)} {tenant.currencyEn}</span>
                              )}
                              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                                isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="w-2.5 h-2.5" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center gap-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-1/3 py-2 border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-100 transition text-center"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmModifiers}
                className="w-2/3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition text-center"
              >
                {lang === 'ar' ? 'تأكيد الإضافة السريعة' : 'Confirm & Add'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: APPLY CUSTOM TICKET DISCOUNT */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-xs border border-gray-100 text-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <h3 className="font-extrabold text-sm text-gray-900 mb-3">
              {lang === 'ar' ? 'تطبيق نسبة خصم مخصصة' : 'Apply custom percentage promo'}
            </h3>

            <div className="space-y-3">
              <div className="flex justify-center gap-1">
                {['5', '10', '15', '20', '25'].map(val => (
                  <button
                    key={val}
                    onClick={() => setDiscountInput(val)}
                    className={`px-3 py-1 text-xs border rounded-lg font-bold ${
                      discountInput === val ? 'bg-rose-600 border-rose-600 text-white' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>

              <input 
                type="number"
                min="0"
                max="100"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-center w-full focus:outline-none text-sm font-bold"
                placeholder="Custom Value %"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="w-1/2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    const parsed = parseFloat(discountInput) || 0;
                    setDiscountPercent(Math.min(100, Math.max(0, parsed)));
                    setShowDiscountModal(false);
                  }}
                  className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg"
                >
                  {lang === 'ar' ? 'تطبيق' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SUSPENDED ORDERS MANAGER */}
      {showSuspendedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm border border-gray-100 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Clock className="w-4.5 h-4.5 text-amber-500" />
                {lang === 'ar' ? 'الطلبات المعلقة بالمطعم' : 'Suspended Restaurant Orders'}
              </h3>
              <button onClick={() => setShowSuspendedModal(false)} className="text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto">
              {suspendedOrders.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">{lang === 'ar' ? 'لا يوجد طلبات معلقة.' : 'No suspended tickets currently.'}</p>
              ) : (
                suspendedOrders.map(order => (
                  <div 
                    key={order.id}
                    className="p-3 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-between hover:border-rose-100 transition"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{order.customerName}</h4>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {order.timestamp} • {order.items.reduce((sum, i) => sum + i.quantity, 0)} {lang === 'ar' ? 'أصناف' : 'items'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleResumeOrder(order)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      {lang === 'ar' ? 'استرجاع' : 'Resume'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3.5: ONLINE MENU ORDERS MANAGER */}
      {showOnlineOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl p-5 w-full max-w-lg border border-gray-100 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <span>🌐</span>
                {lang === 'ar' ? 'طلبات المنيو الرقمي (أونلاين)' : 'Online Menu Orders'}
              </h3>
              <button onClick={() => setShowOnlineOrdersModal(false)} className="text-gray-400 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
              {orders.filter(o => o.source === 'DigitalMenu' && o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
                <div className="text-center py-8 text-gray-400 space-y-2">
                  <span className="text-2xl">📭</span>
                  <p className="text-xs">{lang === 'ar' ? 'لا توجد طلبات أونلاين نشطة حالياً.' : 'No active online orders.'}</p>
                </div>
              ) : (
                orders
                  .filter(o => o.source === 'DigitalMenu' && o.status !== 'completed' && o.status !== 'cancelled')
                  .map(order => {
                    const items = orderItems.filter(oi => oi.orderId === order.id);
                    return (
                      <div 
                        key={order.id} 
                        className="p-4 border border-gray-100 rounded-2xl bg-gray-50 dark:bg-gray-900/10 space-y-3"
                      >
                        {/* Title Row */}
                        <div className="flex items-center justify-between border-b border-gray-200/40 pb-2">
                          <div>
                            <span className="font-mono font-bold text-xs text-gray-800">{order.receiptNumber}</span>
                            <span className="text-[9px] text-gray-400 block mt-0.5">{new Date(order.createdAt).toLocaleTimeString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                              order.customerType === 'dine_in' ? 'bg-rose-50 text-rose-600' :
                              order.customerType === 'delivery' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {order.customerType === 'dine_in' ? (lang === 'ar' ? 'محلي' : 'Dine-in') :
                               order.customerType === 'delivery' ? (lang === 'ar' ? 'توصيل' : 'Delivery') :
                               (lang === 'ar' ? 'استلام' : 'Takeaway')}
                            </span>
                            
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                              order.status === 'pending' ? 'bg-indigo-50 text-indigo-600 animate-pulse' :
                              order.status === 'preparing' ? 'bg-amber-50 text-amber-655' : 'bg-green-50 text-green-600'
                            }`}>
                              {order.status === 'pending' ? (lang === 'ar' ? 'قيد الانتظار' : 'Pending') :
                               order.status === 'preparing' ? (lang === 'ar' ? 'يتحضر' : 'Preparing') :
                               (lang === 'ar' ? 'جاهز' : 'Ready')}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info Box */}
                        <div className="text-[10px] text-gray-500 bg-white/60 p-2.5 rounded-xl space-y-1 border border-gray-200/40 leading-relaxed text-right">
                          {order.customerType === 'dine_in' && order.tableNumber && (
                            <div className="flex items-center gap-1 font-black text-rose-600">
                              <span>🍽️</span>
                              <span>{lang === 'ar' ? `رقم الطاولة: ${order.tableNumber}` : `Table No: ${order.tableNumber}`}</span>
                            </div>
                          )}
                          {order.customerName && order.customerType !== 'dine_in' && (
                            <div>
                              <span className="font-bold">{lang === 'ar' ? 'اسم العميل: ' : 'Customer Name: '}</span>
                              <span className="text-gray-800 font-bold">{order.customerName}</span>
                            </div>
                          )}
                          {order.customerPhone && (
                            <div>
                              <span className="font-bold">{lang === 'ar' ? 'رقم الجوال: ' : 'Phone: '}</span>
                              <span className="text-gray-800 font-mono">{order.customerPhone}</span>
                            </div>
                          )}
                          {order.customerType === 'delivery' && order.deliveryAddress && (
                            <div className="border-t border-dotted pt-1 mt-1">
                              <span className="font-bold block text-gray-400 text-[9px]">{lang === 'ar' ? 'عنوان التوصيل:' : 'Delivery Address:'}</span>
                              <span className="text-gray-700 font-semibold">{order.deliveryAddress}</span>
                            </div>
                          )}
                        </div>

                        {/* Order Items Summary */}
                        <div className="space-y-1 text-right">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{lang === 'ar' ? 'تفاصيل الطلب:' : 'Order Items:'}</span>
                          <div className="space-y-1">
                            {items.map(item => (
                              <div key={item.id} className="text-[10px] text-gray-700 flex justify-between bg-white/40 px-2 py-1 rounded">
                                <span>{item.quantity} x {lang === 'ar' ? item.productNameAr : item.productNameEn} {item.sizeNameEn && `(${lang === 'ar' ? item.sizeNameAr : item.sizeNameEn})`}</span>
                                <span className="font-mono font-semibold">{(item.pricePerItem * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Calculations Row */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200/40 text-xs">
                          <div>
                            <span className="font-bold text-gray-800">{lang === 'ar' ? 'الإجمالي: ' : 'Total: '}</span>
                            <span className="text-rose-600 font-black">{order.total.toFixed(2)} {tenant.currencyEn}</span>
                          </div>
                          
                          {/* Actions button group */}
                          <div className="flex gap-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => {
                                  if (setOrders) {
                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'preparing' } : o));
                                    addAuditLog('POS_ACCEPT_ORDER', 'Order', order.id, `POS cashier accepted online order ${order.receiptNumber}`);
                                  }
                                }}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                {lang === 'ar' ? 'قبول وتحضير' : 'Accept & Prep'}
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => {
                                  if (setOrders) {
                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'ready' } : o));
                                    addAuditLog('POS_READY_ORDER', 'Order', order.id, `POS cashier marked online order ${order.receiptNumber} as Ready`);
                                  }
                                }}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                {lang === 'ar' ? 'تجهيز' : 'Mark Ready'}
                              </button>
                            )}
                            {order.status === 'ready' && (
                              <button
                                onClick={() => {
                                  if (setOrders) {
                                    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
                                    addAuditLog('POS_COMPLETE_ORDER', 'Order', order.id, `POS cashier delivered and closed online order ${order.receiptNumber}`);
                                  }
                                }}
                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-[10px] transition cursor-pointer"
                              >
                                {lang === 'ar' ? 'تسليم وإنهاء' : 'Complete Order'}
                              </button>
                            )}
                            <button
                              onClick={() => handleViewOnlineOrderReceipt(order)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-[10px] transition flex items-center gap-1 cursor-pointer"
                            >
                              <span>🧾</span>
                              <span>{lang === 'ar' ? 'الفاتورة' : 'Bill'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FULL THERMAL RECEIPT SIMULATOR */}
      {showPaymentReceipt && lastOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto flex flex-col justify-between shadow-2xl relative">
            
            {/* Close trigger */}
            <button 
              onClick={() => setShowPaymentReceipt(false)}
              className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Thermal Print paper representation */}
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-5 text-gray-800 font-mono text-xs text-center space-y-4 shadow-sm">
              
              {/* Brand Logo & Invoice meta */}
              <div className="space-y-1">
                <span className="font-extrabold text-sm uppercase tracking-wider text-rose-600">★★ {tenant.nameEn} ★★</span>
                <p className="text-[10px] text-gray-400">HQ Riyadh Node • Tax ID: 30045920000</p>
                <div className="border-t border-gray-300 border-dotted my-1" />
                <h4 className="font-extrabold text-xs uppercase">{lang === 'ar' ? 'فاتورة ضريبية مبسطة' : 'Simplified Tax Invoice'}</h4>
                <p className="text-[10px] text-gray-500 font-bold">{lastOrderDetails.receiptNumber}</p>
                <p className="text-[9px] text-gray-400">{lastOrderDetails.timestamp}</p>
              </div>

              {/* Customer Info Panel */}
              <div className="border-t border-b border-gray-300 border-dotted py-2.5 space-y-1 text-right text-[10px]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex justify-between font-bold text-gray-400">
                  <span>{lang === 'ar' ? 'نوع الطلب:' : 'Service Type:'}</span>
                  <span className="text-rose-655 font-black">
                    {lastOrderDetails.customerType === 'dine_in' && (lang === 'ar' ? 'محلي (صالة)' : 'Dine-in')}
                    {lastOrderDetails.customerType === 'takeaway' && (lang === 'ar' ? 'سفري (استلام)' : 'Takeaway')}
                    {lastOrderDetails.customerType === 'delivery' && (lang === 'ar' ? 'توصيل للمنزل' : 'Delivery')}
                  </span>
                </div>
                {lastOrderDetails.tableNumber && (
                  <div className="flex justify-between font-black text-xs text-rose-650 bg-rose-50/50 p-2 rounded-xl border border-rose-100/50 mt-1">
                    <span>{lang === 'ar' ? 'رقم الطاولة:' : 'Table Number:'}</span>
                    <span>{lastOrderDetails.tableNumber}</span>
                  </div>
                )}
                {lastOrderDetails.customerName && lastOrderDetails.customerType !== 'dine_in' && (
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'العميل:' : 'Customer:'}</span>
                    <span className="font-bold text-slate-800">{lastOrderDetails.customerName}</span>
                  </div>
                )}
                {lastOrderDetails.customerPhone && (
                  <div className="flex justify-between">
                    <span>{lang === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}</span>
                    <span className="font-bold text-slate-800 font-mono">{lastOrderDetails.customerPhone}</span>
                  </div>
                )}
                {lastOrderDetails.deliveryAddress && (
                  <div className="text-right border-t border-dotted border-gray-200 pt-1.5 mt-1.5">
                    <span className="text-gray-400 block text-[8px] font-bold">{lang === 'ar' ? 'عنوان التوصيل:' : 'Delivery Address:'}</span>
                    <p className="font-semibold text-slate-800 leading-tight mt-0.5">{lastOrderDetails.deliveryAddress}</p>
                  </div>
                )}
              </div>

              {/* Items row */}
              <div className="space-y-2 text-left font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex justify-between font-bold border-b border-gray-300 border-dotted pb-1.5 text-[9px] text-gray-400 uppercase tracking-wider">
                  <span>{lang === 'ar' ? 'الصنف' : 'Item Description'}</span>
                  <span>{lang === 'ar' ? 'الكمية * السعر' : 'Qty * Price'}</span>
                </div>
                {lastOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5 text-[10px]">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span className="truncate max-w-[170px]">{lang === 'ar' ? item.product.nameAr : item.product.nameEn}</span>
                      <span className="font-mono">{item.quantity} * {item.pricePerUnit.toFixed(2)}</span>
                    </div>
                    {item.selectedSize && (
                      <span className="text-[9px] text-gray-400 block pr-2 pl-2">• {lang === 'ar' ? `الحجم: ${item.selectedSize.nameAr}` : `Size: ${item.selectedSize.nameEn}`}</span>
                    )}
                    {item.selectedModifiers.map((m, mIdx) => (
                      <span key={mIdx} className="text-[9px] text-gray-400 block pr-2 pl-2">• {lang === 'ar' ? `${m.nameAr} (+${m.price.toFixed(1)})` : `${m.nameEn} (+${m.price.toFixed(1)})`}</span>
                    ))}
                  </div>
                ))}
              </div>

              {/* Calculations block */}
              <div className="border-t border-gray-300 border-dotted pt-2.5 space-y-1 text-right font-sans text-[10px]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex justify-between text-slate-500">
                  <span>{lang === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                  <span className="font-mono">{lastOrderDetails.subtotal.toFixed(2)} {tenant.currencyEn}</span>
                </div>
                {lastOrderDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>{lang === 'ar' ? 'الخصم المطبق:' : 'Discount Applied:'}</span>
                    <span className="font-mono">-{lastOrderDetails.discountAmount.toFixed(2)} {tenant.currencyEn}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>{lang === 'ar' ? `الضريبة (${tenant.id === 't-1' ? '١٥٪' : '٥٪'}):` : `VAT (${tenant.id === 't-1' ? '15%' : '5%'}):`}</span>
                  <span className="font-mono">{lastOrderDetails.taxAmount.toFixed(2)} {tenant.currencyEn}</span>
                </div>
                <div className="flex justify-between text-xs font-black border-t border-dotted border-gray-350 pt-1.5 mt-1 text-slate-900">
                  <span>{lang === 'ar' ? 'المجموع النهائي:' : 'GRAND TOTAL:'}</span>
                  <span className="text-rose-600 font-mono text-xs">{lastOrderDetails.total.toFixed(2)} {tenant.currencyEn}</span>
                </div>
              </div>

              {/* Change section */}
              <div className="border-t border-gray-300 border-dotted pt-2 text-[10px] text-right font-sans space-y-0.5 text-slate-650" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <p><strong>{lang === 'ar' ? 'طريقة الدفع:' : 'Payment Method:'}</strong> {lastOrderDetails.paymentMethod.toUpperCase()}</p>
                {lastOrderDetails.changeAmount > 0 && (
                  <p className="text-emerald-600 font-bold"><strong>{lang === 'ar' ? 'المتبقي للعميل:' : 'Change Due:'}</strong> {lastOrderDetails.changeAmount.toFixed(2)} {tenant.currencyEn}</p>
                )}
              </div>

              {/* ZATCA Simplified Tax Invoice QR Code representation */}
              <div className="pt-3 flex flex-col items-center space-y-1.5 border-t border-dotted border-gray-300">
                <div className="p-1.5 bg-white border border-gray-200 rounded-xl shadow-xs inline-block">
                  <svg className="w-16 h-16 text-gray-800" viewBox="0 0 100 100">
                    <path d="M5 5h30v30H5V5zm4 4v22h22V9H9zM15 15h10v10H15V15zm45-10h30v30H60V5zm4 4v22h22V9H64zm10 6h10v10H74V15zM5 60h30v30H5V60zm4 4v22h22V64H9zm10 6h10v10H19v-10zm35-10h6v6h-6zm10 0h6v6h-6zm10 0h10v6H80zm-20 10h10v6H60zm16 0h6v6h-6zm6 0h12v6H82zm-22 10h6v6h-6zm10 0h12v6H70zm18 0h6v6h-6z" fill="currentColor" />
                  </svg>
                </div>
                <span className="text-[7px] text-gray-400 tracking-wider font-mono uppercase">ZATCA COMPLIANT TAX QR CODE</span>
                <span className="text-[8px] text-gray-400">Powered by Foodics SaaS Monolith Core</span>
              </div>

              <p className="text-[9px] text-gray-400 font-medium italic">
                {lang === 'ar' ? 'نشكرك على اختيارنا، نتمنى لك وجبة هنيئة!' : 'Thank you for your visit, enjoy your meal!'}
              </p>

            </div>

            {/* Simulated Receipt Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-1/2 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
              >
                {lang === 'ar' ? 'طباعة الفاتورة 🖨️' : 'Print Thermal Invoice 🖨️'}
              </button>
              <button
                onClick={() => setShowPaymentReceipt(false)}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
              >
                {lang === 'ar' ? 'معاملة جديدة' : 'New Transaction'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
