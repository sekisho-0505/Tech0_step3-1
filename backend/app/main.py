from __future__ import annotations

from decimal import Decimal, getcontext
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .api.endpoints import break_even, data_import, price_simulations, products
from .core.config import settings
from .core.database import Base, engine
from .schemas import (
    BreakEvenResponse,
    GuardInfo,
    ImportResponse,
    ImportError,
    ImportWarning,
    MARGIN_PRESETS,
    PricePattern,
    PriceSimulationRequest,
    PriceSimulationResponse,
    TrendData,
    round_jpy,
    round_rate,
)

getcontext().prec = 28

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# 現状は 5% の粗利率を最低売価としてガード
DEFAULT_MIN_MARGIN_RATE = Decimal("0.05")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def calculate_recommended_price(unit_cost: Decimal, target_margin_rate: Decimal) -> Decimal:
    if target_margin_rate >= Decimal("1"):
        raise ValueError("target_margin_rate must be less than 1.0")
    return unit_cost / (Decimal("1") - target_margin_rate)


@app.post("/api/price-simulations/calculate", response_model=PriceSimulationResponse)
def calculate_price_simulation(payload: PriceSimulationRequest) -> PriceSimulationResponse:
    """
    価格シミュレーションAPIエンドポイント

    要件定義書v2.0に基づいた価格計算を実行します。
    - 推奨価格 = 原価 / (1 - 目標粗利率)
    - 粗利益 = 推奨価格 - 原価
    - すべての計算で四捨五入（ROUND_HALF_UP）を適用
    """
    try:
        unit_cost = payload.unit_cost_per_kg
        target_margin_rate = payload.target_margin_rate
        recommended_price_decimal = calculate_recommended_price(unit_cost, target_margin_rate)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"error": {"code": "VALIDATION_ERROR", "message": str(exc)}},
        ) from exc

    # 推奨価格と粗利益の計算（円/kg単位で四捨五入）
    recommended_price = round_jpy(recommended_price_decimal)
    rounded_price_decimal = Decimal(recommended_price)
    gross_profit_decimal = rounded_price_decimal - unit_cost
    gross_profit = round_jpy(gross_profit_decimal)

    # 粗利率の計算（小数第4位まで）
    margin_rate = round_rate(gross_profit_decimal / rounded_price_decimal)

    # 総粗利益の計算（数量が指定されている場合）
    gross_profit_total = None
    if payload.quantity_kg is not None and payload.quantity_kg > Decimal("0"):
        gross_profit_total = round_jpy(gross_profit_decimal * payload.quantity_kg)

    # 5つの価格パターンを生成（10%, 15%, 20%, 25%, 30%）
    price_patterns = []
    for preset_margin in MARGIN_PRESETS:
        price_decimal = calculate_recommended_price(unit_cost, preset_margin)
        rounded_price = round_jpy(price_decimal)
        rounded_price_decimal = Decimal(rounded_price)
        price_patterns.append(
            PricePattern(
                margin_rate=round_rate(preset_margin),
                price_per_kg=rounded_price,
                profit_per_kg=round_jpy(rounded_price_decimal - unit_cost),
            )
        )

    # 最低売価ガード（5%マージンを最低ラインとする）
    minimum_price_decimal = calculate_recommended_price(unit_cost, DEFAULT_MIN_MARGIN_RATE)
    minimum_price = round_jpy(minimum_price_decimal)
    is_below_min = recommended_price < minimum_price
    guard_message = (
        "最低売価を下回っています"
        if is_below_min
        else "最低売価を満たしています"
    )

    guard = GuardInfo(
        minimum_price_per_kg=minimum_price,
        is_below_min=is_below_min,
        message=guard_message,
    )

    return PriceSimulationResponse(
        recommended_price_per_kg=recommended_price,
        gross_profit_per_kg=gross_profit,
        gross_profit_total=gross_profit_total,
        margin_rate=margin_rate,
        price_patterns=price_patterns,
        guard=guard,
    )


# Include API routers
app.include_router(price_simulations.router, prefix=f"{settings.API_V1_STR}/price-simulations", tags=["price-simulations"])
app.include_router(break_even.router, prefix=f"{settings.API_V1_STR}/break-even", tags=["break-even"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])
app.include_router(data_import.router, prefix=f"{settings.API_V1_STR}/data-import", tags=["data-import"])


@app.get("/")
def root() -> Dict[str, Any]:
    """APIルートエンドポイント - APIの情報を返す"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "price_simulations": f"{settings.API_V1_STR}/price-simulations",
            "break_even": f"{settings.API_V1_STR}/break-even",
            "products": f"{settings.API_V1_STR}/products",
            "data_import": f"{settings.API_V1_STR}/data-import",
        }
    }


@app.get("/health")
def health_check() -> Dict[str, Any]:
    return {"status": "ok"}


@app.get("/api/break-even/current", response_model=BreakEvenResponse)
def get_break_even_current(year_month: str | None = None) -> BreakEvenResponse:
    """
    損益分岐点情報取得APIエンドポイント

    現在の月の損益分岐点情報を返します。
    モックデータを返す実装です（後でデータベース連携を追加予定）。
    """
    from datetime import datetime

    # 年月が指定されていない場合は現在の年月を使用
    if year_month is None:
        year_month = datetime.now().strftime("%Y-%m")

    # モックデータ（要件定義書のサンプルデータを使用）
    fixed_costs = 4018000
    current_revenue = 25000000
    variable_cost_rate = Decimal("0.754")
    gross_margin_rate = Decimal("0.246")

    # 損益分岐点計算: 固定費 / 粗利率
    break_even_revenue = round_jpy(Decimal(fixed_costs) / gross_margin_rate)

    # 達成率計算: 現在売上 / 損益分岐点
    achievement_rate = round_rate(Decimal(current_revenue) / Decimal(break_even_revenue))

    # 差額計算
    delta_revenue = current_revenue - break_even_revenue

    # ステータス判定
    if achievement_rate >= Decimal("1.2"):
        status = "safe"
    elif achievement_rate >= Decimal("1.0"):
        status = "warning"
    else:
        status = "danger"

    # トレンドデータ（過去3ヶ月分のモックデータ）
    trend = [
        TrendData(month="2025-06", revenue=23207000, break_even=15069106),
        TrendData(month="2025-07", revenue=28722000, break_even=34235772),
        TrendData(month="2025-08", revenue=25000000, break_even=16341463),
    ]

    return BreakEvenResponse(
        year_month=year_month,
        fixed_costs=fixed_costs,
        current_revenue=current_revenue,
        variable_cost_rate=variable_cost_rate,
        gross_margin_rate=gross_margin_rate,
        break_even_revenue=break_even_revenue,
        achievement_rate=achievement_rate,
        delta_revenue=delta_revenue,
        status=status,
        trend=trend,
    )


@app.post("/api/import/excel", response_model=ImportResponse)
async def import_excel() -> ImportResponse:
    """
    ExcelインポートAPIエンドポイント

    Excelファイルからデータをインポートします。
    モック実装（後でファイルアップロード処理を追加予定）。
    """
    # モックレスポンス（要件定義書のサンプルデータを使用）
    return ImportResponse(
        success=True,
        imported=8,
        skipped=2,
        errors=[
            ImportError(
                row=3,
                column="C",
                value="abc",
                reason="数値でない値が入力されています",
            ),
            ImportError(
                row=7,
                column="D",
                value=-100,
                reason="負の値は許可されていません",
            ),
        ],
        warnings=[
            ImportWarning(
                row=5,
                message="利益率が5%未満です",
            ),
        ],
    )
