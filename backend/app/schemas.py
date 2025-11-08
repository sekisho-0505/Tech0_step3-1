from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# 価格パターンのプリセット（10%, 15%, 20%, 25%, 30%）
MARGIN_PRESETS = [Decimal("0.10"), Decimal("0.15"), Decimal("0.20"), Decimal("0.25"), Decimal("0.30")]

# バリデーション規則（要件定義書v2.0準拠）
MARGIN_RATE_MIN = Decimal("0.0")
MARGIN_RATE_MAX = Decimal("0.9")
UNIT_COST_MIN = Decimal("0.01")
UNIT_COST_MAX = Decimal("999999999.999")
QUANTITY_MIN = Decimal("0.0")
QUANTITY_MAX = Decimal("999999999.999")


def round_jpy(value: Decimal) -> int:
    """金額の丸め（円、整数）- 四捨五入（ROUND_HALF_UP）"""
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def round_rate(value: Decimal) -> Decimal:
    """率の丸め（小数第4位）- 四捨五入（ROUND_HALF_UP）"""
    return value.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)


class PriceSimulationRequest(BaseModel):
    """価格シミュレーション入力モデル（要件定義書v2.0準拠）"""

    product_name: str = Field(..., min_length=1, max_length=200, description="商品名")
    unit_cost_per_kg: Decimal = Field(
        ..., gt=UNIT_COST_MIN - Decimal("0.01"), le=UNIT_COST_MAX, description="原価（円/kg）"
    )
    target_margin_rate: Decimal = Field(
        ..., ge=MARGIN_RATE_MIN, lt=Decimal("1"), description="目標粗利率（0.0〜0.9）"
    )
    quantity_kg: Optional[Decimal] = Field(
        default=None, ge=QUANTITY_MIN, le=QUANTITY_MAX, description="数量（kg）"
    )

    @field_validator("target_margin_rate")
    @classmethod
    def validate_margin(cls, value: Decimal) -> Decimal:
        """粗利率のバリデーション（要件定義書：0〜90%）"""
        if value >= Decimal("1"):
            raise ValueError("粗利率は100%未満である必要があります")
        if value > MARGIN_RATE_MAX:
            raise ValueError(f"粗利率は{MARGIN_RATE_MAX * 100}%以下である必要があります")
        return value


class GuardInfo(BaseModel):
    """最低売価ガード情報"""

    minimum_price_per_kg: int = Field(..., description="最低許容価格（円/kg）")
    is_below_min: bool = Field(..., description="最低価格を下回っているかどうか")
    message: str = Field(..., description="ガードメッセージ")


class PricePattern(BaseModel):
    """価格パターン（異なる粗利率での計算結果）"""

    margin_rate: Decimal = Field(..., description="粗利率")
    price_per_kg: int = Field(..., description="販売価格（円/kg）")
    profit_per_kg: int = Field(..., description="粗利益（円/kg）")


class PriceSimulationResponse(BaseModel):
    """価格シミュレーション結果（要件定義書v2.0準拠）"""

    recommended_price_per_kg: int = Field(..., description="推奨販売価格（円/kg）")
    gross_profit_per_kg: int = Field(..., description="粗利益（円/kg）")
    gross_profit_total: Optional[int] = Field(None, description="総粗利益（円）")
    margin_rate: Decimal = Field(..., description="粗利率")
    price_patterns: List[PricePattern] = Field(..., description="価格パターン一覧")
    guard: GuardInfo = Field(..., description="最低売価ガード情報")

    @field_validator("margin_rate")
    @classmethod
    def _round_margin_rate(cls, value: Decimal) -> Decimal:
        """粗利率を小数第4位で四捨五入"""
        return round_rate(value)
