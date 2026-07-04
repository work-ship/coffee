import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  Coffee, Lock, User, ArrowRight, Zap,
  LayoutDashboard, ChefHat, ShoppingBag, Delete,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_USERS = [
  { name: "Admin",   role: "Admin",   pin: "1111", gradient: "from-violet-500 to-purple-600",  icon: "dashboard" },
  { name: "Manager", role: "Manager", pin: "2222", gradient: "from-sky-500 to-blue-600",        icon: "kitchen"   },
  { name: "Cashier", role: "Cashier", pin: "3333", gradient: "from-orange-500 to-amber-500",   icon: "pos"       },
];

const RoleIcon: React.FC<{ icon: string }> = ({ icon }) => {
  if (icon === "dashboard") return <LayoutDashboard className="h-4 w-4" />;
  if (icon === "kitchen")   return <ChefHat className="h-4 w-4" />;
  return <ShoppingBag className="h-4 w-4" />;
};

export const Login: React.FC = () => {
  const { handleLogin } = useApp();
  const [pin, setPin]             = useState("");
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [usePin, setUsePin]       = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [shake, setShake]         = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const particles = useRef(
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      size: Math.random() * 40 + 10,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      dur: `${Math.random() * 8 + 6}s`,
      delay: `${Math.random() * 5}s`,
    }))
  ).current;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handlePINClick = (num: string) => {
    if (pin.length >= 4 || isLoading) return;
    setPressedKey(num);
    setTimeout(() => setPressedKey(null), 300);
    const next = pin + num;
    setPin(next);
    setError("");
    if (next.length === 4) submitPin(next);
  };

  const submitPin = async (p: string) => {
    setIsLoading(true);
    try {
      await handleLogin({ pin: p });
    } catch {
      setError("Incorrect PIN. Please try again.");
      setPin("");
      triggerShake();
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
      setError("Invalid credentials. Please try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-neutral-950">

      {/* LEFT — dark cinematic panel */}
      <div
        className="hidden lg:flex w-[46%] flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f0f17 0%, #1a1225 50%, #0d1520 100%)" }}
      >
        {/* Ambient orbs */}
        <div
          className="absolute top-[-120px] left-[-80px] w-[520px] h-[520px] rounded-full orb-drift-1 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,107,53,0.18) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-100px] right-[-60px] w-[420px] h-[420px] rounded-full orb-drift-2 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full orb-drift-3 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)" }}
        />

        {/* Floating micro-particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full particle pointer-events-none"
            style={{
              width: p.size, height: p.size,
              top: p.top, left: p.left,
              background: "rgba(255,255,255,0.04)",
              ["--dur" as string]: p.dur,
              animationDelay: p.delay,
            }}
          />
        ))}

        {/* Grid mesh overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #FF6B35, #FF9F1C)" }}
            >
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Antigravity POS</span>
          </motion.div>

          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 26 }}
            >
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400/80 mb-5 px-3 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/10"
              >
                ☕ Point of Sale System
              </span>
              <h1 className="text-5xl font-black leading-[1.12] text-white mb-5">
                Run your café<br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #FF6B35, #FF9F1C, #FBBF24)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  effortlessly.
                </span>
              </h1>
              <p className="text-white/45 text-base font-medium leading-relaxed max-w-xs">
                Premium POS software — from orders to kitchen to reports, all in one place.
              </p>
            </motion.div>

            {/* Feature chips */}
            <motion.div
              className="mt-10 grid grid-cols-3 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[["Fast", "Checkout"], ["Real-time", "Kitchen"], ["Smart", "Reports"]].map(([v, l], i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.07 }}
                  className="rounded-2xl p-4 border border-white/[0.07]"
                  style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}
                >
                  <p className="text-white font-extrabold text-sm">{v}</p>
                  <p className="text-white/40 text-[11px] font-semibold mt-0.5">{l}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Role quick-select */}
          <div className="mt-auto">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-white/35 text-[10px] font-bold uppercase tracking-[0.18em] mb-3 flex items-center gap-1.5"
            >
              <Zap className="h-3 w-3 text-orange-400" /> Quick Role Login
            </motion.p>
            <div className="space-y-2">
              {QUICK_USERS.map((u, i) => (
                <motion.button
                  key={u.pin}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 260, damping: 24 }}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => submitPin(u.pin)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left group transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div
                    className={`h-9 w-9 rounded-xl bg-gradient-to-br ${u.gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
                  >
                    <RoleIcon icon={u.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold">{u.name}</p>
                    <p className="text-white/40 text-[10px] font-semibold">{u.role} · PIN {u.pin}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — login form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-950 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,107,53,0.06) 0%, transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 28, delay: 0.05 }}
          className="w-full max-w-[400px] relative z-10"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20"
              style={{ background: "linear-gradient(135deg, #FF6B35, #FF9F1C)" }}
            >
              <Coffee className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">Antigravity POS</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="text-3xl font-black text-white tracking-tight mb-1"
            >
              Welcome back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-sm font-medium"
            >
              Sign in to start your shift
            </motion.p>
          </div>

          {/* Tab switcher */}
          <div
            className="flex p-1.5 mb-8 rounded-2xl gap-1.5"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {[{ label: "Quick PIN", id: true }, { label: "Password", id: false }].map((tab) => (
              <button
                key={String(tab.id)}
                onClick={() => { setUsePin(tab.id); setPin(""); setError(""); }}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all"
                style={
                  usePin === tab.id
                    ? {
                        background: "linear-gradient(135deg, #FF6B35, #FF8C5A)",
                        color: "white",
                        boxShadow: "0 4px 14px rgba(255,107,53,0.35)",
                      }
                    : { color: "rgba(255,255,255,0.4)" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {usePin ? (
              <motion.div
                key="pin"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 14 }}
                transition={{ duration: 0.2 }}
              >
                {/* PIN dots */}
                <div className={`flex justify-center gap-5 mb-8 ${shake ? "animate-shake" : ""}`}>
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={
                        pin.length > i
                          ? { scale: [1, 1.35, 1], backgroundColor: "#FF6B35" }
                          : { scale: 1, backgroundColor: "rgba(255,255,255,0.12)" }
                      }
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className="h-4 w-4 rounded-full"
                      style={{
                        border: pin.length > i ? "2px solid #FF6B35" : "2px solid rgba(255,255,255,0.18)",
                        boxShadow: pin.length > i ? "0 0 12px rgba(255,107,53,0.5)" : "none",
                      }}
                    />
                  ))}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3">
                  {["1","2","3","4","5","6","7","8","9"].map((n) => (
                    <motion.button
                      key={n}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handlePINClick(n)}
                      disabled={isLoading}
                      className="py-5 text-xl font-bold rounded-2xl text-white transition-all select-none"
                      style={{
                        background: pressedKey === n ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: pressedKey === n ? "0 0 0 3px rgba(255,107,53,0.25)" : "none",
                      }}
                    >
                      {n}
                    </motion.button>
                  ))}

                  {/* Clear */}
                  <motion.button
                    whileTap={{ scale: 0.90 }}
                    onClick={() => { setPin(""); setError(""); }}
                    className="py-5 text-xs font-bold rounded-2xl text-white/40 transition-all select-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    Clear
                  </motion.button>

                  {/* 0 */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handlePINClick("0")}
                    disabled={isLoading}
                    className="py-5 text-xl font-bold rounded-2xl text-white transition-all select-none"
                    style={{
                      background: pressedKey === "0" ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    0
                  </motion.button>

                  {/* Backspace */}
                  <motion.button
                    whileTap={{ scale: 0.90 }}
                    onClick={() => { setPin((p) => p.slice(0, -1)); setError(""); }}
                    className="py-5 flex items-center justify-center rounded-2xl text-white/40 transition-all select-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    <Delete className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Loading indicator */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 mt-6 text-sm text-white/40 font-medium"
                    >
                      <div className="h-4 w-4 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                      Verifying…
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.2 }}
                onSubmit={handlePasswordSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input
                      type="text" required value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl text-white text-sm font-medium placeholder-white/20 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(255,107,53,0.6)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
                    <input
                      type="password" required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl text-white text-sm font-medium placeholder-white/20 outline-none transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(255,107,53,0.6)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C5A)", boxShadow: "0 4px 20px rgba(255,107,53,0.35)" }}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>Sign In <ArrowRight className="h-4 w-4" /></>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                className="mt-5 flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-semibold text-rose-400"
                style={{ background: "rgba(244,63,94,0.12)", border: "1px solid rgba(244,63,94,0.2)" }}
              >
                <span className="h-5 w-5 rounded-full bg-rose-500/20 flex items-center justify-center text-xs flex-shrink-0">✕</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
