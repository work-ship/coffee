import React, { useState } from "react";
import { useApp, Product } from "../context/AppContext";
import { ProductCard } from "../components/ProductCard";
import { CartPanel } from "../components/CartPanel";
import { ProductOptionsModal } from "../components/ProductOptionsModal";
import { CheckoutSuccessModal } from "../components/CheckoutSuccessModal";
import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";

interface POSProps {
  searchQuery: string;
  selectedCategoryId: number | null;
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const POS: React.FC<POSProps> = ({ searchQuery, selectedCategoryId }) => {
  const { products, addToCart } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState("");
  const [successOrderDetails, setSuccessOrderDetails] = useState<any>(null);

  const handleProductSelect = (product: Product) => {
    if (
      (product.variants && product.variants.length > 0) ||
      (product.extras && product.extras.length > 0)
    ) {
      setSelectedProduct(product);
      setIsOptionsOpen(true);
    } else {
      addToCart(product, null, []);
    }
  };

  const handleCheckoutSuccess = (orderId: string, orderDetails: any) => {
    setSuccessOrderId(orderId);
    setSuccessOrderDetails(orderDetails);
    setIsSuccessOpen(true);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryId === null || p.category_id === selectedCategoryId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Product Grid Area */}
      <main className="flex-1 overflow-y-auto p-6" style={{ background: "#0f0f17" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-extrabold text-2xl text-white tracking-tight">
              Product Register
            </h1>
            <p className="text-xs font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Select coffees and snacks to build order</p>
          </div>
          <motion.span
            key={filteredProducts.length}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
          >
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            {filteredProducts.length} Products
          </motion.span>
        </div>

        <AnimatePresence mode="wait">
          {filteredProducts.length > 0 ? (
            <motion.div
              key="grid"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleProductSelect}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="h-[60vh] flex flex-col items-center justify-center text-center p-6"
            >
              <div className="h-20 w-20 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                <Package className="h-9 w-9" style={{ color: "rgba(255,255,255,0.2)" }} />
              </div>
              <p className="text-base font-bold text-white">No items match your filters</p>
              <p className="text-sm mt-1 max-w-[240px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                Try clearing the search bar or choosing another category.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Cart Right Panel */}
      <CartPanel onSuccess={handleCheckoutSuccess} />

      <ProductOptionsModal
        product={selectedProduct}
        isOpen={isOptionsOpen}
        onClose={() => { setIsOptionsOpen(false); setSelectedProduct(null); }}
        onConfirm={(variant, extras) => { if (selectedProduct) addToCart(selectedProduct, variant, extras); }}
      />

      <CheckoutSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => { setIsSuccessOpen(false); setSuccessOrderId(""); setSuccessOrderDetails(null); }}
        orderNumber={successOrderId}
        orderDetails={successOrderDetails}
      />
    </div>
  );
};
