"""Price simulation endpoints."""
from __future__ import annotations

import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import PriceSimulation, Product
from app.schemas import (
    PriceSimulationSaveRequest,
    PriceSimulationSaveResponse,
    SimulationHistoryResponse,
)

router = APIRouter()


@router.post("/save", response_model=PriceSimulationSaveResponse)
def save_price_simulation(
    payload: PriceSimulationSaveRequest,
    db: Session = Depends(get_db),
):
    """
    価格シミュレーション結果を保存

    Args:
        payload: シミュレーション保存データ
        db: データベースセッション

    Returns:
        保存結果
    """
    try:
        # 商品が存在するか確認（または新規作成）
        product = db.query(Product).filter(
            Product.product_name == payload.product_name
        ).first()

        if not product:
            # 商品が存在しない場合は新規作成
            product = Product(
                product_code=f"AUTO-{uuid.uuid4().hex[:8].upper()}",
                product_name=payload.product_name,
                unit_cost_per_kg=payload.input_cost_per_kg,
                target_margin_rate=payload.target_margin_rate,
            )
            db.add(product)
            db.flush()  # IDを取得するためにflush

        # シミュレーション結果を保存
        simulation = PriceSimulation(
            product_id=product.id,
            input_cost_per_kg=payload.input_cost_per_kg,
            target_margin_rate=payload.target_margin_rate,
            calculated_price_per_kg=payload.calculated_price_per_kg,
            selected_price_per_kg=payload.selected_price_per_kg or payload.calculated_price_per_kg,
            quantity_kg=payload.quantity_kg,
            gross_profit_total=payload.gross_profit_total,
            notes=payload.notes,
            status="draft",
        )

        db.add(simulation)
        db.commit()
        db.refresh(simulation)

        return PriceSimulationSaveResponse(
            id=str(simulation.id),
            message="シミュレーション結果を保存しました",
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail={"error": {"code": "DATABASE_ERROR", "message": str(e)}},
        )


@router.get("/history", response_model=List[SimulationHistoryResponse])
def get_simulation_history(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """
    シミュレーション履歴を取得

    Args:
        limit: 取得件数
        offset: オフセット
        db: データベースセッション

    Returns:
        シミュレーション履歴リスト
    """
    try:
        simulations = (
            db.query(PriceSimulation)
            .join(Product)
            .order_by(PriceSimulation.simulation_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        return [
            SimulationHistoryResponse(
                id=str(sim.id),
                product_name=sim.product.product_name,
                simulation_at=sim.simulation_at.isoformat(),
                input_cost_per_kg=sim.input_cost_per_kg,
                target_margin_rate=sim.target_margin_rate,
                calculated_price_per_kg=sim.calculated_price_per_kg,
                selected_price_per_kg=sim.selected_price_per_kg,
                status=sim.status,
            )
            for sim in simulations
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": {"code": "DATABASE_ERROR", "message": str(e)}},
        )
