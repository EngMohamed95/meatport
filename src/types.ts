export interface Tenant {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string;
  currencyEn: string;
  currencyAr: string;
  managerUsername?: string;
  managerPassword?: string;
  addressEn?: string;
  addressAr?: string;
  phone?: string;
  expiryDate?: string;
  plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  status?: 'active' | 'suspended' | 'expired';
  enableDelivery?: boolean;
  secondaryColor?: string;
  darkMode?: boolean;
  showLogoInHeader?: boolean;
  showLogoInFooter?: boolean;
  sloganAr?: string;
  sloganEn?: string;
  descAr?: string;
  descEn?: string;
  hoursAr?: string;
  hoursEn?: string;
  supportAr?: string;
  supportEn?: string;
  socialAr?: string;
  socialEn?: string;
  handle?: string;
  copyrightAr?: string;
  copyrightEn?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  whatsappNumber?: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  nameEn: string;
  nameAr: string;
  addressEn: string;
  addressAr: string;
  phone: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  tenantId: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  displayOrder: number;
  isVisible: boolean;
  parentId?: string | null; // For Sub-categories support
  imageUrl?: string;
}

export interface Modifier {
  id: string;
  modifierGroupId: string;
  nameEn: string;
  nameAr: string;
  price: number;
  calories?: number;
  sku?: string;
}

export interface ModifierGroup {
  id: string;
  tenantId: string;
  nameEn: string;
  nameAr: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  modifiers: Modifier[];
}

export interface ProductSize {
  id: string;
  nameEn: string;
  nameAr: string;
  priceDifference: number; // Added to base price
  calories?: number;
  sku?: string;
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId: string;
  subCategoryId?: string | null;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price: number;
  costPrice: number;
  profit: number;
  margin: number; // percentage
  calories?: number;
  preparationTime: number; // in minutes
  sku: string;
  barcode?: string;
  imageUrl?: string;
  videoUrl?: string;
  displayOrder: number;
  isVisible: boolean;
  isFeatured: boolean;
  isRecommended: boolean;
  isPopular: boolean;
  trackStock: boolean;
  stockQuantity: number;
  recipeLink?: string;
  allergens: string[]; // e.g. ["Nuts", "Gluten", "Dairy"]
  nutrition?: {
    carbs?: number;
    protein?: number;
    fat?: number;
  };
  modifierGroupIds: string[];
  sizes: ProductSize[];
  taxRate: number; // e.g. 0.15 for 15% VAT
  discountRate: number; // e.g. 0.10 for 10% discount
}

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityName: string;
  entityId: string;
  timestamp: string;
  details: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userEmail: string;
  role: 'SuperAdmin' | 'BranchManager' | 'KitchenStaff' | 'Cashier';
  branchId?: string;
  loginTime: string;
  ipAddress: string;
}

export interface Ingredient {
  id: string;
  tenantId: string;
  nameEn: string;
  nameAr: string;
  sku: string;
  stockQuantity: number;
  unitEn: string;
  unitAr: string;
  costPerUnit: number;
  supplierName: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  reorderLevel: number;
  totalConsumedCount: number; // For average consumption prediction calculations
}

export interface RecipeItem {
  productId: string;
  ingredientId: string;
  quantityRequired: number; // Quantity consumed per unit sold
}

export interface Order {
  id: string;
  tenantId: string;
  branchId: string;
  receiptNumber: string;
  customerName?: string;
  customerType: 'dine_in' | 'takeaway' | 'delivery';
  paymentMethod: 'cash' | 'card' | 'apple_pay' | 'online';
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string; // ISO DateTime string
  source: 'DigitalMenu' | 'POS';
  preparationTimeEstimate?: number; // Total estimated prep time in minutes
  tableNumber?: string;
  customerPhone?: string;
  deliveryAddress?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
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
}

