"""Fixed cost model."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import TIMESTAMP, CheckConstraint, Column, Date, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func

from app.core.database import Base


class FixedCost(Base):
    """Fixed cost model for monthly fixed costs."""

    __tablename__ = "fixed_costs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    year_month = Column(Date, unique=True, nullable=False, index=True)
    amount = Column(
        Numeric(14, 2),
        CheckConstraint("amount >= 0"),
        nullable=False,
    )
    category = Column(String(100), nullable=False, default="固定費")
    breakdown = Column(JSONB, default=dict)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:
        return f"<FixedCost {self.year_month}: {self.amount}>"
