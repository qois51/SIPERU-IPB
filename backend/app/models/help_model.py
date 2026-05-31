from database import Base
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

class HelpRequest(Base):
    __tablename__ = 'help_requests'
    
    id = Column(Integer, primary_key=True)
    nama = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    pesan = Column(Text, nullable=False)
    status = Column(String(20), default="Pending") # Pending, Replied
    reply = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
