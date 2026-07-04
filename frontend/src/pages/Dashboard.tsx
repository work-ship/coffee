import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { 
  DollarSign, ShoppingCart, Percent, AlertTriangle, 
  Coffee, Award, Sparkles, TrendingUp, Medal, Trophy
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from "recharts";
import { useApp } from "../context/AppContext";
import { motion } from "framer-motion";

/** Animated count-up number hook */
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

/** Skeleton loader card */
const StatCardSkeleton = () => (
  <div className="bg-white border border-neutral-150 p-5 rounded-3xl">
    <div className="skeleton h-3 w-24 mb-3" />
    <div className="skeleton h-8 w-32 mb-2" />
    <div className="skeleton h-3 w-20" />
  </div>
);

/** Animated stat card */
const StatCard: React.FC<{
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  iconBg: string;
  delay?: number;
}> = ({ label, subtext, icon, iconBg, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: "spring", stiffness: 260, damping: 22 }}
    className="bg-white border border-neutral-150 p-5 rounded-3xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group"
  >
    <div className="space-y-1.5">
      <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{label}</span>
      <span className="block text-2xl font-black text-neutral-800 font-price">{value}</span>
      <span className="block text-[11px] font-semibold text-neutral-400">{subtext}</span>
    </div>
    <div className={`h-12 w-12 rounded-2xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
  </motion.div>
);

const COLORS = ["#FF6B35", "#4ECDC4", "#FFD166", "#118AB2", "#06D6A0"];

const rankIcon = (i: number) => {
  if (i === 0) return <Trophy className="h-4 w-4 text-amber-500" />;
  if (i === 1) return <Medal className="h-4 w-4 text-neutral-400" />;
  if (i === 2) return <Medal className="h-4 w-4 text-amber-700" />;
  return <span className="text-xs font-black text-neutral-300 w-4 text-center">#{i + 1}</span>;
};

export const Dashboard: React.FC = () => {
  const { showNotification, customers } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardAnalytics()
      .then(setData)
      .catch((err: any) => showNotification(err.message || "Failed to load dashboard metrics", "error"))
      .finally(() => setLoading(false));
  }, []);

  const revenueToday = useCountUp(data?.revenue?.today ?? 0);
  const revenueWeek = useCountUp(data?.revenue?.week ?? 0);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/30 space-y-6">
        <div className="skeleton h-8 w-48 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-80 rounded-3xl lg:col-span-2" />
          <div className="skeleton h-80 rounded-3xl" />
        </div>
        <div className="skeleton h-72 rounded-3xl" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/30 space-y-6 animate-slide-up">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-neutral-800 tracking-tight flex items-center gap-2">
            Store Performance
            <Sparkles className="h-5 w-5 text-orange-500" />
          </h1>
          <p className="text-xs text-neutral-400 font-semibold mt-0.5">Live business intelligence feed</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 bg-white border border-neutral-200 px-3.5 py-2 rounded-2xl shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Realtime Active Session
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Revenue Today"
          value={`${revenueToday.toFixed(2)} DH`}
          subtext="+12.4% vs yesterday"
          icon={<DollarSign className="h-6 w-6 text-orange-600" />}
          iconBg="bg-gradient-to-br from-orange-100 to-amber-50"
          delay={0}
        />
        <StatCard
          label="Orders Today"
          value={`${data.transactions.today}`}
          subtext={`Avg ticket: ${data.aov_today.toFixed(2)} DH`}
          icon={<ShoppingCart className="h-6 w-6 text-teal-600" />}
          iconBg="bg-gradient-to-br from-teal-100 to-cyan-50"
          delay={0.07}
        />
        <StatCard
          label="Weekly Sales"
          value={`${revenueWeek.toFixed(2)} DH`}
          subtext={`${data.transactions.week} total orders`}
          icon={<TrendingUp className="h-6 w-6 text-amber-600" />}
          iconBg="bg-gradient-to-br from-amber-100 to-yellow-50"
          delay={0.14}
        />
        <StatCard
          label="Loyalty Members"
          value={`${customers.length}`}
          subtext="Registered accounts"
          icon={<Award className="h-6 w-6 text-indigo-600" />}
          iconBg="bg-gradient-to-br from-indigo-100 to-purple-50"
          delay={0.21}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 24 }}
          className="bg-white border border-neutral-150 rounded-3xl p-5 shadow-sm lg:col-span-2"
        >
          <div className="mb-4">
            <h3 className="font-bold text-neutral-800 text-sm">Revenue Timeline</h3>
            <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Last 7 Days Trend</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#A3A3A3" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #f0f0f0", fontSize: 12, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B35" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Pie */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, type: "spring", stiffness: 220, damping: 24 }}
          className="bg-white border border-neutral-150 rounded-3xl p-5 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="font-bold text-neutral-800 text-sm">Category Mix</h3>
            <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Sales Distribution</p>
          </div>
          <div className="h-72 flex flex-col justify-between">
            {data.category_sales.length > 0 ? (
              <>
                <div className="h-[190px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.category_sales}
                        cx="50%" cy="50%"
                        innerRadius={58} outerRadius={78}
                        paddingAngle={4} dataKey="value"
                      >
                        {data.category_sales.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #f0f0f0", fontSize: 12, fontWeight: 600 }}
                        formatter={(value) => [`${parseFloat(value as string).toFixed(2)} DH`, "Sales"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold px-2 pb-2 text-neutral-500">
                  {data.category_sales.map((entry: any, index: number) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="line-clamp-1">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-xs text-neutral-450 py-6">
                No categorical sales recorded yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Best Sellers */}
      <div className="grid grid-cols-1 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, type: "spring", stiffness: 220, damping: 24 }}
          className="bg-white border border-neutral-150 rounded-3xl p-5 shadow-sm space-y-4"
        >
          <div>
            <h3 className="font-bold text-neutral-800 text-sm">Best Selling Products</h3>
            <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Top items by quantity</p>
          </div>
          <div className="space-y-2.5">
            {data.best_sellers.length > 0 ? (
              data.best_sellers.map((item: any, i: number) => (
                <div key={item.name} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-neutral-50 transition">
                  <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                    {rankIcon(i)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-neutral-700 line-clamp-1">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-neutral-400 flex-shrink-0">
                    <span className="text-neutral-500">{item.quantity} sold</span>
                    <span className="text-neutral-800 font-extrabold">{item.revenue.toFixed(2)} DH</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-neutral-400 py-6">No products sold yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};


