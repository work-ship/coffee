const API_BASE_URL = "http://localhost:8000";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request(endpoint: string, options: RequestOptions = {}) {
  const token = localStorage.getItem("pos_token");
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = "An error occurred";
    try {
      const parsed = JSON.parse(errText);
      message = parsed.detail || message;
    } catch {
      message = errText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials: { username?: string; password?: string; pin?: string }) => {
    if (credentials.pin) {
      return request("/api/auth/login-pin", {
        method: "POST",
        body: JSON.stringify({ pin: credentials.pin }),
      });
    }
    
    // OAuth2 password form data
    const formData = new FormData();
    formData.append("username", credentials.username || "");
    formData.append("password", credentials.password || "");
    
    return request("/api/auth/login", {
      method: "POST",
      body: formData,
    });
  },
  
  getMe: () => request("/api/auth/me"),
  getEmployees: () => request("/api/auth/employees"),
  registerEmployee: (data: any) => request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  // Catalog
  getCategories: () => request("/api/catalog/categories"),
  createCategory: (data: any) => request("/api/catalog/categories", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  deleteCategory: (id: number) => request(`/api/catalog/categories/${id}`, {
    method: "DELETE",
  }),

  getProducts: (categoryId?: number, search?: string) => {
    let url = "/api/catalog/products";
    const params = new URLSearchParams();
    if (categoryId) params.append("category_id", categoryId.toString());
    if (search) params.append("q", search);
    const queryStr = params.toString();
    if (queryStr) url += `?${queryStr}`;
    return request(url);
  },
  createProduct: (data: any) => request("/api/catalog/products", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateProduct: (id: number, data: any) => request(`/api/catalog/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  deleteProduct: (id: number) => request(`/api/catalog/products/${id}`, {
    method: "DELETE",
  }),
  addProductVariant: (id: number, data: any) => request(`/api/catalog/products/${id}/variants`, {
    method: "POST",
    body: JSON.stringify(data),
  }),
  addProductExtra: (id: number, data: any) => request(`/api/catalog/products/${id}/extras`, {
    method: "POST",
    body: JSON.stringify(data),
  }),

  // Orders
  getOrders: () => request("/api/orders"),
  getOrder: (id: number) => request(`/api/orders/${id}`),
  createOrder: (data: any) => request("/api/orders", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  refundOrder: (id: number) => request(`/api/orders/${id}/refund`, {
    method: "POST",
  }),

  // Customers
  getCustomers: () => request("/api/customers"),
  createCustomer: (data: any) => request("/api/customers", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  updateCustomer: (id: number, data: any) => request(`/api/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),

  // Analytics
  getDashboardAnalytics: () => request("/api/analytics/dashboard"),
};
