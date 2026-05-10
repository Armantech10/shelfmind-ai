import pandas as pd
import numpy as np
from datetime import datetime, timedelta

np.random.seed(42)

products = ["MacBook Pro", "iPhone 15", "AirPods Max"]
base_demand = [10, 50, 20]
trend = [0.1, 0.5, -0.2]

dates = [datetime.utcnow() - timedelta(days=i) for i in range(90)]
dates.reverse()

data = []
for idx, d in enumerate(dates):
    for i, p in enumerate(products):
        # Base + trend + weekly seasonality + noise
        qty = base_demand[i] + trend[i] * idx + np.sin(idx * (2 * np.pi / 7)) * 5 + np.random.normal(0, 2)
        qty = max(1, int(qty))
        
        price = 1999 if p == "MacBook Pro" else (999 if p == "iPhone 15" else 549)
        rev = qty * price
        
        data.append({
            "date": d.strftime("%Y-%m-%d"),
            "product_name": p,
            "quantity_sold": qty,
            "revenue": rev
        })

df = pd.DataFrame(data)
df.to_csv("scratch/sales_data.csv", index=False)
print("Created scratch/sales_data.csv with", len(df), "rows.")
