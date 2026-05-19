from database import Base
from sqlalchemy import Column, Integer, String, Text
import bcrypt

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False) # mahasiswa, admin, satpam
    full_name = Column(String(100))
    nim_nip = Column(String(20))
    email = Column(String(100))
    profile_image = Column(Text)

    def set_password(self, password: str):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password: str):
        if self.password_hash.startswith(('scrypt:', 'pbkdf2:', 'sha256:', 'bcrypt:')):
            from werkzeug.security import check_password_hash
            return check_password_hash(self.password_hash, password)
        try:
            return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        except Exception:
            from werkzeug.security import check_password_hash
            try:
                return check_password_hash(self.password_hash, password)
            except Exception:
                return False

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "full_name": self.full_name,
            "nim_nip": self.nim_nip,
            "email": self.email,
            "profile_image": self.profile_image
        }
