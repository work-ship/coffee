import React from "react";
import { useApp } from "../context/AppContext";
import {
  Coffee, Flame, CupSoda, GlassWater, IceCream, Cake,
  UtensilsCrossed, Croissant, Cookie, LayoutDashboard,
  ClipboardList, BarChart3, Users, Contact, ShoppingBag,
  ChefHat,
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
}

export const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "h-5 w-5" }) => {
  switch (name) {
    case "Coffee":          return <Coffee className={className} />;
    case "Flame":           return <Flame className={className} />;
    case "CupSoda":         return <CupSoda className={className} />;
    case "GlassWater":      return <GlassWater className={className} />;
    case "IceCream":        return <IceCream className={className} />;
    case "Cake":            return <Cake className={className} />;
    case "UtensilsCrossed": return <UtensilsCrossed className={className} />;
    case "Croissant":       return <Croissant className={className} />;
    case "Cookie":          return <Cookie className={className} />;
    default:                return <Coffee className={className} />;
  }
};

/** Keyboard hint pill rendered inside nav items */
const KBadge: React.FC<{ k: string }> = ({ k }) => (
  <kbd className="ml-auto inline-flex items-center justify-center rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 text-[9px] font-black text-neutral-400 dark:text-neutral-500 tracking-wider font-mono leading-none">
    {k}
  </kbd>
);

const sidebarVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 22 } },
};

export const Sidebar: React.FC<SidebarProps> = ({ selectedCategoryId, setSelectedCategoryId }) => {
  const { currentView, setView, user, categories } = useApp();

  const navItems = [
    { id: "dashboard", label: "Dashboard",       icon: <LayoutDashboard className="h-5 w-5" />, roles: ["admin"],           kbd: null },
    { id: "pos",       label: "Register (POS)",  icon: <ShoppingBag className="h-5 w-5" />,   roles: ["cashier"], kbd: "S" },
    { id: "kitchen",   label: "Kitchen Display", icon: <ChefHat className="h-5 w-5" />,        roles: ["manager"], kbd: "K" },
    
    { id: "inventory", label: "Inventory",       icon: <ClipboardList className="h-5 w-5" />,  roles: ["admin"],           kbd: "I" },
    { id: "reports",   label: "Sales Analytics", icon: <BarChart3 className="h-5 w-5" />,      roles: ["admin"],           kbd: "R" },
  ];

  return (
    <aside className="w-64 border-r border-neutral-150 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-[calc(100vh-4rem)]">

      {/* ── Module Navigation ── */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
        <span className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest px-3 mb-3">Modules</span>
        <motion.div
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className="space-y-0.5"
        >
          {navItems
            .filter((item) => item.roles.includes(user?.role ?? ""))
            .map((item) => {
              const isActive = currentView === item.id;
              return (
                <motion.button
                  key={item.id}
                  variants={itemVariants}
                  onClick={() => setView(item.id as any)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  {/* Active left indicator */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-400 rounded-r-full"
                    />
                  )}
                  {item.icon}
                  <span>{item.label}</span>
                  {item.kbd && !isActive && <KBadge k={item.kbd} />}
                </motion.button>
              );
            })}
        </motion.div>
      </div>

      {/* ── POS Category Filter ── */}
      {user?.role === "cashier" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-0.5">
          <div className="flex items-center justify-between px-3 mb-3">
            <span className="block text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">
              Categories
            </span>
            <span className="text-[9px] font-bold bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full">
              {categories.length}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => currentView === "pos" && setSelectedCategoryId(null)}
            disabled={currentView !== "pos"}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition text-left ${
              currentView !== "pos"
                ? "opacity-40 cursor-not-allowed text-neutral-400 dark:text-neutral-600"
                : selectedCategoryId === null
                ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 border border-orange-100 dark:border-orange-800/40 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            <Coffee className="h-5 w-5" />
            <span>All Categories</span>
          </motion.button>

          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
          >
            {categories.map((cat) => {
              const isActive = selectedCategoryId === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  variants={itemVariants}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => currentView === "pos" && setSelectedCategoryId(cat.id)}
                  disabled={currentView !== "pos"}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition text-left ${
                    currentView !== "pos"
                      ? "opacity-40 cursor-not-allowed text-neutral-400 dark:text-neutral-600"
                      : isActive
                      ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 border border-orange-100 dark:border-orange-800/40 shadow-sm"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  <CategoryIcon name={cat.icon ?? "Coffee"} />
                  <span>{cat.name}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      )}

    </aside>
  );
};
