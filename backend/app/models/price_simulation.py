"""Price simulation model."""
from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    JSON,
    TIMESTAMP,
    CheckConstraint,
    Column,
    Enum,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class PriceSimulation(Base):
    """Price simulation model for storing simulation results."""

    __tablename__ = "price_simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"))
    simulation_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    input_cost_per_kg = Column(
        Numeric(14, 3),
        CheckConstraint("input_cost_per_kg > 0"),
        nullable=False,
    )
    target_margin_rate = Column(
        Numeric(6, 4),
        CheckConstraint("target_margin_rate >= 0 AND target_margin_rate < 1"),
        nullable=False,
    )
    calculated_price_per_kg = Column(Numeric(14, 3), nullable=False)
    selected_price_per_kg = Column(Numeric(14, 3))
    quantity_kg = Column(Numeric(14, 3), CheckConstraint("quantity_kg >= 0"))
    gross_profit_total = Column(Numeric(16, 2))
    parameters = Column(JSONB, default=dict)
    status = Column(
        Enum("draft", "approved", "rejected", name="price_status"),
        default="draft",
    )
    notes = Column(Text)
    created_by = Column(String(100))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    # Relationships
    product = relationship("Product", back_populates="price_simulations")

    def __repr__(self) -> str:
        return f"<PriceSimulation {self.id} for product {self.product_id}>"
