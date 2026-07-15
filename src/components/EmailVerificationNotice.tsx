import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { Mail, RefreshCw, Send, LogOut, CheckCircle2, AlertCircle } from "lucide-react";

export function EmailVerificationNotice() {
  const {
    currentUser,
    fbAuthUser,
    reloadAuthUser,
    resendVerificationEmail,
    logout,
    settings
  } = useApp();

  const [isChecking, setIsChecking] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const primaryColor = settings?.primaryColor || "#022c22";
  const secondaryColor = settings?.secondaryColor || "#fbbf24";

  // Cooldown timer for resending verification email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const isVerified = await reloadAuthUser();
      if (isVerified) {
        setSuccessMessage("Success! Your email address has been verified. Welcome to your Customer Portal!");
      } else {
        setErrorMessage("Verification still pending. Please check your inbox and click the verification link.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to refresh verification status. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || resendStatus === "sending") return;
    setResendStatus("sending");
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await resendVerificationEmail();
      setResendStatus("sent");
      setSuccessMessage("A fresh email verification link has been sent to your inbox. Please check your spam folder if you cannot find it.");
      setResendCooldown(60); // 1-minute cooldown
    } catch (err: any) {
      setResendStatus("error");
      setErrorMessage(err.message || "Failed to resend verification email. Please try again later.");
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white border border-gray-100 rounded-2xl shadow-xl">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-600 mb-6 animate-pulse">
          <Mail className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          Verify Your Email
        </h2>
        
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          We have sent a secure verification link to:
          <br />
          <strong className="text-gray-900 font-semibold text-base block mt-1 select-all">
            {currentUser?.email || fbAuthUser?.email}
          </strong>
        </p>

        <p className="text-xs text-gray-500 mb-8 leading-relaxed">
          Please check your inbox, click the link to verify your account, and return to this page to access your customer dashboard.
        </p>

        {/* Status Alerts */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3.5 mb-6 text-sm text-red-800 bg-red-50 border border-red-100 rounded-xl text-left"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div>{errorMessage}</div>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 p-3.5 mb-6 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl text-left"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
            <div>{successMessage}</div>
          </motion.div>
        )}

        {/* Primary CTA: Check Verification */}
        <button
          onClick={handleCheckStatus}
          disabled={isChecking}
          id="auth_check_verify_btn"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all shadow-md mb-3"
          style={{
            backgroundColor: primaryColor,
            color: "#ffffff",
            opacity: isChecking ? 0.8 : 1,
          }}
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
          {isChecking ? "Checking status..." : "I have verified my email"}
        </button>

        {/* Secondary: Resend link */}
        <button
          onClick={handleResendEmail}
          disabled={resendCooldown > 0 || resendStatus === "sending"}
          id="auth_resend_verify_btn"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors mb-6 disabled:text-gray-400 disabled:bg-gray-50"
        >
          <Send className="w-3.5 h-3.5" />
          {resendCooldown > 0
            ? `Resend available in ${resendCooldown}s`
            : "Resend verification email"}
        </button>

        {/* Separator */}
        <div className="border-t border-gray-100 pt-5 flex items-center justify-center">
          <button
            onClick={logout}
            id="auth_verify_logout_btn"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out & Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
