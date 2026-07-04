import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { 
  Printer, ArrowLeft, RefreshCw, Calendar, 
  DollarSign, Loader2, Sparkles, Receipt 
} from "lucide-react";
import { useApp } from "../context/AppContext";

export const Reports: React.FC = () => {
  const { showNotification } = useApp();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      showNotification(err.message || "Failed to load order history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefund = async (orderId: number) => {
    if (!window.confirm("Are you sure you want to refund this transaction?")) return;
    try {
      const updated = await api.refundOrder(orderId);
      showNotification("Order refunded successfully.", "success");
      setSelectedOrder(updated);
      await fetchOrders();
    } catch (err: any) {
      showNotification(err.message || "Refund failed", "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50/50">
        <div className="flex items-center justify-center w-full h-full bg-neutral-950">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex" style={{ background: "#0f0f17" }}>
      {/* Left side: Orders Registry List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 border-r border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-2xl text-white tracking-tight">Sales Analytics</h1>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Full order history & receipts</p>
          </div>
          <button onClick={fetchOrders} className="rounded-xl p-2 bg-white/5 hover:bg-white/10 transition text-white/60">
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {orders.map((o) => {
            const isRefunded = o.status === "refunded";
            const dateStr = new Date(o.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
            return (
              <div
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedOrder?.id === o.id
                    ? "border-orange-500/40 shadow-md shadow-orange-500/10"
                    : "border-transparent hover:border-white/10"
                }`}
                style={{
                  background: selectedOrder?.id === o.id
                    ? "rgba(255,107,53,0.12)"
                    : "rgba(255,255,255,0.04)",
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{o.order_number}</span>
                    {isRefunded && (
                      <span className="text-[9px] font-extrabold bg-white text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Voided
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                    <Calendar className="h-3 w-3" />
                    <span>{dateStr}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-sm text-white">{o.total.toFixed(2)} DH</span>
                  <span className="block text-[10px] capitalize font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>{o.payment_method}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Receipt Auditor View */}
      <div className="w-96 overflow-y-auto p-6 flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.02)", borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
        {selectedOrder ? (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            {/* The Receipt Roll Box */}
            <div className="rounded-2xl p-5 text-neutral-800 text-xs font-mono space-y-4 shadow-xl border border-neutral-250 relative overflow-hidden" style={{ backgroundColor: "#FDFBF7" }}>
              
              {/* Paper Top Jagged Edge / Decorator */}
              <div className="absolute top-0 left-0 right-0 h-1.5 flex overflow-hidden opacity-10">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-neutral-900 rotate-45 -translate-y-2 flex-shrink-0" />
                ))}
              </div>

              {/* Shop Header */}
              <div className="text-center pt-2 pb-1 border-b border-dashed border-neutral-300">
                <h3 className="text-sm font-black tracking-widest text-neutral-900">ANTIGRAVITY COFFEE</h3>
                <p className="text-[10px] text-neutral-500 font-medium">100 Premium Beans Ave.</p>
                <p className="text-[9px] text-neutral-400">Tel: +212 5XX-XXXXXX</p>
              </div>

              {/* Metadata */}
              <div className="space-y-1 text-[10px] text-neutral-600">
                <div className="flex justify-between">
                  <span>ORDER:</span>
                  <span className="font-bold text-neutral-900">{selectedOrder.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date(selectedOrder.date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYMENT:</span>
                  <span className="uppercase font-bold text-neutral-900">{selectedOrder.payment_method}</span>
                </div>
                {selectedOrder.customer_name && (
                  <div className="flex justify-between">
                    <span>MEMBER:</span>
                    <span className="font-bold text-orange-600">{selectedOrder.customer_name}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="border-t border-b border-dashed border-neutral-300 py-3 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-neutral-500">
                  <span>ITEM DESCRIPTION</span>
                  <span>TOTAL</span>
                </div>
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="space-y-0.5">
                    <div className="flex justify-between text-neutral-900">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="font-bold">{(item.price * item.quantity).toFixed(2)} DH</span>
                    </div>
                    {item.selected_variant && (
                      <div className="text-[9px] text-neutral-400 pl-4">
                        ↳ Option: {item.selected_variant}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-neutral-600">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>{selectedOrder.subtotal.toFixed(2)} DH</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>DISCOUNT COUPON</span>
                    <span>-{selectedOrder.discount.toFixed(2)} DH</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>TAX (8%)</span>
                  <span>{selectedOrder.tax.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-dashed border-neutral-300">
                  <span>TOTAL DUE</span>
                  <span>{selectedOrder.total.toFixed(2)} DH</span>
                </div>
              </div>

              {/* Footer Messages / Barcode */}
              <div className="text-center pt-3 border-t border-dashed border-neutral-300 space-y-3">
                <p className="text-[10px] text-neutral-500 font-medium tracking-wide">THANK YOU FOR YOUR VISIT!</p>
                
                {/* Simulated Barcode */}
                <div className="flex justify-center items-center gap-0.5 h-7 opacity-75">
                  {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8].map((w, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-900 h-full"
                      style={{ width: `${(w % 3) + 1}px` }}
                    />
                  ))}
                </div>
                <p className="text-[8px] text-neutral-400 tracking-widest">{selectedOrder.order_number}</p>
              </div>

            </div>

            {/* Quick Actions Panel */}
            <div className="space-y-2">
              <button
                onClick={handlePrint}
                className="w-full text-white font-bold py-3 px-4 rounded-xl transition text-xs flex items-center justify-center gap-2"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <Printer className="h-4 w-4" />
                Print Physical Receipt
              </button>

              {selectedOrder.status !== "refunded" && (
                <button
                  onClick={() => handleRefund(selectedOrder.id)}
                  className="w-full text-white font-bold py-3.5 rounded-xl transition text-xs flex items-center justify-center gap-2"
                  style={{ background: "rgba(244,63,94,0.15)", border: "1px solid rgba(244,63,94,0.25)", color: "#f87171" }}
                >
                  Void Transaction & Refund
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-450">
            <Receipt className="h-10 w-10 text-neutral-500 opacity-60 mb-2" />
            <p className="text-sm font-semibold text-white">No invoice selected</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">Choose a receipt from the registry to inspect payment details.</p>
          </div>
        )}
      </div>
    </div>
  );
};
