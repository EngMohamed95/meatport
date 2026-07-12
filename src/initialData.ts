import { Tenant, Branch, Category, ModifierGroup, Product, AuditLog, UserSession, Ingredient, RecipeItem, Order, OrderItem } from './types';
import { meatportCategories, meatportProducts } from './meatportCatalog';

export const initialTenants: Tenant[] = [
  {
    id: 't-1',
    nameEn: 'Meatport',
    nameAr: 'Meatport',
    slug: 'meatport',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&h=150&fit=crop&q=80',
    primaryColor: '#e11d48', // rose-600
    currencyEn: 'SAR',
    currencyAr: 'ر.س'
  }
];

export const initialBranches: Branch[] = [
  {
    id: 'b-1',
    tenantId: 't-1',
    nameEn: 'Riyadh Olaya Branch',
    nameAr: 'فرع العليا الرياض',
    addressEn: 'Olaya District, Riyadh, KSA',
    addressAr: 'حي العليا، الرياض، المملكة العربية السعودية',
    phone: '+966 11 456 7890',
    isActive: true
  },
  {
    id: 'b-2',
    tenantId: 't-1',
    nameEn: 'Jeddah Corniche Branch',
    nameAr: 'فرع كورنيش جدة',
    addressEn: 'Corniche Road, Jeddah, KSA',
    addressAr: 'طريق الكورنيش، جدة، المملكة العربية السعودية',
    phone: '+966 12 654 3210',
    isActive: true
  }
];

export const initialCategories: Category[] = meatportCategories;

export const initialModifierGroups: ModifierGroup[] = [
  // Burger Modifiers
  {
    id: 'mg-1',
    tenantId: 't-1',
    nameEn: 'Choose Sauce',
    nameAr: 'اختر الصلصة',
    minSelect: 1,
    maxSelect: 3,
    isRequired: true,
    modifiers: [
      { id: 'm-1', modifierGroupId: 'mg-1', nameEn: 'Truffle Mayo', nameAr: 'مايونيز الكمأة', price: 0, calories: 120 },
      { id: 'm-2', modifierGroupId: 'mg-1', nameEn: 'Smoky BBQ', nameAr: 'باربكيو مدخن', price: 0, calories: 80 },
      { id: 'm-3', modifierGroupId: 'mg-1', nameEn: 'Spicy Sriracha', nameAr: 'سيرارتشا الحارة', price: 0, calories: 95 },
      { id: 'm-4', modifierGroupId: 'mg-1', nameEn: 'Gourmet Special', nameAr: 'صلصة الذواقة الخاصة', price: 1.5, calories: 110 }
    ]
  },
  {
    id: 'mg-2',
    tenantId: 't-1',
    nameEn: 'Extra Toppings',
    nameAr: 'إضافات مميزة',
    minSelect: 0,
    maxSelect: 4,
    isRequired: false,
    modifiers: [
      { id: 'm-5', modifierGroupId: 'mg-2', nameEn: 'Sharp Cheddar Cheese', nameAr: 'جبنة شيدر حادة', price: 3.0, calories: 150 },
      { id: 'm-6', modifierGroupId: 'mg-2', nameEn: 'Crispy Beef Bacon', nameAr: 'لحم بقري مقدد مقرمش', price: 5.0, calories: 180 },
      { id: 'm-7', modifierGroupId: 'mg-2', nameEn: 'Fried Egg', nameAr: 'بيض مقلي', price: 4.0, calories: 90 },
      { id: 'm-8', modifierGroupId: 'mg-2', nameEn: 'Sautéed Mushrooms', nameAr: 'مشروم سوتيه', price: 3.5, calories: 60 }
    ]
  },
];

export const initialProducts: Product[] = meatportProducts;

export const initialIngredients: Ingredient[] = [
  { id: 'inv-1', tenantId: 't-1', nameEn: 'Cheese Slices', nameAr: 'شرائح الجبن', sku: 'SKU-CHEESE-01', stockQuantity: 240, unitEn: 'pcs', unitAr: 'حبة', costPerUnit: 0.5, supplierName: 'Almarai Corp', status: 'in_stock', reorderLevel: 50, totalConsumedCount: 32 },
  { id: 'inv-2', tenantId: 't-1', nameEn: 'Pizza Dough Base', nameAr: 'عجينة بيتزا جاهزة', sku: 'SKU-DOUGH-02', stockQuantity: 80, unitEn: 'kg', unitAr: 'كجم', costPerUnit: 2.5, supplierName: 'Riyadh Flour Mills', status: 'in_stock', reorderLevel: 20, totalConsumedCount: 12 },
  { id: 'inv-3', tenantId: 't-1', nameEn: 'Pepperoni Slices', nameAr: 'شرائح بيبيروني', sku: 'SKU-PEPP-03', stockQuantity: 110, unitEn: 'kg', unitAr: 'كجم', costPerUnit: 8.0, supplierName: 'Halal Meat Co', status: 'in_stock', reorderLevel: 30, totalConsumedCount: 18 },
  { id: 'inv-4', tenantId: 't-1', nameEn: 'Tomato Paste Sauce', nameAr: 'صلصة طماطم مركزة', sku: 'SKU-TOMATO-04', stockQuantity: 65, unitEn: 'liter', unitAr: 'لتر', costPerUnit: 1.2, supplierName: 'Gulf Foods Saudi', status: 'in_stock', reorderLevel: 10, totalConsumedCount: 22 },
  { id: 'inv-5', tenantId: 't-1', nameEn: 'Fresh Mushrooms', nameAr: 'فطر طازج مبرد', sku: 'SKU-MUSH-05', stockQuantity: 40, unitEn: 'kg', unitAr: 'كجم', costPerUnit: 4.5, supplierName: 'Agri Farms Riyadh', status: 'in_stock', reorderLevel: 15, totalConsumedCount: 5 },
  { id: 'inv-6', tenantId: 't-1', nameEn: 'Black Angus Beef Patties', nameAr: 'شرائح لحم أنجوس الأسود', sku: 'SKU-PATTY-06', stockQuantity: 150, unitEn: 'pcs', unitAr: 'حبة', costPerUnit: 5.5, supplierName: 'Premium Beef Co', status: 'in_stock', reorderLevel: 30, totalConsumedCount: 45 },
  { id: 'inv-7', tenantId: 't-1', nameEn: 'Brioche Buns', nameAr: 'خبز البريوش المحمص', sku: 'SKU-BUN-07', stockQuantity: 180, unitEn: 'pcs', unitAr: 'حبة', costPerUnit: 0.8, supplierName: 'Modern Bakeries', status: 'in_stock', reorderLevel: 40, totalConsumedCount: 45 }
];

