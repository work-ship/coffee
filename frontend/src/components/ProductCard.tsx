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
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(product)}
      className="group relative overflow-hidden rounded-3xl cursor-pointer select-none transition-all"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,107,53,0.35)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(255,107,53,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.09)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Shine overlay */}
      <div
        className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
        }}
      />

      {/* Discount badge */}
      <div className="absolute top-3 left-3 z-20">
        {hasDiscount && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="rounded-full px-2.5 py-1 text-[10px] font-black text-white uppercase tracking-wider shadow-md"
            style={{ background: "linear-gradient(135deg, #FF6B35, #ef4444)" }}
          >
            -{discountPct}% OFF
          </motion.span>
        )}
      </div>

      {/* Favorite */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => { e.stopPropagation(); product.is_favorite = !product.is_favorite; }}
        className="absolute top-3 right-3 z-20 rounded-full p-1.5 backdrop-blur-sm transition"
        style={{ background: "rgba(0,0,0,0.3)", color: product.is_favorite ? "#fbbf24" : "rgba(255,255,255,0.4)" }}
      >
        <Star className={`h-4 w-4 transition-all ${product.is_favorite ? "fill-amber-400" : ""}`} />
      </motion.button>

      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden" style={{ background: "rgba(0,0,0,0.2)" }}>
        <img
          src={product.image_url || "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500"}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
      </div>

      {/* Details */}
      <div className="p-3.5">
        <h3 className="font-bold text-white text-sm leading-tight line-clamp-1 group-hover:text-orange-400 transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
          {product.description || "Brewed fresh using premium light roasted beans."}
        </p>

        {/* Pricing & CTA */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {hasDiscount ? (
              <>
                <span className="text-base font-extrabold text-white">{product.discount_price?.toFixed(2)} DH</span>
                <span className="text-xs line-through font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>{product.price.toFixed(2)} DH</span>
              </>
            ) : (
              <span className="text-base font-extrabold text-white">{product.price.toFixed(2)} DH</span>
            )}
          </div>
          <motion.div
            whileTap={{ scale: 0.85 }}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200"
            style={{ background: "rgba(255,107,53,0.15)", color: "#FF6B35" }}
          >
            <Plus className="h-4 w-4" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
