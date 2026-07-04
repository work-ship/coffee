import React, { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";
import { useApp } from "../context/AppContext";
import { useKDSChime } from "../hooks/useKDSChime";
import {
  ChefHat, Bell, BellOff, Clock, CheckCircle2, Flame,
  RefreshCw, Loader2, Coffee,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type KDSStatus = "pending" | "preparing" | "ready";

interface KDSOrder {
  id: number;
  order_number: string;
  date: string;
  items: { id: number; product_name: string; quantity: number; selected_variant?: string; selected_extras?: string[] }[];
  status: KDSStatus;
}

/** Returns elapsed minutes since a date string */
function minutesAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
}

function urgencyColor(mins: number, dark: boolean) {
  if (mins >= 8) return dark ? "border-rose-500/70 bg-rose-950/40" : "border-rose-400 bg-rose-50";
  if (mins >= 4) return dark ? "border-amber-400/60 bg-amber-950/30" : "border-amber-400 bg-amber-50";
  return dark ? "border-neutral-700 bg-neutral-900" : "border-neutral-200 bg-white";
}

const STATUS_CONFIG: Record<KDSStatus, { label: string; icon: React.ReactNode; next: KDSStatus | null; btnLabel: string; color: string }> = {
  pending: {
    label: "Queued",
    icon: <Clock className="h-3.5 w-3.5" />,
    next: "preparing",
    btnLabel: "Start Prep",
    color: "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
  },
  preparing: {
    label: "Preparing",
    icon: <Flame className="h-3.5 w-3.5 text-orange-500" />,
    next: "ready",
    btnLabel: "Mark Ready",
    color: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  },
  ready: {
    label: "Ready!",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    next: null,
    btnLabel: "Served",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
};

export const KitchenDisplay: React.FC = () => {
  const { darkMode } = useApp();
  const { chime } = useKDSChime();

  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [ticker, setTicker] = useState(0); // re-render every 30 s to refresh elapsed times
  const knownIdsRef = useRef<Set<number>>(new Set());
  const [localStatus, setLocalStatus] = useState<Record<number, KDSStatus>>({});

  /* ── Fetch paid + draft orders and surface new ones ── */
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const raw = await api.getOrders();
      // Only show today's paid / draft orders on the kitchen board
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayOrders: KDSOrder[] = raw
        .filter((o: any) => o.status === "paid" && new Date(o.date) >= todayStart)
        .map((o: any) => ({
          id: o.id,
          order_number: o.order_number,
          date: o.date,
          items: o.items,
          status: "pending" as KDSStatus,
        }));

      // Detect genuinely new orders and chime
      const incoming = todayOrders.filter((o) => !knownIdsRef.current.has(o.id));
      if (incoming.length > 0 && knownIdsRef.current.size > 0) {
        // There are new orders since last fetch → chime
        if (audioEnabled) chime();
      }
      incoming.forEach((o) => knownIdsRef.current.add(o.id));

      setOrders(todayOrders);
    } catch (err) {
      // Silently fail on background refresh
    } finally {
      setLoading(false);
    }
  };

  /* ── Initial load + 30-second polling for new tickets ── */
  useEffect(() => {
    fetchOrders();
    const poll = setInterval(() => {
      fetchOrders(true);
      setTicker((t) => t + 1);
    }, 30_000);
    return () => clearInterval(poll);
  }, [audioEnabled]);

  /* ── Advance local status of an order ── */
  const advanceStatus = (orderId: number, currentStatus: KDSStatus) => {
    const next = STATUS_CONFIG[currentStatus].next;
    if (!next) {
      // "Served" — remove from board
      setLocalStatus((prev) => {
        const copy = { ...prev };
        delete copy[orderId];
        return copy;
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      return;
    }
    setLocalStatus((prev) => ({ ...prev, [orderId]: next }));
  };

  const getStatus = (o: KDSOrder): KDSStatus =>
    localStatus[o.id] ?? o.status;

  /* ── Split into columns by status ── */
  const byStatus = (s: KDSStatus) => orders.filter((o) => getStatus(o) === s);
  const columns: { status: KDSStatus; title: string; accent: string }[] = [
    { status: "pending", title: "Queued Orders", accent: "text-neutral-500 dark:text-neutral-400" },
    { status: "preparing", title: "Preparing Now", accent: "text-orange-500" },
    { status: "ready", title: "Ready for Pickup", accent: "text-emerald-500" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* ── KDS Header ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-neutral-900 dark:text-white leading-none">
              Kitchen Display
            </h1>
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Live ticket board — auto-refreshes every 30 s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Elapsed clock trigger */}
          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 hidden md:block">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>

          {/* Refresh button */}
          <button
            onClick={() => fetchOrders()}
            title="Refresh tickets"
            className="rounded-xl p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>

          {/* Audio chime toggle */}
          <button
            onClick={() => setAudioEnabled((v) => !v)}
            title={audioEnabled ? "Mute chime" : "Enable chime"}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold border transition ${
              audioEnabled
                ? "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800/50 dark:bg-orange-950/40 dark:text-orange-400"
                : "border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500"
            }`}
          >
            {audioEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            <span>{audioEnabled ? "Chime On" : "Muted"}</span>
          </button>

          {/* Test chime button */}
          {audioEnabled && (
            <button
              onClick={() => chime()}
              className="rounded-xl px-3 py-2 text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
            >
              Test ♪
            </button>
          )}
        </div>
      </header>

      {/* ── Ticket Columns ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-3 gap-0 overflow-hidden">
          {columns.map(({ status, title, accent }) => {
            const col = byStatus(status);
            return (
              <div
                key={status}
                className="flex flex-col overflow-hidden border-r last:border-r-0 border-neutral-200 dark:border-neutral-800"
              >
                {/* Column header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
                  <div className="flex items-center gap-2">
                    <span className={`font-extrabold text-sm ${accent}`}>{title}</span>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      col.length > 0
                        ? "bg-orange-500 text-white"
                        : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                    }`}
                  >
                    {col.length}
                  </span>
                </div>

                {/* Tickets */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {col.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-32 text-center"
                      >
                        <Coffee className="h-7 w-7 text-neutral-300 dark:text-neutral-600 mb-2" />
                        <p className="text-xs text-neutral-400 dark:text-neutral-600 font-semibold">No tickets here</p>
                      </motion.div>
                    ) : (
                      col.map((order) => {
                        const mins = minutesAgo(order.date);
                        const cfg = STATUS_CONFIG[getStatus(order)];
                        return (
                          <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 280, damping: 24 }}
                            className={`rounded-3xl border-2 p-4 shadow-sm transition-colors ${urgencyColor(mins, darkMode)}`}
                          >
                            {/* Ticket header */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-black text-sm text-neutral-800 dark:text-white">
                                {order.order_number.split("-").pop()}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${cfg.color}`}
                                >
                                  {cfg.icon}
                                  {cfg.label}
                                </span>
                              </div>
                            </div>

                            {/* Items */}
                            <ul className="space-y-2 mb-4">
                              {order.items.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-start justify-between gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                                >
                                  <div>
                                    <span className="font-extrabold text-neutral-800 dark:text-white">
                                      ×{item.quantity}
                                    </span>{" "}
                                    {item.product_name}
                                    {item.selected_variant && (
                                      <span className="ml-1 text-neutral-400 dark:text-neutral-500">
                                        ({item.selected_variant})
                                      </span>
                                    )}
                                    {item.selected_extras && item.selected_extras.length > 0 && (
                                      <p className="text-[10px] text-orange-500 dark:text-orange-400 font-semibold mt-0.5">
                                        + {item.selected_extras.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>

                            {/* Footer: elapsed + action */}
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-bold flex items-center gap-1 ${
                                  mins >= 8
                                    ? "text-rose-500"
                                    : mins >= 4
                                    ? "text-amber-500"
                                    : "text-neutral-400 dark:text-neutral-500"
                                }`}
                              >
                                <Clock className="h-3 w-3" />
                                {mins}m ago
                              </span>

                              <button
                                onClick={() => advanceStatus(order.id, getStatus(order))}
                                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition active:scale-95 ${
                                  getStatus(order) === "ready"
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
                                    : getStatus(order) === "preparing"
                                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                                    : "bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-700 dark:hover:bg-neutral-300 text-white dark:text-neutral-900 shadow"
                                }`}
                              >
                                {cfg.btnLabel}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
