from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional


class BehavioralQuestion(BaseModel):
    question: str
    category: str
    explanation: str

class TechnicalQuestion(BaseModel):
    question: str
    skill_area: str
    explanation: str

class InterviewPreparation(BaseModel):
    job_title: str
    industry: str
    experience_level: str
    behavioral_questions: List[BehavioralQuestion]
    technical_questions: List[TechnicalQuestion]
    additional_notes: str


# Define the tag types as an enumeration
class TagType(str, Enum):
    MUST_SAY = "must-say"
    GOOD = "good"
    UNNECESSARY = "unnecessary"
    SHOULD_BE_AVOIDED = "should-be-avoided"

# Model for each tagged phrase
class TaggedPhrase(BaseModel):
    phrase: str
    type: TagType
    comment: str

# Main feedback model with alias for JSON keys
class Feedback(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    summary_of_strengths: str = Field(alias="Summary of Strengths")
    areas_for_improvement: str = Field(alias="Areas for Improvement")
    specific_suggestions: List[str] = Field(alias="Specific Suggestions")
    practice_exercises: List[str] = Field(alias="Practice Exercises")
    encouragement: str = Field(alias="Encouragement")
    tagged_answer: List[TaggedPhrase] = Field(alias="tagged_answer")
