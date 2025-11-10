"""Break-even analysis model."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    TIMESTAMP,
    Column,
    Date,
    Enum,
    Numeric,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base


class BreakEvenAnalysis(Base):
    """Break-even analysis model for monthly calculations."""

    __tablename__ = "break_even_analysis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    year_month = Column(Date, nullable=False, index=True)
    fixed_cost = Column(Numeric(14, 2), nullable=False)
    total_revenue = Column(Numeric(16, 2), nullable=False)
    total_variable_cost = Column(Numeric(16, 2), nullable=False)
    variable_cost_rate = Column(Numeric(6, 4), nullable=False)
    gross_margin_rate = Column(Numeric(6, 4), nullable=False)
    break_even_revenue = Column(Numeric(16, 2), nullable=False)
    actual_revenue = Column(Numeric(16, 2))
    achievement_rate = Column(Numeric(6, 3))
    risk_level = Column(
        Enum("safe", "warning", "danger", name="risk_level"),
        nullable=False,
    )
    calculated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<BreakEvenAnalysis {self.year_month}: {self.break_even_revenue}>"
