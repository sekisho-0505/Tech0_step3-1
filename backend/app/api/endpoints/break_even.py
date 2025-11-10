"""Break-even analysis endpoints."""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models import FixedCost, SalesData
from app.schemas import BreakEvenResponse, round_jpy, round_rate

router = APIRouter()


@router.get("/current", response_model=BreakEvenResponse)
def get_current_break_even(
    year_month: str = Query(None, description="対象年月（YYYY-MM形式）"),
    db: Session = Depends(get_db),
):
    """
    現在の損益分岐点情報を取得

    Args:
        year_month: 対象年月（指定しない場合は当月）
        db: データベースセッション

    Returns:
        損益分岐点分析結果
    """
    try:
        # 対象年月の決定
        if year_month:
            target_date = datetime.strptime(year_month, "%Y-%m").date()
        else:
            target_date = date.today().replace(day=1)

        target_year = target_date.year
        target_month = target_date.month

        # 固定費の取得
        fixed_cost = (
            db.query(FixedCost)
            .filter(
                extract("year", FixedCost.year_month) == target_year,
                extract("month", FixedCost.year_month) == target_month,
            )
            .first()
        )

        if not fixed_cost:
            # 固定費データがない場合はデフォルト値を使用
            fixed_cost_amount = Decimal("4000000")  # デフォルト400万円
        else:
            fixed_cost_amount = fixed_cost.amount

        # 売上データの集計
        sales_summary = (
            db.query(
                func.sum(SalesData.quantity_kg * SalesData.unit_price_per_kg).label("revenue"),
                func.sum(SalesData.quantity_kg * SalesData.unit_cost_per_kg).label("cost"),
            )
            .filter(
                extract("year", SalesData.sale_date) == target_year,
                extract("month", SalesData.sale_date) == target_month,
            )
            .first()
        )

        # 売上データがない場合のデフォルト値
        revenue = sales_summary.revenue or Decimal("0")
        variable_cost = sales_summary.cost or Decimal("0")

        # 変動費率と粗利率の計算
        if revenue > 0:
            variable_cost_rate = round_rate(variable_cost / revenue)
            gross_profit = revenue - variable_cost
            gross_margin_rate = round_rate(gross_profit / revenue)
        else:
            variable_cost_rate = Decimal("0.75")  # デフォルト75%
            gross_margin_rate = Decimal("0.25")  # デフォルト25%

        # 損益分岐点の計算
        if gross_margin_rate > 0:
            break_even_revenue = round_jpy(fixed_cost_amount / gross_margin_rate)
        else:
            break_even_revenue = 0

        # 達成率の計算
        if break_even_revenue > 0:
            achievement_rate = round_rate(revenue / Decimal(break_even_revenue))
        else:
            achievement_rate = Decimal("0")

        # 差額の計算
        delta_revenue = round_jpy(revenue - Decimal(break_even_revenue))

        # ステータスの判定
        if achievement_rate >= Decimal("1.5"):
            status = "safe"
        elif achievement_rate >= Decimal("1.0"):
            status = "warning"
        else:
            status = "danger"

        return BreakEvenResponse(
            year_month=target_date.strftime("%Y-%m"),
            fixed_costs=round_jpy(fixed_cost_amount),
            current_revenue=round_jpy(revenue),
            variable_cost_rate=variable_cost_rate,
            gross_margin_rate=gross_margin_rate,
            break_even_revenue=break_even_revenue,
            achievement_rate=achievement_rate,
            delta_revenue=delta_revenue,
            status=status,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "INVALID_PARAM", "message": "年月の形式が不正です（YYYY-MM形式で指定してください）"}},
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"error": {"code": "DATABASE_ERROR", "message": str(e)}},
        )
