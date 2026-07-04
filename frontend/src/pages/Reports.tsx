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
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-neutral-50/30">
      {/* Left side: Orders Registry List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 border-r border-neutral-150">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-2xl text-neutral-800 tracking-tight">Shift Invoices</h1>
            <p className="text-xs text-neutral-450 font-semibold font-medium">Verify sales registry and process voids</p>
          </div>
          <button onClick={fetchOrders} className="rounded-xl p-2 bg-neutral-100 hover:bg-neutral-200 transition text-neutral-600">
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
                className={`p-4 rounded-3xl border cursor-pointer transition flex items-center justify-between ${
                  selectedOrder?.id === o.id
                    ? "border-orange-500 bg-orange-50/20"
                    : "border-neutral-200 bg-white hover:border-neutral-350 hover:bg-neutral-50/20"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-800">{o.order_number}</span>
                    {isRefunded && (
                      <span className="text-[9px] font-extrabold bg-neutral-800 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Voided
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-450">
                    <Calendar className="h-3 w-3" />
                    <span>{dateStr}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-black text-sm text-neutral-800">${o.total.toFixed(2)}</span>
                  <span className="block text-[10px] text-neutral-400 capitalize font-bold">{o.payment_method}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Receipt Auditor View */}
      <div className="w-96 bg-white overflow-y-auto p-6 flex flex-col justify-between border-l border-neutral-150">
        {selectedOrder ? (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex justify-between items-start border-b border-dashed pb-4">
                <div>
                  <h3 className="font-bold text-sm text-neutral-800">Invoice Audit</h3>
                  <span className="text-[10px] font-semibold text-neutral-450 uppercase">{selectedOrder.order_number}</span>
                </div>
                <button onClick={handlePrint} className="rounded-xl p-2 bg-neutral-50 hover:bg-neutral-100 transition text-neutral-500">
                  <Printer className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="text-xs font-semibold text-neutral-700 flex justify-between">
                    <div>
                      <span className="block">{item.quantity}x {item.product_name}</span>
                      {item.selected_variant && <span className="block text-[9px] text-neutral-400">Size: {item.selected_variant}</span>}
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 border-t pt-4 text-xs font-semibold text-neutral-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-800">${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Discount Coupon</span>
                    <span>-${selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax</span>
                  <span className="text-neutral-800">${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-850 text-sm font-extrabold pt-2 border-t border-dashed">
                  <span>Total Amount Paid</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {selectedOrder.status !== "refunded" && (
              <button
                onClick={() => handleRefund(selectedOrder.id)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3.5 rounded-2xl shadow-md transition text-xs flex items-center justify-center gap-2 mt-6"
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
