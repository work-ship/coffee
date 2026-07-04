import React, { useState, useEffect } from "react";
import { X, CreditCard, Banknote, QrCode, Smartphone, Sparkles, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { api } from "../utils/api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  onSuccess: (orderNumber: string, orderDetails: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  discount,
  tax,
  total,
  onSuccess,
}) => {
  const { cart, selectedCustomer, clearCart, refreshData, showNotification } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile" | "qr">("cash");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod("cash");
      setCashAmount("");
    }
  }, [isOpen]);

  const cashReceivedNum = parseFloat(cashAmount) || 0;
  const changeToReturn = cashReceivedNum >= total ? cashReceivedNum - total : 0;

  const handleQuickCash = (amt: number) => {
    setCashAmount(amt.toString());
  };

  const handleCheckoutSubmit = async () => {
    setIsProcessing(true);
    try {
      const itemsPayload = cart.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.unitPrice,
        discount: 0.0,
        selected_variant: item.selectedVariant?.name || null,
        selected_extras: item.selectedExtras.map((e) => e.name),
      }));

      const payload = {
        status: "paid",
        payment_method: paymentMethod,
        payment_details: null,
        subtotal,
        discount,
        tax,
        total,
        customer_id: selectedCustomer?.id || null,
        items: itemsPayload,
      };

      const result = await api.createOrder(payload);
      showNotification("Transaction completed successfully!", "success");
      await refreshData();
      
      const orderDetails = {
        items: [...cart],
        subtotal,
        discount,
        tax,
        total,
        customerName: selectedCustomer?.name,
        paymentMethod,
        cashAmount: paymentMethod === "cash" ? cashReceivedNum : total,
        changeAmount: paymentMethod === "cash" ? changeToReturn : 0,
      };

      clearCart();
      onSuccess(result.order_number, orderDetails);
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to process payment", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Gateway themes for color-coding
  const getGatewayStyle = (id: string, isSel: boolean) => {
    if (!isSel) {
      return {
        background: "rgba(255,255,255,0.02)",
        color: "rgba(255,255,255,0.5)",
        borderColor: "rgba(255,255,255,0.06)",
      };
    }
    switch (id) {
      case "cash":
        return {
          background: "rgba(16,185,129,0.12)",
          color: "#10b981",
          borderColor: "rgba(16,185,129,0.4)",
          boxShadow: "0 0 15px rgba(16,185,129,0.15)",
        };
      case "card":
        return {
          background: "rgba(59,130,246,0.12)",
          color: "#3b82f6",
          borderColor: "rgba(59,130,246,0.4)",
          boxShadow: "0 0 15px rgba(59,130,246,0.15)",
        };
      case "mobile":
        return {
          background: "rgba(139,92,246,0.12)",
          color: "#8b5cf6",
          borderColor: "rgba(139,92,246,0.4)",
          boxShadow: "0 0 15px rgba(139,92,246,0.15)",
        };
      case "qr":
        return {
          background: "rgba(245,158,11,0.12)",
          color: "#f59e0b",
          borderColor: "rgba(245,158,11,0.4)",
          boxShadow: "0 0 15px rgba(245,158,11,0.15)",
        };
      default:
        return {};
    }
  };

  const getSubmitButtonConfig = () => {
    if (isProcessing) {
      return { text: "Processing Transaction...", enabled: false };
    }
    if (paymentMethod === "cash") {
      if (cashReceivedNum < total) {
        return { text: `Awaiting Cash (Need ${(total - cashReceivedNum).toFixed(2)} DH)`, enabled: false };
      }
      return { text: `Confirm Cash & Post (Change: ${changeToReturn.toFixed(2)} DH)`, enabled: true };
    }
    if (paymentMethod === "card") {
      return { text: "Confirm Card Payment & Post", enabled: true };
    }
    if (paymentMethod === "mobile") {
      return { text: "Confirm Mobile Wallet & Post", enabled: true };
    }
    if (paymentMethod === "qr") {
      return { text: "Confirm QR Scan & Post", enabled: true };
    }
    return { text: "Complete & Post Transaction", enabled: true };
  };

  const btnConfig = getSubmitButtonConfig();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="w-full max-w-3xl overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row max-h-[92vh]"
            style={{ background: "#161622", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {/* Left side: Bill Summary */}
            <div className="flex-1 p-6 flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.02)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="space-y-5">
                <div>
                  <h3 className="font-bold text-white text-base">Bill Summary</h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Total charge verification</p>
                </div>

                {/* Items List scrollable */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
                  {cart.map((item) => (
                    <div key={item.cartId} className="flex justify-between text-xs font-semibold text-white/70">
                      <div className="flex flex-col">
                        <span className="line-clamp-1">{item.quantity}x {item.product.name}</span>
                        {(item.selectedVariant || item.selectedExtras.length > 0) && (
                          <span className="text-[9px] text-white/40">
                            {item.selectedVariant?.name} {item.selectedExtras.map(e => `+${e.name}`).join(" ")}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-white">{item.totalPrice.toFixed(2)} DH</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs font-semibold text-white/50">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white/80">{subtotal.toFixed(2)} DH</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Discount Coupon</span>
                      <span>-{discount.toFixed(2)} DH</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span className="text-white/80">{tax.toFixed(2)} DH</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold pt-2 text-white" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <span>Grand Total</span>
                    <span className="text-base text-orange-400 font-black">{total.toFixed(2)} DH</span>
                  </div>
                </div>

                {selectedCustomer && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.15)" }}>
                    <Award className="h-4.5 w-4.5 text-amber-400" />
                    <div>
                      <span className="block text-xs font-bold text-amber-300 leading-none">Loyalty Member Linked</span>
                      <span className="text-[10px] font-semibold mt-1 block" style={{ color: "rgba(251,191,36,0.6)" }}>
                        {selectedCustomer.name} (Earns +{Math.floor(total)} pts)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:flex gap-1.5 items-center text-[10px] text-white/30 mt-6 font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                <span>Secure Terminal Sync</span>
              </div>
            </div>

            {/* Right side: Interactive Payment Gateways */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-bold text-white text-base">Select Gateway</span>
                  <button onClick={onClose} className="rounded-xl p-1.5 transition text-white/40 hover:bg-white/5 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Gateway Choices */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {[
                    { id: "cash", label: "Cash Register", icon: <Banknote className="h-5 w-5" /> },
                    { id: "card", label: "Credit Card", icon: <CreditCard className="h-5 w-5" /> },
                    { id: "mobile", label: "Mobile Wallet", icon: <Smartphone className="h-5 w-5" /> },
                    { id: "qr", label: "QR Payment", icon: <QrCode className="h-5 w-5" /> }
                  ].map((gateway) => {
                    const isSel = paymentMethod === gateway.id;
                    return (
                      <button
                        key={gateway.id}
                        onClick={() => setPaymentMethod(gateway.id as any)}
                        className="flex items-center gap-3 p-3.5 rounded-2xl text-xs font-bold transition-all text-left border cursor-pointer hover:scale-[1.02]"
                        style={getGatewayStyle(gateway.id, isSel)}
                      >
                        {gateway.icon}
                        <span>{gateway.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Gateway Actions */}
                <AnimatePresence mode="wait">
                  {paymentMethod === "cash" && (
                    <motion.div
                      key="cash-panel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-white/40">Cash Tendered</label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Enter amount..."
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value)}
                            className="w-full rounded-2xl py-3.5 px-4 text-sm font-bold text-white outline-none transition-all focus:border-emerald-500/50"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-white/35">DH</span>
                        </div>
                      </div>

                      {/* Quick Cash Banknotes */}
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-wider mb-1.5 text-white/30">Moroccan Banknotes</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleQuickCash(total)}
                            className="flex-1 py-3 text-[10px] font-bold text-white rounded-xl transition border border-white/10 bg-white/5 hover:bg-white/10"
                          >
                            Exact
                          </button>
                          {[
                            { amt: 20, bg: "linear-gradient(135deg, #7C3AED, #4F46E5)", label: "20 DH" },
                            { amt: 50, bg: "linear-gradient(135deg, #059669, #10B981)", label: "50 DH" },
                            { amt: 100, bg: "linear-gradient(135deg, #CA8A04, #EAB308)", label: "100 DH" },
                            { amt: 200, bg: "linear-gradient(135deg, #2563EB, #3B82F6)", label: "200 DH" }
                          ].map((bill) => (
                            <button
                              key={bill.amt}
                              onClick={() => handleQuickCash(bill.amt)}
                              className="flex-1 py-3 text-[10px] font-extrabold text-white rounded-xl transition shadow-md hover:scale-105"
                              style={{ background: bill.bg }}
                            >
                              {bill.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Change Due Feed */}
                      <div className="p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all duration-300" 
                           style={{ 
                             background: cashReceivedNum >= total && total > 0 ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)", 
                             border: cashReceivedNum >= total && total > 0 ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.06)" 
                           }}>
                        <span className="text-white/40">Change Due</span>
                        <span className={`text-base font-black ${cashReceivedNum >= total ? "text-emerald-400" : "text-white/30"}`}>
                          {changeToReturn.toFixed(2)} DH
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === "card" && (
                    <motion.div
                      key="card-panel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl space-y-3"
                      style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 animate-pulse">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-blue-300">Tap or Insert Card</p>
                      <p className="text-[10px] font-semibold text-center text-blue-400/60">Awaiting secure connection to card reader...</p>
                    </motion.div>
                  )}

                  {paymentMethod === "mobile" && (
                    <motion.div
                      key="mobile-panel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl space-y-3"
                      style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)" }}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 animate-pulse">
                        <Smartphone className="h-6 w-6" />
                      </div>
                      <p className="text-xs font-bold text-purple-300">NFC Phone Payment</p>
                      <p className="text-[10px] font-semibold text-center text-purple-400/60">Hold client device near terminal sensor...</p>
                    </motion.div>
                  )}

                  {paymentMethod === "qr" && (
                    <motion.div
                      key="qr-panel"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl space-y-3"
                      style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}
                    >
                      <div className="p-2 bg-white rounded-2xl shadow-md">
                        <QrCode className="h-24 w-24 text-neutral-900" />
                      </div>
                      <p className="text-xs font-bold text-amber-300">Scan QR Code</p>
                      <p className="text-[10px] font-semibold text-center text-amber-400/60">Scan using dynamic payment app with customer's phone</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={handleCheckoutSubmit}
                disabled={!btnConfig.enabled}
                className="w-full mt-6 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm select-none cursor-pointer"
                style={
                  !btnConfig.enabled
                    ? { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)", cursor: "not-allowed" }
                    : { background: "linear-gradient(135deg, #FF6B35, #FF8C5A)", boxShadow: "0 4px 16px rgba(255,107,53,0.35)" }
                }
              >
                {btnConfig.text}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
