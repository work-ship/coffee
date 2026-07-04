import React from "react";
import { useApp } from "../context/AppContext";
import {
  Coffee, Flame, CupSoda, GlassWater, IceCream, Cake,
  UtensilsCrossed, Croissant, Cookie, LayoutDashboard,
  ClipboardList, BarChart3, Users, ShoppingBag, ChefHat,
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
}

export const CategoryIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "h-4.5 w-4.5" }) => {
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

const sidebarVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export const Sidebar: React.FC<SidebarProps> = ({ selectedCategoryId, setSelectedCategoryId }) => {
  const { currentView, setView, user, categories } = useApp();

  const navItems = [
    { id: "dashboard", label: "Dashboard",      icon: <LayoutDashboard className="h-4.5 w-4.5" />, roles: ["admin"],   },
    { id: "pos",       label: "Register",        icon: <ShoppingBag className="h-4.5 w-4.5" />,    roles: ["cashier"], },
    { id: "kitchen",   label: "Kitchen Display", icon: <ChefHat className="h-4.5 w-4.5" />,        roles: ["manager"], },
    { id: "inventory", label: "Inventory",       icon: <ClipboardList className="h-4.5 w-4.5" />,  roles: ["admin"],   },
    { id: "reports",   label: "Analytics",       icon: <BarChart3 className="h-4.5 w-4.5" />,      roles: ["admin"],   },
  ];

  const visibleNav = navItems.filter((item) => item.roles.includes(user?.role ?? ""));

  return (
    <aside
      className="w-60 flex flex-col h-[calc(100vh-4rem)] overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0f0f17 0%, #111118 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Module navigation */}
      <div className="p-3 pt-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] px-3 mb-3" style={{ color: "rgba(255,255,255,0.25)" }}>
          Navigation
        </p>
        <motion.div variants={sidebarVariants} initial="hidden" animate="visible" className="space-y-0.5">
          {visibleNav.map((item) => {
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                variants={itemVariants}
                onClick={() => setView(item.id as any)}
                className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,143,90,0.12))",
                        color: "#FF6B35",
                        border: "1px solid rgba(255,107,53,0.25)",
                      }
                    : {
                        color: "rgba(255,255,255,0.4)",
                        border: "1px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                  }
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-bar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: "#FF6B35", boxShadow: "0 0 8px rgba(255,107,53,0.6)" }}
                  />
                )}
                <span className={isActive ? "text-orange-400" : ""}>{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Category filter (POS / cashier only) */}
      {user?.role === "cashier" && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
          <div className="flex items-center justify-between px-3 mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.25)" }}>
              Categories
            </p>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(255,107,53,0.15)", color: "#FF6B35" }}
            >
              {categories.length}
            </span>
          </div>

          {/* All */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => currentView === "pos" && setSelectedCategoryId(null)}
            disabled={currentView !== "pos"}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
            style={
              selectedCategoryId === null
                ? {
                    background: "rgba(255,107,53,0.15)",
                    color: "#FF6B35",
                    border: "1px solid rgba(255,107,53,0.2)",
                  }
                : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }
            }
            onMouseEnter={(e) => {
              if (selectedCategoryId !== null) {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategoryId !== null) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              }
            }}
          >
            <Coffee className="h-4.5 w-4.5" />
            <span>All Categories</span>
          </motion.button>

          <motion.div variants={sidebarVariants} initial="hidden" animate="visible">
            {categories.map((cat) => {
              const isActive = selectedCategoryId === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  variants={itemVariants}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => currentView === "pos" && setSelectedCategoryId(cat.id)}
                  disabled={currentView !== "pos"}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                  style={
                    isActive
                      ? {
                          background: "rgba(255,107,53,0.15)",
                          color: "#FF6B35",
                          border: "1px solid rgba(255,107,53,0.2)",
                        }
                      : { color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                    }
                  }}
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
