from sqlalchemy.orm import Mapped, mapped_column
from database import Base

class ConnectionTest(Base):
    __tablename__ = "connection_test"

    id: Mapped[int] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(default="Connected")
