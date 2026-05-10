from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    Enum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database import Base


class AlertSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AlertStatus(str, enum.Enum):
    active = "active"
    acknowledged = "acknowledged"
    resolved = "resolved"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    store_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # relationships
    products = relationship("Product", back_populates="owner")
    alerts = relationship("Alert", back_populates="user")
    ai_insights = relationship("AIInsight", back_populates="user")
    sales = relationship("Sale", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    barcode = Column(String(100), unique=True, index=True, nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    supplier_name = Column(String(255), nullable=True)
    supplier_contact = Column(String(255), nullable=True)
    unit_cost = Column(Float, default=0.0)
    unit_price = Column(Float, default=0.0)
    current_stock = Column(Integer, default=0)
    min_threshold = Column(Integer, default=0)
    reorder_quantity = Column(Integer, default=0)
    lead_time_days = Column(Integer, default=7)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="products")
    sales = relationship("Sale", back_populates="product")
    forecasts = relationship("Forecast", back_populates="product")
    forecast_summary = relationship("ForecastSummary", back_populates="product", uselist=False)
    reorder_recommendations = relationship("ReorderRecommendation", back_populates="product")
    alerts = relationship("Alert", back_populates="product")


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    sale_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    channel = Column(String(100), nullable=True)  # e.g. online, in-store
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="sales")
    product = relationship("Product", back_populates="sales")


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    forecast_date = Column(DateTime(timezone=True), nullable=False)
    predicted_quantity = Column(Float, nullable=False)
    confidence_lower = Column(Float, nullable=True)
    confidence_upper = Column(Float, nullable=True)
    model_type = Column(String(100), nullable=True)  # e.g. ARIMA, Prophet, LLM
    accuracy_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="forecasts")


class ForecastSummary(Base):
    __tablename__ = "forecast_summaries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, unique=True)
    demand_7_day = Column(Float, default=0.0)
    demand_30_day = Column(Float, default=0.0)
    stockout_probability = Column(Float, default=0.0)
    overstock_probability = Column(Float, default=0.0)
    recommended_reorder_quantity = Column(Integer, default=0)
    demand_trend = Column(String(50), default="stable")
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    product = relationship("Product", back_populates="forecast_summary")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(Enum(AlertSeverity), default=AlertSeverity.medium)
    status = Column(Enum(AlertStatus), default=AlertStatus.active)
    alert_type = Column(String(100), nullable=True)  # e.g. low_stock, anomaly, forecast
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="alerts")
    product = relationship("Product", back_populates="alerts")


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    insight_type = Column(String(100), nullable=False)  # e.g. trend, anomaly, recommendation
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    data_snapshot = Column(Text, nullable=True)  # JSON blob of relevant data
    confidence_score = Column(Float, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="ai_insights")


class ReorderRecommendation(Base):
    __tablename__ = "reorder_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    recommended_quantity = Column(Integer, nullable=False)
    recommended_order_date = Column(DateTime(timezone=True), nullable=False)
    estimated_stockout_date = Column(DateTime(timezone=True), nullable=True)
    urgency = Column(String(50), default="low")
    priority_score = Column(Float, default=0.0)
    reasoning = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="reorder_recommendations")
