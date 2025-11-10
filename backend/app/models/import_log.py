"""Import log model."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import TIMESTAMP, Column, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func

from app.core.database import Base


class ImportLog(Base):
    """Import log model for tracking data imports."""

    __tablename__ = "import_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    import_type = Column(String(50), nullable=False)
    file_name = Column(String(255))
    total_rows = Column(Integer)
    imported_rows = Column(Integer)
    skipped_rows = Column(Integer)
    error_details = Column(JSONB)
    imported_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<ImportLog {self.import_type}: {self.file_name}>"
