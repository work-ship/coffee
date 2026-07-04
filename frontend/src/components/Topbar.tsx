import React, { useState, forwardRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import {
  Search, Calculator, RotateCw, Bell, Printer,
  LogOut, Coffee, Sun, Moon, X,
} from "lucide-react";
import { CalculatorModal } from "./CalculatorModal";
import { motion, AnimatePresence } from "framer-motion";

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

/** Visual keyboard shortcut pill */
const Key: React.FC<{ k: string }> = ({ k }) => (
  <kbd className="inline-flex items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[9px] font-black text-neutral-400 dark:text-neutral-500 tracking-wider font-mono shadow-sm ml-1">
    {k}
  </kbd>
);

// Forward the search input ref so the keyboard shortcut hook can .focus() it
export const Topbar = forwardRef<HTMLInputElement, TopbarProps>(
  ({ searchQuery, setSearchQuery }, ref) => {
    const { user, handleLogout, refreshData, showNotification, darkMode, toggleDarkMode } = useApp();
    const [isCalcOpen, setIsCalcOpen] = useState(false);
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

    return (
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 px-6 backdrop-blur-md">

        {/* ── Brand ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/30"
          >
            <Coffee className="h-5 w-5" />
          </motion.div>
          <div>
            <span className="block font-bold text-neutral-900 dark:text-white leading-none">Antigravity</span>
            <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-widest mt-0.5 block">POS Suite</span>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative w-full max-w-md mx-6">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            ref={ref}
            type="text"
            placeholder="Search products or scan barcode…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 py-2.5 pl-11 pr-10 text-sm text-neutral-800 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 outline-none hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50 focus:border-orange-500 focus:bg-white dark:focus:bg-neutral-800 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/30 transition"
          />
          {/* Clear button */}
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
          {/* Keyboard hint */}
          {!searchQuery && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Key k="F" />
            </span>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Dark mode toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-xl p-2.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white transition relative overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={darkMode ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCalcOpen(true)}
            title="Calculator"
            className="rounded-xl p-2.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white transition"
          >
            <Calculator className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            title="Refresh data"
            className="rounded-xl p-2.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white transition"
          >
            <RotateCw className={`h-5 w-5 transition-transform ${isRefreshing ? "animate-spin" : ""}`} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            title="Alerts"
            className="relative rounded-xl p-2.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white transition"
          >
            <Bell className="h-5 w-5" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 border-2 border-white dark:border-neutral-900 pulse-ring"
            />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => window.print()}
            title="Print receipt"
            className="rounded-xl p-2.5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-white transition"
          >
            <Printer className="h-5 w-5" />
          </motion.button>

          <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

          {/* Profile dropdown */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 p-1.5 pr-3 border border-neutral-150 dark:border-neutral-700 transition"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white font-bold text-sm shadow-sm">
                {user?.name?.slice(0, 2).toUpperCase() ?? "CO"}
              </div>
              <div className="hidden text-left md:block">
                <span className="block text-xs font-semibold text-neutral-800 dark:text-white leading-tight">{user?.name ?? "Cashier"}</span>
                <span className="block text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 capitalize">{user?.role ?? "User"}</span>
              </div>
            </motion.button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl border border-neutral-150 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 shadow-xl z-50"
                >
                  <div className="border-b border-neutral-100 dark:border-neutral-700 px-3 pb-3 pt-1.5 mb-1">
                    <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Logged In</p>
                    <p className="text-sm font-bold text-neutral-800 dark:text-white mt-0.5">{user?.name}</p>
                    <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <CalculatorModal isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />
      </header>
    );
  }
);

Topbar.displayName = "Topbar";
