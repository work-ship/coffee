import React from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const NotificationToast: React.FC = () => {
  const { notifications } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => {
          const isSuccess = n.type === "success";
          const isError = n.type === "error";

          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-lg border ${
                isSuccess
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : isError
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <div className="mt-0.5">
                {isSuccess ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : isError ? (
                  <XCircle className="h-5 w-5 text-rose-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 text-sm font-medium">{n.message}</div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
