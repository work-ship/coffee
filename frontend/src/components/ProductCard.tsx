import React from "react";
import { Star, Plus } from "lucide-react";
import { Product } from "../context/AppContext";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {


  const hasDiscount = product.discount_price !== null && product.discount_price !== undefined;
  const discountPct = hasDiscount
    ? Math.round(((product.price - (product.discount_price ?? 0)) / product.price) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(product)}
      className="group relative overflow-hidden rounded-3xl bg-white border transition-all cursor-pointer select-none border-neutral-150 hover:border-orange-200 hover:shadow-[0_8px_30px_rgba(255,107,53,0.15)]"
    >
      {/* Shine overlay on hover */}
      <div className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
      />

      {/* Top badges */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5">
        {hasDiscount && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-md"
          >
            -{discountPct}% OFF
          </motion.span>
        )}
      </div>

      {/* Favorite button */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.stopPropagation();
          product.is_favorite = !product.is_favorite;
        }}
        className="absolute top-3.5 right-3.5 z-20 rounded-full bg-white/90 p-1.5 text-neutral-400 hover:text-amber-500 backdrop-blur-sm shadow-sm transition"
      >
        <Star className={`h-4 w-4 transition-all ${product.is_favorite ? "fill-amber-400 text-amber-500 scale-110" : ""}`} />
      </motion.button>

      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <img
          src={product.image_url || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500"}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />
        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Details */}
      <div className="p-3.5">
        <h3 className="font-bold text-neutral-800 text-sm leading-tight group-hover:text-orange-500 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] text-neutral-400 font-medium leading-relaxed">
          {product.description || "Brewed fresh using premium light roasted beans."}
        </p>

        {/* Pricing & CTA */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {hasDiscount ? (
              <>
                <span className="text-base font-extrabold text-neutral-900">{product.discount_price?.toFixed(2)} DH</span>
                <span className="text-xs text-neutral-400 line-through font-medium">{product.price.toFixed(2)} DH</span>
              </>
            ) : (
              <span className="text-base font-extrabold text-neutral-900">{product.price.toFixed(2)} DH</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <motion.div
              whileTap={{ scale: 0.85 }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
