from typing import List, Optional
from datetime import datetime
from sqlalchemy import ForeignKey, String, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base

class User(Base):
    __tablename__ = "user"

    id_user: Mapped[int] = mapped_column(primary_key=True)
    nama: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(100), unique=True)
    password: Mapped[str] = mapped_column(String(255))
    no_telp: Mapped[str] = mapped_column(String(20))

    type: Mapped[str] = mapped_column(String(20))

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "user",
    }


class Mahasiswa(User):
    __tablename__ = "mahasiswa"

    id_user: Mapped[int] = mapped_column(ForeignKey("user.id_user"), primary_key=True)
    nim: Mapped[str] = mapped_column(String(20), unique=True)

    peminjamans: Mapped[List["Peminjaman"]] = relationship(back_populates="mahasiswa")

    __mapper_args__ = {
        "polymorphic_identity": "mahasiswa",
    }


class PICRuangan(User):
    __tablename__ = "pic_ruangan"

    id_user: Mapped[int] = mapped_column(ForeignKey("user.id_user"), primary_key=True)
    nip: Mapped[str] = mapped_column(String(30), unique=True)
    unit_kerja: Mapped[str] = mapped_column(String(100))
    jabatan: Mapped[str] = mapped_column(String(100))

    ruangans: Mapped[List["Ruangan"]] = relationship(back_populates="pic")

    __mapper_args__ = {
        "polymorphic_identity": "pic_ruangan",
    }


class PenjagaRuangan(User):
    __tablename__ = "penjaga_ruangan"

    id_user: Mapped[int] = mapped_column(ForeignKey("user.id_user"), primary_key=True)
    nip: Mapped[str] = mapped_column(String(30), unique=True)
    unit_kerja: Mapped[str] = mapped_column(String(100))

    __mapper_args__ = {
        "polymorphic_identity": "penjaga_ruangan",
    }


class Ruangan(Base):
    __tablename__ = "ruangan"

    id_ruangan: Mapped[int] = mapped_column(primary_key=True)
    nama_ruangan: Mapped[str] = mapped_column(String(100))
    kapasitas: Mapped[int] = mapped_column(Integer)
    fasilitas: Mapped[str] = mapped_column(Text)
    biaya_peminjaman: Mapped[int] = mapped_column(Integer, default=0)
    id_pic: Mapped[int] = mapped_column(ForeignKey("pic_ruangan.id_user"))
    pic: Mapped["PICRuangan"] = relationship(back_populates="ruangans")
    peminjamans: Mapped[List["Peminjaman"]] = relationship(back_populates="ruangan")


class Peminjaman(Base):
    __tablename__ = "peminjaman"

    id_booking: Mapped[int] = mapped_column(primary_key=True)
    waktu_mulai: Mapped[datetime] = mapped_column(DateTime)
    waktu_selesai: Mapped[datetime] = mapped_column(DateTime)
    keperluan: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    path_file_bukti: Mapped[Optional[str]] = mapped_column(String(255))
    id_epass: Mapped[Optional[str]] = mapped_column(String(50))

    id_mahasiswa: Mapped[int] = mapped_column(ForeignKey("mahasiswa.id_user"))
    id_ruangan: Mapped[int] = mapped_column(ForeignKey("ruangan.id_ruangan"))

    mahasiswa: Mapped["Mahasiswa"] = relationship(back_populates="peminjamans")
    ruangan: Mapped["Ruangan"] = relationship(back_populates="peminjamans")
