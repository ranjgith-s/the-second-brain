from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
import uuid

class Note(SQLModel, table=True):
    id: Optional[uuid.UUID] = Field(default_factory=uuid.uuid4, primary_key=True)
    content: str
    category: str = Field(default="general")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Vector column will be added via raw SQL or specialized migration for now
    # or using pgvector-python's Vector type if integrated
