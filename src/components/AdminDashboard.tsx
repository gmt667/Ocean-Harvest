import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatMwk } from "../utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import {
  LayoutDashboard,
  ShoppingBag,
  History,
  FileText,
  UserCheck,
  Users,
  Globe,
  Settings,
  Bell,
  Activity,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Truck,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  AlertTriangle,
  Lock,
  Download,
  Mail,
  ShieldAlert
} from "lucide-react";
import { UserRole, UserStatus, OrderStatus, InventoryTransactionType, QuotationStatus } from "../types";

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    products,
    categories,
    orders,
    quotations,
    inventoryTransactions,
    contactMessages,
    newsletterSubscribers,
    notifications,
    auditLogs,
    users,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
    updateOrderStatus,
    respondToQuotation,
    addInventoryTransaction,
    updateSettings,
    createCMSItem,
    updateCMSItem,
    deleteCMSItem,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser,
    adminResetPassword,
    markNotificationAsRead,
    settings
  } = useApp();

  const primaryColor = settings?.primaryColor || "#15803d";
  const secondaryColor = settings?.secondaryColor || "#ca8a04";

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "orders" | "inventory" | "customers" | "cms" | "users" | "reports" | "audit" | "settings"
  >("overview");

  // Filter lists
  const [orderFilter, setOrderFilter] = useState("All");

  // Dynamic CMS sub-section
  const [cmsSection, setCmsSection] = useState<"services" | "testimonials" | "faqs" | "gallery" | "news">("gallery");

  // Modals & States
  const [showProductModal, setShowProductModal] = useState<any>(null); // null, 'add', or Product object
  const [showCategoryModal, setShowCategoryModal] = useState<any>(null); // null, 'add', or Category
  const [showUserModal, setShowUserModal] = useState<any>(null); // null, 'add', or User
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState<any>(null);
  const [showCMSModal, setShowCMSModal] = useState<any>(null);

  // Form Fields
  const [productForm, setProductForm] = useState({ name: "", description: "", category: "", imageUrl: "", priceMwk: 0, stockLevel: 0, unit: "5kg Bag", isFeatured: false });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", role: UserRole.STAFF, status: UserStatus.ACTIVE, mustChangePassword: true, passwordPlain: "" });
  const [txnForm, setTxnForm] = useState({ productId: "", type: InventoryTransactionType.STOCK_IN, quantity: 1, reason: "Manual Adjustment" });
  const [quoteFormPrice, setQuoteFormPrice] = useState(0);
  const [cmsForm, setCmsForm] = useState<any>({});

  // -------------------------------------------------------------
  // ROLE VERIFICATION (Zero-Trust Security Client-side enforcement)
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdmin = currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === UserRole.ADMIN;
  const isStaff = currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.STAFF;

  if (!isStaff) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-600 mx-auto" />
        <h2 className="text-xl font-black text-gray-900">Access Denied</h2>
        <p className="text-xs text-gray-500">You do not have the required operational permissions to view the Ocean General Dealers Administrative Dashboard. If you are a staff member, please contact the Super Administrator.</p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CORE CALCULATION ENGINE
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalCustomers = users.filter(u => u.role === UserRole.CUSTOMER).length;

  // Revenue calculates only Delivered or Confirmed orders
  const totalRevenue = orders
    .filter((o) => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.PROCESSING)
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const lowStockProducts = products.filter(p => p.stockLevel < 10);
  const unreadAlerts = notifications.filter(n => !n.isRead);

  // Chart Data preparation
  const stockChartData = products.slice(0, 8).map(p => ({
    name: p.name.substring(0, 15),
    stock: p.stockLevel
  }));

  const orderStatusData = [
    { name: "Pending", value: orders.filter(o => o.status === OrderStatus.PENDING).length },
    { name: "Confirmed", value: orders.filter(o => o.status === OrderStatus.CONFIRMED).length },
    { name: "Processing", value: orders.filter(o => o.status === OrderStatus.PROCESSING).length },
    { name: "Delivered", value: orders.filter(o => o.status === OrderStatus.DELIVERED).length },
    { name: "Cancelled", value: orders.filter(o => o.status === OrderStatus.CANCELLED).length }
  ].filter(item => item.value > 0);

  const COLORS = [primaryColor, secondaryColor, "#3b82f6", "#10b981", "#ef4444"];

  // -------------------------------------------------------------
  // CRUD SUBMISSIONS
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showProductModal === "add") {
      await createProduct(productForm);
    } else {
      await updateProduct(showProductModal.id, productForm);
    }
    setShowProductModal(null);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showCategoryModal === "add") {
      await createCategory(categoryForm);
    } else {
      await updateCategory(showCategoryModal.id, categoryForm);
    }
    setShowCategoryModal(null);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showUserModal === "add") {
      await adminCreateUser(userForm, userForm.passwordPlain);
    } else {
      await adminUpdateUser(showUserModal.uid, {
        name: userForm.name,
        role: userForm.role,
        status: userForm.status,
        phone: userForm.phone
      });
    }
    setShowUserModal(null);
  };

  const handleTxnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addInventoryTransaction(
      txnForm.productId,
      txnForm.type,
      txnForm.quantity,
      txnForm.reason
    );
    setShowTxnModal(false);
  };

  const handleQuoteRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showQuoteModal) return;
    await respondToQuotation(showQuoteModal.id, quoteFormPrice);
    setShowQuoteModal(null);
  };

  const handleCMSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const collectionName =
      cmsSection === "gallery" ? "gallery" :
      cmsSection === "services" ? "services" :
      cmsSection === "testimonials" ? "testimonials" :
      cmsSection === "news" ? "news" : "faqs";

    if (showCMSModal === "add") {
      await createCMSItem(collectionName, cmsForm);
    } else {
      await updateCMSItem(collectionName, showCMSModal.id, cmsForm);
    }
    setShowCMSModal(null);
  };

  // -------------------------------------------------------------
  // REPORTS GENERATION EXPORTERS (CSV / printable window)
  const exportToCSV = (reportType: string) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (reportType === "sales") {
      csvContent += "Order ID,Customer Name,Customer Email,Status,Total Amount (MWK),Date\n";
      orders.forEach((o) => {
        csvContent += `"${o.id}","${o.customerName}","${o.customerEmail}","${o.status}","${o.totalAmount}","${o.createdAt}"\n`;
      });
    } else if (reportType === "inventory") {
      csvContent += "Product Name,Current Stock Level,Category,Dealer Price (MWK)\n";
      products.forEach((p) => {
        csvContent += `"${p.name}","${p.stockLevel}","${p.category}","${p.priceMwk}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ocean_Harvest_${reportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin_dashboard_main">
      <div className="lg:flex gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 bg-emerald-950 border border-emerald-900/50 rounded-2xl p-4 space-y-1.5 text-left mb-6 lg:mb-0 shadow-md flex-shrink-0 flex flex-col justify-between text-white">
          <div>
            <div className="p-3 border-b border-emerald-900/30 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center font-bold text-emerald-950 text-xs">OH</div>
                <div>
                  <h1 className="text-white text-xs font-bold leading-none tracking-tight">Ocean Harvest</h1>
                  <p className="text-emerald-400 text-[9px] uppercase font-bold mt-1 tracking-wider">Management System</p>
                </div>
              </div>
            </div>
            <p className="text-3xs font-black text-emerald-500 uppercase tracking-widest px-3 mb-2">Main Console</p>
            <div className="space-y-1">
              {[
                { label: "Overview Analytics", tab: "overview", icon: <LayoutDashboard className="w-4 h-4" /> },
                { label: "Product Catalog", tab: "products", icon: <ShoppingBag className="w-4 h-4 animate-none" /> },
                { label: "Harvest Orders", tab: "orders", icon: <History className="w-4 h-4" /> },
                { label: "Warehouse Inventory", tab: "inventory", icon: <FileText className="w-4 h-4" /> },
                { label: "Customer Profiles", tab: "customers", icon: <UserCheck className="w-4 h-4" /> },
                { label: "Dynamic CMS Blocks", tab: "cms", icon: <Globe className="w-4 h-4" /> },
                { label: "Staff & User Roles", tab: "users", icon: <Users className="w-4 h-4" /> },
                { label: "CSV & PDF Reports", tab: "reports", icon: <FileSpreadsheet className="w-4 h-4" /> },
                { label: "System settings", tab: "settings", icon: <Settings className="w-4 h-4" /> },
                { label: "Audit Log Trail", tab: "audit", icon: <Activity className="w-4 h-4" /> }
              ].map((item) => {
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab as any)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all focus:outline-none ${
                      isActive
                        ? "text-white bg-emerald-800/50 border-l-4 border-amber-400 font-bold shadow-sm"
                        : "text-emerald-300 hover:bg-emerald-900/40 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {currentUser && (
            <div className="mt-6 pt-3 border-t border-emerald-900/30 bg-emerald-950/20">
              <div className="flex items-center gap-3 px-1">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-3xs font-black border border-emerald-500 flex-shrink-0">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-3xs font-extrabold truncate leading-tight">{currentUser.name}</p>
                  <p className="text-emerald-400 text-[9px] uppercase font-bold tracking-wider">{currentUser.role.replace("ROLE_", "").replace("_", " ")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Display Board */}
        <div className="flex-1 bg-white border border-slate-250 rounded-2xl p-5 sm:p-6 text-left shadow-sm min-h-[550px] overflow-hidden">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-800">Enterprise Overview</h2>
                  <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
                  <div className="flex items-center text-3xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 uppercase tracking-tighter">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-ping"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 absolute"></span>
                    Live Database Connected
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="flex flex-col items-end">
                    <p className="text-xs font-bold text-slate-700">MWK Currency</p>
                    <p className="text-[10px] text-slate-400 font-mono">Africa/Blantyre {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })} CAT</p>
                  </div>
                  <div className="relative flex items-center justify-center w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold">
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    ●
                  </div>
                </div>
              </div>

              {/* Stat Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue (MTD)", val: formatMwk(totalRevenue), sub: "+12.4% vs Last Month", highlight: true },
                  { label: "Active Orders", val: `${totalOrders} Units`, sub: "All customer transactions", progress: true },
                  { label: "Inventory Alerts", val: `${lowStockProducts.length.toString().padStart(2, '0')} Items`, sub: lowStockProducts.length > 0 ? "Action Required Immediately" : "All stocks stable", isAlert: lowStockProducts.length > 0 },
                  { label: "Registered Customers", val: totalCustomers.toLocaleString(), sub: "Malawi wholesale buyers" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className={`text-xl font-black tracking-tight ${stat.highlight ? "text-slate-900 underline decoration-amber-400 decoration-4" : stat.isAlert ? "text-red-600" : "text-slate-900"}`}>{stat.val}</p>
                    </div>
                    {stat.progress ? (
                      <div className="flex gap-1 mt-2">
                        <div className="h-1.5 w-full bg-amber-400 rounded-full"></div>
                        <div className="h-1.5 w-1/3 bg-slate-100 rounded-full"></div>
                      </div>
                    ) : (
                      <p className={`text-[10px] font-bold mt-1 ${stat.isAlert ? "text-red-500 uppercase italic" : "text-emerald-600"}`}>{stat.sub}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Recharts Live Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Crop Stock Levels</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockChartData}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "10px" }} />
                        <Bar dataKey="stock" fill={primaryColor} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Order Status Distribution</h3>
                    <div className="h-48 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {orderStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "10px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 text-3xs font-extrabold text-gray-500 pb-2">
                    {orderStatusData.map((status, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        {status.name}: {status.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alerts & Notifications list */}
              <div className="bg-amber-50/30 border border-amber-100 p-6 rounded-3xl space-y-4 text-left">
                <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-1">
                  <Bell className="w-4 h-4 text-amber-600" /> Operational System Alerts ({unreadAlerts.length})
                </h3>
                {unreadAlerts.length === 0 ? (
                  <p className="text-3xs text-amber-700 italic">No unread alerts. System is fully operational!</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {unreadAlerts.map((n) => (
                      <div key={n.id} className="bg-white p-3 rounded-xl border border-amber-100/50 flex justify-between items-center text-3xs">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-gray-800 block">{n.title}</span>
                          <span className="text-gray-500">{n.message}</span>
                        </div>
                        <button
                          onClick={() => markNotificationAsRead(n.id)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold rounded-lg"
                        >
                          Mark Read
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT CATALOGUE */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Catalog Commodities</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage, add, update, and remove crops, quails, or condiments.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCategoryForm({ name: "", description: "" });
                      setShowCategoryModal("add");
                    }}
                    className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border text-gray-700 text-xs font-bold rounded-xl flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Category</span>
                  </button>
                  <button
                    onClick={() => {
                      setProductForm({ name: "", description: "", category: categories[0]?.name || "", imageUrl: "", priceMwk: 1000, stockLevel: 100, unit: "5kg Bag", isFeatured: false });
                      setShowProductModal("add");
                    }}
                    className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Crop / Item</span>
                  </button>
                </div>
              </div>

              {/* Table List */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-3xs uppercase text-gray-400 font-extrabold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Image & Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price (MWK)</th>
                      <th className="px-6 py-4">Stock Level</th>
                      <th className="px-6 py-4">Featured</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                          <div>
                            <span className="font-extrabold text-gray-900 block">{p.name}</span>
                            <span className="text-3xs text-gray-400">{p.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-500">{p.category}</td>
                        <td className="px-6 py-4 font-extrabold text-gray-900">{formatMwk(p.priceMwk)}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${p.stockLevel < 10 ? "text-red-600 font-black animate-pulse" : "text-gray-700"}`}>
                            {p.stockLevel} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${p.isFeatured ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-gray-100 text-gray-400"}`}>
                            {p.isFeatured ? "Featured" : "Regular"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end space-x-2 pt-5">
                          <button
                            onClick={() => {
                              setProductForm({ name: p.name, description: p.description, category: p.category, imageUrl: p.imageUrl, priceMwk: p.priceMwk, stockLevel: p.stockLevel, unit: p.unit, isFeatured: p.isFeatured });
                              setShowProductModal(p);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this product?")) {
                                await deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: HARVEST ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-50 pb-4 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Manage Harvest Orders</h2>
                  <p className="text-xs text-gray-500 mt-1">Review, authorize confirmation, process shipping, or cancel orders.</p>
                </div>

                {/* Status filters */}
                <div className="flex gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100 w-fit">
                  {["All", "Pending", "Confirmed", "Processing", "Delivered", "Cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-3xs font-black transition-all ${
                        orderFilter === status ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quotations pending reply section */}
              {quotations.filter(q => q.status === QuotationStatus.PENDING).length > 0 && (
                <div className="bg-amber-50/20 border border-amber-100 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-1">
                    <FileText className="w-4 h-4" /> Pending Quotation Tickets ({quotations.filter(q => q.status === QuotationStatus.PENDING).length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quotations.filter(q => q.status === QuotationStatus.PENDING).map((q) => (
                      <div key={q.id} className="bg-white border border-amber-100 p-4 rounded-2xl text-xs space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-gray-800">{q.customerName}</span>
                            <span className="text-3xs text-gray-400 block">{q.customerEmail}</span>
                          </div>
                          <span className="text-3xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold">Pending Reply</span>
                        </div>
                        <p className="font-bold text-gray-900 mt-1">{q.quantity} x {q.productName}</p>
                        {q.notes && <p className="text-3xs text-gray-500 italic">"{q.notes}"</p>}
                        <div className="flex gap-2 border-t border-gray-50 pt-3">
                          <input
                            type="number"
                            placeholder="Quote Price (MWK)"
                            onChange={(e) => setQuoteFormPrice(parseInt(e.target.value) || 0)}
                            className="p-2 border border-gray-200 rounded-lg text-3xs flex-1 focus:outline-none"
                          />
                          <button
                            onClick={async () => {
                              if (quoteFormPrice <= 0) return alert("Please enter a valid price");
                              await respondToQuotation(q.id, quoteFormPrice);
                            }}
                            className="px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-3xs font-bold"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Send Response
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Table */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-3xs uppercase text-gray-400 font-extrabold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders
                      .filter((o) => orderFilter === "All" || o.status === orderFilter)
                      .map((o) => (
                        <tr key={o.id}>
                          <td className="px-6 py-4 font-extrabold text-gray-900">#{o.id}</td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-800 block">{o.customerName}</span>
                            <span className="text-3xs text-gray-400">{o.customerEmail}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span
                              className="px-2.5 py-1 rounded-full text-3xs font-extrabold uppercase"
                              style={{
                                backgroundColor:
                                  o.status === "Delivered" ? "#dcfce7" :
                                  o.status === "Cancelled" ? "#fee2e2" : "#fef3c7",
                                color:
                                  o.status === "Delivered" ? "#166534" :
                                  o.status === "Cancelled" ? "#991b1b" : "#92400e"
                              }}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-extrabold text-gray-900">{formatMwk(o.totalAmount)}</td>
                          <td className="px-6 py-4 text-right flex justify-end space-x-1 pt-5">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus, `Status updated to ${e.target.value}`)}
                              className="p-1.5 border border-gray-200 rounded-lg text-3xs focus:outline-none"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: WAREHOUSE INVENTORY */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Warehouse Inventory</h2>
                  <p className="text-xs text-gray-500 mt-1">Review stock intake history and log manual adjustments.</p>
                </div>
                <button
                  onClick={() => {
                    setTxnForm({ productId: products[0]?.id || "", type: InventoryTransactionType.STOCK_IN, quantity: 1, reason: "Restock" });
                    setShowTxnModal(true);
                  }}
                  className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Stock adjustment</span>
                </button>
              </div>

              {/* Transactions log table */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-3xs uppercase text-gray-400 font-extrabold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Qty adjusted</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Operator</th>
                      <th className="px-6 py-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {inventoryTransactions.map((t) => (
                      <tr key={t.id}>
                        <td className="px-6 py-4 font-mono text-3xs text-gray-500">{t.id}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{t.productName}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-3xs font-bold ${
                              t.type === InventoryTransactionType.STOCK_IN
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-extrabold">{t.quantity} bags/units</td>
                        <td className="px-6 py-4 text-gray-500">{t.reason}</td>
                        <td className="px-6 py-4 font-semibold text-gray-600">{t.operatorName}</td>
                        <td className="px-6 py-4 text-right text-gray-400 text-3xs">{new Date(t.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER PROFILES */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Customer Profiles</h2>
                <p className="text-xs text-gray-500 mt-1">Review customer registration logs, profile details, and account statuses.</p>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-3xs uppercase text-gray-400 font-extrabold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Customer Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">P.O. Box Address</th>
                      <th className="px-6 py-4">Registered Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Orders placed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users
                      .filter((u) => u.role === UserRole.CUSTOMER)
                      .map((c) => {
                        const orderCount = orders.filter((o) => o.customerId === c.uid).length;
                        return (
                          <tr key={c.uid}>
                            <td className="px-6 py-4 font-bold text-gray-800">{c.name}</td>
                            <td className="px-6 py-4 text-gray-500">{c.email}</td>
                            <td className="px-6 py-4 text-gray-500 font-semibold">{c.poBox || "—"}</td>
                            <td className="px-6 py-4 text-gray-400 text-3xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${c.status === UserStatus.ACTIVE ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-black text-gray-900">{orderCount} orders</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: DYNAMIC CMS BLOCKS */}
          {activeTab === "cms" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-50 pb-4 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">CMS Website Management</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage public website blocks (Photos, Services, Testimonials, FAQs, News).</p>
                </div>

                <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 w-fit">
                  {[
                    { label: "Gallery", key: "gallery" },
                    { label: "Services", key: "services" },
                    { label: "Reviews", key: "testimonials" },
                    { label: "Bulletins", key: "news" },
                    { label: "FAQs", key: "faqs" }
                  ].map((sub) => (
                    <button
                      key={sub.key}
                      onClick={() => setCmsSection(sub.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-3xs font-black transition-all ${
                        cmsSection === sub.key ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* List and create depending on selection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest capitalize">{cmsSection} list</h3>
                  <button
                    onClick={() => {
                      if (cmsSection === "gallery") setCmsForm({ title: "", imageUrl: "", category: "Product Stock", description: "" });
                      else if (cmsSection === "services") setCmsForm({ title: "", description: "", iconName: "Truck" });
                      else if (cmsSection === "testimonials") setCmsForm({ name: "", role: "", content: "", rating: 5 });
                      else if (cmsSection === "faqs") setCmsForm({ question: "", answer: "" });
                      else if (cmsSection === "news") setCmsForm({ title: "", content: "", imageUrl: "", createdAt: new Date().toISOString() });
                      setShowCMSModal("add");
                    }}
                    className="px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-3xs font-bold flex items-center space-x-1"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create {cmsSection} Item</span>
                  </button>
                </div>

                {/* Listing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cmsSection === "gallery" &&
                    (showCMSModal === null) &&
                    settings &&
                    useApp().galleryItems.map((item) => (
                      <div key={item.id} className="border border-gray-100 p-4 rounded-2xl flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-3 text-left">
                          <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded-lg" />
                          <div>
                            <span className="font-extrabold text-gray-800 block text-xs">{item.title}</span>
                            <span className="text-3xs text-gray-400 font-bold uppercase">{item.category}</span>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm("Delete this gallery photo?")) await deleteCMSItem("gallery", item.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                  {cmsSection === "services" &&
                    useApp().services.map((item) => (
                      <div key={item.id} className="border border-gray-100 p-4 rounded-2xl flex justify-between items-center text-left">
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-800 text-xs">{item.title}</h4>
                          <p className="text-3xs text-gray-400 line-clamp-1">{item.description}</p>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm("Delete this service item?")) await deleteCMSItem("services", item.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                  {cmsSection === "testimonials" &&
                    useApp().testimonials.map((item) => (
                      <div key={item.id} className="border border-gray-100 p-4 rounded-2xl flex justify-between items-center text-left">
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-800 text-xs">{item.name}</h4>
                          <p className="text-3xs text-gray-400 italic line-clamp-1">"{item.content}"</p>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm("Delete this review?")) await deleteCMSItem("testimonials", item.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                  {cmsSection === "faqs" &&
                    useApp().faqs.map((item) => (
                      <div key={item.id} className="border border-gray-100 p-4 rounded-2xl flex justify-between items-center text-left">
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-800 text-xs">{item.question}</h4>
                          <p className="text-3xs text-gray-400 line-clamp-1">{item.answer}</p>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm("Delete this FAQ item?")) await deleteCMSItem("faqs", item.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                  {cmsSection === "news" &&
                    useApp().newsItems.map((item) => (
                      <div key={item.id} className="border border-gray-100 p-4 rounded-2xl flex justify-between items-center text-left">
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-800 text-xs">{item.title}</h4>
                          <p className="text-3xs text-gray-400 line-clamp-1">{item.content}</p>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm("Delete this news article?")) await deleteCMSItem("news", item.id);
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: STAFF & USER ROLES */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Staff & Roles</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage personnel, assign permissions, disable/activate accounts, or reset passwords.</p>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      setUserForm({ name: "", email: "", phone: "", role: UserRole.STAFF, status: UserStatus.ACTIVE, mustChangePassword: true, passwordPlain: "" });
                      setShowUserModal("add");
                    }}
                    className="px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create User</span>
                  </button>
                )}
              </div>

              {/* Users table */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 text-3xs uppercase text-gray-400 font-extrabold border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">P.O. Box</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u.uid}>
                        <td className="px-6 py-4 font-bold text-gray-800">{u.name}</td>
                        <td className="px-6 py-4 text-gray-500">{u.email}</td>
                        <td className="px-6 py-4 text-gray-500">{u.phone || "—"}</td>
                        <td className="px-6 py-4 text-gray-500 font-semibold">{u.poBox || "—"}</td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold tracking-wider uppercase"
                            style={{
                              backgroundColor:
                                u.role === UserRole.SUPER_ADMIN ? "#fee2e2" :
                                u.role === UserRole.ADMIN ? "#ffedd5" :
                                u.role === UserRole.STAFF ? "#e0f2fe" : "#f1f5f9",
                              color:
                                u.role === UserRole.SUPER_ADMIN ? "#991b1b" :
                                u.role === UserRole.ADMIN ? "#c2410c" :
                                u.role === UserRole.STAFF ? "#0369a1" : "#4b5563"
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-3xs font-bold ${u.status === UserStatus.ACTIVE ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end space-x-2 pt-5">
                          {isSuperAdmin && u.uid !== currentUser?.uid && (
                            <>
                              <button
                                onClick={async () => {
                                  const nextStatus = u.status === UserStatus.ACTIVE ? UserStatus.DISABLED : UserStatus.ACTIVE;
                                  await adminUpdateUser(u.uid, { status: nextStatus });
                                }}
                                className="px-2 py-1 border text-3xs rounded hover:bg-gray-50 font-bold"
                              >
                                {u.status === UserStatus.ACTIVE ? "Disable" : "Activate"}
                              </button>
                              <button
                                onClick={async () => {
                                  const pass = prompt("Enter new temporary password:");
                                  if (pass) {
                                    await adminResetPassword(u.uid, pass);
                                    alert("Password reset successfully. The user will be forced to change it on their next login.");
                                  }
                                }}
                                className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm("Delete this user account?")) await adminDeleteUser(u.uid);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: CSV & PDF REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-8" id="printable_report_view">
              <div className="border-b border-gray-50 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">CSV & PDF Reports</h2>
                  <p className="text-xs text-gray-500 mt-1">Export high-fidelity spreadsheets or trigger printable window PDF layouts.</p>
                </div>
                <button
                  onClick={printReport}
                  className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 focus:outline-none"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report (PDF)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sales Exporter */}
                <div className="border border-gray-100 p-6 rounded-3xl space-y-4 text-left">
                  <h3 className="text-sm font-bold text-gray-800">Sales & Revenue Ledger</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Contains every registered purchase transaction, customer IDs, and VAT totals logged in the system.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportToCSV("sales")}
                      className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 text-xs font-bold rounded-xl flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Inventory Exporter */}
                <div className="border border-gray-100 p-6 rounded-3xl space-y-4 text-left">
                  <h3 className="text-sm font-bold text-gray-800">Warehouse Inventory Levels</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Contains current grain stock levels, product units, categories, and custom dealer rates.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportToCSV("inventory")}
                      className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 text-xs font-bold rounded-xl flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview of report tables */}
              <div className="space-y-4 border-t border-gray-50 pt-6">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Report Preview (Last 10 Orders)</h3>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-3xs uppercase text-gray-400 font-extrabold border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Total Amount (Inc VAT)</th>
                        <th className="px-6 py-4 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 10).map((o) => (
                        <tr key={o.id}>
                          <td className="px-6 py-4 font-mono text-xs text-gray-800">#{o.id}</td>
                          <td className="px-6 py-4 text-gray-600 font-semibold">{o.customerName}</td>
                          <td className="px-6 py-4 font-extrabold text-gray-950">{formatMwk(o.totalAmount)}</td>
                          <td className="px-6 py-4 text-right text-gray-400 text-3xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SYSTEM SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">System Brand Customizations</h2>
                <p className="text-xs text-gray-500 mt-1">Configure physical addresses, phone lines, theme colors, and hero titles.</p>
              </div>

              {isAdmin ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const companyName = (e.currentTarget.elements.namedItem("companyName") as HTMLInputElement).value;
                    const brandName = (e.currentTarget.elements.namedItem("brandName") as HTMLInputElement).value;
                    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
                    const phone1 = (e.currentTarget.elements.namedItem("phone1") as HTMLInputElement).value;
                    const phone2 = (e.currentTarget.elements.namedItem("phone2") as HTMLInputElement).value;
                    const phone3 = (e.currentTarget.elements.namedItem("phone3") as HTMLInputElement).value;
                    const address = (e.currentTarget.elements.namedItem("address") as HTMLInputElement).value;
                    const primaryColor = (e.currentTarget.elements.namedItem("primaryColor") as HTMLInputElement).value;
                    const secondaryColor = (e.currentTarget.elements.namedItem("secondaryColor") as HTMLInputElement).value;
                    const heroTitle = (e.currentTarget.elements.namedItem("heroTitle") as HTMLInputElement).value;
                    const heroSubtitle = (e.currentTarget.elements.namedItem("heroSubtitle") as HTMLInputElement).value;

                    await updateSettings({
                      companyName,
                      brandName,
                      email,
                      phone1,
                      phone2,
                      phone3,
                      address,
                      primaryColor,
                      secondaryColor,
                      heroTitle,
                      heroSubtitle
                    });
                    alert("Settings updated successfully! Changes will propagate instantly across the public website.");
                  }}
                  className="space-y-6 max-w-3xl text-left"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Company Legal Name</label>
                      <input
                        type="text"
                        name="companyName"
                        defaultValue={settings?.companyName}
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Brand Trading Name</label>
                      <input
                        type="text"
                        name="brandName"
                        defaultValue={settings?.brandName}
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Primary Hotline Phone</label>
                      <input
                        type="text"
                        name="phone1"
                        defaultValue={settings?.phone1}
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Secondary Hotline Phone</label>
                      <input
                        type="text"
                        name="phone2"
                        defaultValue={settings?.phone2}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Brand Email Address</label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={settings?.email}
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Warehouse Physical Address</label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={settings?.address}
                      required
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Theme Primary Color</label>
                      <input
                        type="color"
                        name="primaryColor"
                        defaultValue={settings?.primaryColor}
                        className="w-full h-12 p-1 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Theme Secondary Color</label>
                      <input
                        type="color"
                        name="secondaryColor"
                        defaultValue={settings?.secondaryColor}
                        className="w-full h-12 p-1 bg-gray-50 border border-gray-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Homepage Copywriter</h3>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Homepage Hero Display Title</label>
                      <input
                        type="text"
                        name="heroTitle"
                        defaultValue={settings?.heroTitle}
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1.5">Homepage Hero Subtitle</label>
                      <textarea
                        name="heroSubtitle"
                        defaultValue={settings?.heroSubtitle}
                        required
                        rows={3}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Save Global Settings
                  </button>
                </form>
              ) : (
                <p className="text-xs text-red-500 italic font-bold">Only administrators can change system-wide settings.</p>
              )}
            </div>
          )}

          {/* TAB 10: AUDIT LOG TRAIL */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Operational Audit Logs</h2>
                <p className="text-xs text-gray-500 mt-1">Immutable trace trail logging actions, operators, timestamp, and client IP references.</p>
              </div>

              {isAdmin ? (
                <div className="border border-gray-100 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-3xs uppercase text-gray-400 font-extrabold border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">Action Recorded</th>
                        <th className="px-6 py-4">Staff Operator</th>
                        <th className="px-6 py-4">IP Address</th>
                        <th className="px-6 py-4 text-right">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 font-bold text-gray-800">{log.action}</td>
                          <td className="px-6 py-4">
                            <span className="font-semibold block">{log.userName}</span>
                            <span className="text-3xs text-gray-400">{log.userEmail}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-3xs text-gray-400">{log.ipAddress}</td>
                          <td className="px-6 py-4 text-right text-gray-400 text-3xs">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-red-500 italic font-bold">Audit logs are restricted strictly to Administrators and Super Administrators.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Board Bottom Bar */}
      <footer className="mt-6 h-10 bg-slate-100 border border-slate-200 rounded-xl px-4 flex items-center justify-between text-[10px] font-medium text-slate-500">
         <div className="flex gap-4">
            <span>Session: <span className="text-slate-800 font-bold">ACTIVE</span></span>
            <span>Audit Log Trace: <span className="text-slate-800 font-bold">ON</span></span>
            <span>System Version: <span className="text-slate-800 font-mono font-bold">v2.0.26-PRE</span></span>
         </div>
         <div className="flex gap-4">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> API Stable</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> SMTP Ready</span>
         </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* CMS ITEM ADD / EDIT MODAL */}
      {showCMSModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-xs" onClick={() => setShowCMSModal(null)} />
            <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl z-10 p-8 text-left space-y-6">
              <h3 className="text-lg font-bold text-gray-900 capitalize">
                {showCMSModal === "add" ? "Create New" : "Edit"} {cmsSection} Item
              </h3>
              <form onSubmit={handleCMSSubmit} className="space-y-4">
                {cmsSection === "gallery" && (
                  <>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Image Title</label>
                      <input
                        type="text"
                        required
                        value={cmsForm.title || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Image URL</label>
                      <input
                        type="url"
                        required
                        value={cmsForm.imageUrl || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, imageUrl: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Category</label>
                      <select
                        required
                        value={cmsForm.category || "Product Stock"}
                        onChange={(e) => setCmsForm({ ...cmsForm, category: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      >
                        <option value="Product Stock">Product Stock</option>
                        <option value="Warehouses">Warehouses</option>
                        <option value="Product Deliveries">Product Deliveries</option>
                        <option value="Packaging Process">Packaging Process</option>
                        <option value="Agricultural Sourcing">Agricultural Sourcing</option>
                        <option value="Fresh Produce">Fresh Produce</option>
                        <option value="Food Commodities">Food Commodities</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Description</label>
                      <input
                        type="text"
                        value={cmsForm.description || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, description: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                  </>
                )}

                {cmsSection === "services" && (
                  <>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Service Title</label>
                      <input
                        type="text"
                        required
                        value={cmsForm.title || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Service Icon</label>
                      <select
                        required
                        value={cmsForm.iconName || "Truck"}
                        onChange={(e) => setCmsForm({ ...cmsForm, iconName: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      >
                        <option value="Truck">Truck (Logistics)</option>
                        <option value="ShieldCheck">ShieldCheck (Quality)</option>
                        <option value="Handshake">Handshake (Farming)</option>
                        <option value="ShoppingBag">ShoppingBag (Retail)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Description</label>
                      <textarea
                        required
                        rows={3}
                        value={cmsForm.description || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, description: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                  </>
                )}

                {cmsSection === "testimonials" && (
                  <>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Client Name</label>
                      <input
                        type="text"
                        required
                        value={cmsForm.name || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, name: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Client Role / Institution</label>
                      <input
                        type="text"
                        required
                        value={cmsForm.role || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, role: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        placeholder="Procurement Director, school..."
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Review Content</label>
                      <textarea
                        required
                        rows={3}
                        value={cmsForm.content || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, content: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                  </>
                )}

                {cmsSection === "news" && (
                  <>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Bulletin Title</label>
                      <input
                        type="text"
                        required
                        value={cmsForm.title || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Cover Image URL</label>
                      <input
                        type="url"
                        value={cmsForm.imageUrl || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, imageUrl: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Article Content</label>
                      <textarea
                        required
                        rows={5}
                        value={cmsForm.content || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, content: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                  </>
                )}

                {cmsSection === "faqs" && (
                  <>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">FAQ Question</label>
                      <input
                        type="text"
                        required
                        value={cmsForm.question || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, question: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">FAQ Answer</label>
                      <textarea
                        required
                        rows={3}
                        value={cmsForm.answer || ""}
                        onChange={(e) => setCmsForm({ ...cmsForm, answer: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCMSModal(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white font-bold rounded-xl text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Save CMS Block
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PRODUCT ADD / EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-xs" onClick={() => setShowProductModal(null)} />
            <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl z-10 p-8 text-left space-y-6">
              <h3 className="text-lg font-bold text-gray-900">
                {showProductModal === "add" ? "Add New Commodity" : "Edit Commodity Details"}
              </h3>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Commodity Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Category</label>
                    <select
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Image URL</label>
                    <input
                      type="url"
                      required
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Price (MWK)</label>
                    <input
                      type="number"
                      required
                      value={productForm.priceMwk}
                      onChange={(e) => setProductForm({ ...productForm, priceMwk: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Stock level</label>
                    <input
                      type="number"
                      required
                      value={productForm.stockLevel}
                      onChange={(e) => setProductForm({ ...productForm, stockLevel: parseInt(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Unit Weight</label>
                    <input
                      type="text"
                      required
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      placeholder="50kg Bag"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isFeatured" className="text-2xs font-extrabold text-gray-600">Featured Crop on Homepage</label>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white font-bold rounded-xl text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Save Commodity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CATEGORY ADD / EDIT MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-xs" onClick={() => setShowCategoryModal(null)} />
            <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl z-10 p-8 text-left space-y-6">
              <h3 className="text-lg font-bold text-gray-900">
                {showCategoryModal === "add" ? "Create New Category" : "Edit Category Details"}
              </h3>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    placeholder="E.g., Poultry or Spices"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white font-bold rounded-xl text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* INVENTORY ADJUSTMENT TXN MODAL */}
      {showTxnModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-xs" onClick={() => setShowTxnModal(false)} />
            <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl z-10 p-8 text-left space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Log Warehouse Adjustment</h3>
              <form onSubmit={handleTxnSubmit} className="space-y-4">
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Product</label>
                  <select
                    required
                    value={txnForm.productId}
                    onChange={(e) => setTxnForm({ ...txnForm, productId: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">-- Select Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Adjustment Type</label>
                    <select
                      required
                      value={txnForm.type}
                      onChange={(e) => setTxnForm({ ...txnForm, type: e.target.value as any })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Stock In">Stock In (Restock/Harvest)</option>
                      <option value="Stock Out">Stock Out (Dampness/Sales)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={txnForm.quantity}
                      onChange={(e) => setTxnForm({ ...txnForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Adjustment Reason</label>
                  <input
                    type="text"
                    required
                    value={txnForm.reason}
                    onChange={(e) => setTxnForm({ ...txnForm, reason: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    placeholder="E.g., Sourced 50 bags from Ntcheu farm"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTxnModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white font-bold rounded-xl text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Adjust Stock Level
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* USER CREATION / EDIT ROLES MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-xs" onClick={() => setShowUserModal(null)} />
            <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl z-10 p-8 text-left space-y-6">
              <h3 className="text-lg font-bold text-gray-900">
                {showUserModal === "add" ? "Create New Personnel" : "Modify Staff Roles"}
              </h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Personnel Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={showUserModal !== "add"}
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    placeholder="e.g. +265 888 12 34 56"
                  />
                </div>
                {showUserModal === "add" && (
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Temporary Plain Password</label>
                    <input
                      type="password"
                      required
                      value={userForm.passwordPlain}
                      onChange={(e) => setUserForm({ ...userForm, passwordPlain: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                      placeholder="Ocean@2026Temp"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Role Type</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Staff">Staff</option>
                      <option value="Customer">Customer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-3xs font-extrabold text-gray-400 uppercase mb-1">Account Status</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value as any })}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white font-bold rounded-xl text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Save Personnel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
