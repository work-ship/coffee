import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import {
  DollarSign, ShoppingCart, TrendingUp, Award, Sparkles, Trophy, Medal,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useApp } from "../context/AppContext";
import { motion } from "framer-motion";

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animFrame: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) animFrame = requestAnimationFrame(step);
    };
    animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [target, duration]);
  return value;
}

const DARK_CARD = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "1.5rem",
};

const StatCardSkeleton = () => (
  <div style={{ ...DARK_CARD, padding: "1.25rem" }}>
    <div className="skeleton h-3 w-24 mb-3 rounded-lg" style={{ background: "rgba(255,255,255,0.07)" }} />
    <div className="skeleton h-8 w-32 mb-2 rounded-lg" style={{ background: "rgba(255,255,255,0.07)" }} />
    <div className="skeleton h-3 w-20 rounded-lg"      style={{ background: "rgba(255,255,255,0.07)" }} />
  </div>
);

const StatCard: React.FC<{
  label: string; value: string; subtext: string;
  icon: React.ReactNode; iconStyle: React.CSSProperties; delay?: number;
}> = ({ label, subtext, icon, iconStyle, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 260, damping: 22 }}
    className="flex items-center justify-between p-5 group"
    style={DARK_CARD}
  >
    <div className="space-y-1.5">
      <span className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
      <span className="block text-2xl font-black text-white font-price">{value}</span>
      <span className="block text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>{subtext}</span>
    </div>
    <div className="h-12 w-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0" style={iconStyle}>
      {icon}
    </div>
  </motion.div>
);

const COLORS = ["#FF6B35", "#4ECDC4", "#FFD166", "#818CF8", "#34D399"];

const rankIcon = (i: number) => {
  if (i === 0) return <Trophy className="h-4 w-4 text-amber-400" />;
  if (i === 1) return <Medal className="h-4 w-4 text-neutral-400" />;
  if (i === 2) return <Medal className="h-4 w-4 text-amber-700" />;
  return <span className="text-xs font-black w-4 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>#{i + 1}</span>;
};

export const Dashboard: React.FC = () => {
  const { showNotification, customers } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardAnalytics()
      .then(setData)
      .catch((err: any) => showNotification(err.message || "Failed to load dashboard", "error"))
      .finally(() => setLoading(false));
  }, []);

  const revenueToday = useCountUp(data?.revenue?.today ?? 0);
  const revenueWeek  = useCountUp(data?.revenue?.week ?? 0);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ background: "#0f0f17" }}>
        <div className="h-8 w-48 rounded-2xl" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-3xl" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="h-80 rounded-3xl" style={{ background: "rgba(255,255,255,0.04)" }} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-slide-up" style={{ background: "#0f0f17" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-white tracking-tight flex items-center gap-2">
            Store Performance
            <Sparkles className="h-5 w-5" style={{ color: "#FF6B35" }} />
          </h1>
          <p className="text-xs font-semibold mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Live business intelligence</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-2xl" style={{ ...DARK_CARD, color: "rgba(255,255,255,0.5)" }}>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Realtime Session
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Revenue Today"   value={`${revenueToday.toFixed(2)} DH`} subtext="+12.4% vs yesterday"
          icon={<DollarSign className="h-6 w-6" style={{ color: "#FF6B35" }} />}
          iconStyle={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.2)" }} delay={0} />
        <StatCard label="Orders Today"    value={`${data.transactions.today}`} subtext={`Avg: ${data.aov_today.toFixed(2)} DH`}
          icon={<ShoppingCart className="h-6 w-6" style={{ color: "#4ECDC4" }} />}
          iconStyle={{ background: "rgba(78,205,196,0.12)", border: "1px solid rgba(78,205,196,0.2)" }} delay={0.07} />
        <StatCard label="Weekly Sales"    value={`${revenueWeek.toFixed(2)} DH`} subtext={`${data.transactions.week} orders`}
          icon={<TrendingUp className="h-6 w-6" style={{ color: "#FFD166" }} />}
          iconStyle={{ background: "rgba(255,209,102,0.12)", border: "1px solid rgba(255,209,102,0.2)" }} delay={0.14} />
        <StatCard label="Loyalty Members" value={`${customers.length}`} subtext="Registered accounts"
          icon={<Award className="h-6 w-6" style={{ color: "#818CF8" }} />}
          iconStyle={{ background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.2)" }} delay={0.21} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 24 }}
          className="p-5 lg:col-span-2" style={DARK_CARD}
        >
          <div className="mb-4">
            <h3 className="font-bold text-white text-sm">Revenue Timeline</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Last 7 Days</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSalesDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FF6B35" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1a1a26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, fontWeight: 600, color: "#fff" }}
                  formatter={(value) => [`${parseFloat(value as string).toFixed(2)} DH`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSalesDark)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, type: "spring", stiffness: 220, damping: 24 }}
          className="p-5" style={DARK_CARD}
        >
          <div className="mb-4">
            <h3 className="font-bold text-white text-sm">Category Mix</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Sales Distribution</p>
          </div>
          <div className="h-64 flex flex-col justify-between">
            {data.category_sales.length > 0 ? (
              <>
                <div className="h-[175px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.category_sales} cx="50%" cy="50%"
                        innerRadius={55} outerRadius={74} paddingAngle={4} dataKey="value">
                        {data.category_sales.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#1a1a26", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12, fontWeight: 600, color: "#fff" }}
                        formatter={(value) => [`${parseFloat(value as string).toFixed(2)} DH`, "Sales"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-semibold px-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {data.category_sales.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="line-clamp-1">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                No sales recorded yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Best Sellers */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44, type: "spring", stiffness: 220, damping: 24 }}
        className="p-5" style={DARK_CARD}
      >
        <div className="mb-4">
          <h3 className="font-bold text-white text-sm">Best Selling Products</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Top items by quantity</p>
        </div>
        <div className="space-y-1.5">
          {data.best_sellers.length > 0 ? (
            data.best_sellers.map((item: any, i: number) => (
              <div
                key={item.name}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                style={{ borderRadius: "0.875rem" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                  {rankIcon(i)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-white line-clamp-1">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold flex-shrink-0">
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>{item.quantity} sold</span>
                  <span className="text-white font-extrabold">{item.revenue.toFixed(2)} DH</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs py-6" style={{ color: "rgba(255,255,255,0.25)" }}>No products sold yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
