"""Sales data model."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    TIMESTAMP,
    CheckConstraint,
    Column,
    Date,
    ForeignKey,
    Numeric,
    String,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class SalesData(Base):
    """Sales data model for tracking sales transactions."""

    __tablename__ = "sales_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    sale_date = Column(Date, nullable=False, index=True)
    quantity_kg = Column(
        Numeric(14, 3),
        CheckConstraint("quantity_kg > 0"),
        nullable=False,
    )
    unit_price_per_kg = Column(
        Numeric(14, 3),
        CheckConstraint("unit_price_per_kg > 0"),
        nullable=False,
    )
    unit_cost_per_kg = Column(
        Numeric(14, 3),
        CheckConstraint("unit_cost_per_kg > 0"),
        nullable=False,
    )
    customer_name = Column(String(200))
    invoice_number = Column(String(50))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationships
    product = relationship("Product", back_populates="sales_data")

    def __repr__(self) -> str:
        return f"<SalesData {self.id} on {self.sale_date}>"
