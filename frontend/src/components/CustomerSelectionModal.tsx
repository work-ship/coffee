import React, { useState } from "react";
import { X, Search, UserPlus, Phone, Mail, Award, Check, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp, Customer } from "../context/AppContext";
import { api } from "../utils/api";

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Generate a deterministic gradient for each customer based on name */
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
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } },
};

export const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({ isOpen, onClose }) => {
  const { customers, setSelectedCustomer, selectedCustomer, refreshData, showNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "register">("search");

  // New customer form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    showNotification(`Linked loyalty customer: ${customer.name}`, "success");
    onClose();
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      const newCust = await api.createCustomer({ name, phone: phone || null, email: email || null });
      await refreshData();
      setSelectedCustomer(newCust);
      showNotification(`Registered customer: ${newCust.name}`, "success");
      setName(""); setPhone(""); setEmail("");
      setActiveTab("search");
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to register customer", "error");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 border border-neutral-100 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-orange-100 flex items-center justify-center">
                  <Award className="h-4.5 w-4.5 text-orange-500" />
                </div>
                <div>
                  <span className="block font-bold text-neutral-800 text-base leading-tight">Loyalty Customer</span>
                  <span className="text-[11px] text-neutral-400 font-medium">Award points & apply perks</span>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Tab Strip */}
            <div className="flex px-6 bg-neutral-50 border-b border-neutral-100 relative">
              {(["search", "register"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-center text-sm font-semibold transition relative ${
                    activeTab === tab ? "text-orange-600" : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  {tab === "search" ? "Search List" : "Register New"}
                  {activeTab === tab && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <AnimatePresence mode="wait">
                {activeTab === "search" ? (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-4"
                  >
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search by name, phone or email…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
                      />
                    </div>

                    {/* Customer List */}
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-2"
                    >
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((c) => {
                          const isSelected = selectedCustomer?.id === c.id;
                          return (
                            <motion.div
                              key={c.id}
                              variants={rowVariants}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelect(c)}
                              className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "border-orange-400 bg-orange-50 shadow-sm shadow-orange-100"
                                  : "border-neutral-200 bg-white hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-sm"
                              }`}
                            >
                              {/* Avatar */}
                              <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${getAvatarGradient(c.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
                                {c.name.slice(0, 2).toUpperCase()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-neutral-800 leading-tight">{c.name}</p>
                                <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium mt-0.5">
                                  {c.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                                  {c.email && <span className="flex items-center gap-1 truncate"><Mail className="h-3 w-3 flex-shrink-0" /><span className="truncate">{c.email}</span></span>}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 font-bold text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                                  {c.loyalty_points}
                                </span>
                                {isSelected && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center"
                                  >
                                    <Check className="h-3 w-3 text-white" />
                                  </motion.span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col items-center justify-center py-10 text-center"
                        >
                          <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                            <Search className="h-6 w-6 text-neutral-350" />
                          </div>
                          <p className="text-sm font-semibold text-neutral-600">No members found</p>
                          <p className="text-xs text-neutral-400 mt-1">Try a different name or register a new customer</p>
                          <button
                            onClick={() => setActiveTab("register")}
                            className="mt-4 text-xs font-bold text-orange-500 hover:text-orange-600 transition flex items-center gap-1"
                          >
                            <UserPlus className="h-3.5 w-3.5" /> Register New Customer
                          </button>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18 }}
                  >
                    <form onSubmit={handleCreateCustomer} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Full Name <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={name}
                          autoFocus
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 123-456-7890"
                          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. john@example.com"
                          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
                        />
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
                      >
                        <UserPlus className="h-4.5 w-4.5" />
                        Register & Link Customer
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
