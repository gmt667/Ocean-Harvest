import React, { useState, useEffect, useRef } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { PublicPages } from "./components/PublicPages";
import { CustomerPortal } from "./components/CustomerPortal";
import { AdminDashboard } from "./components/AdminDashboard";
import { EmailVerificationNotice } from "./components/EmailVerificationNotice";
import { OceanHarvestLogo } from "./components/OceanHarvestLogo";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Check,
  Eye,
  EyeOff
} from "lucide-react";
import { UserRole } from "./types";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebase";

function MainAppContent() {
  const [currentTab, setTab] = useState<string>("home");
  const [authModal, setAuthModal] = useState<"login" | "register" | "forgot" | null>(null);

  // Auth form states
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem("remembered_email");
    if (remembered) {
      setAuthEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (authError) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  // Password strength validation variables
  const hasMinLength = authPassword.length >= 8;
  const hasNumber = /[0-9]/.test(authPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(authPassword);
  const pwdScore = authPassword.length === 0 
    ? 0 
    : (hasMinLength ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

  // Input refs for automatic mobile focus and virtual keyboard trigger
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authModal) {
      setShowPassword(false);
      const timer = setTimeout(() => {
        if (authModal === "register" && nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.click();
        } else if ((authModal === "login" || authModal === "forgot") && emailInputRef.current) {
          emailInputRef.current.focus();
          emailInputRef.current.click();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authModal]);

  const {
    currentUser,
    login,
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    register,
    fbAuthUser,
    triggerQuickSeeding,
    settings,
    products,
    isLoading
  } = useApp();

  const primaryColor = settings?.primaryColor || "#15803d";
  const secondaryColor = settings?.secondaryColor || "#ca8a04";

  const handleOpenAuth = (mode: "login" | "register" | "forgot") => {
    setAuthError("");
    setResetSuccess("");
    if (mode === "login") {
      const remembered = localStorage.getItem("remembered_email");
      setAuthEmail(remembered || "");
      setRememberMe(!!remembered);
    } else if (mode === "register") {
      setAuthEmail("");
      setRememberMe(false);
    }
    setAuthPassword("");
    setAuthName("");
    setShowPassword(false);
    setAuthModal(mode);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setResetSuccess("");
    setIsSubmitting(true);

    try {
      if (authModal === "forgot") {
        if (!authEmail.trim()) {
          setAuthError("Email address is required.");
          setIsSubmitting(false);
          return;
        }
        await sendPasswordResetEmail(auth, authEmail);
        setResetSuccess("A secure reset link has been sent to your email. Check your inbox to complete the credentials reset.");
      } else if (authModal === "login") {
        const success = await login(authEmail, authPassword);
        if (success) {
          if (rememberMe) {
            localStorage.setItem("remembered_email", authEmail);
          } else {
            localStorage.removeItem("remembered_email");
          }
          setAuthModal(null);
          // Redirect to appropriate dashboard/portal
          setTab("dashboard");
        } else {
          setAuthError("Invalid email or password. Please verify credentials.");
        }
      } else {
        if (!authName.trim()) {
          setAuthError("Name field is required.");
          setIsSubmitting(false);
          return;
        }
        if (!hasMinLength || !hasNumber || !hasSpecial) {
          setAuthError("Password does not meet the security strength requirements. Please ensure all conditions are green.");
          setIsSubmitting(false);
          return;
        }
        const success = await register(authEmail, authPassword, authName);
        if (success) {
          setAuthModal(null);
          setTab("dashboard");
        } else {
          setAuthError("Registration failed. Email may already exist.");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setResetSuccess("");
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setAuthModal(null);
        setTab("dashboard");
      } else {
        setAuthError(res.error || "Google sign-in failed.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during Google sign-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setAuthError("");
    setResetSuccess("");
    setIsSubmitting(true);
    try {
      const res = await loginWithFacebook();
      if (res.success) {
        setAuthModal(null);
        setTab("dashboard");
      } else {
        setAuthError(res.error || "Facebook sign-in failed.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during Facebook sign-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAuthError("");
    setResetSuccess("");
    setIsSubmitting(true);
    try {
      const res = await loginWithApple();
      if (res.success) {
        setAuthModal(null);
        setTab("dashboard");
      } else {
        setAuthError(res.error || "Apple sign-in failed.");
      }
    } catch (err: any) {
      setAuthError(err.message || "An error occurred during Apple sign-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSeed = async () => {
    if (confirm("This will seed initial products, FAQs, Services, Testimonials, and create a test Administrator account. Proceed?")) {
      await triggerQuickSeeding();
      alert("Database successfully seeded! Default Admin Login: admin@oceanharvest.com | Password: password");
    }
  };

  // Loader screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl animate-spin border-4 border-t-transparent shadow-lg" style={{ borderColor: primaryColor, borderTopColor: "transparent" }} />
        <p className="text-xs font-bold text-gray-500 tracking-wider">Loading Ocean Harvest...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      <div>
        {/* Real-time sync Navbar */}
        <Navbar currentTab={currentTab} setTab={setTab} onOpenAuth={handleOpenAuth} />

        {/* Dynamic Route views */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {currentTab === "dashboard" ? (
                currentUser?.role === UserRole.CUSTOMER ? (
                  fbAuthUser && !fbAuthUser.emailVerified ? (
                    <EmailVerificationNotice />
                  ) : (
                    <CustomerPortal />
                  )
                ) : (
                  <AdminDashboard />
                )
              ) : (
                <PublicPages currentTab={currentTab} setTab={setTab} onOpenAuth={handleOpenAuth} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer linkboard */}
      <Footer setTab={setTab} />

      {/* ------------------------------------------------------------- */}
      {/* 1. SECURE AUTHENTICATION DIALOG (LOGIN/REGISTRATION) */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto" id="auth_overlay">
            <div className="flex items-center justify-center min-h-screen p-4 text-center">
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setAuthModal(null)} />
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15, x: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  x: shake ? [0, -10, 10, -10, 10, -5, 5, -2, 2, 0] : 0
                }}
                exit={{ opacity: 0, scale: 0.95, y: 15, x: 0 }}
                transition={{
                  x: { duration: 0.5, ease: "easeInOut" },
                  default: { duration: 0.3 }
                }}
                className="relative inline-block w-full max-w-md bg-white rounded-2xl sm:rounded-3xl text-left overflow-hidden shadow-2xl p-6 sm:p-8 space-y-5 sm:space-y-6 border border-slate-100 my-auto"
              >
                <button
                  onClick={() => setAuthModal(null)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-left space-y-1">
                  <OceanHarvestLogo className="w-11 h-11 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {authModal === "login" 
                      ? "Welcome back to Ocean Harvest" 
                      : authModal === "register" 
                      ? "Register Customer Profile" 
                      : "Reset Your Password"}
                  </h3>
                  <p className="text-2xs sm:text-xs text-slate-500 leading-relaxed">
                    {authModal === "login"
                      ? "Sign in to compile quotes, buy crops directly, or manage warehouse operations."
                      : authModal === "register"
                      ? "Create an account to track delivery dispatch progress and retrieve official VAT invoices."
                      : "Enter your registered email address and we'll send you a secure link to reset your credentials."}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
                  {authModal === "register" && (
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          ref={nameInputRef}
                          type="text"
                          required
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm transition-all focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-950/10 focus:border-emerald-900"
                          placeholder="Hon. Peter Banda"
                        />
                        {authName.length > 0 && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                            {authName.trim().length >= 3 ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <X className="w-4 h-4 text-rose-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <input
                        ref={emailInputRef}
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm transition-all focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-950/10 focus:border-emerald-900"
                        placeholder="buyer@example.com"
                      />
                      {authEmail.length > 0 && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail) ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <X className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {authModal !== "forgot" && (
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Account Password *</label>
                        {authModal === "login" && (
                          <button
                            type="button"
                            onClick={() => handleOpenAuth("forgot")}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline transition-colors focus:outline-none"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full pl-11 pr-20 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm transition-all focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-950/10 focus:border-emerald-900"
                          placeholder="••••••••"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors rounded-lg hover:bg-slate-100"
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          {authPassword.length > 0 && (
                            <div className="flex items-center justify-center">
                              {((authModal === "register" && pwdScore === 3) || (authModal === "login" && authPassword.length >= 6)) ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <X className="w-4 h-4 text-rose-500" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {authModal === "login" && (
                        <div className="flex items-center mt-3" id="remember_me_container">
                          <input
                            id="remember_me"
                            name="remember_me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <label htmlFor="remember_me" className="ml-2 block text-xs font-semibold text-slate-600 cursor-pointer select-none">
                            Remember Me
                          </label>
                        </div>
                      )}

                      {authModal === "register" && authPassword.length > 0 && (
                        <div className="space-y-2.5 mt-2.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl transition-all duration-200">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-slate-500">Password Strength:</span>
                            <span className={`font-bold transition-colors ${
                              pwdScore === 3 ? "text-emerald-600" : pwdScore === 2 ? "text-amber-500" : "text-rose-500"
                            }`}>
                              {pwdScore === 3 ? "Strong" : pwdScore === 2 ? "Medium" : "Weak"}
                            </span>
                          </div>
                          
                          {/* Segmented Strength Bar */}
                          <div className="grid grid-cols-3 gap-1.5 h-1.5">
                            <div className={`rounded-full h-full transition-all duration-300 ${
                              pwdScore >= 1 ? (pwdScore === 3 ? "bg-emerald-500" : pwdScore === 2 ? "bg-amber-500" : "bg-rose-500") : "bg-slate-200"
                            }`} />
                            <div className={`rounded-full h-full transition-all duration-300 ${
                              pwdScore >= 2 ? (pwdScore === 3 ? "bg-emerald-500" : "bg-amber-500") : "bg-slate-200"
                            }`} />
                            <div className={`rounded-full h-full transition-all duration-300 ${
                              pwdScore === 3 ? "bg-emerald-500" : "bg-slate-200"
                            }`} />
                          </div>

                          {/* Requirement Checklist */}
                          <div className="pt-1.5 space-y-2 text-[11px] font-medium text-slate-600">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                hasMinLength ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"
                              }`}>
                                {hasMinLength ? (
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <div className="w-1 h-1 rounded-full bg-slate-400" />
                                )}
                              </div>
                              <span className={`transition-colors ${hasMinLength ? "text-emerald-700 font-semibold" : ""}`}>Minimum 8 characters</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                hasNumber ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"
                              }`}>
                                {hasNumber ? (
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <div className="w-1 h-1 rounded-full bg-slate-400" />
                                )}
                              </div>
                              <span className={`transition-colors ${hasNumber ? "text-emerald-700 font-semibold" : ""}`}>At least one number (0-9)</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                                hasSpecial ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"
                              }`}>
                                {hasSpecial ? (
                                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <div className="w-1 h-1 rounded-full bg-slate-400" />
                                )}
                              </div>
                              <span className={`transition-colors ${hasSpecial ? "text-emerald-700 font-semibold" : ""}`}>At least one special character</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {authError && (
                    <div className="p-3 bg-red-50 text-red-800 text-2xs sm:text-xs rounded-xl font-bold flex items-start gap-2.5 border border-red-100">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-normal">{authError}</span>
                    </div>
                  )}

                  {resetSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-2xs sm:text-xs rounded-xl font-bold flex items-start gap-2.5 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-normal">{resetSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 sm:py-4 text-white rounded-xl text-sm font-bold shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>
                      {isSubmitting 
                        ? "Processing secure request..." 
                        : authModal === "login" 
                        ? "Secure Log In" 
                        : authModal === "register" 
                        ? "Register Profile" 
                        : "Send Reset Link"}
                    </span>
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {authModal !== "forgot" && (
                    <>
                      <div className="relative flex items-center justify-center my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <span className="relative px-3 bg-white text-xs font-bold text-slate-400 uppercase tracking-wider">Or continue with</span>
                      </div>

                      <div className="space-y-2.5">
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isSubmitting}
                          className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm active:scale-[0.99] transition-all flex items-center justify-center space-x-3 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                          </svg>
                          <span>Sign in with Google</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleFacebookSignIn}
                          disabled={isSubmitting}
                          className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl text-sm font-bold shadow-sm active:scale-[0.99] transition-all flex items-center justify-center space-x-3 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                          </svg>
                          <span>Sign in with Facebook</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAppleSignIn}
                          disabled={isSubmitting}
                          className="w-full py-3 px-4 bg-black hover:bg-neutral-900 text-white rounded-xl text-sm font-bold shadow-sm active:scale-[0.99] transition-all flex items-center justify-center space-x-3 focus:outline-none focus:ring-4 focus:ring-slate-100 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.029-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.51 12.06 1.005 1.45 2.187 3.07 3.766 3.01 1.524-.06 2.098-.98 3.94-.98 1.83 0 2.35.98 3.945.95 1.646-.03 2.683-1.46 3.682-2.92 1.154-1.69 1.63-3.33 1.66-3.41-.03-.01-3.19-1.22-3.22-4.85-.03-3.03 2.48-4.49 2.59-4.56-1.43-2.1-3.65-2.33-4.44-2.38-2.1-.17-3.32 1.11-3.95 1.11zM15.424 3.716c.866-1.05 1.45-2.51 1.29-3.97-1.25.05-2.77.83-3.67 1.88-.78.91-1.46 2.39-1.28 3.82 1.39.11 2.8-.73 3.66-1.73z" />
                          </svg>
                          <span>Sign in with Apple</span>
                        </button>
                      </div>
                    </>
                  )}

                  <div className="text-center pt-1">
                    {authModal === "login" && (
                      <button
                        type="button"
                        onClick={() => handleOpenAuth("register")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline py-2 px-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-100"
                      >
                        Need a customer profile? Register here
                      </button>
                    )}
                    {authModal === "register" && (
                      <button
                        type="button"
                        onClick={() => handleOpenAuth("login")}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline py-2 px-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-100"
                      >
                        Already have a profile? Sign in here
                      </button>
                    )}
                    {authModal === "forgot" && (
                      <button
                        type="button"
                        onClick={() => handleOpenAuth("login")}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline py-2 px-3 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-100"
                      >
                        Back to Log In
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 2. PERSISTENT SYSTEM SEEDER CONTROLS */}
      {products.length === 0 && (
        <div className="fixed bottom-6 left-6 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleQuickSeed}
            className="flex items-center space-x-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-full shadow-2xl border-2 border-white animate-bounce focus:outline-none"
            style={{ backgroundColor: secondaryColor }}
          >
            <Database className="w-4 h-4" />
            <span>Seed Demo Database</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
