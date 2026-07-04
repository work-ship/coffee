import React, { useState, useEffect } from "react";
import { X, CheckCircle, CreditCard, Banknote, QrCode, Smartphone, Sparkles, Award } from "lucide-react";
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
  onSuccess: (orderNumber: string) => void;
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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile" | "qr" | "split">("cash");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [splitCash, setSplitCash] = useState<string>("");
  const [splitCard, setSplitCard] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod("cash");
      setCashAmount("");
      setSplitCash("");
      setSplitCard("");
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
      // Map cart items to API parameters
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
        payment_details: paymentMethod === "split" ? { cash: parseFloat(splitCash), card: parseFloat(splitCard) } : null,
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
      clearCart();
      onSuccess(result.order_number);
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to process payment", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-100 flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Left side: Bill Breakdowns */}
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-neutral-150 flex flex-col justify-between bg-neutral-50/50">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-neutral-800 text-lg">Bill Summary</h3>
                  <p className="text-xs text-neutral-400">Total charge verification</p>
                </div>

                <div className="space-y-3 border-b border-neutral-150 pb-4">
                  {cart.map((item) => (
                    <div key={item.cartId} className="flex justify-between text-xs font-semibold text-neutral-600">
                      <span className="line-clamp-1">{item.quantity}x {item.product.name}</span>
                      <span>${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm font-semibold">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-rose-500">
                      <span>Discount Coupon</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-800 text-lg font-bold pt-2 border-t border-neutral-200">
                    <span>Grand Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {selectedCustomer && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100">
                    <Award className="h-5 w-5 text-amber-500" />
                    <div>
                      <span className="block text-xs font-bold text-amber-800 leading-none">Loyalty Account Linked</span>
                      <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                        {selectedCustomer.name} (Earns +{Math.floor(total)} pts)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:flex gap-1.5 items-center text-xs text-neutral-400 mt-6 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                <span>Encrypted terminal sync active</span>
              </div>
            </div>

            {/* Right side: Payment Gateway Selection */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-neutral-800 text-base">Payment Method</span>
                  <button onClick={onClose} className="rounded-full p-1 hover:bg-neutral-100 transition">
                    <X className="h-4.5 w-4.5 text-neutral-400" />
                  </button>
                </div>

                {/* Gateway Choices */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-sm font-semibold transition ${
                      paymentMethod === "cash"
                        ? "border-orange-500 bg-orange-50/20 text-orange-700"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <Banknote className="h-4.5 w-4.5" />
                    <span>Cash Register</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-sm font-semibold transition ${
                      paymentMethod === "card"
                        ? "border-orange-500 bg-orange-50/20 text-orange-700"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <CreditCard className="h-4.5 w-4.5" />
                    <span>Credit Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("mobile")}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-sm font-semibold transition ${
                      paymentMethod === "mobile"
                        ? "border-orange-500 bg-orange-50/20 text-orange-700"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <Smartphone className="h-4.5 w-4.5" />
                    <span>Mobile Wallet</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("qr")}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-sm font-semibold transition ${
                      paymentMethod === "qr"
                        ? "border-orange-500 bg-orange-50/20 text-orange-700"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <QrCode className="h-4.5 w-4.5" />
                    <span>QR Payment</span>
                  </button>
                </div>

                {/* Sub-panels based on selection */}
                {paymentMethod === "cash" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1.5">Cash Tendered</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">$</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3 pl-7 text-sm text-neutral-850 outline-none focus:border-orange-500 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Quick Cash Buttons */}
                    <div className="flex gap-2">
                      <button onClick={() => handleQuickCash(total)} className="flex-1 py-2 text-xs font-bold bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-55 transition">
                        Exact
                      </button>
                      {[5, 10, 20, 50].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => handleQuickCash(amt)}
                          className="flex-1 py-2 text-xs font-bold bg-white border border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-55 transition"
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>

                    {/* Change calculator feedback */}
                    <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 flex items-center justify-between text-sm font-semibold">
                      <span className="text-neutral-500">Change Due</span>
                      <span className="text-lg font-bold text-neutral-800">${changeToReturn.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {(paymentMethod === "card" || paymentMethod === "mobile" || paymentMethod === "qr") && (
                  <div className="flex flex-col items-center justify-center p-6 bg-neutral-50 border border-neutral-150 rounded-3xl space-y-3">
                    {paymentMethod === "qr" ? (
                      <>
                        <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-neutral-100">
                          <QrCode className="h-28 w-28 text-neutral-800" />
                        </div>
                        <p className="text-xs text-neutral-450 font-semibold text-center">Scan with customer device to initialize checkout</p>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 animate-pulse">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <p className="text-xs text-neutral-450 font-semibold text-center">Awaiting merchant terminal payment confirmation...</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleCheckoutSubmit}
                disabled={isProcessing || (paymentMethod === "cash" && cashReceivedNum < total)}
                className={`w-full mt-6 text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 ${
                  isProcessing || (paymentMethod === "cash" && cashReceivedNum < total)
                    ? "bg-neutral-300 shadow-none cursor-not-allowed text-neutral-500"
                    : "bg-orange-500 hover:bg-orange-600 active:scale-98"
                }`}
              >
                {isProcessing ? "Processing..." : "Authorize and Post Transaction"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