export const initialRecipes: RecipeItem[] = [
  // Black Angus Truffle Burger (p-1) consumes Angus Patty, Brioche Bun, Cheese Slice
  { productId: 'p-1', ingredientId: 'inv-6', quantityRequired: 1 },
  { productId: 'p-1', ingredientId: 'inv-7', quantityRequired: 1 },
  { productId: 'p-1', ingredientId: 'inv-1', quantityRequired: 1 },

  // Crispy Chicken Burger (p-2) consumes Brioche Bun
  { productId: 'p-2', ingredientId: 'inv-7', quantityRequired: 1 },

  // Truffle & Wild Mushroom Pizza (p-6) consumes Pizza Dough, Tomato Paste, Mushrooms
  { productId: 'p-6', ingredientId: 'inv-2', quantityRequired: 0.25 },
  { productId: 'p-6', ingredientId: 'inv-4', quantityRequired: 0.15 },
  { productId: 'p-6', ingredientId: 'inv-5', quantityRequired: 0.10 },

  // Truffle Maccheroni (p-7) consumes Mushrooms
  { productId: 'p-7', ingredientId: 'inv-5', quantityRequired: 0.05 }
];

// Helper to calculate a timestamp relative to current date (ISO string)
const getPastISOString = (minsAgo: number) => {
  return new Date(Date.now() - minsAgo * 60000).toISOString();
};

export const initialOrders: Order[] = [
  {
    id: 'ord-1',
    tenantId: 't-1',
    branchId: 'b-1',
    receiptNumber: 'REC-GOURMET-492718',
    customerName: 'أبو فهد',
    customerType: 'dine_in',
    paymentMethod: 'cash',
    subtotal: 96.0,
    discountAmount: 0.0,
    taxAmount: 14.4,
    total: 110.4,
    status: 'preparing',
    createdAt: getPastISOString(15),
    source: 'POS',
    preparationTimeEstimate: 12
  },
  {
    id: 'ord-2',
    tenantId: 't-1',
    branchId: 'b-1',
    receiptNumber: 'REC-GOURMET-381920',
    customerName: 'سارة عبد الله',
    customerType: 'takeaway',
    paymentMethod: 'online',
    subtotal: 68.0,
    discountAmount: 0.0,
    taxAmount: 10.2,
    total: 78.2,
    status: 'pending',
    createdAt: getPastISOString(5),
    source: 'DigitalMenu',
    preparationTimeEstimate: 12
  }
];

export const initialOrderItems: OrderItem[] = [
  // For ord-1
  {
    id: 'oi-1',
    orderId: 'ord-1',
    productId: 'p-1',
    productNameEn: 'Black Angus Truffle Burger',
    productNameAr: 'برجر أنجوس الأسود بالكمأة',
    sizeNameEn: 'Single Patty',
    sizeNameAr: 'شريحة واحدة',
    pricePerItem: 68.0,
    quantity: 1,
    modifiers: [
      { nameEn: 'Truffle Mayo', nameAr: 'مايونيز الكمأة', price: 0 },
      { nameEn: 'Sharp Cheddar Cheese', nameAr: 'جبنة شيدر حادة', price: 3.0 }
    ]
  },
  {
    id: 'oi-2',
    orderId: 'ord-1',
    productId: 'p-3',
    productNameEn: 'Truffle Parmesan Fries',
    productNameAr: 'بطاطس مقلية بالكمأة والبارميزان',
    sizeNameEn: 'Regular',
    sizeNameAr: 'عادي',
    pricePerItem: 28.0,
    quantity: 1,
    modifiers: []
  },

  // For ord-2
  {
    id: 'oi-3',
    orderId: 'ord-2',
    productId: 'p-1',
    productNameEn: 'Black Angus Truffle Burger',
    productNameAr: 'برجر أنجوس الأسود بالكمأة',
    sizeNameEn: 'Single Patty',
    sizeNameAr: 'شريحة واحدة',
    pricePerItem: 68.0,
    quantity: 1,
    modifiers: [
      { nameEn: 'Truffle Mayo', nameAr: 'مايونيز الكمأة', price: 0 }
    ]
  }
];

export const initialAuditLogs: AuditLog[] = [];
