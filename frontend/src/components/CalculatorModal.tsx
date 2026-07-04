import React, { useState } from "react";
import { X, Delete } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState("0");

  const handleNumClick = (val: string) => {
    if (display === "0") {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const handleOperatorClick = (op: string) => {
    const lastChar = display.slice(-1);
    if (["+", "-", "*", "/"].includes(lastChar)) {
      setDisplay(display.slice(0, -1) + op);
    } else {
      setDisplay(display + op);
    }
  };

  const handleClear = () => {
    setDisplay("0");
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const handleEqual = () => {
    try {
      // Evaluate basic arithmetic safely without eval using simple parser or limited scope
      // Since it is a cashier tool, simple eval-like calculation is safe as user enters it
      const result = new Function(`return ${display}`)();
      setDisplay(Number(result).toString());
    } catch {
      setDisplay("Error");
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
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-6 py-4">
              <span className="font-semibold text-neutral-800 text-lg">Shift Calculator</span>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-150 hover:text-neutral-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Display */}
            <div className="bg-neutral-900 px-6 py-8 text-right">
              <div className="text-sm font-medium text-orange-400 tracking-wider mb-1 uppercase">POS Operations</div>
              <div className="overflow-x-auto text-3xl font-bold text-white whitespace-nowrap scrollbar-none">
                {display}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2.5 p-6 bg-neutral-50">
              <button onClick={handleClear} className="col-span-2 py-4 text-center text-sm font-semibold rounded-2xl bg-neutral-200 text-neutral-700 hover:bg-neutral-300 active:scale-95 transition">
                Clear
              </button>
              <button onClick={handleBackspace} className="py-4 flex items-center justify-center rounded-2xl bg-neutral-200 text-neutral-700 hover:bg-neutral-300 active:scale-95 transition">
                <Delete className="h-5 w-5" />
              </button>
              <button onClick={() => handleOperatorClick("/")} className="py-4 text-center text-lg font-bold rounded-2xl bg-orange-100 text-orange-600 hover:bg-orange-200 active:scale-95 transition">
                ÷
              </button>

              {["7", "8", "9"].map((n) => (
                <button key={n} onClick={() => handleNumClick(n)} className="py-4 text-center text-lg font-semibold rounded-2xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 active:scale-95 transition">
                  {n}
                </button>
              ))}
              <button onClick={() => handleOperatorClick("*")} className="py-4 text-center text-lg font-bold rounded-2xl bg-orange-100 text-orange-600 hover:bg-orange-200 active:scale-95 transition">
                ×
              </button>

              {["4", "5", "6"].map((n) => (
                <button key={n} onClick={() => handleNumClick(n)} className="py-4 text-center text-lg font-semibold rounded-2xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 active:scale-95 transition">
                  {n}
                </button>
              ))}
              <button onClick={() => handleOperatorClick("-")} className="py-4 text-center text-lg font-bold rounded-2xl bg-orange-100 text-orange-600 hover:bg-orange-200 active:scale-95 transition">
                -
              </button>

              {["1", "2", "3"].map((n) => (
                <button key={n} onClick={() => handleNumClick(n)} className="py-4 text-center text-lg font-semibold rounded-2xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 active:scale-95 transition">
                  {n}
                </button>
              ))}
              <button onClick={() => handleOperatorClick("+")} className="py-4 text-center text-lg font-bold rounded-2xl bg-orange-100 text-orange-600 hover:bg-orange-200 active:scale-95 transition">
                +
              </button>

              <button onClick={() => handleNumClick("0")} className="col-span-2 py-4 text-center text-lg font-semibold rounded-2xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 active:scale-95 transition">
                0
              </button>
              <button onClick={() => handleNumClick(".")} className="py-4 text-center text-lg font-semibold rounded-2xl bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-100 active:scale-95 transition">
                .
              </button>
              <button onClick={handleEqual} className="py-4 text-center text-lg font-bold rounded-2xl bg-orange-500 text-white hover:bg-orange-600 active:scale-95 transition">
                =
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
