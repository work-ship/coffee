import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  price_override?: number;
}

export interface ProductExtra {
  id: number;
  product_id: number;
  name: string;
  price: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  image_url?: string;
  availability: boolean;
  is_favorite: boolean;
  stock: number;
  category_id: number;
  variants: ProductVariant[];
  extras: ProductExtra[];
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  loyalty_points: number;
  created_at: string;
}

export interface CartItem {
  cartId: string; // unique id combining product + modifications
  product: Product;
  quantity: number;
  selectedVariant: ProductVariant | null;
  selectedExtras: ProductExtra[];
  unitPrice: number;
  totalPrice: number;
}

interface User {
  username: string;
  name: string;
  role: string;
}

interface Notification {
  message: string;
  type: "success" | "error" | "info";
  id: number;
}

interface AppContextType {
  token: string | null;
  user: User | null;
  currentView: "pos" | "dashboard" | "inventory" | "reports" | "kitchen" | "customers" | "employees" | "login";
  setView: (view: "pos" | "dashboard" | "inventory" | "reports" | "kitchen" | "customers" | "employees" | "login") => void;

  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant | null, extras: ProductExtra[]) => void;
  removeFromCart: (cartId: string) => void;
  updateCartQuantity: (cartId: string, amount: number) => void;
  clearCart: () => void;

  // Customer
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;

  // App-wide data
  products: Product[];
  categories: Category[];
  customers: Customer[];
  refreshData: () => Promise<void>;

  // Kitchen orders (latest batch for KDS chime)
  latestOrderId: number | null;
  setLatestOrderId: (id: number | null) => void;

  // Auth Operations
  handleLogin: (credentials: { username?: string; password?: string; pin?: string }) => Promise<void>;
  handleLogout: () => void;

  // Notifications
  notifications: Notification[];
  showNotification: (message: string, type: "success" | "error" | "info") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("pos_token"));
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setView] = useState<AppContextType["currentView"]>("login");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [latestOrderId, setLatestOrderId] = useState<number | null>(null);

  // Dark mode — persist preference in localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("pos_dark") === "true";
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("pos_dark", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  // Apply persisted preference on mount
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
  }, []);

  // Show status popup — use randomUUID to avoid duplicate keys on rapid-fire notifications
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    const id = parseInt(crypto.randomUUID().replace(/-/g, "").slice(0, 9), 16);
    setNotifications((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Load app data
  const refreshData = async () => {
    if (!token) return;
    try {
      const [pData, cData, custData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getCustomers()
      ]);
      setProducts(pData);
      setCategories(cData);
      setCustomers(custData);
    } catch (err: any) {
      showNotification(err.message || "Failed to load shop data", "error");
    }
  };

  // Check auth user status on load
  useEffect(() => {
    const initializeUser = async () => {
      if (token) {
        try {
          const userProfile = await api.getMe();
          setUser(userProfile);
          if (userProfile.role === "admin") {
            setView("dashboard");
          } else if (userProfile.role === "manager") {
            setView("kitchen");
          } else {
            setView("pos");
          }
          refreshData();
        } catch (err) {
          handleLogout();
        }
      } else {
        setView("login");
      }
    };
    initializeUser();
  }, [token]);

  const handleLogin = async (credentials: { username?: string; password?: string; pin?: string }) => {
    try {
      const response = await api.login(credentials);
      localStorage.setItem("pos_token", response.access_token);
      setToken(response.access_token);
      setUser({
        username: credentials.username || "pin_user",
        name: response.name,
        role: response.role
      });
      showNotification(`Welcome back, ${response.name}!`, "success");
      if (response.role === "admin") {
        setView("dashboard");
      } else if (response.role === "manager") {
        setView("kitchen");
      } else {
        setView("pos");
      }
    } catch (err: any) {
      showNotification(err.message || "Login failed", "error");
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pos_token");
    setToken(null);
    setUser(null);
    setCart([]);
    setSelectedCustomer(null);
    setView("login");
    showNotification("Logged out successfully", "info");
  };

  // Cart operations
  const addToCart = (product: Product, variant: ProductVariant | null, extras: ProductExtra[]) => {
    // Generate a unique identifier for this configuration
    const variantId = variant ? `v${variant.id}` : "v0";
    const extrasId = extras.map((e) => `e${e.id}`).sort().join("-");
    const cartId = `${product.id}-${variantId}-${extrasId}`;

    const basePrice = product.discount_price !== null && product.discount_price !== undefined 
      ? product.discount_price 
      : product.price;

    const variantPrice = variant && variant.price_override !== null && variant.price_override !== undefined
      ? variant.price_override
      : 0;

    const extrasPrice = extras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = basePrice + variantPrice + extrasPrice;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartId === cartId);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += 1;
        newCart[existingIndex].totalPrice = newCart[existingIndex].quantity * unitPrice;
        showNotification(`Added another ${product.name} to cart`, "success");
        return newCart;
      }

      showNotification(`Added ${product.name} to cart`, "success");
      return [
        ...prevCart,
        {
          cartId,
          product,
          quantity: 1,
          selectedVariant: variant,
          selectedExtras: extras,
          unitPrice,
          totalPrice: unitPrice
        }
      ];
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const updateCartQuantity = (cartId: string, amount: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.cartId === cartId) {
          const newQty = item.quantity + amount;
          if (newQty <= 0) return null;
          
          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitPrice
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        currentView,
        setView,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        selectedCustomer,
        setSelectedCustomer,
        products,
        categories,
        customers,
        refreshData,
        latestOrderId,
        setLatestOrderId,
        handleLogin,
        handleLogout,
        notifications,
        showNotification,
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
