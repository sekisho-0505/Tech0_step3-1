from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


MARGIN_PRESETS = [Decimal("0.10"), Decimal("0.15"), Decimal("0.20"), Decimal("0.25"), Decimal("0.30")]


def round_jpy(value: Decimal) -> int:
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def round_rate(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)


class PriceSimulationRequest(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=200)
    unit_cost_per_kg: Decimal = Field(..., gt=Decimal("0"))
    target_margin_rate: Decimal = Field(..., ge=Decimal("0"), lt=Decimal("1"))
    quantity_kg: Optional[Decimal] = Field(default=None, ge=Decimal("0"))

    @field_validator("target_margin_rate")
    @classmethod
    def validate_margin(cls, value: Decimal) -> Decimal:
        if value >= Decimal("1"):
            raise ValueError("target_margin_rate must be less than 1.0")
        if value > Decimal("0.90"):
            raise ValueError("target_margin_rate must be 0.90 or less")
        return value


class GuardInfo(BaseModel):
    minimum_price_per_kg: int
    is_below_min: bool
    message: str


class PricePattern(BaseModel):
    margin_rate: Decimal
    price_per_kg: int
    profit_per_kg: int


class PriceSimulationResponse(BaseModel):
    recommended_price_per_kg: int
    gross_profit_per_kg: int
    margin_rate: Decimal
    price_patterns: List[PricePattern]
    guard: GuardInfo

    @field_validator("margin_rate")
    @classmethod
    def _round_margin_rate(cls, value: Decimal) -> Decimal:
        return round_rate(value)
