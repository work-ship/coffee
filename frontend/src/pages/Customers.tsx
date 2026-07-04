import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Search, Award, Calendar, Phone, Mail, Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

/** Deterministic gradient per customer name */
const getAvatarGradient = (name: string) => {
  const gradients = [
    "from-orange-400 to-rose-500",
    "from-violet-500 to-purple-600",
    "from-teal-400 to-cyan-500",
    "from-amber-400 to-orange-500",
    "from-blue-500 to-indigo-600",
    "from-emerald-400 to-teal-500",
    "from-pink-500 to-rose-600",
  ];
  return gradients[name.charCodeAt(0) % gradients.length];
};

/** Loyalty tier based on points */
const getLoyaltyTier = (points: number) => {
  if (points >= 500) return { label: "Gold", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
  if (points >= 200) return { label: "Silver", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
  return { label: "Bronze", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-400" };
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

export const Customers: React.FC = () => {
  const { customers } = useApp();
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-neutral-800 tracking-tight">Customer Database</h1>
          <p className="text-xs text-neutral-400 font-semibold mt-0.5">Loyalty tiers and perk parameters</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 bg-white border border-neutral-200 px-3.5 py-2.5 rounded-2xl shadow-sm">
          <Users className="h-4 w-4 text-orange-500" />
          {customers.length} Members
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition shadow-sm"
          />
        </div>
        {search && (
          <span className="text-xs font-bold text-neutral-400">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Cards */}
      {filtered.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((c) => {
            const tier = getLoyaltyTier(c.loyalty_points);
            const dateJoined = new Date(c.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            });

            return (
              <motion.div
                key={c.id}
                variants={cardVariants}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.10)" }}
                className="bg-white border border-neutral-150 rounded-3xl shadow-sm overflow-hidden cursor-default transition-all"
              >
                {/* Card top accent */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${getAvatarGradient(c.name)}`} />

                <div className="p-5 space-y-4">
                  {/* Avatar row */}
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${getAvatarGradient(c.name)} flex items-center justify-center text-white font-bold text-base shadow-md`}>
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-full border uppercase tracking-wider ${tier.bg} ${tier.text} ${tier.border}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${tier.dot}`} />
                      {tier.label}
                    </span>
                  </div>

                  {/* Name & join date */}
                  <div>
                    <h3 className="font-extrabold text-neutral-800 text-sm leading-tight">{c.name}</h3>
                    <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" /> Joined {dateJoined}
                    </p>
                  </div>

                  {/* Loyalty points bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                        <Award className="h-3 w-3 text-amber-500" /> Loyalty Points
                      </span>
                      <span className="text-sm font-extrabold text-neutral-800">{c.loyalty_points}</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((c.loyalty_points / 500) * 100, 100)}%` }}
                        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${getAvatarGradient(c.name)}`}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 font-medium">
                      {c.loyalty_points >= 500 ? "Gold tier achieved! 🏆" : `${500 - c.loyalty_points} pts to Gold`}
                    </p>
                  </div>

                  {/* Contact info */}
                  <div className="border-t border-neutral-100 pt-3.5 space-y-1.5 text-xs text-neutral-500 font-medium">
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-neutral-350 flex-shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-neutral-350 flex-shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {!c.phone && !c.email && (
                      <span className="text-neutral-350 text-[11px] italic">No contact info</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="h-20 w-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <Users className="h-9 w-9 text-orange-300" />
          </div>
          <p className="text-base font-bold text-neutral-700">No customers found</p>
          <p className="text-sm text-neutral-400 mt-1 max-w-xs">
            {search ? "Try a different search query." : "Start building your loyalty program by registering customers at the POS."}
          </p>
        </motion.div>
      )}
    </div>
  );
};
