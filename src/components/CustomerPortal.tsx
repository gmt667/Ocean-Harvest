import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatMwk } from "../utils";
import {
  ShoppingBag,
  Clock,
  History,
  User,
  HelpCircle,
  TrendingUp,
  FileText,
  Truck,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  Send,
  Lock,
  Download,
  Receipt
} from "lucide-react";
import { OrderStatus, QuotationStatus } from "../types";

export const CustomerPortal: React.FC = () => {
  const {
    currentUser,
    products,
    orders,
    quotations,
    createOrder,
    createQuotationRequest,
    changePassword,
    updateUserProfile,
    submitContactForm,
    settings
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<"browse" | "orders" | "quotes" | "profile" | "support">("browse");

  // Cart State
  const [cart, setCart] = useState<{ productId: string; productName: string; quantity: number; priceMwk: number; unit: string; maxStock: number }[]>([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Quote Request State
  const [qProductId, setQProductId] = useState("");
  const [qQuantity, setQQuantity] = useState(1);
  const [qNotes, setQNotes] = useState("");
  const [qSuccess, setQSuccess] = useState(false);

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState("");

  // Support State
  const [supportForm, setSupportForm] = useState({ subject: "", message: "" });
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Invoice Modal State
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<any>(null);

  const primaryColor = settings?.primaryColor || "#15803d";
  const secondaryColor = settings?.secondaryColor || "#ca8a04";

  // ADD TO SHOPPING CART
  const addToCart = (p: any) => {
    if (p.stockLevel <= 0) return;
    const existingIndex = cart.findIndex((item) => item.productId === p.id);
    if (existingIndex > -1) {
      const nextCart = [...cart];
      if (nextCart[existingIndex].quantity < p.stockLevel) {
        nextCart[existingIndex].quantity += 1;
        setCart(nextCart);
      }
    } else {
      setCart([...cart, {
        productId: p.id,
        productName: p.name,
        quantity: 1,
        priceMwk: p.priceMwk,
        unit: p.unit,
        maxStock: p.stockLevel
      }]);
    }
  };

  const adjustQuantity = (pId: string, delta: number) => {
    const item = cart.find(i => i.productId === pId);
    if (!item) return;

    const nextQty = item.quantity + delta;
    if (nextQty <= 0) {
      setCart(cart.filter(i => i.productId !== pId));
    } else if (nextQty <= item.maxStock) {
      setCart(cart.map(i => i.productId === pId ? { ...i, quantity: nextQty } : i));
    }
  };

  const removeFromCart = (pId: string) => {
    setCart(cart.filter(i => i.productId !== pId));
  };

  // CHECKOUT CART
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const orderItems = cart.map(i => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      priceMwk: i.priceMwk
    }));

    await createOrder(orderItems);
    setCart([]);
    setCheckoutSuccess(true);
    setTimeout(() => setCheckoutSuccess(false), 5000);
    setActiveSubTab("orders");
  };

  // QUOTE REQUEST
  const handleQuoteRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qProductId) return;
    await createQuotationRequest(qProductId, qQuantity, qNotes);
    setQSuccess(true);
    setQNotes("");
    setQQuantity(1);
    setQProductId("");
    setTimeout(() => setQSuccess(false), 5000);
  };

  // UPDATE PROFILE
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    await updateUserProfile(currentUser.uid, name, email);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 4000);
  };

  // SECURE PASSWORD CHANGE
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPassError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setPassError("Password must be at least 6 characters.");
      return;
    }
    setPassError("");
    await changePassword(password);
    setPassword("");
    setConfirmPassword("");
    setPassSuccess(true);
    setTimeout(() => setPassSuccess(false), 4000);
  };

  // SUPPORT FORM
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    await submitContactForm(
      currentUser.name,
      currentUser.email,
      "",
      `SUPPORT: ${supportForm.subject}`,
      supportForm.message
    );
    setSupportSuccess(true);
    setSupportForm({ subject: "", message: "" });
    setTimeout(() => setSupportSuccess(false), 4000);
  };

  // CART CALCULATIONS
  const cartSubtotal = cart.reduce((acc, item) => acc + item.priceMwk * item.quantity, 0);
  const vatAmount = cartSubtotal * 0.165; // 16.5% standard Malawi VAT
  const cartTotal = cartSubtotal + vatAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="customer_portal_main_view">
      <div className="lg:flex gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 bg-emerald-950 border border-emerald-900/50 rounded-2xl p-4 space-y-1.5 text-left mb-6 lg:mb-0 shadow-md flex-shrink-0 flex flex-col justify-between text-white">
          <div>
            <div className="p-3 border-b border-emerald-900/30 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-400 rounded flex items-center justify-center font-bold text-emerald-950 text-xs">CP</div>
                <div>
                  <h1 className="text-white text-xs font-bold leading-none tracking-tight">Customer Portal</h1>
                  <p className="text-emerald-400 text-[9px] uppercase font-bold mt-1 tracking-wider">Ocean Harvest</p>
                </div>
              </div>
            </div>
            <p className="text-3xs font-black text-emerald-500 uppercase tracking-widest px-3 mb-2">Member Panel</p>
            <div className="space-y-1">
              {[
                { label: "Browse & Order", subTab: "browse", icon: <ShoppingBag className="w-4 h-4" /> },
                { label: "My Purchase Orders", subTab: "orders", icon: <History className="w-4 h-4" /> },
                { label: "Quotation Tickets", subTab: "quotes", icon: <FileText className="w-4 h-4" /> },
                { label: "Profile Settings", subTab: "profile", icon: <User className="w-4 h-4" /> },
                { label: "Contact Support", subTab: "support", icon: <HelpCircle className="w-4 h-4" /> }
              ].map((item) => {
                const isActive = activeSubTab === item.subTab;
                return (
                  <button
                    key={item.subTab}
                    onClick={() => setActiveSubTab(item.subTab as any)}
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
                  <p className="text-emerald-400 text-[9px] uppercase font-bold tracking-wider">Verified Buyer</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Inner Panel */}
        <div className="flex-1 bg-white border border-slate-250 rounded-2xl p-5 sm:p-6 text-left shadow-sm min-h-[500px]">
          {/* TAB 1: BROWSE & CART */}
          {activeSubTab === "browse" && (
            <div className="space-y-8">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Direct Farm Purchase</h2>
                <p className="text-xs text-gray-500 mt-1">Select crops below to compile your order bags. Invoices automatically include 16.5% standard Malawian VAT.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Product Catalog */}
                <div className="xl:col-span-2 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Products Catalog</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((p) => (
                      <div key={p.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow">
                        <div className="flex space-x-3">
                          <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                          <div className="text-left space-y-1">
                            <span className="text-3xs uppercase font-extrabold text-green-700" style={{ color: primaryColor }}>{p.category}</span>
                            <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{p.name}</h4>
                            <p className="text-2xs font-extrabold text-gray-900">{formatMwk(p.priceMwk)} / {p.unit}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                          <span className="text-3xs font-semibold text-gray-400">Stock: {p.stockLevel} units</span>
                          <button
                            onClick={() => addToCart(p)}
                            disabled={p.stockLevel <= 0}
                            className={`px-3 py-1.5 rounded-lg text-3xs font-bold text-white transition-all focus:outline-none ${
                              p.stockLevel <= 0 ? "bg-gray-300 cursor-not-allowed" : "hover:opacity-90 shadow-xs"
                            }`}
                            style={{ backgroundColor: p.stockLevel > 0 ? primaryColor : "#cbd5e1" }}
                          >
                            {p.stockLevel <= 0 ? "Out of Stock" : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shopping Cart */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6 flex flex-col justify-between h-fit">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-3">My Order Bags</h3>
                    {cart.length === 0 ? (
                      <div className="py-12 text-center text-xs text-gray-400">
                        Your cart is empty. Click "Add to Cart" to compile purchase bags.
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div key={item.productId} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                            <div className="text-left space-y-0.5">
                              <h5 className="text-2xs font-bold text-gray-800 truncate max-w-32">{item.productName}</h5>
                              <p className="text-3xs text-gray-500">{formatMwk(item.priceMwk)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => adjustQuantity(item.productId, -1)}
                                className="p-1 rounded bg-gray-50 hover:bg-gray-100 border text-gray-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-2xs font-extrabold text-gray-800 w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => adjustQuantity(item.productId, 1)}
                                className="p-1 rounded bg-gray-50 hover:bg-gray-100 border text-gray-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeFromCart(item.productId)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 space-y-4">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-500">
                          <span>Subtotal:</span>
                          <span>{formatMwk(cartSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Malawi VAT (16.5%):</span>
                          <span>{formatMwk(vatAmount)}</span>
                        </div>
                        <div className="flex justify-between font-black text-gray-900 border-t border-gray-100 pt-2 text-sm">
                          <span>Total Amount:</span>
                          <span>{formatMwk(cartTotal)}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckout}
                        className="w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-95 transition-all flex items-center justify-center space-x-1.5 focus:outline-none"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Place Harvest Order</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY PURCHASE ORDERS */}
          {activeSubTab === "orders" && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">My Purchase Orders</h2>
                <p className="text-xs text-gray-500 mt-1">Check current status, track loading logs, and download VAT-ready invoice sheets.</p>
              </div>

              {orders.length === 0 ? (
                <div className="py-20 text-center text-gray-400 text-xs">
                  You haven't placed any harvest orders yet. Click "Browse & Order" to buy commodities.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-xs transition-shadow">
                      <div className="text-left space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-black text-gray-900">Order ID: #{o.id}</span>
                          <span
                            className="px-2.5 py-1 rounded-full text-3xs font-bold uppercase tracking-wider"
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
                        </div>
                        <p className="text-3xs text-gray-400">{new Date(o.createdAt).toLocaleString()}</p>
                        
                        {/* Progress Tracker */}
                        <div className="space-y-2 pt-2">
                          <p className="text-3xs font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" /> Dispatch Status: {o.trackingNotes}
                          </p>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden max-w-sm">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width:
                                  o.status === "Pending" ? "20%" :
                                  o.status === "Confirmed" ? "40%" :
                                  o.status === "Processing" ? "65%" :
                                  o.status === "Delivered" ? "100%" : "0%",
                                backgroundColor: primaryColor
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col justify-between items-end gap-3 min-w-44 border-t md:border-t-0 md:border-l border-gray-50 pt-4 md:pt-0 md:pl-6">
                        <div>
                          <p className="text-3xs font-semibold text-gray-400 uppercase">Grand Total (Inc VAT)</p>
                          <p className="text-sm font-black text-gray-900 mt-0.5">{formatMwk(o.totalAmount)}</p>
                        </div>
                        <button
                          onClick={() => setActiveInvoiceOrder(o)}
                          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border text-gray-700 text-3xs font-bold rounded-xl transition-all flex items-center space-x-1 focus:outline-none"
                        >
                          <Receipt className="w-3.5 h-3.5 text-gray-400" />
                          <span>View VAT Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUOTATION TICKETS */}
          {activeSubTab === "quotes" && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Custom Quotation Tickets</h2>
                <p className="text-xs text-gray-500 mt-1">If you require bulk tonnes or custom packaging, submit a quotation request ticket below.</p>
              </div>

              {/* Request form shortcut */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Request a Wholesale Quote</h3>
                <form onSubmit={handleQuoteRequestSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Select Crop</label>
                    <select
                      required
                      value={qProductId}
                      onChange={(e) => setQProductId(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Target Quantity</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={qQuantity}
                      onChange={(e) => setQQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center space-x-1.5 focus:outline-none"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Ticket</span>
                    </button>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Special requests or bulk locations</label>
                    <input
                      type="text"
                      value={qNotes}
                      onChange={(e) => setQNotes(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none"
                      placeholder="Example: Need 20 tonnes shipped directly to our boarding school in Zomba."
                    />
                  </div>
                </form>
                {qSuccess && (
                  <div className="mt-4 p-3 bg-green-50 text-green-800 text-3xs rounded-xl font-bold border border-green-200 text-center">
                    ✓ Custom quote request registered. Our staff will respond shortly!
                  </div>
                )}
              </div>

              {/* Tickets list */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">My Quote Requests</h3>
                {quotations.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs bg-white border border-gray-50 rounded-2xl">
                    No quotations requested yet.
                  </div>
                ) : (
                  quotations.map((q) => (
                    <div key={q.id} className="border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800">Quote Ticket #{q.id}</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-3xs font-bold uppercase"
                            style={{
                              backgroundColor:
                                q.status === "Responded" ? "#dcfce7" :
                                q.status === "Closed" ? "#f3f4f6" : "#fef3c7",
                              color:
                                q.status === "Responded" ? "#166534" :
                                q.status === "Closed" ? "#4b5563" : "#92400e"
                            }}
                          >
                            {q.status}
                          </span>
                        </div>
                        <p className="text-2xs font-extrabold text-gray-900">{q.quantity} x {q.productName}</p>
                        {q.notes && <p className="text-3xs text-gray-400">Notes: "{q.notes}"</p>}
                      </div>

                      <div className="text-right">
                        {q.status === "Responded" && q.responsePriceMwk ? (
                          <div className="space-y-1">
                            <span className="text-3xs text-gray-400 uppercase block font-semibold">Dealer Price response</span>
                            <span className="text-xs font-black text-green-700">{formatMwk(q.responsePriceMwk)}</span>
                          </div>
                        ) : (
                          <span className="text-3xs text-gray-400 italic">Awaiting response</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE SETTINGS */}
          {activeSubTab === "profile" && (
            <div className="space-y-8">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
                <p className="text-xs text-gray-500 mt-1">Manage your account information and secure passwords here.</p>
              </div>

              {/* Personal Info */}
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm focus:outline-none"
                  style={{ backgroundColor: primaryColor }}
                >
                  Save Profile Changes
                </button>
                {profileSuccess && (
                  <div className="p-3 bg-green-50 text-green-800 text-3xs rounded-xl font-bold">
                    ✓ Profile updated successfully!
                  </div>
                )}
              </form>

              {/* Change password */}
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg border-t border-gray-50 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Secure Password Update
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                {passError && <p className="text-3xs text-red-500 font-semibold">{passError}</p>}
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm focus:outline-none"
                  style={{ backgroundColor: primaryColor }}
                >
                  Change Account Password
                </button>
                {passSuccess && (
                  <div className="p-3 bg-green-50 text-green-800 text-3xs rounded-xl font-bold">
                    ✓ Password changed securely.
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 5: SUPPORT */}
          {activeSubTab === "support" && (
            <div className="space-y-6">
              <div className="border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Contact Support</h2>
                <p className="text-xs text-gray-500 mt-1">Submit an online support request to Limbe offices. Staff will review and email you shortly.</p>
              </div>

              <form onSubmit={handleSupportSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Inquiry Subject</label>
                  <input
                    type="text"
                    required
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                    placeholder="E.g., Logistics delay or payment validation"
                  />
                </div>
                <div>
                  <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Message Detail</label>
                  <textarea
                    required
                    rows={5}
                    value={supportForm.message}
                    onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                    placeholder="Tell us what you need..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-sm focus:outline-none"
                  style={{ backgroundColor: primaryColor }}
                >
                  Submit Support Message
                </button>
                {supportSuccess && (
                  <div className="p-3 bg-green-50 text-green-800 text-2xs rounded-xl font-semibold border border-green-200">
                    ✓ Support request received. We will look into it promptly.
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PROFESSIONAL VAT INVOICE MODAL */}
      {activeInvoiceOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto" id="invoice_modal">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-xs" onClick={() => setActiveInvoiceOrder(null)} />
            
            <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden z-10 p-8 sm:p-12 text-left space-y-8 border border-gray-100">
              <button
                onClick={() => setActiveInvoiceOrder(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-50 rounded-full text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">{settings?.companyName || "Ocean General Dealers"}</h3>
                  <p className="text-3xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Ocean Harvest Brand</p>
                  <p className="text-2xs text-gray-500 mt-2">{settings?.address || "Limbe, Blantyre, Malawi"}</p>
                  <p className="text-2xs text-gray-500">Call: {settings?.phone1 || "+265 993 86 16 49"}</p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-xs font-bold text-white uppercase px-3 py-1.5 rounded-lg" style={{ backgroundColor: primaryColor }}>
                    Official Tax Invoice
                  </span>
                  <p className="text-xs font-black text-gray-800 mt-3">Invoice No: INV-{activeInvoiceOrder.id}</p>
                  <p className="text-2xs text-gray-500 mt-1">Date: {new Date(activeInvoiceOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-3xs font-extrabold text-gray-400 uppercase tracking-wider">Billed To</p>
                  <p className="text-xs font-bold text-gray-800 mt-1">{activeInvoiceOrder.customerName}</p>
                  <p className="text-2xs text-gray-500 mt-0.5">{activeInvoiceOrder.customerEmail}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-3xs font-extrabold text-gray-400 uppercase tracking-wider">Order Details</p>
                  <p className="text-2xs text-gray-600 mt-1">Status: <span className="font-bold text-green-700">{activeInvoiceOrder.status}</span></p>
                  <p className="text-2xs text-gray-600 mt-0.5">Timezone: Africa/Blantyre</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <p className="text-3xs font-extrabold text-gray-400 uppercase tracking-wider">Purchased Commodities</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-3xs uppercase text-gray-400 font-bold border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3">Crop Name</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Unit Rate</th>
                        <th className="px-4 py-3 text-right">Total (MWK)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {activeInvoiceOrder.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 font-semibold text-gray-800">{item.productName}</td>
                          <td className="px-4 py-3 text-center text-gray-600 font-semibold">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{item.priceMwk.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-gray-800 font-bold">{(item.priceMwk * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoicing calculation */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal Excl. VAT:</span>
                    <span>{(activeInvoiceOrder.totalAmount / 1.165).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Malawi VAT (16.5%):</span>
                    <span>{(activeInvoiceOrder.totalAmount - (activeInvoiceOrder.totalAmount / 1.165)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-black text-gray-950 border-t border-gray-100 pt-2 text-sm">
                    <span>Total Paid (MWK):</span>
                    <span>{formatMwk(activeInvoiceOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Thank you footer */}
              <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center text-3xs text-gray-400 gap-4">
                <span>Thank you for choosing Ocean Harvest! Malawi's trusted agricultural dealer.</span>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print / Download Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
