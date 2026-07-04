import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Coffee, Lock, User, ArrowRight, Zap, LayoutDashboard, ChefHat, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_USERS = [
  { name: "Admin Dashboard",  role: "Admin",    pin: "1111", color: "from-purple-500 to-violet-600", icon: "dashboard" },
  { name: "Kitchen Display",  role: "Manager",  pin: "2222", color: "from-blue-500 to-indigo-600", icon: "kitchen" },
  { name: "Register (POS)",   role: "Cashier",  pin: "3333", color: "from-orange-500 to-amber-500", icon: "pos" },
];

/** Floating coffee particle */
const Particle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    className="absolute rounded-full opacity-20 particle pointer-events-none"
    style={style}
  />
);

export const Login: React.FC = () => {
  const { handleLogin } = useApp();
  const [pin, setPin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usePin, setUsePin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const particles = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 48 + 16,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      dur: `${Math.random() * 6 + 5}s`,
      delay: `${Math.random() * 4}s`,
    }))
  ).current;

  const handlePINClick = (num: string) => {
    if (pin.length < 4) {
      const next = pin + num;
      setPin(next);
      setError("");
      if (next.length === 4) submitPin(next);
    }
  };

  const submitPin = async (p: string) => {
    setIsLoading(true);
    try {
      await handleLogin({ pin: p });
    } catch {
      setError("Incorrect PIN. Please try again.");
      setPin("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await handleLogin({ username, password });
    } catch {
      setError("Invalid credentials. Please check and retry.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-neutral-950">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-orange-gradient relative overflow-hidden">
        {/* Floating particles */}
        {particles.map((p) => (
          <Particle
            key={p.id}
            style={{
              width: p.size, height: p.size,
              top: p.top, left: p.left,
              background: "rgba(255,255,255,0.3)",
              ["--dur" as string]: p.dur,
              animationDelay: p.delay,
            }}
          />
        ))}

        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/8 rounded-full" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-white/6 rounded-full" />
        <div className="absolute -bottom-16 left-1/4 w-64 h-64 bg-black/10 rounded-full" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <motion.div
            initial={{ rotate: -15, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
          >
            <Coffee className="h-5 w-5 text-white" />
          </motion.div>
          <span className="text-white font-bold text-xl tracking-tight">Antigravity POS</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 24 }}
            className="text-5xl font-black text-white leading-tight mb-4"
          >
            Your Coffee Shop.<br />
            <span className="text-white/70">Perfectly Managed.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-white/60 text-lg font-medium max-w-sm"
          >
            Premium point-of-sale software built for modern specialty coffee businesses.
          </motion.p>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[["9+", "Products"], ["11", "Categories"], ["15+", "Daily Orders"]].map(([val, label], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
              >
                <p className="text-3xl font-black text-white">{val}</p>
                <p className="text-white/60 text-xs font-semibold mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick user cards */}
        <div className="relative z-10 space-y-2">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">
            <Zap className="h-3 w-3 inline mr-1" />Select Role to Login
          </p>
          {QUICK_USERS.map((u, i) => (
            <motion.button
              key={u.pin}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.1 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => submitPin(u.pin)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 hover:border-white/20 transition text-left group"
            >
              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${u.color} flex items-center justify-center text-white shadow-md`}>
                {u.icon === "dashboard" && <LayoutDashboard className="h-4.5 w-4.5" />}
                {u.icon === "kitchen" && <ChefHat className="h-4.5 w-4.5" />}
                {u.icon === "pos" && <ShoppingBag className="h-4.5 w-4.5" />}
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-bold">{u.name}</p>
                <p className="text-white/50 text-[10px] font-semibold">{u.role} · PIN {u.pin}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-neutral-900 dark:text-white text-lg">Antigravity POS</span>
          </div>

          <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-1 tracking-tight">
            Welcome back 👋
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-8">
            Sign in to start your shift
          </p>

          {/* Toggle */}
          <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-1.5 mb-8 border border-neutral-200 dark:border-neutral-800">
            {[
              { label: "Quick PIN", id: true },
              { label: "Password", id: false },
            ].map((tab) => (
              <button
                key={String(tab.id)}
                onClick={() => { setUsePin(tab.id); setPin(""); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  usePin === tab.id
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-500"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {usePin ? (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18 }}
                className="space-y-6"
              >
                {/* PIN dots */}
                <motion.div
                  className={`flex justify-center gap-4 ${shake ? "animate-shake" : ""}`}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={
                        pin.length > i
                          ? { scale: [1, 1.4, 1], backgroundColor: "#FF6B35" }
                          : { scale: 1, backgroundColor: "transparent" }
                      }
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      className={`h-5 w-5 rounded-full border-2 transition-colors ${
                        pin.length > i
                          ? "border-orange-500 shadow-lg shadow-orange-500/30"
                          : "border-neutral-300 dark:border-neutral-700"
                      }`}
                    />
                  ))}
                </motion.div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.9, backgroundColor: "#fff7ed" }}
                      onClick={() => handlePINClick(n)}
                      disabled={isLoading}
                      className="py-5 text-center text-xl font-bold rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-white hover:bg-orange-50 dark:hover:bg-neutral-800 hover:border-orange-200 dark:hover:border-orange-800 transition card-shadow"
                    >
                      {n}
                    </motion.button>
                  ))}
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => { setPin(""); setError(""); }}
                    className="py-5 text-sm font-bold rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    Clear
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9, backgroundColor: "#fff7ed" }}
                    onClick={() => handlePINClick("0")}
                    disabled={isLoading}
                    className="py-5 text-center text-xl font-bold rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-white hover:bg-orange-50 dark:hover:bg-neutral-800 hover:border-orange-200 dark:hover:border-orange-800 transition card-shadow"
                  >
                    0
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => { setPin((p) => p.slice(0, -1)); setError(""); }}
                    className="py-5 text-lg font-bold rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    ←
                  </motion.button>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Verifying…
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text" required value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="password" required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition"
                    />
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition"
                >
                  {isLoading ? "Signing in…" : "Sign In →"}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-5 text-center text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-2xl py-3 px-4"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
