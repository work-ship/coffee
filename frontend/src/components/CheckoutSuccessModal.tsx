import React from "react";
import { CheckCircle, Printer, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

export const CheckoutSuccessModal: React.FC<CheckoutSuccessModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
}) => {
  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-100 p-6 flex flex-col items-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>

            <h3 className="font-extrabold text-xl text-neutral-850">Order Complete!</h3>
            <p className="text-xs text-neutral-400 font-semibold mt-1 uppercase tracking-wider">Transaction Posted</p>

            <div className="mt-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-100 w-full">
              <span className="block text-[10px] text-neutral-450 uppercase font-bold tracking-widest mb-0.5">Order ID</span>
              <span className="text-sm font-bold text-neutral-800">{orderNumber}</span>
            </div>

            <div className="mt-6 flex gap-3 w-full">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 border border-neutral-200 hover:border-neutral-350 text-neutral-700 font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2 text-sm"
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl shadow-lg active:scale-98 transition text-sm"
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
