"""Product endpoints."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import Product
from app.schemas import ProductListResponse

router = APIRouter()


@router.get("/list", response_model=List[ProductListResponse])
def get_product_list(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """
    商品リストを取得

    Args:
        limit: 取得件数
        offset: オフセット
        db: データベースセッション

    Returns:
        商品リスト
    """
    try:
        products = (
            db.query(Product)
            .filter(Product.is_active == True)
            .order_by(Product.product_name)
            .limit(limit)
            .offset(offset)
            .all()
        )

        return [
            ProductListResponse(
                id=str(product.id),
                product_code=product.product_code,
                product_name=product.product_name,
                unit_cost_per_kg=product.unit_cost_per_kg,
                unit_price_per_kg=product.unit_price_per_kg,
            )
            for product in products
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": {"code": "DATABASE_ERROR", "message": str(e)}},
        )
