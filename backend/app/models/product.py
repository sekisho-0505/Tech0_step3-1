"""Product model."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import TIMESTAMP, Boolean, CheckConstraint, Column, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Product(Base):
    """Product model representing items in the inventory."""

    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_code = Column(String(50), unique=True, nullable=False, index=True)
    product_name = Column(String(200), nullable=False)
    category = Column(String(100))
    unit_cost_per_kg = Column(
        Numeric(14, 3),
        CheckConstraint("unit_cost_per_kg > 0"),
        nullable=False,
    )
    unit_price_per_kg = Column(
        Numeric(14, 3),
        CheckConstraint("unit_price_per_kg > 0"),
    )
    target_margin_rate = Column(
        Numeric(6, 4),
        CheckConstraint("target_margin_rate >= 0 AND target_margin_rate < 1"),
    )
    min_margin_rate = Column(
        Numeric(6, 4),
        CheckConstraint("min_margin_rate >= 0 AND min_margin_rate < 1"),
    )
    unit = Column(String(10), default="kg")
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    price_simulations = relationship(
        "PriceSimulation",
        back_populates="product",
        cascade="all, delete-orphan",
    )
    sales_data = relationship(
        "SalesData",
        back_populates="product",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Product {self.product_code}: {self.product_name}>"
