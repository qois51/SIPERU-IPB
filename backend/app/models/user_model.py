from database import Base
from sqlalchemy import ForeignKey, String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
import bcrypt


def _raw(obj) -> dict:
    """Baca instance.__dict__ secara langsung, bypass SA attribute machinery.

    SQLAlchemy menyimpan nilai kolom yang sudah di-load sebagai entry biasa
    di instance.__dict__. Dengan membaca lewat object.__getattribute__ kita
    mendapatkan dict itu tanpa melalui descriptor SA — artinya tidak ada
    lazy-load, tidak ada greenlet, tidak ada MissingGreenlet.

    Kalau kolom subclass belum di-load (karena query tidak JOIN), .get()
    mengembalikan '' (default) tanpa trigger IO apapun.
    """
    return object.__getattribute__(obj, '__dict__')


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
        # Kolom base table selalu aman diakses via SA (ada di SELECT User)
        # Kolom subclass (nim, nip, unit_kerja, jabatan) dibaca via _raw()
        # agar tidak trigger lazy-load → MissingGreenlet
        r = _raw(self)
        nim_nip_val = r.get('nim', r.get('nip', ''))

        return {
            "id_user":    self.id_user,
            "nama":       self.nama,
            "email":      self.email,
            "no_telepon": self.no_telepon,
            "type":       self.type,
            # Legacy fields
            "id":         self.id_user,
            "username":   self.nama,
            "full_name":  self.nama,
            "email_str":  self.email,
            "phone":      self.no_telepon,
            "role":       self.role,
            "nim_nip":    nim_nip_val,
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
        nim_val = _raw(self).get('nim', '')
        d.update({
            "nim":     nim_val,
            "nim_nip": nim_val,
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
        r = _raw(self)
        nip_val = r.get('nip', '')
        d.update({
            "nip":        nip_val,
            "unit_kerja": r.get('unit_kerja', ''),
            "jabatan":    r.get('jabatan', ''),
            "nim_nip":    nip_val,
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
        r = _raw(self)
        nip_val = r.get('nip', '')
        d.update({
            "nip":        nip_val,
            "unit_kerja": r.get('unit_kerja', ''),
            "nim_nip":    nip_val,
        })
        return d
