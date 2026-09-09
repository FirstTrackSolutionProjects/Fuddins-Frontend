export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
}

export interface ProductVariation {
  id: number;
  title?: string | null;
  price?: number | null;
  regularPrice?: number | null;
  salePrice?: number | null;
  sku?: string | null;
  stockQuantity?: number | null;
  stockStatus?: string;
  attributes?: Record<string, string>;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  regularPrice?: number | null;
  salePrice?: number | null;
  sku?: string | null;
  description?: string;
  fullDescription?: string | null;
  imageUrl?: string | null;
  galleryImages?: string | null;
  brand?: string | null;
  stockQuantity?: number | null;
  stockStatus?: string;
  attributes?: string | null;
  variations?: string | null;
  categoryId?: number | null;
  category?: Category | null;
}

export interface CartItem {
  product: Product;
  variation?: ProductVariation | null;
  quantity: number;
}

export interface Order {
  id: number;
  customerName: string;
  email: string;
  total: number;
  subtotal?: number | null;
  discountTotal?: number | null;
  shippingTotal?: number | null;
  taxTotal?: number | null;
  items: string;
  status?: string;
  couponCode?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  phone?: string | null;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt?: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: string;
  amount: number;
  usageLimit?: number | null;
  usedCount: number;
  expiresAt?: string | null;
  active: boolean;
}

export interface WalletTransaction {
  id: number;
  userId?: number | null;
  legacyUserId?: number | null;
  type: string;
  amount: number;
  balanceAfter?: number | null;
  description?: string | null;
  status: string;
  createdAt?: string;
  user?: User;
}

export interface RewardTransaction {
  id: number;
  userId?: number | null;
  legacyUserId?: number | null;
  type: string;
  points: number;
  balanceAfter?: number | null;
  description?: string | null;
  status: string;
  createdAt?: string;
  user?: User;
}

export interface Vendor {
  id: number;
  legacyVendorId?: number | null;
  storeName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
}

export interface VendorSettlement {
  id: number;
  vendorId?: number | null;
  legacyVendorId?: number | null;
  legacyOrderId?: number | null;
  transactionType: string;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  paidAmount: number;
  status: string;
  notes?: string | null;
  vendor?: Vendor;
  order?: Order;
  createdAt?: string;
}
