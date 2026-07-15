import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatMwk } from "../utils";
import { AnimatePresence, motion } from "motion/react";
import {
  Search,
  Filter,
  CheckCircle,
  Truck,
  ShieldCheck,
  Award,
  Users,
  ChevronRight,
  ArrowRight,
  Send,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
  Maximize2,
  X,
  Plus,
  ShoppingBag,
  Handshake,
  Clock,
  ThumbsUp
} from "lucide-react";

interface PublicPagesProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onOpenAuth: (mode: "login" | "register") => void;
}

export const PublicPages: React.FC<PublicPagesProps> = ({ currentTab, setTab, onOpenAuth }) => {
  const {
    products,
    categories,
    testimonials,
    services,
    newsItems,
    faqs,
    galleryItems,
    settings,
    submitContactForm,
    currentUser,
    createQuotationRequest
  } = useApp();

  // Color variables
  const primaryColor = settings?.primaryColor || "#15803d";
  const secondaryColor = settings?.secondaryColor || "#ca8a04";

  // Products State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeProduct, setActiveProduct] = useState<any>(null);
  const [quoteQuantity, setQuoteQuantity] = useState(1);
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Gallery State
  const [galleryFilter, setGalleryFilter] = useState("all");
  const [lightboxImage, setLightboxImage] = useState<any>(null);

  // Contact Us State
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  // FAQ Expand state
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // -------------------------------------------------------------
  // CONTACT FORM SUBMISSION
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContactForm(
      contactForm.name,
      contactForm.email,
      contactForm.phone,
      contactForm.subject,
      contactForm.message
    );
    setContactSuccess(true);
    setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setTimeout(() => setContactSuccess(false), 5000);
  };

  // -------------------------------------------------------------
  // QUOTE REQUEST SUBMISSION FROM MODAL
  const handleQuoteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth("login");
      return;
    }
    await createQuotationRequest(activeProduct.id, quoteQuantity, quoteNotes);
    setQuoteSuccess(true);
    setQuoteNotes("");
    setQuoteQuantity(1);
    setTimeout(() => {
      setQuoteSuccess(false);
      setActiveProduct(null);
    }, 4000);
  };

  // -------------------------------------------------------------
  // RENDER SECTIONS BASED ON TAB
  const renderContent = () => {
    switch (currentTab) {
      // 1. HOME VIEW
      case "home":
        return (
          <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-amber-50/50 py-24 sm:py-32 border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-left">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: primaryColor + "15", color: primaryColor }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Est. 2023 | Malawi Sourced Grains
                  </span>
                  <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                    {settings?.heroTitle || "Sustaining Malawi with Premium Agricultural & Food Commodities"}
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
                    {settings?.heroSubtitle || "Providing fresh, reliable, and high-quality grains, beans, livestock, and general supplies across the nation."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => setTab("products")}
                      className="px-8 py-4 rounded-xl text-sm font-bold text-white shadow-lg shadow-green-700/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Browse Products</span>
                    </button>
                    <button
                      onClick={() => setTab("contact")}
                      className="px-8 py-4 rounded-xl text-sm font-bold text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Inquire Bulk Prices</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-100 to-amber-100 rounded-3xl filter blur-2xl opacity-60 transform rotate-6 scale-95" />
                  <img
                    src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80"
                    alt="Malawian Farming Harvest"
                    className="rounded-3xl shadow-2xl relative z-10 w-full object-cover h-[450px]"
                  />
                  {/* Floating Metric Card */}
                  <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl z-20 flex items-center space-x-4 border border-gray-50 max-w-xs">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: secondaryColor }}>
                      99%
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-gray-800">Stone-Free Grains</p>
                      <p className="text-3xs text-gray-400 leading-relaxed">Our advanced de-stoning process guarantees pure ready-to-cook rice.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
              <div className="max-w-2xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Dynamic Catalog</span>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Premium Featured Crops</h2>
                <p className="text-sm text-gray-500">Carefully sorted, affordable, and stocked for households, hotels, schools, and wholesalers across Malawi.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.filter(p => p.isFeatured).slice(0, 4).map((p) => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col group h-full">
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={p.imageUrl || "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=60"}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-3xs font-extrabold shadow-sm text-green-800 uppercase tracking-wider border border-green-100">
                        {p.category}
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between text-left space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{p.name}</h3>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>
                      <div className="space-y-4 border-t border-gray-50 pt-4">
                        <div className="flex justify-between items-end">
                          <span className="text-3xs text-gray-400 font-semibold uppercase">Est. Retail Rate</span>
                          <span className="text-sm font-black text-gray-900">
                            {formatMwk(p.priceMwk)} <span className="text-3xs font-medium text-gray-500">/ {p.unit}</span>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveProduct(p)}
                            className="flex-1 py-2 rounded-xl text-center text-xs font-bold text-white transition-all shadow-sm"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Request Quote
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <button onClick={() => setTab("products")} className="inline-flex items-center space-x-1 text-sm font-bold text-green-700 hover:underline" style={{ color: primaryColor }}>
                  <span>View Full Product Catalog</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="bg-gray-50 py-20 border-y border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Ocean Harvest Advantage</span>
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Why Malawian Businesses Trust Us</h2>
                  <p className="text-sm text-gray-500">Our logistics operations, processing standards, and farming relationships ensure 100% stock reliability.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      icon: <Award className="w-6 h-6 text-green-700" style={{ color: primaryColor }} />,
                      title: "Stone-Free Guarantee",
                      desc: "Our processing lines use advanced mechanical de-stoners ensuring ready-to-cook rice and clean legumes free of stones."
                    },
                    {
                      icon: <Truck className="w-6 h-6 text-amber-600" style={{ color: secondaryColor }} />,
                      title: "Nationwide Logistics",
                      desc: "Deploying our dynamic dispatch network to transport massive bulk orders safely across Blantyre, Lilongwe, Zomba, and Mzuzu."
                    },
                    {
                      icon: <Users className="w-6 h-6 text-green-700" style={{ color: primaryColor }} />,
                      title: "Fair-Trade Sourcing",
                      desc: "We work directly with hardworking local Malawian farmers, providing fair prices and reliable contract farming setups."
                    }
                  ].map((card, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-lg transition-all text-left space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center" style={{ backgroundColor: primaryColor + "10" }}>
                        {card.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
              <div className="max-w-2xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Customer Endorsements</span>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Wholesaler & Institution Reviews</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {testimonials.slice(0, 3).map((t) => (
                  <div key={t.id} className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
                    <p className="text-xs text-gray-600 leading-relaxed italic">"{t.content}"</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-xs" style={{ backgroundColor: primaryColor }}>
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{t.name}</p>
                        <p className="text-3xs text-gray-400">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact CTA Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl py-12 px-8 sm:px-16 text-white text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-8 shadow-xl" style={{ backgroundColor: primaryColor }}>
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">Need a custom bulk price estimate?</h3>
                  <p className="text-xs text-green-100 max-w-xl">
                    Whether you are purchasing 50 tonnes of maize for an academy, packaging quails for hotel chains, or stocking rice, our staff will offer fair dealer pricing.
                  </p>
                </div>
                <button
                  onClick={() => setTab("contact")}
                  className="px-6 py-3.5 bg-white text-gray-900 rounded-xl text-xs font-bold shadow-md hover:bg-gray-50 transition-all flex items-center space-x-1.5 flex-shrink-0"
                >
                  <span>Get Free Quotation</span>
                  <ArrowRight className="w-4 h-4 text-green-700" style={{ color: primaryColor }} />
                </button>
              </div>
            </section>
          </div>
        );

      // 2. ABOUT US VIEW
      case "about":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-left">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Our Foundation</span>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">About Ocean Harvest</h1>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Ocean General Dealers, operating under the <span className="font-semibold" style={{ color: primaryColor }}>Ocean Harvest</span> brand, is a trusted Malawian supplier of high-quality agricultural products, food commodities, and general supplies. We are committed to providing fresh, affordable, and reliable products to households, retailers, wholesalers, institutions, restaurants, hotels, supermarkets, and businesses across Malawi.
                </p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  At Ocean Harvest, we believe every customer deserves access to quality products backed by exceptional service, professionalism, and long-term business relationships. Our focus is on consistency, integrity, and customer satisfaction, ensuring every order is delivered with care and reliability.
                </p>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80"
                  alt="Agriculture Sourcing Malawi"
                  className="rounded-3xl shadow-lg h-96 w-full object-cover"
                />
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-left space-y-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center" style={{ backgroundColor: primaryColor + "10" }}>
                  <Award className="w-6 h-6 text-green-700" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  To become Malawi's most trusted supplier of agricultural products, food commodities, and general supplies by delivering quality, reliability, and value to every customer.
                </p>
              </div>
              <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-left space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center" style={{ backgroundColor: secondaryColor + "10" }}>
                  <Users className="w-6 h-6 text-amber-600" style={{ color: secondaryColor }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  To provide high-quality agricultural and food products at competitive prices while delivering exceptional customer service, maintaining professional standards, and building long-term relationships with our customers and partners.
                </p>
              </div>
            </div>

            {/* Core Values with Animated Cards */}
            <div className="space-y-10 text-center">
              <div className="max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Guiding Principles</span>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Core Values</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-left">
                {[
                  { title: "Integrity", desc: "Honest contracts, precise weights, and absolute transparency in our agricultural trading." },
                  { title: "Quality", desc: "Clean grains, pure chilli, healthy livestock quails sourced directly under strict standards." },
                  { title: "Reliability", desc: "Ensuring consistent stock and dependable logistics networks for our commercial clients." },
                  { title: "Customer Satisfaction", desc: "Crafting custom bulk quotes and keeping communication lines transparent 24/7." },
                  { title: "Professionalism", desc: "Polished invoicing, prompt loading, and business respect in all Malawian districts." }
                ].map((val, idx) => (
                  <motion.div
                    whileHover={{ y: -6 }}
                    key={idx}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3 cursor-default"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: primaryColor }}>
                      0{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">{val.title}</h4>
                    <p className="text-3xs text-gray-500 leading-relaxed">{val.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      // 3. PRODUCTS CATALOGUE VIEW
      case "products":
        // Filter and Search logic
        const filteredProducts = products.filter((p) => {
          const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                p.description.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
          return matchesSearch && matchesCategory;
        });

        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Commodities Catalog</span>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Explore Our Crops & Grains</h1>
              <p className="text-sm text-gray-500">Filter through our fresh, stone-free agricultural stock. Select a product to read bulk details, view stock availability, or request a customized quotation invoice.</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === "all"
                      ? "text-white shadow-sm"
                      : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                  style={selectedCategory === "all" ? { backgroundColor: primaryColor } : {}}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      selectedCategory === cat.name
                        ? "text-white shadow-sm"
                        : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
                    }`}
                    style={selectedCategory === cat.name ? { backgroundColor: primaryColor } : {}}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                No crops match your search parameters. Try searching for "rice" or "beans".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all flex flex-col group h-full">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={p.imageUrl || "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                      />
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1 rounded-full text-3xs font-extrabold shadow-sm text-green-800 uppercase tracking-wider border border-green-500/10">
                        {p.category}
                      </span>
                      {p.stockLevel < 10 && (
                        <span className="absolute top-4 right-4 bg-red-500 text-white px-2.5 py-1 rounded-full text-3xs font-extrabold shadow-sm uppercase tracking-wider">
                          Low Stock
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between text-left space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-green-700 transition-colors">{p.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{p.description}</p>
                      </div>
                      <div className="space-y-4 border-t border-gray-50 pt-4">
                        <div className="flex justify-between items-end">
                          <span className="text-3xs text-gray-400 font-semibold uppercase">Dealer Retail Rate</span>
                          <span className="text-sm font-black text-gray-900">
                            {formatMwk(p.priceMwk)} <span className="text-3xs font-medium text-gray-500">/ {p.unit}</span>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveProduct(p)}
                            className="flex-1 py-3.5 rounded-xl text-center text-xs font-bold text-white transition-all shadow-sm"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Request Quote
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // 4. SERVICES VIEW
      case "services":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Enterprise Capabilities</span>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Our Professional Services</h1>
              <p className="text-sm text-gray-500">Beyond simple commodity supply, Ocean General Dealers leverages premium processing machinery, logistics dispatch, and local agricultural off-take agreements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {services.map((srv) => (
                <div key={srv.id} className="bg-white p-10 rounded-3xl border border-gray-100 hover:shadow-lg transition-all space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center" style={{ backgroundColor: primaryColor + "10" }}>
                    {srv.iconName === "Truck" && <Truck className="w-6 h-6 text-green-700" style={{ color: primaryColor }} />}
                    {srv.iconName === "ShieldCheck" && <ShieldCheck className="w-6 h-6 text-green-700" style={{ color: primaryColor }} />}
                    {srv.iconName === "Handshake" && <Handshake className="w-6 h-6 text-green-700" style={{ color: primaryColor }} />}
                    {srv.iconName === "ShoppingBag" && <ShoppingBag className="w-6 h-6 text-green-700" style={{ color: primaryColor }} />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{srv.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{srv.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      // 5. GALLERY VIEW
      case "gallery":
        const galleryCategories = ["all", "Product Stock", "Warehouses", "Product Deliveries", "Packaging Process", "Agricultural Sourcing", "Fresh Produce", "Food Commodities"];
        const filteredGallery = galleryItems.filter(item => galleryFilter === "all" || item.category === galleryFilter);

        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Operational Transparency</span>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Ocean Harvest Gallery</h1>
              <p className="text-sm text-gray-500">Browse through our live stock, Limbe warehouses, transport fleets, and sorting lines. Click on any image to open a lightbox preview.</p>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {galleryCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGalleryFilter(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    galleryFilter === cat
                      ? "text-white shadow-sm"
                      : "text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100"
                  }`}
                  style={galleryFilter === cat ? { backgroundColor: primaryColor } : {}}
                >
                  {cat === "all" ? "View All Photos" : cat}
                </button>
              ))}
            </div>

            {/* Masonry-style Grid */}
            {filteredGallery.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                No images uploaded to this category yet.
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {filteredGallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setLightboxImage(item)}
                    className="break-inside-avoid bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer group hover:shadow-md transition-all relative"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full object-cover rounded-2xl group-hover:scale-101 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left">
                      <span className="text-3xs text-green-300 font-extrabold uppercase tracking-widest">{item.category}</span>
                      <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                      {item.description && <p className="text-3xs text-gray-300 mt-1">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // 6. NEWS VIEW
      case "news":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Ocean Announcements</span>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">News & Farmer Bulletins</h1>
              <p className="text-sm text-gray-500">Read our latest farming bulletins, bulk supply reports, and operational news directly from Limbe warehouse.</p>
            </div>

            {newsItems.length === 0 ? (
              <div className="py-20 text-center text-gray-400">
                No dynamic news articles have been posted yet. Seed/dashboard entries will show here.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                {newsItems.map((news) => (
                  <div key={news.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden flex flex-col shadow-xs hover:shadow-md transition-shadow">
                    {news.imageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-3xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(news.createdAt).toLocaleDateString()}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">{news.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{news.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // 7. FAQS VIEW
      case "faqs":
        return (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Instant Answers</span>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Frequently Asked Questions</h1>
              <p className="text-sm text-gray-500">Read about our sourcing operations, de-stoning mechanical sorting lines, and bulk delivery details in Blantyre and beyond.</p>
            </div>

            <div className="space-y-4 text-left">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all shadow-xs">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 flex justify-between items-center text-xs font-bold text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <Plus className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${expandedFaq === faq.id ? "rotate-45 text-green-700" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-gray-50"
                      >
                        <div className="px-6 py-4 text-xs text-gray-600 leading-relaxed bg-gray-50/50">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        );

      // 8. CONTACT US VIEW
      case "contact":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondaryColor }}>Get in Touch</span>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Contact Ocean Dealers</h1>
              <p className="text-sm text-gray-500">Submit a support ticket, request grain supply contracts, or call our Blantyre offices directly for prompt logistics dispatch.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Form */}
              <div className="lg:col-span-3 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Send an Online Message</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                        placeholder="John Phiri"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Phone Number (Malawi)</label>
                      <input
                        type="text"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                        placeholder="+265 993 86 16 49"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Subject *</label>
                      <input
                        type="text"
                        required
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                        placeholder="Bulk Maize Quote Request"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Message Detail *</label>
                    <textarea
                      required
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                      placeholder="Please details what products and volume you require."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message Inquiry</span>
                  </button>
                  {contactSuccess && (
                    <div className="p-3 bg-green-50 text-green-800 text-xs rounded-xl font-semibold border border-green-200 text-center">
                      ✓ Inquiry successfully sent! Our Blantyre staff will email or call you shortly.
                    </div>
                  )}
                </form>
              </div>

              {/* Company contact list */}
              <div className="lg:col-span-2 space-y-6 text-left">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-3">Office Locations</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3.5">
                      <MapPin className="w-5 h-5 text-green-700 mt-0.5" style={{ color: primaryColor }} />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Physical Warehouse Address</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {settings?.address || "P.O. Box 3012, Limbe, Blantyre, Malawi"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3.5">
                      <Phone className="w-5 h-5 text-amber-600 mt-0.5" style={{ color: secondaryColor }} />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Phone Hotline Numbers</p>
                        <div className="text-xs text-gray-500 mt-1 space-y-1">
                          <p>{settings?.phone1 || "+265 993 86 16 49"}</p>
                          {settings?.phone2 && <p>{settings.phone2}</p>}
                          {settings?.phone3 && <p>{settings.phone3}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3.5">
                      <Mail className="w-5 h-5 text-green-700 mt-0.5" style={{ color: primaryColor }} />
                      <div>
                        <p className="text-xs font-bold text-gray-900">Business Brand Email</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {settings?.email || "Oceangeneraldealers23@gmail.com"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl text-white flex flex-col justify-between h-48 shadow-md" style={{ backgroundColor: primaryColor }}>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-green-200">Africa/Blantyre Time</h4>
                    <p className="text-xl font-bold">08:00 AM - 05:00 PM</p>
                    <p className="text-3xs text-green-100">Monday to Friday (Saturday open 8:30 AM - 12:30 PM)</p>
                  </div>
                  <p className="text-3xs text-green-200 border-t border-green-600/50 pt-3">
                    We respond to online support tickets within 3 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      // 9. PRIVACY POLICY
      case "privacy":
        return (
          <div className="max-w-3xl mx-auto px-4 py-16 text-left space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
            <p className="text-xs text-gray-400">Last updated: July 2026</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              At Ocean General Dealers (operating as Ocean Harvest), we value the privacy and confidentiality of our customers, wholesale partners, and farmers. This Privacy Policy details how we handle quotation records, account registries, billing addresses, and digital cookies in accordance with modern security standards.
            </p>
            <h3 className="text-lg font-bold text-gray-800">1. Data Collection</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We collect user details (name, email, phone number) when registering a customer account or submitting quotation inquiry tickets. Payment invoices and physical shipping locations are logged strictly to facilitate nationwide deliveries.
            </p>
            <h3 className="text-lg font-bold text-gray-800">2. Security of Data</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              All credentials are cryptographically hashed using industry-standard protocols. Financial transactions and stock purchases are handled securely via authorized staff members inside our Limbe facility. We never share customer logs with third-party advertising companies.
            </p>
          </div>
        );

      // 10. TERMS AND CONDITIONS
      case "terms":
        return (
          <div className="max-w-3xl mx-auto px-4 py-16 text-left space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Terms & Conditions</h1>
            <p className="text-xs text-gray-400">Last updated: July 2026</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              By accessing the website, registering a customer portal profile, or ordering bulk crops from Ocean Harvest, you agree to comply with the following business terms.
            </p>
            <h3 className="text-lg font-bold text-gray-800">1. Pricing & Currency</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              All product pricing, quotation invoices, and delivery logistics rates are quoted in Malawian Kwacha (MWK). Invoices include standard Malawi Value Added Tax (VAT) rate of 16.5% unless a valid tax exemption certificate is supplied prior to packing.
            </p>
            <h3 className="text-lg font-bold text-gray-800">2. Logistics & Delivery</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              While we make every effort to satisfy delivery dates, transport is subject to road and weather conditions across Blantyre, Lilongwe, Zomba, and Mzuzu. Risk of stock deterioration transfers to the purchaser upon delivery receipt.
            </p>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderContent()}

      {/* ------------------------------------------------------------- */}
      {/* 1. PRODUCT DETAILS & QUOTATION MODAL */}
      <AnimatePresence>
        {activeProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity"
                aria-hidden="true"
                onClick={() => setActiveProduct(null)}
              />

              {/* Centered Modal Content */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                <div className="relative">
                  <button
                    onClick={() => setActiveProduct(null)}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm hover:bg-gray-100 rounded-full text-gray-600 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img
                    src={activeProduct.imageUrl}
                    alt={activeProduct.name}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-6 space-y-6">
                  <div className="text-left">
                    <span className="text-3xs uppercase font-extrabold tracking-wider" style={{ color: secondaryColor }}>
                      {activeProduct.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{activeProduct.name}</h3>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{activeProduct.description}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center text-xs">
                    <div>
                      <p className="text-3xs font-semibold text-gray-400 uppercase">Estimated Dealer Price</p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">
                        {formatMwk(activeProduct.priceMwk)} <span className="text-3xs font-medium text-gray-400">/ {activeProduct.unit}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xs font-semibold text-gray-400 uppercase">Warehouse Stock Level</p>
                      {activeProduct.stockLevel < 10 ? (
                        <p className="text-xs font-extrabold text-red-600 mt-0.5">Critical ({activeProduct.stockLevel} left)</p>
                      ) : (
                        <p className="text-xs font-extrabold text-green-700 mt-0.5">Available ({activeProduct.stockLevel} units)</p>
                      )}
                    </div>
                  </div>

                  {/* Form */}
                  <div className="border-t border-gray-100 pt-4 text-left">
                    {currentUser ? (
                      <form onSubmit={handleQuoteRequest} className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Request a Quotation Invoice</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Required Quantity</label>
                            <input
                              type="number"
                              min={1}
                              required
                              value={quoteQuantity}
                              onChange={(e) => setQuoteQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Stock Unit</label>
                            <input
                              type="text"
                              disabled
                              value={activeProduct.unit}
                              className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-400 cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-3xs font-bold text-gray-500 uppercase mb-1">Special Delivery / Packaging Notes</label>
                          <textarea
                            rows={3}
                            value={quoteNotes}
                            onChange={(e) => setQuoteNotes(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-500"
                            placeholder="Example: Sacks of 50kg, shipping address in Zomba town, required by Friday."
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center space-x-1.5"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Send className="w-4 h-4" />
                          <span>Submit Quotation Request</span>
                        </button>
                        {quoteSuccess && (
                          <div className="p-3 bg-green-50 text-green-800 text-3xs rounded-xl font-bold text-center border border-green-200">
                            ✓ Success! Ticket logged. Check your portal for status updates.
                          </div>
                        )}
                      </form>
                    ) : (
                      <div className="p-6 bg-amber-50 rounded-2xl text-center space-y-3">
                        <p className="text-xs text-amber-800 font-semibold">You must be registered to request quotations.</p>
                        <p className="text-3xs text-amber-700 leading-relaxed">Create a free Customer Portal profile to track quotations, view VAT invoices, and track orders directly in real-time.</p>
                        <button
                          onClick={() => {
                            setActiveProduct(null);
                            onOpenAuth("register");
                          }}
                          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-3xs rounded-lg transition-colors focus:outline-none"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          Register Customer Profile
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 2. GALLERY LIGHTBOX */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors focus:outline-none"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-4xl max-h-screen text-center space-y-4">
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title}
                className="max-h-[80vh] rounded-xl object-contain mx-auto shadow-2xl"
              />
              <div className="text-white space-y-1">
                <span className="text-3xs font-extrabold uppercase tracking-widest text-green-400">{lightboxImage.category}</span>
                <h3 className="text-lg font-bold">{lightboxImage.title}</h3>
                {lightboxImage.description && <p className="text-xs text-gray-400 max-w-xl mx-auto">{lightboxImage.description}</p>}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
