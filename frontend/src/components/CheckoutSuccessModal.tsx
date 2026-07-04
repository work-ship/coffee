import React from "react";
import { CheckCircle, Printer, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderDetails: {
    items: any[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    customerName?: string;
    paymentMethod: string;
    cashAmount?: number;
    changeAmount?: number;
  } | null;
}

export const CheckoutSuccessModal: React.FC<CheckoutSuccessModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  orderDetails,
}) => {
  const handlePrintReceipt = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash": return "CASH";
      case "card": return "CREDIT CARD";
      case "mobile": return "MOBILE WALLET";
      case "qr": return "QR CODE SCAN";
      default: return method.toUpperCase();
    }
  };

  const todayStr = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:inset-auto print:static">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl p-6 flex flex-col items-center bg-[#161622] border border-white/10 shadow-2xl print:shadow-none print:border-none print:p-0 print:bg-white print:w-full print:max-w-none"
          >
            {/* Success Banner (Hidden on print) */}
            <div className="flex flex-col items-center text-center mb-5 print:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-full mb-3"
                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-lg text-white">Order Complete!</h3>
              <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wider text-emerald-400">Transaction Posted Successfully</p>
            </div>

            {/* Thermal Receipt Box */}
            <div className="printable-receipt w-full bg-[#fdfbf7] text-[#1c1917] p-6 rounded-2xl shadow-inner border border-amber-900/10 font-mono text-xs relative overflow-hidden print:border-none print:shadow-none print:p-0 print:w-full">
              
              {/* Receipt Top Zigzag effect */}
              <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden opacity-30 select-none print:hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-neutral-900/10 rotate-45 -translate-y-2 flex-shrink-0" />
                ))}
              </div>

              {/* Receipt Header */}
              <div className="text-center space-y-1 mt-2 mb-4">
                <div className="flex justify-center mb-1">
                  {/* Styled Minimal Coffee Cup SVG */}
                  <svg className="w-8 h-8 text-neutral-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="2" x2="6" y2="4" />
                    <line x1="10" y1="2" x2="10" y2="4" />
                    <line x1="14" y1="2" x2="14" y2="4" />
                  </svg>
                </div>
                <h2 className="font-black text-sm tracking-wider uppercase text-neutral-800">Antigravity Coffee</h2>
                <p className="text-[10px] text-neutral-500">123 Sci-Fi Way, Cosmic Valley</p>
                <p className="text-[10px] text-neutral-500">TEL: +212 522-123456</p>
              </div>

              {/* Transaction Metadata */}
              <div className="border-t border-dashed border-neutral-300 py-3 space-y-1 text-[10px] text-neutral-600">
                <div className="flex justify-between">
                  <span>DATE: {todayStr}</span>
                </div>
                <div className="flex justify-between">
                  <span>ORDER ID: <span className="font-bold text-neutral-800">{orderNumber}</span></span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER: POS terminal #1</span>
                </div>
                {orderDetails?.customerName && (
                  <div className="flex justify-between text-amber-900 font-semibold bg-amber-50 px-1 py-0.5 rounded">
                    <span>CUSTOMER: {orderDetails.customerName.toUpperCase()}</span>
                    <span>POINTS: +{Math.floor(orderDetails.total)}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="border-t border-dashed border-neutral-300 pt-3">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-dashed border-neutral-300 text-neutral-800 font-bold">
                      <th className="pb-1.5 w-8">QTY</th>
                      <th className="pb-1.5">ITEM</th>
                      <th className="pb-1.5 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails?.items.map((item, idx) => (
                      <tr key={idx} className="align-top text-neutral-800">
                        <td className="py-1.5 font-bold">{item.quantity}x</td>
                        <td className="py-1.5">
                          <div className="font-bold">{item.product.name}</div>
                          {item.selectedVariant && (
                            <div className="text-[9px] text-neutral-500">Size: {item.selectedVariant.name}</div>
                          )}
                          {item.selectedExtras.length > 0 && (
                            <div className="text-[9px] text-neutral-500">
                              Add-on: {item.selectedExtras.map((e: any) => e.name).join(", ")}
                            </div>
                          )}
                        </td>
                        <td className="py-1.5 text-right font-bold">{(item.totalPrice).toFixed(2)} DH</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="border-t border-dashed border-neutral-300 mt-3 pt-3 space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>SUBTOTAL</span>
                  <span>{orderDetails?.subtotal.toFixed(2)} DH</span>
                </div>
                {orderDetails && orderDetails.discount > 0 && (
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>DISCOUNT COUPON</span>
                    <span>-{orderDetails.discount.toFixed(2)} DH</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>TAX (8%)</span>
                  <span>{orderDetails?.tax.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-double border-neutral-300">
                  <span>TOTAL DUE</span>
                  <span>{orderDetails?.total.toFixed(2)} DH</span>
                </div>
              </div>

              {/* Payment details */}
              {orderDetails && (
                <div className="border-t border-dashed border-neutral-300 mt-3 pt-3 space-y-1 text-[10px] text-neutral-600">
                  <div className="flex justify-between">
                    <span>PAY METHOD:</span>
                    <span className="font-bold text-neutral-800">{getPaymentMethodLabel(orderDetails.paymentMethod)}</span>
                  </div>
                  {orderDetails.paymentMethod === "cash" && (
                    <>
                      <div className="flex justify-between">
                        <span>CASH TENDERED:</span>
                        <span className="font-bold text-neutral-800">{orderDetails.cashAmount?.toFixed(2)} DH</span>
                      </div>
                      <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-1 py-0.5 rounded text-xs mt-1">
                        <span>CHANGE RETURNED:</span>
                        <span>{orderDetails.changeAmount?.toFixed(2)} DH</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SVG Barcode Graphic */}
              <div className="mt-6 flex flex-col items-center justify-center space-y-1 select-none">
                <svg className="w-48 h-8 opacity-80" viewBox="0 0 100 20" preserveAspectRatio="none">
                  {Array.from({ length: 45 }).map((_, i) => {
                    const width = (i % 3 === 0 ? 2 : i % 5 === 0 ? 3 : 1);
                    const gap = (i % 2 === 0 ? 1 : 2);
                    return (
                      <rect
                        key={i}
                        x={i * 2.2}
                        y={0}
                        width={width * 0.4}
                        height={20}
                        fill="#000"
                      />
                    );
                  })}
                </svg>
                <span className="text-[9px] text-neutral-400 tracking-[0.2em]">{orderNumber}</span>
              </div>

              {/* Receipt Footer */}
              <div className="text-center mt-6 space-y-1 text-neutral-500 text-[9px] leading-tight border-t border-dashed border-neutral-200 pt-3">
                <p className="font-bold text-neutral-600">THANK YOU FOR YOUR VISIT!</p>
                <p>Visit us at www.antigravity.coffee</p>
                <p>Share your experience using #AntigravityCoffee</p>
              </div>

              {/* Receipt Bottom Zigzag effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 flex overflow-hidden opacity-30 select-none print:hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-neutral-900/10 rotate-45 translate-y-2 flex-shrink-0" />
                ))}
              </div>
            </div>

            {/* Action buttons (Hidden on print) */}
            <div className="mt-5 flex gap-3 w-full print:hidden">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 text-white font-bold py-3.5 rounded-2xl hover:bg-white/10 transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 text-white font-bold py-3.5 rounded-2xl hover:opacity-95 transition text-xs cursor-pointer"
                style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C5A)", boxShadow: "0 4px 14px rgba(255,107,53,0.3)" }}
              >
                Next Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
