export enum UserRole {
  SUPER_ADMIN = "Super Administrator",
  ADMIN = "Administrator",
  STAFF = "Staff",
  CUSTOMER = "Customer"
}

export enum UserStatus {
  ACTIVE = "Active",
  DISABLED = "Disabled"
}

export interface User {
  uid: string;
  email: string;
  passwordHash?: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  mustChangePassword?: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  priceMwk: number;
  stockLevel: number;
  unit: string;
  isFeatured: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export enum OrderStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  PROCESSING = "Processing",
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled"
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceMwk: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  trackingNotes?: string;
}

export enum QuotationStatus {
  PENDING = "Pending",
  RESPONDED = "Responded",
  CLOSED = "Closed"
}

export interface Quotation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  quantity: number;
  notes: string;
  status: QuotationStatus;
  responsePriceMwk?: number;
  createdAt: string;
}

export enum InventoryTransactionType {
  STOCK_IN = "Stock In",
  STOCK_OUT = "Stock Out"
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productName: string;
  type: InventoryTransactionType;
  quantity: number;
  reason: string;
  operatorName: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  description?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  email: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "order" | "stock" | "user" | "contact";
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userName: string;
  userEmail: string;
  action: string;
  ipAddress: string;
  createdAt: string;
}

export interface Setting {
  id: string;
  companyName: string;
  brandName: string;
  email: string;
  phone1: string;
  phone2: string;
  phone3: string;
  address: string;
  vatRate: number;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
}
