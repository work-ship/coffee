import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { UserPlus, Shield, User, Loader2, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export const Employees: React.FC = () => {
  const { showNotification } = useApp();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("cashier");
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      showNotification(err.message || "Failed to load employee list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;
    try {
      await api.registerEmployee({
        name,
        username,
        password,
        role,
        pin: pin || null
      });
      showNotification(`Registered new ${role}: ${name}`, "success");
      // Reset form
      setName("");
      setUsername("");
      setPassword("");
      setPin("");
      setRole("cashier");
      setIsRegistering(false);
      await fetchEmployees();
    } catch (err: any) {
      showNotification(err.message || "Registration failed", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50/50">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-neutral-50/30">
      {/* Left side: Employees List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 border-r border-neutral-150">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-2xl text-neutral-800 tracking-tight">Active Cashiers & Admins</h1>
            <p className="text-xs text-neutral-450 font-semibold font-medium">Verify credentials permissions and PINs</p>
          </div>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map((emp) => (
            <div key={emp.id} className="p-4 bg-white rounded-3xl border border-neutral-200 shadow-sm flex items-center gap-4">
              <div className="h-10 w-10 bg-orange-50 text-orange-600 font-bold rounded-2xl flex items-center justify-center text-sm">
                {emp.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-bold text-sm text-neutral-850">{emp.name}</p>
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-semibold">
                  <span className="capitalize">{emp.role}</span>
                  <span>•</span>
                  <span>PIN: {emp.pin || "None"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side Form register */}
      {isRegistering && (
        <div className="w-96 bg-white overflow-y-auto p-6 border-l border-neutral-150 flex flex-col justify-between">
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <span className="font-bold text-neutral-800 text-sm">Register Team Member</span>
              <button type="button" onClick={() => setIsRegistering(false)} className="text-neutral-400 hover:text-neutral-600">
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Full Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm" placeholder="Alice Smith" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Username</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm" placeholder="alice" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm" placeholder="••••••••" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Quick login PIN</label>
                <input type="text" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm" placeholder="4444" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">System Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm">
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs shadow-md transition"
            >
              Confirm Registration
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
