import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { OceanHarvestLogo } from "./OceanHarvestLogo";
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Compass,
  Bell,
  CheckCircle,
  Truck
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onOpenAuth: (mode: "login" | "register") => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab, onOpenAuth }) => {
  const { currentUser, logout, settings, notifications, markNotificationAsRead } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const brandName = settings?.brandName || "Ocean Harvest";
  const primaryColor = settings?.primaryColor || "#15803d"; // Default green
  const secondaryColor = settings?.secondaryColor || "#ca8a04"; // Default gold

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const publicNavItems = [
    { label: "Home", tab: "home" },
    { label: "About Us", tab: "about" },
    { label: "Products", tab: "products" },
    { label: "Services", tab: "services" },
    { label: "Gallery", tab: "gallery" },
    { label: "News", tab: "news" },
    { label: "FAQs", tab: "faqs" },
    { label: "Contact Us", tab: "contact" }
  ];

  const handleNavClick = (tab: string) => {
    setTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    setTab("home");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm" id="main_navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick("home")}
              className="flex items-center space-x-2 group focus:outline-none"
              id="navbar_logo_button"
            >
              <OceanHarvestLogo className="w-11 h-11 transition-transform group-hover:scale-105" />
              <div className="text-left">
                <span
                  className="block text-lg font-extrabold tracking-tight"
                  style={{ color: primaryColor }}
                >
                  {brandName}
                </span>
                <span className="block text-2xs uppercase tracking-widest text-gray-400 font-semibold -mt-1">
                  General Dealers
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {publicNavItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentTab === item.tab
                    ? "text-green-700 bg-green-50"
                    : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
                }`}
                style={currentTab === item.tab ? { color: primaryColor, backgroundColor: primaryColor + "10" } : {}}
                id={`nav_link_${item.tab}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Profile / Auth Area */}
          <div className="hidden lg:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3 relative">
                {/* Staff / Admin notifications list */}
                {(currentUser.role !== "Customer") && (
                  <div className="relative">
                    <button
                      onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-50 rounded-full relative focus:outline-none"
                      id="bell_icon_button"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadNotifs.length > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-3xs font-bold rounded-full flex items-center justify-center">
                          {unreadNotifs.length}
                        </span>
                      )}
                    </button>

                    {notifDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                          <span className="font-bold text-sm text-gray-800">Alerts & Notifications</span>
                          <span className="text-2xs text-gray-400">{unreadNotifs.length} unread</span>
                        </div>
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-gray-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationAsRead(n.id);
                                handleNavClick("dashboard");
                              }}
                              className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors flex space-x-3 ${
                                !n.isRead ? "bg-green-50/30" : ""
                              }`}
                            >
                              <div className="mt-0.5">
                                {n.type === "stock" ? (
                                  <span className="w-2 h-2 rounded-full bg-red-500 block" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-green-500 block" />
                                )}
                              </div>
                              <div className="text-left flex-1">
                                <p className="text-xs font-semibold text-gray-800 leading-tight">{n.title}</p>
                                <p className="text-2xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                                <span className="text-3xs text-gray-400 block mt-1">
                                  {new Date(n.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                        <div className="px-4 py-1 text-center border-t border-gray-50 mt-1">
                          <button
                            onClick={() => {
                              setNotifDropdownOpen(false);
                              handleNavClick("dashboard");
                            }}
                            className="text-2xs font-semibold text-green-700 hover:underline"
                            style={{ color: primaryColor }}
                          >
                            View in Dashboard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dashboard Shortcut */}
                <button
                  onClick={() => handleNavClick("dashboard")}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium border-gray-200 hover:border-green-600 transition-colors bg-gray-50"
                  id="dashboard_nav_button"
                >
                  <LayoutDashboard className="w-4 h-4 text-green-600" style={{ color: primaryColor }} />
                  <span>Portal / Dashboard</span>
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
                    id="user_profile_dropdown"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-semibold text-gray-800 max-w-28 truncate">{currentUser.name}</span>
                      <span className="block text-3xs text-gray-400 capitalize">{currentUser.role}</span>
                    </div>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <span className="block text-xs font-bold text-gray-800">{currentUser.name}</span>
                        <span className="block text-2xs text-gray-400 max-w-full truncate">{currentUser.email}</span>
                      </div>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleNavClick("dashboard");
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        <span>My Dashboard</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 border-t border-gray-100"
                        id="logout_nav_button"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth("login")}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-all focus:outline-none"
                  id="navbar_login_btn"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth("register")}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-md hover:opacity-90 transition-all focus:outline-none"
                  style={{ backgroundColor: primaryColor }}
                  id="navbar_register_btn"
                >
                  Customer Registration
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none"
              id="mobile_menu_toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white" id="mobile_navbar_menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {publicNavItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                  currentTab === item.tab
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
                }`}
                style={currentTab === item.tab ? { color: primaryColor, backgroundColor: primaryColor + "10" } : {}}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-4 pb-2 border-t border-gray-100 mt-4 px-4">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNavClick("dashboard")}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold bg-gray-50 text-gray-700"
                  >
                    <LayoutDashboard className="w-4 h-4 text-green-600" style={{ color: primaryColor }} />
                    <span>My Portal / Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth("login");
                    }}
                    className="w-full py-2.5 border border-gray-200 rounded-xl text-center text-sm font-semibold text-gray-700 bg-gray-50"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth("register");
                    }}
                    className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Customer Registration
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
