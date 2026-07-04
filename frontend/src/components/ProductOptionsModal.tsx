import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product, ProductVariant, ProductExtra } from "../context/AppContext";

interface ProductOptionsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (variant: ProductVariant | null, extras: ProductExtra[]) => void;
}

export const ProductOptionsModal: React.FC<ProductOptionsModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([]);

  useEffect(() => {
    if (product) {
      // Default to first variant if exists
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setSelectedExtras([]);
    }
  }, [product, isOpen]);

  if (!product) return null;

  const toggleExtra = (extra: ProductExtra) => {
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const basePrice = product.discount_price !== null && product.discount_price !== undefined
    ? product.discount_price
    : product.price;

  const variantPrice = selectedVariant && selectedVariant.price_override !== null && selectedVariant.price_override !== undefined
    ? selectedVariant.price_override
    : 0;

  const extrasPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const currentTotalPrice = basePrice + variantPrice + extrasPrice;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-100 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-150 bg-neutral-50 px-6 py-4">
              <div>
                <span className="block font-semibold text-neutral-800 text-lg">{product.name}</span>
                <span className="text-xs text-neutral-400">Customize this item</span>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-150 hover:text-neutral-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Product Info */}
              <div className="flex gap-4">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-20 w-20 rounded-2xl object-cover shadow-sm"
                  />
                )}
                <div>
                  <p className="text-sm text-neutral-500">{product.description || "Freshly made to order."}</p>
                  <p className="mt-1 font-bold text-orange-600 text-lg">{basePrice.toFixed(2)} DH</p>
                </div>
              </div>

              {/* Variants Section */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <h4 className="font-semibold text-neutral-800 text-sm mb-3 tracking-wide uppercase">Select Size / Style</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition text-left ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/50 text-orange-950 font-medium"
                              : "border-neutral-200 bg-white hover:border-neutral-350 text-neutral-700"
                          }`}
                        >
                          <span className="text-sm">{v.name}</span>
                          <span className="text-xs font-semibold opacity-75">
                            {v.price_override !== null && v.price_override !== undefined && v.price_override > 0
                              ? `+${v.price_override.toFixed(2)} DH`
                              : "Standard"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Extras Section */}
              {product.extras && product.extras.length > 0 && (
                <div>
                  <h4 className="font-semibold text-neutral-800 text-sm mb-3 tracking-wide uppercase">Add Extras / Customizations</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {product.extras.map((e) => {
                      const isSelected = selectedExtras.some((item) => item.id === e.id);
                      return (
                        <button
                          key={e.id}
                          onClick={() => toggleExtra(e)}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition text-left ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/50 text-orange-950 font-medium"
                              : "border-neutral-200 bg-white hover:border-neutral-350 text-neutral-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded flex items-center justify-center border transition ${
                              isSelected ? "bg-orange-500 border-orange-600 text-white" : "border-neutral-300 bg-white"
                            }`}>
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            <span className="text-sm">{e.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-neutral-500">
                            +{e.price.toFixed(2)} DH
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer / Add Button */}
            <div className="border-t border-neutral-150 bg-neutral-50 p-6 flex items-center justify-between">
              <div>
                <span className="block text-xs text-neutral-400 font-medium">Subtotal</span>
                <span className="text-2xl font-bold text-neutral-800">{currentTotalPrice.toFixed(2)} DH</span>
              </div>
              <button
                onClick={() => {
                  onConfirm(selectedVariant, selectedExtras);
                  onClose();
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-2xl shadow-lg active:scale-98 transition flex items-center gap-2"
              >
                Add item to Cart
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
