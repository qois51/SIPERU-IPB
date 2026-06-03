from database import Base
from sqlalchemy import ForeignKey, String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import bcrypt

class User(Base):
    __tablename__ = "user"

    id_user: Mapped[int] = mapped_column(Integer, primary_key=True)
    nama: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    no_telepon: Mapped[str] = mapped_column(String(20), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "user",
    }

    # Compatibility properties for legacy routes and services
    @property
    def role(self) -> str:
        if self.type == "mahasiswa":
            return "mahasiswa"
        elif self.type == "pic_ruangan":
            return "pic"
        elif self.type == "penjaga_ruangan":
            return "satpam"
        else:
            if self.nama == "admin":
                return "admin"
            elif self.nama == "dosen":
                return "dosen"
            return "user"

    @property
    def username(self) -> str:
        return self.nama

    @property
    def full_name(self) -> str:
        return self.nama

    @property
    def nim_nip(self) -> str:
        return ""

    @property
    def phone(self) -> str:
        return self.no_telepon

    @property
    def id(self) -> int:
        return self.id_user

    def set_password(self, raw_password: str):
        salt = bcrypt.gensalt()
        self.password = bcrypt.hashpw(raw_password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, raw_password: str):
        if self.password.startswith(('scrypt:', 'pbkdf2:', 'sha256:', 'bcrypt:')):
            from werkzeug.security import check_password_hash
            return check_password_hash(self.password, raw_password)
        try:
            return bcrypt.checkpw(raw_password.encode('utf-8'), self.password.encode('utf-8'))
        except Exception:
            from werkzeug.security import check_password_hash
            try:
                return check_password_hash(self.password, raw_password)
            except Exception:
                return False

    def to_dict(self):
        return {
            "id_user": self.id_user,
            "nama": self.nama,
            "email": self.email,
            "no_telepon": self.no_telepon,
            "type": self.type,
            # Legacy fields
            "id": self.id_user,
            "username": self.nama,
            "full_name": self.nama,
            "email_str": self.email,
            "phone": self.no_telepon,
            "role": self.role,
            "nim_nip": self.nim_nip
        }


class Mahasiswa(User):
    __tablename__ = "mahasiswa"

    id_user: Mapped[int] = mapped_column(ForeignKey("user.id_user"), primary_key=True)
    nim: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)

    peminjamans: Mapped[List["Peminjaman"]] = relationship(back_populates="mahasiswa", cascade="all, delete-orphan")

    __mapper_args__ = {
        "polymorphic_identity": "mahasiswa",
    }

    @property
    def nim_nip(self) -> str:
        return self.nim

    def to_dict(self):
        d = super().to_dict()
        d.update({
            "nim": self.nim,
            "nim_nip": self.nim
        })
        return d


class PICRuangan(User):
    __tablename__ = "pic_ruangan"

    id_user: Mapped[int] = mapped_column(ForeignKey("user.id_user"), primary_key=True)
    nip: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    unit_kerja: Mapped[str] = mapped_column(String(100), nullable=False)
    jabatan: Mapped[str] = mapped_column(String(100), nullable=False)

    ruangans: Mapped[List["Ruangan"]] = relationship(back_populates="pic", cascade="all, delete-orphan")

    __mapper_args__ = {
        "polymorphic_identity": "pic_ruangan",
    }

    @property
    def nim_nip(self) -> str:
        return self.nip

    def to_dict(self):
        d = super().to_dict()
        d.update({
            "nip": self.nip,
            "unit_kerja": self.unit_kerja,
            "jabatan": self.jabatan,
            "nim_nip": self.nip
        })
        return d


class PenjagaRuangan(User):
    __tablename__ = "penjaga_ruangan"

    id_user: Mapped[int] = mapped_column(ForeignKey("user.id_user"), primary_key=True)
    nip: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    unit_kerja: Mapped[str] = mapped_column(String(100), nullable=False)

    __mapper_args__ = {
        "polymorphic_identity": "penjaga_ruangan",
    }

    @property
    def nim_nip(self) -> str:
        return self.nip

    def to_dict(self):
        d = super().to_dict()
        d.update({
            "nip": self.nip,
            "unit_kerja": self.unit_kerja,
            "nim_nip": self.nip
        })
        return d
