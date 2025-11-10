"""Monthly revenue model."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import TIMESTAMP, CheckConstraint, Column, Date, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base


class MonthlyRevenue(Base):
    """Monthly revenue model for tracking monthly total sales."""

    __tablename__ = "monthly_revenue"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    year_month = Column(Date, unique=True, nullable=False, index=True)
    total_revenue = Column(
        Numeric(16, 2),
        CheckConstraint("total_revenue >= 0"),
        nullable=False,
    )
    notes = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    def __repr__(self) -> str:
        return f"<MonthlyRevenue {self.year_month}: {self.total_revenue}>"
