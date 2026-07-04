import React, { useState, forwardRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import {
  Search, RotateCw, Printer,
  LogOut, Coffee, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const Key: React.FC<{ k: string }> = ({ k }) => (
  <kbd className="inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-wider font-mono leading-none ml-1"
    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.3)" }}>
    {k}
  </kbd>
);

export const Topbar = forwardRef<HTMLInputElement, TopbarProps>(
  ({ searchQuery, setSearchQuery }, ref) => {
    const { user, handleLogout, refreshData, showNotification } = useApp();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
      if (isRefreshing) return;
      setIsRefreshing(true);
      try {
        await refreshData();
        showNotification("Shop data refreshed", "success");
      } catch {
        showNotification("Refresh failed", "error");
      } finally {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }, [isRefreshing, refreshData, showNotification]);

    const initials = user?.name?.slice(0, 2).toUpperCase() ?? "AG";

    return (
      <header
        className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-6"
        style={{
          background: "rgba(15,15,23,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #FF6B35, #FF9F1C)", boxShadow: "0 4px 14px rgba(255,107,53,0.35)" }}
          >
            <Coffee className="h-4.5 w-4.5" />
          </motion.div>
          <div>
            <span className="block font-bold text-white leading-none text-sm">Antigravity</span>
            <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5 block" style={{ color: "#FF6B35" }}>POS Suite</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md mx-6">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "rgba(255,255,255,0.25)" }} />
          <input
            ref={ref}
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl py-2.5 pl-11 pr-10 text-sm font-medium text-white placeholder-white/25 outline-none transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(255,107,53,0.55)";
              e.target.style.background = "rgba(255,255,255,0.09)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.09)";
              e.target.style.background = "rgba(255,255,255,0.06)";
            }}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 transition"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
          {!searchQuery && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Key k="F" />
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            title="Refresh data"
            className="rounded-xl p-2.5 transition"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <RotateCw className={`h-4.5 w-4.5 transition-transform ${isRefreshing ? "animate-spin" : ""}`} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => window.print()}
            title="Print"
            className="rounded-xl p-2.5 transition"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <Printer className="h-4.5 w-4.5" />
          </motion.button>

          <div className="h-5 w-px mx-1" style={{ background: "rgba(255,255,255,0.09)" }} />

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 rounded-2xl p-1.5 pr-3 transition"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-xl text-white font-bold text-xs shadow-sm"
                style={{ background: "linear-gradient(135deg, #FF6B35, #FF9F1C)" }}
              >
                {initials}
              </div>
              <div className="hidden text-left md:block">
                <span className="block text-xs font-semibold text-white leading-tight">{user?.name ?? "User"}</span>
                <span className="block text-[9px] font-semibold capitalize" style={{ color: "rgba(255,255,255,0.35)" }}>{user?.role ?? "—"}</span>
              </div>
            </motion.button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl p-2.5 shadow-2xl z-50"
                  style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.09)" }}
                >
                  <div className="px-3 pb-3 pt-1.5 mb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Logged In</p>
                    <p className="text-sm font-bold text-white">{user?.name}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize mt-1 inline-block"
                      style={{ background: "rgba(255,107,53,0.15)", color: "#FF6B35", border: "1px solid rgba(255,107,53,0.25)" }}>
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition"
                    style={{ color: "rgba(248,113,113,0.9)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    );
  }
);

Topbar.displayName = "Topbar";
