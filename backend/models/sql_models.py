from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func
from core.sql_db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    sex = Column(String(10), nullable=True)
    goal = Column(String(100), nullable=True)
    activity_frequency = Column(Integer, nullable=True)
    activity_type = Column(String(50), nullable=True)
    activity_level = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
