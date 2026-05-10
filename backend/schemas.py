from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Products ──────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    sku: str
    barcode: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    unit_cost: float = 0.0
    unit_price: float = 0.0
    current_stock: int = 0
    min_threshold: int = 0
    reorder_quantity: int = 0
    lead_time_days: int = 7
    expiry_date: Optional[datetime] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    supplier_name: Optional[str] = None
    supplier_contact: Optional[str] = None
    unit_cost: Optional[float] = None
    unit_price: Optional[float] = None
    current_stock: Optional[int] = None
    min_threshold: Optional[int] = None
    reorder_quantity: Optional[int] = None
    lead_time_days: Optional[int] = None
    expiry_date: Optional[datetime] = None


class ProductOut(ProductCreate):
    id: int
    owner_id: int
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ── Forecasts ─────────────────────────────────────────────────────────────────

class ForecastOut(BaseModel):
    id: int
    forecast_date: datetime
    predicted_quantity: float
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None

    class Config:
        from_attributes = True

class ForecastSummaryOut(BaseModel):
    product_id: int
    demand_7_day: float
    demand_30_day: float
    stockout_probability: float
    overstock_probability: float
    recommended_reorder_quantity: int
    demand_trend: str
    confidence_score: float

    class Config:
        from_attributes = True

class ProductForecastsResponse(BaseModel):
    product: ProductOut
    summary: Optional[ForecastSummaryOut] = None
    daily_forecasts: list[ForecastOut] = []
    historical_sales: list[dict] = []

# ── Analytics ─────────────────────────────────────────────────────────────────

class AnalyticsSummaryOut(BaseModel):
    total_products: int
    low_stock_count: int
    total_revenue_30d: float
    weekly_sales: float
    predicted_demand_next_7d: float
    forecast_accuracy_score: float

class RevenueTrendOut(BaseModel):
    date: str
    revenue: float

class TopProductOut(BaseModel):
    product_id: int
    name: str
    quantity_sold: int
    revenue: float

class InventoryTurnoverOut(BaseModel):
    product_id: int
    name: str
    turnover_ratio: float

# ── AI Insights & Recommendations ─────────────────────────────────────────────

class AIInsightOut(BaseModel):
    id: int
    insight_type: str
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReorderRecommendationOut(BaseModel):
    id: int
    product_id: int
    product: ProductOut
    recommended_quantity: int
    recommended_order_date: datetime
    urgency: str
    priority_score: float
    reasoning: Optional[str] = None
    is_approved: bool

    class Config:
        from_attributes = True

# ── AI Chat Assistant ─────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str # "user" or "model"
    text: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str

# ── Alerts ────────────────────────────────────────────────────────────────────

class AlertOut(BaseModel):
    id: int
    product_id: Optional[int]
    product: Optional[ProductOut]
    title: str
    message: str
    severity: str
    status: str
    alert_type: str
    created_at: datetime
    acknowledged_at: Optional[datetime]

    class Config:
        from_attributes = True
