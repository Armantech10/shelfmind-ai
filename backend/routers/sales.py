from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
import pandas as pd
from io import StringIO
import traceback

from database import get_db
import models
from auth import get_current_user
from ml_forecasting import process_all_products
from database import SessionLocal

router = APIRouter(prefix="/api/sales", tags=["sales"])

def run_ml_pipeline(user_id: int):
    # Create a fresh DB session for background task
    db = SessionLocal()
    try:
        process_all_products(db, user_id)
    except Exception as e:
        print("ML Background Task Error:", e)
    finally:
        db.close()

@router.post("/upload")
async def upload_sales_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        content = await file.read()
        df = pd.read_csv(StringIO(content.decode('utf-8')))
        
        # Validate columns
        required_cols = {'date', 'product_name', 'quantity_sold', 'revenue'}
        if not required_cols.issubset(set(df.columns)):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_cols}")

        df = df.dropna(subset=['date', 'product_name', 'quantity_sold'])
        
        # Convert date safely
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df.dropna(subset=['date'])

        # Group by product name for processing
        product_names = df['product_name'].unique()
        
        # Cache existing products
        existing_products = db.query(models.Product).filter(models.Product.owner_id == current_user.id).all()
        prod_map = {p.name: p for p in existing_products}

        sales_to_insert = []
        for name in product_names:
            if name not in prod_map:
                # Create missing product
                new_product = models.Product(
                    owner_id=current_user.id,
                    name=name,
                    sku=f"{name.replace(' ', '-').upper()}-{current_user.id}-SKU",
                    category="Uncategorized"
                )
                db.add(new_product)
                db.flush() # get id
                prod_map[name] = new_product

            prod = prod_map[name]
            prod_df = df[df['product_name'] == name]
            
            for _, row in prod_df.iterrows():
                qty = int(row['quantity_sold'])
                rev = float(row['revenue'])
                sales_to_insert.append(models.Sale(
                    user_id=current_user.id,
                    product_id=prod.id,
                    quantity=qty,
                    unit_price=rev / max(1, qty),
                    total_amount=rev,
                    sale_date=row['date']
                ))

        db.bulk_save_objects(sales_to_insert)
        db.commit()

        # Trigger ML pipeline in background using a fresh session wrapper
        background_tasks.add_task(run_ml_pipeline, current_user.id)

        return {
            "status": "success", 
            "message": f"Successfully uploaded {len(sales_to_insert)} records.", 
            "products_updated": len(product_names)
        }

    except Exception as e:
        db.rollback()
        print("Upload Error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
