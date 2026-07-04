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
      <div className="w-96 overflow-y-auto p-6 flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.04)", borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
        {selectedOrder ? (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex justify-between items-start border-b border-dashed pb-4">
                <div>
                  <h3 className="font-bold text-sm text-white">Invoice Audit</h3>
                  <span className="text-[10px] font-semibold uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>{selectedOrder.order_number}</span>
                </div>
                <button onClick={handlePrint} className="rounded-xl p-2 transition" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                  <Printer className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="text-xs font-semibold flex justify-between" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <div>
                      <span className="block">{item.quantity}x {item.product_name}</span>
                      {item.selected_variant && <span className="block text-[9px] text-neutral-400">Size: {item.selected_variant}</span>}
                    </div>
                    <span>{(item.price * item.quantity).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 border-t pt-4 text-xs font-semibold" style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">{selectedOrder.subtotal.toFixed(2)} DH</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Discount Coupon</span>
                    <span>-{selectedOrder.discount.toFixed(2)} DH</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax</span>
                  <span className="text-white">{selectedOrder.tax.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-dashed text-white" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                  <span>Total Amount Paid</span>
                  <span>{selectedOrder.total.toFixed(2)} DH</span>
                </div>
              </div>
            </div>

            {selectedOrder.status !== "refunded" && (
              <button
                onClick={() => handleRefund(selectedOrder.id)}
                className="w-full text-white font-bold py-3.5 rounded-2xl transition text-xs flex items-center justify-center gap-2 mt-6"
                style={{ background: "rgba(244,63,94,0.2)", border: "1px solid rgba(244,63,94,0.3)", color: "#f87171" }}
              >
                Void Transaction & Refund
              </button>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
            <Receipt className="h-10 w-10 text-neutral-350" />
            <p className="text-sm font-semibold mt-2.5">No invoice selected</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-[200px]">Choose a receipt from the registry to inspect payment details.</p>
          </div>
        )}
      </div>
    </div>
  );
};
