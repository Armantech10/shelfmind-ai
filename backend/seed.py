import os
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from auth import get_password_hash

def seed_data():
    db = SessionLocal()
    try:
        # 1. Create Demo User
        demo_email = "demo@shelfmind.ai"
        user = db.query(models.User).filter(models.User.email == demo_email).first()
        if not user:
            user = models.User(
                email=demo_email,
                full_name="Demo Manager",
                hashed_password=get_password_hash("Demo@123"),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created demo user: {demo_email}")
        else:
            print(f"Demo user {demo_email} already exists.")

        # 2. Add Products
        categories = ["Beverages", "Snacks", "Dairy", "Grains", "Personal Care"]
        product_templates = [
            ("Cold Brew Coffee", "Beverages", 4.5, 7.0),
            ("Green Tea 20pk", "Beverages", 3.0, 5.5),
            ("Organic Almond Milk", "Dairy", 2.5, 4.9),
            ("Greek Yogurt Plain", "Dairy", 1.5, 3.5),
            ("Sea Salt Chips", "Snacks", 1.2, 2.5),
            ("Protein Bar Chocolate", "Snacks", 1.8, 3.0),
            ("Quinoa 1kg", "Grains", 4.0, 8.5),
            ("Basmati Rice 5kg", "Grains", 8.0, 15.0),
            ("Hand Sanitizer", "Personal Care", 2.0, 5.0),
            ("Bamboo Toothbrush", "Personal Care", 1.0, 3.0),
            ("Oat Milk", "Dairy", 2.2, 4.5),
            ("Sparkling Water 6pk", "Beverages", 2.5, 5.0),
            ("Kettle Cooked Chips", "Snacks", 1.5, 3.5),
            ("Brown Rice 2kg", "Grains", 3.5, 7.0),
            ("Liquid Hand Soap", "Personal Care", 2.5, 6.0)
        ]

        products = []
        for name, cat, cost, price in product_templates:
            sku = f"SKU-{cat[:3].upper()}-{name[:3].upper()}-{random.randint(100, 999)}"
            existing = db.query(models.Product).filter(models.Product.sku == sku).first()
            if not existing:
                # Some products below threshold
                threshold = random.randint(20, 50)
                stock = random.randint(5, 100)
                
                # Some expiring soon
                expiry = None
                if random.random() < 0.2:
                    expiry = datetime.now() + timedelta(days=random.randint(2, 10))

                product = models.Product(
                    owner_id=user.id,
                    sku=sku,
                    name=name,
                    category=cat,
                    unit_cost=cost,
                    unit_price=price,
                    current_stock=stock,
                    min_threshold=threshold,
                    expiry_date=expiry,
                    supplier_name="Global Retailers Inc."
                )
                db.add(product)
                products.append(product)
        
        db.commit()
        print(f"Added {len(products)} products.")

        # 3. Add Sales Data (90 days)
        all_products = db.query(models.Product).filter(models.Product.owner_id == user.id).all()
        sales_count = 0
        for product in all_products:
            # Skip if product already has sales
            if db.query(models.Sale).filter(models.Sale.product_id == product.id).first():
                continue

            for day in range(90):
                date = datetime.now() - timedelta(days=day)
                
                # Weekend spikes (Friday=4, Saturday=5, Sunday=6)
                base_qty = random.randint(2, 15)
                if date.weekday() in [4, 5, 6]:
                    base_qty = int(base_qty * 1.5)
                
                if base_qty > 0:
                    sale = models.Sale(
                        user_id=user.id,
                        product_id=product.id,
                        quantity=base_qty,
                        unit_price=product.unit_price,
                        total_amount=base_qty * product.unit_price,
                        sale_date=date
                    )
                    db.add(sale)
                    sales_count += 1
            
        db.commit()
        print(f"Added {sales_count} sales records.")

        # 4. Generate Initial Data (ForecastSummaries, Alerts, Insights, Recommendations)
        for product in all_products:
            # Forecast Summary
            if not db.query(models.ForecastSummary).filter(models.ForecastSummary.product_id == product.id).first():
                summary = models.ForecastSummary(
                    user_id=user.id,
                    product_id=product.id,
                    demand_7_day=random.uniform(50, 200),
                    demand_30_day=random.uniform(200, 800),
                    stockout_probability=0.85 if product.current_stock < product.min_threshold else 0.05,
                    demand_trend="increasing" if random.random() > 0.5 else "stable",
                    confidence_score=0.92
                )
                db.add(summary)

            # Alerts
            if product.current_stock < product.min_threshold:
                alert = models.Alert(
                    user_id=user.id,
                    product_id=product.id,
                    title="Low Stock Warning",
                    message=f"Stock for {product.name} ({product.current_stock}) is below threshold ({product.min_threshold}).",
                    severity=models.AlertSeverity.high,
                    alert_type="low_stock"
                )
                db.add(alert)
            
            if product.expiry_date and (product.expiry_date - datetime.now()).days < 7:
                alert = models.Alert(
                    user_id=user.id,
                    product_id=product.id,
                    title="Expiry Alert",
                    message=f"{product.name} is expiring on {product.expiry_date.strftime('%Y-%m-%d')}.",
                    severity=models.AlertSeverity.critical,
                    alert_type="expiry"
                )
                db.add(alert)

            # Recommendations
            if product.current_stock < product.min_threshold:
                rec = models.ReorderRecommendation(
                    product_id=product.id,
                    recommended_quantity=product.min_threshold * 2,
                    recommended_order_date=datetime.now(),
                    urgency="high" if product.current_stock < 10 else "medium",
                    priority_score=0.9,
                    reasoning=f"Current stock {product.current_stock} is critically low relative to 7-day projected demand."
                )
                db.add(rec)

        # AI Insights
        insight = models.AIInsight(
            user_id=user.id,
            insight_type="trend",
            title="Beverage Category Growth",
            content="Sales in the Beverages category have increased by 15% over the last 14 days, primarily driven by cold brew coffee sales during weekends."
        )
        db.add(insight)

        db.commit()
        print("✅ Seed complete. Login: demo@shelfmind.ai / Demo@123")

    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
