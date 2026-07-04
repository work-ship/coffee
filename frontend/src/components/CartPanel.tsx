import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import {
  Plus, Minus, Trash2, X, Tag, Search,
  UserPlus, Phone, Award, ChevronDown, ShoppingBag,
} from "lucide-react";
import { PaymentModal } from "./PaymentModal";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../utils/api";

interface CartPanelProps {
  onSuccess: (orderNum: string, orderDetails: any) => void;
}

/** Shortcut badge pill */
const Key: React.FC<{ k: string }> = ({ k }) => (
  <kbd className="inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-wider font-mono shadow-sm ml-1.5"
    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.3)" }}>
    {k}
  </kbd>
);

export const CartPanel: React.FC<CartPanelProps> = ({ onSuccess }) => {
  const {
    cart, removeFromCart, updateCartQuantity,
    selectedCustomer, setSelectedCustomer,
    customers, refreshData, showNotification,
  } = useApp();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Inline CRM state
  const [crmQuery, setCrmQuery] = useState("");
  const [crmOpen, setCrmOpen] = useState(false);
  const [enrollMode, setEnrollMode] = useState(false);
  const [enrollName, setEnrollName] = useState("");
  const [enrollPhone, setEnrollPhone] = useState("");
  const crmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => { if (cart.length > 0) setIsPaymentModalOpen(true); };
    window.addEventListener("pos:open-payment", handler);
    return () => window.removeEventListener("pos:open-payment", handler);
  }, [cart]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (crmRef.current && !crmRef.current.contains(e.target as Node)) {
        setCrmOpen(false); setEnrollMode(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = crmQuery.toLowerCase();
    return q.length >= 1 && (c.name.toLowerCase().includes(q) || c.phone?.includes(q));
  });

  const handleSelectCustomer = (c: typeof customers[0]) => {
    setSelectedCustomer(c); setCrmOpen(false); setCrmQuery(""); setEnrollMode(false);
    showNotification(`Linked loyalty member: ${c.name}`, "success");
  };

  const handleQuickEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName) return;
    try {
      const newCust = await api.createCustomer({ name: enrollName, phone: enrollPhone || null, email: null });
      await refreshData();
      setSelectedCustomer(newCust); setEnrollMode(false); setCrmOpen(false);
      setEnrollName(""); setEnrollPhone("");
      showNotification(`Enrolled & linked: ${newCust.name}`, "success");
    } catch (err: any) {
      showNotification(err.message || "Enrollment failed", "error");
    }
  };

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase();
    if (code === "COFFEE10") { setDiscountPercent(10); showNotification("10% discount applied!", "success"); }
    else if (code === "WELCOME") { setDiscountPercent(15); showNotification("15% Welcome discount applied!", "success"); }
    else { showNotification("Invalid coupon code", "error"); setDiscountPercent(0); }
  };

  const handleRemoveCoupon = () => {
    setCouponCode(""); setDiscountPercent(0);
    showNotification("Coupon removed", "info");
  };

  const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + tax;
  const orderDateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="w-96 flex flex-col h-[calc(100vh-4rem)]" style={{ background: "#111118", borderLeft: "1px solid rgba(255,255,255,0.07)" }}>

      {/* ── Header ── */}
      <div className="p-4 space-y-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Active Register</span>
            <span className="text-sm font-bold text-white">New Order</span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Date</span>
            <span className="text-xs font-bold text-white">{orderDateStr}</span>
          </div>
        </div>

        {/* ── Inline CRM ── */}
        <div ref={crmRef} className="relative">
          {selectedCustomer ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border border-orange-100 dark:border-orange-800/40"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold text-xs">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="block text-xs font-bold text-orange-900 dark:text-orange-200 leading-none">{selectedCustomer.name}</span>
                  <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold mt-0.5 flex items-center gap-1">
                    <Award className="h-3 w-3" /> {selectedCustomer.loyalty_points} pts
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="rounded-full p-1 text-orange-400 hover:text-orange-600 hover:bg-orange-100 transition">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => { setCrmOpen(!crmOpen); setEnrollMode(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition"
              >
                <Search className="h-4 w-4" />
                <span>Search or enroll loyalty member</span>
                <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform duration-200 ${crmOpen ? "rotate-180" : ""}`} />
              </motion.button>

              <AnimatePresence>
                {crmOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
                    style={{ originY: 0 }}
                    className="absolute z-40 left-0 right-0 top-full mt-2 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-150 dark:border-neutral-700 shadow-xl overflow-hidden"
                  >
                    <div className="flex border-b border-neutral-100 dark:border-neutral-700">
                      {["Search", "Quick Enroll"].map((tab, i) => (
                        <button
                          key={tab}
                          onClick={() => setEnrollMode(i === 1)}
                          className={`flex-1 py-2.5 text-xs font-bold transition relative ${
                            (i === 0) === !enrollMode ? "text-orange-600" : "text-neutral-500 dark:text-neutral-400"
                          }`}
                        >
                          {tab}
                          {(i === 0) === !enrollMode && (
                            <motion.span layoutId="crm-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full" />
                          )}
                        </button>
                      ))}
                    </div>

                    {!enrollMode ? (
                      <div>
                        <div className="p-3 border-b border-neutral-100 dark:border-neutral-700">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                            <input
                              autoFocus type="text" placeholder="Name or phone…"
                              value={crmQuery} onChange={(e) => setCrmQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-white placeholder-neutral-400 outline-none focus:border-orange-400 transition"
                            />
                          </div>
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => handleSelectCustomer(c)}
                                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition text-left"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-bold text-[10px]">
                                    {c.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-neutral-800 dark:text-white">{c.name}</p>
                                    {c.phone && <p className="text-[10px] text-neutral-400 flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{c.phone}</p>}
                                  </div>
                                </div>
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                  <Award className="h-3 w-3" />{c.loyalty_points}
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="text-xs text-neutral-400 text-center py-5 font-semibold">
                              {crmQuery.length >= 1 ? "No matches found." : "Type to search members…"}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleQuickEnroll} className="p-4 space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Full Name *</label>
                          <input
                            autoFocus required type="text"
                            value={enrollName} onChange={(e) => setEnrollName(e.target.value)}
                            placeholder="e.g. Jane Smith"
                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-white text-xs p-2.5 outline-none focus:border-orange-400 transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Phone (optional)</label>
                          <input
                            type="tel"
                            value={enrollPhone} onChange={(e) => setEnrollPhone(e.target.value)}
                            placeholder="e.g. 555-123-4567"
                            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-white text-xs p-2.5 outline-none focus:border-orange-400 transition"
                          />
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Enroll & Link to Order
                        </motion.button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* ── Cart Items ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {cart.length > 0 ? (
          <AnimatePresence initial={false}>
            {cart.map((item) => (
              <motion.div
                key={item.cartId}
                layout
                initial={{ opacity: 0, x: 20, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95, height: 0, marginBottom: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="flex items-start justify-between gap-3 p-3.5 rounded-2xl border border-neutral-150 dark:border-neutral-800 hover:border-neutral-250 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900 transition"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-neutral-800 dark:text-white line-clamp-1">{item.product.name}</h4>
                    <span className="font-extrabold text-sm text-neutral-800 dark:text-white flex-shrink-0">{item.totalPrice.toFixed(2)} DH</span>
                  </div>
                  {(item.selectedVariant || item.selectedExtras.length > 0) && (
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold space-y-0.5">
                      {item.selectedVariant && <p>Size: {item.selectedVariant.name}</p>}
                      {item.selectedExtras.length > 0 && <p>Add-ons: {item.selectedExtras.map((e) => e.name).join(", ")}</p>}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateCartQuantity(item.cartId, -1)} className="rounded-lg p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition">
                        <Minus className="h-3 w-3" />
                      </motion.button>
                      <span className="w-7 text-center text-xs font-bold text-neutral-800 dark:text-white">{item.quantity}</span>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => updateCartQuantity(item.cartId, 1)} className="rounded-lg p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition">
                        <Plus className="h-3 w-3" />
                      </motion.button>
                    </div>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => removeFromCart(item.cartId)} className="rounded-lg p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-neutral-400 dark:text-neutral-500 hover:text-rose-500 transition">
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center p-6"
          >
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center mb-4 shadow-inner">
              <ShoppingBag className="h-9 w-9 text-orange-300" />
            </div>
            <p className="text-sm font-bold text-neutral-600 dark:text-neutral-400">Order is empty</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-[200px]">Tap product cards to build the order.</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-600 mt-3 font-semibold">
              Press <Key k="ESC" /> to clear cart at any time.
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Totals & Checkout ── */}
      <div className="p-4 border-t border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/60 space-y-4">
        {/* Coupon */}
        {discountPercent > 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold"
          >
            <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-emerald-600" />Promo applied ({discountPercent}%)</span>
            <button onClick={handleRemoveCoupon} className="text-emerald-600 hover:text-emerald-800 transition font-bold">Remove</button>
          </motion.div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text" placeholder="Coupon code (try COFFEE10)…"
              value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              className="flex-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs text-neutral-800 dark:text-white placeholder-neutral-400 outline-none focus:border-orange-400 transition"
            />
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleApplyCoupon} className="bg-orange-100 dark:bg-orange-950/50 hover:bg-orange-200 dark:hover:bg-orange-900/60 text-orange-600 dark:text-orange-400 font-bold text-xs px-4 rounded-xl transition">
              Apply
            </motion.button>
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <div className="flex justify-between"><span>Subtotal</span><span className="text-neutral-800 dark:text-white">{subtotal.toFixed(2)} DH</span></div>
          {discountAmount > 0 && <div className="flex justify-between text-rose-500"><span>Promo Discount</span><span>-{discountAmount.toFixed(2)} DH</span></div>}
          <div className="flex justify-between"><span>Taxes (8%)</span><span className="text-neutral-800 dark:text-white">{tax.toFixed(2)} DH</span></div>
          <div className="flex justify-between text-neutral-800 dark:text-white text-sm font-extrabold pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <span>Amount Due</span><span>{total.toFixed(2)} DH</span>
          </div>
        </div>

        {/* Checkout button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsPaymentModalOpen(true)}
          disabled={cart.length === 0}
          className={`w-full font-bold py-3.5 rounded-2xl transition text-center flex items-center justify-center gap-2 ${
            cart.length === 0
              ? "bg-neutral-200 dark:bg-neutral-700 shadow-none cursor-not-allowed text-neutral-400 dark:text-neutral-500"
              : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white checkout-pulse"
          }`}
        >
          <span>Collect Payment ({total.toFixed(2)} DH)</span>
          {cart.length > 0 && <Key k="P" />}
        </motion.button>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        subtotal={subtotal}
        discount={discountAmount}
        tax={tax}
        total={total}
        onSuccess={onSuccess}
      />
    </div>
  );
};
