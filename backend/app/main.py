from __future__ import annotations

from decimal import Decimal, getcontext
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    GuardInfo,
    MARGIN_PRESETS,
    PricePattern,
    PriceSimulationRequest,
    PriceSimulationResponse,
    round_jpy,
    round_rate,
)

getcontext().prec = 28


app = FastAPI(title="Price Simulation API", version="1.0.0")

# 現状は 5% の粗利率を最低売価としてガード
DEFAULT_MIN_MARGIN_RATE = Decimal("0.05")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
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


@app.get("/health")
def health_check() -> Dict[str, Any]:
    return {"status": "ok"}
