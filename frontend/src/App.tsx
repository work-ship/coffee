import React, { useState, useRef } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Topbar } from "./components/Topbar";
import { Sidebar } from "./components/Sidebar";
import { POS } from "./pages/POS";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Reports } from "./pages/Reports";
import { Customers } from "./pages/Customers";
import { Employees } from "./pages/Employees";
import { KitchenDisplay } from "./pages/KitchenDisplay";
import { Login } from "./pages/Login";
import { NotificationToast } from "./components/NotificationToast";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

const AppContent: React.FC = () => {
  const { currentView, token, darkMode } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Ref forwarded to the search <input> inside Topbar so keyboard shortcut F can focus it
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Register global keyboard shortcuts
  useKeyboardShortcuts(searchInputRef);

  if (!token || currentView === "login") {
    return <Login />;
  }

  return (
    <div className={`flex h-screen w-screen flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950 transition-colors`}>
      {/* Top Header */}
      <Topbar ref={searchInputRef} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
        />

        <div className="flex-1 flex overflow-hidden">
          {currentView === "pos"       && <POS searchQuery={searchQuery} selectedCategoryId={selectedCategoryId} />}
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "inventory" && <Inventory />}
          {currentView === "reports"   && <Reports />}
          {currentView === "customers" && <Customers />}
          {currentView === "employees" && <Employees />}
          {currentView === "kitchen"   && <KitchenDisplay />}
        </div>
      </div>

      <NotificationToast />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
