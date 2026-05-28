const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://shelfmind-ai.onrender.com";

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
  };
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
const data = await res.json();

localStorage.setItem("token", data.access_token);

return data;
}

export async function apiRegister(
  email: string,
  password: string,
  full_name: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function apiGetMe() {
  const res = await fetch(`${API_URL}/api/auth/me`);
  if (!res.ok) return null;
  return res.json();
}

export async function apiLogout() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
  });
  return res.json();
}

// ── Products ─────────────────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  category?: string;
  supplier_name?: string;
  supplier_contact?: string;
  current_stock: number;
  min_threshold: number;
  unit_price: number;
  expiry_date?: string;
  created_at?: string;
}

export interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export async function getProducts(search?: string, category?: string, page = 1, pageSize = 10): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  params.append("page", page.toString());
  params.append("page_size", pageSize.toString());

  const res = await fetch(`${API_URL}/api/products?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_URL}/api/products/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create product");
  }
  return res.json();
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update product");
  }
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete product");
}

// ── Sales & Forecasts ────────────────────────────────────────────────────────

export async function uploadSalesCSV(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/sales/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export interface ForecastSummary {
  product_id: number;
  demand_7_day: number;
  demand_30_day: number;
  stockout_probability: number;
  overstock_probability: number;
  recommended_reorder_quantity: number;
  demand_trend: string;
  confidence_score: number;
}

export interface ForecastDaily {
  id: number;
  forecast_date: string;
  predicted_quantity: number;
  confidence_lower: number;
  confidence_upper: number;
}

export interface ForecastResponse {
  product: Product;
  summary: ForecastSummary | null;
  daily_forecasts: ForecastDaily[];
  historical_sales: { date: string; quantity: number }[];
}

export async function getAllForecasts(): Promise<ForecastResponse[]> {
  const res = await fetch(`${API_URL}/api/forecasts`);
  if (!res.ok) throw new Error("Failed to fetch forecasts");
  return res.json();
}

export async function getProductForecast(productId: number): Promise<ForecastResponse> {
  const res = await fetch(`${API_URL}/api/forecasts/${productId}`);
  if (!res.ok) throw new Error("Failed to fetch product forecast");
  return res.json();
}

// ── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  total_products: number;
  low_stock_count: number;
  total_revenue_30d: number;
  weekly_sales: number;
  predicted_demand_next_7d: number;
  forecast_accuracy_score: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
}

export interface TopProduct {
  product_id: number;
  name: string;
  quantity_sold: number;
  revenue: number;
}

export interface InventoryTurnover {
  product_id: number;
  name: string;
  turnover_ratio: number;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_URL}/api/analytics/summary`);
  if (!res.ok) throw new Error("Failed to fetch analytics summary");
  return res.json();
}

export async function getRevenueTrend(): Promise<RevenueTrend[]> {
  const res = await fetch(`${API_URL}/api/analytics/revenue-trend`);
  if (!res.ok) throw new Error("Failed to fetch revenue trend");
  return res.json();
}

export async function getTopProducts(): Promise<TopProduct[]> {
  const res = await fetch(`${API_URL}/api/analytics/top-products`);
  if (!res.ok) throw new Error("Failed to fetch top products");
  return res.json();
}

export async function getSlowMovers(): Promise<TopProduct[]> {
  const res = await fetch(`${API_URL}/api/analytics/slow-movers`);
  if (!res.ok) throw new Error("Failed to fetch slow movers");
  return res.json();
}

export async function getInventoryTurnover(): Promise<InventoryTurnover[]> {
  const res = await fetch(`${API_URL}/api/analytics/inventory-turnover`);
  if (!res.ok) throw new Error("Failed to fetch inventory turnover");
  return res.json();
}

// ── AI Insights & Recommendations ────────────────────────────────────────────

export interface AIInsight {
  id: number;
  insight_type: string;
  title: string;
  content: string;
  created_at: string;
}

export interface ReorderRecommendation {
  id: number;
  product_id: number;
  product: Product;
  recommended_quantity: number;
  recommended_order_date: string;
  estimated_stockout_date?: string;
  urgency: string;
  priority_score: number;
  reasoning: string;
  is_approved: boolean;
}

export async function generateInsights(): Promise<AIInsight[]> {
  const res = await fetch(`${API_URL}/api/insights/generate`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to generate insights");
  }
  return res.json();
}

export async function getInsights(): Promise<AIInsight[]> {
  const res = await fetch(`${API_URL}/api/insights`);
  if (!res.ok) throw new Error("Failed to fetch insights");
  return res.json();
}

export async function generateRecommendations(): Promise<ReorderRecommendation[]> {
  const res = await fetch(`${API_URL}/api/recommendations/generate`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to generate recommendations");
  return res.json();
}

export async function getRecommendations(): Promise<ReorderRecommendation[]> {
  const res = await fetch(`${API_URL}/api/recommendations`);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
}

export async function approveRecommendation(id: number): Promise<{status: string, message: string}> {
  const res = await fetch(`${API_URL}/api/recommendations/${id}/approve`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to approve recommendation");
  return res.json();
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function sendChatMessage(message: string, history: ChatMessage[]): Promise<string> {
const res = await fetch(`${API_URL}/api/assistant`, {
    method: "POST",
    headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`,
},
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to chat with AI");
  }
  const data = await res.json();
  return data.reply;
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export interface Alert {
  id: number;
  product_id?: number;
  product?: Product;
  title: string;
  message: string;
  severity: string;
  status: string;
  alert_type: string;
  created_at: string;
  acknowledged_at?: string;
}

export async function getAlerts(): Promise<Alert[]> {
  const res = await fetch(`${API_URL}/api/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function scanAlerts(): Promise<{status: string}> {
  const res = await fetch(`${API_URL}/api/alerts/scan`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to scan alerts");
  return res.json();
}

export async function markAlertAsRead(id: number): Promise<{status: string}> {
  const res = await fetch(`${API_URL}/api/alerts/${id}/read`, { method: "PUT" });
  if (!res.ok) throw new Error("Failed to mark alert as read");
  return res.json();
}
