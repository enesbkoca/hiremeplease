from pydantic import BaseModel, UUID4, Field
from datetime import datetime
from enum import Enum


class DBQuestionType(str, Enum):
    BEHAVIORAL = "behavioral"
    TECHNICAL = "technical"


class JobDescriptionDB(BaseModel):
    id: UUID4
    title: str = None
    description: str
    user_id: UUID4 = Field(default_factory=None)  # Foreign key to auth.users.id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="created")


class QuestionDB(BaseModel):
    id: int
    created_at: datetime
    job_description_id: UUID4
    content: str
    type: DBQuestionType
    keyword: str = None
    explanation: str = None
