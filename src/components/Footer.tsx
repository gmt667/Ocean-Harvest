import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { OceanHarvestLogo } from "./OceanHarvestLogo";
import { Phone, Mail, MapPin, Send, Shield, Info, ArrowUpRight } from "lucide-react";

interface FooterProps {
  setTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setTab }) => {
  const { settings, subscribeNewsletter } = useApp();
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "success" | "duplicate" | "error">("idle");

  const brandName = settings?.brandName || "Ocean Harvest";
  const primaryColor = settings?.primaryColor || "#15803d";

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      const res = await subscribeNewsletter(email.trim());
      if (res) {
        setSubStatus("success");
        setEmail("");
      } else {
        setSubStatus("duplicate");
      }
    } catch {
      setSubStatus("error");
    }

    setTimeout(() => {
      setSubStatus("idle");
    }, 4000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 border-t-4" style={{ borderTopColor: primaryColor }} id="main_footer">
      {/* Top Banner with Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white tracking-tight">Stay updated with Ocean Harvest</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-xl">
              Subscribe to our newsletter for instant announcements regarding grain price reductions, crop stock availability, and quarterly farming reports across Malawi.
            </p>
          </div>
          <div className="relative">
            <form onSubmit={handleSubscribe} className="flex">
              <input
                type="email"
                placeholder="Enter email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-xl text-white text-xs focus:outline-none focus:border-green-500 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-3 text-white rounded-r-xl transition-all flex items-center justify-center focus:outline-none"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            {subStatus === "success" && (
              <p className="absolute left-0 mt-1 text-2xs text-green-400 font-medium">✓ Successfully subscribed!</p>
            )}
            {subStatus === "duplicate" && (
              <p className="absolute left-0 mt-1 text-2xs text-amber-400 font-medium">Already subscribed.</p>
            )}
            {subStatus === "error" && (
              <p className="absolute left-0 mt-1 text-2xs text-red-400 font-medium">Failed to subscribe. Try again.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
          {/* Column 1: About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <OceanHarvestLogo className="w-9 h-9" />
              <span className="text-lg font-black tracking-tight text-white">{brandName}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Operating under Ocean General Dealers, providing premium agricultural commodities, grains, poultry, and condiments to hotels, schools, households, and businesses in Malawi.
            </p>
            <div className="flex space-x-3 text-xs text-gray-400">
              <span className="font-semibold text-white">MWK Currency</span>
              <span>•</span>
              <span className="font-semibold text-white">CAT Timezone</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Explore</h4>
            <ul className="space-y-3 text-xs">
              {[
                { name: "Homepage", tab: "home" },
                { name: "About Us", tab: "about" },
                { name: "Product Catalog", tab: "products" },
                { name: "Company Services", tab: "services" },
                { name: "Photo Gallery", tab: "gallery" },
                { name: "News Articles", tab: "news" },
                { name: "FAQs", tab: "faqs" }
              ].map((link) => (
                <li key={link.tab}>
                  <button
                    onClick={() => setTab(link.tab)}
                    className="hover:text-white transition-colors flex items-center space-x-1 group"
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Contact Details</h4>
            <ul className="space-y-4 text-xs text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{settings?.address || "P.O. Box 3012, Limbe, Blantyre, Malawi"}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <span>{settings?.phone1 || "+265 993 86 16 49"}</span>
                  {settings?.phone2 && <span className="block">{settings.phone2}</span>}
                  {settings?.phone3 && <span className="block">{settings.phone3}</span>}
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="truncate">{settings?.email || "Oceangeneraldealers23@gmail.com"}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Quality Badge */}
          <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-white font-bold text-xs">
                <Shield className="w-5 h-5 text-green-500" style={{ color: primaryColor }} />
                <span>Verified Malawi Dealer</span>
              </div>
              <p className="text-3xs text-gray-400 mt-2 leading-relaxed">
                Registered under the Business Names Registration Act of Malawi. Committed to fair pricing, premium quality standard compliance, and long-term supply stability.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-3xs text-gray-400">
              <span>VAT Rate: {settings?.vatRate || 16.5}%</span>
              <span>100% Tax-Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-6 text-center text-xs text-gray-500 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {currentYear} Ocean General Dealers. All rights reserved. Brand: {brandName}.</p>
          <div className="flex space-x-6 text-3xs">
            <button onClick={() => setTab("privacy")} className="hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => setTab("terms")} className="hover:text-white transition-colors">Terms & Conditions</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
