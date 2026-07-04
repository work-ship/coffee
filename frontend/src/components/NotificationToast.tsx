import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const NotificationToast: React.FC = () => {
  const { notifications } = useApp();

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 max-w-xs w-full pointer-events-none items-center">
      <AnimatePresence>
        {notifications.map((n) => {
          const isSuccess = n.type === "success";
          const isError   = n.type === "error";

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="pointer-events-auto flex items-center gap-3 py-3 px-4 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-md"
              style={{
                background: isSuccess
                  ? "rgba(16,185,129,0.18)"
                  : isError
                  ? "rgba(244,63,94,0.18)"
                  : "rgba(59,130,246,0.18)",
                borderColor: isSuccess
                  ? "rgba(16,185,129,0.35)"
                  : isError
                  ? "rgba(244,63,94,0.35)"
                  : "rgba(59,130,246,0.35)",
                color: isSuccess
                  ? "#34d399"
                  : isError
                  ? "#f87171"
                  : "#60a5fa",
              }}
            >
              <div className="flex-shrink-0">
                {isSuccess ? (
                  <CheckCircle className="h-4 w-4" />
                ) : isError ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 leading-tight">{n.message}</div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
