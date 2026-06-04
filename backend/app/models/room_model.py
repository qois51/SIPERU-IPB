from database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional

class Ruangan(Base):
    __tablename__ = 'ruangan'
    
    id_ruangan: Mapped[int] = mapped_column(Integer, primary_key=True)
    nama_ruangan: Mapped[str] = mapped_column(String(100), nullable=False)
    kapasitas: Mapped[int] = mapped_column(Integer, nullable=False)
    fasilitas: Mapped[str] = mapped_column(Text, nullable=False)
    biaya_peminjaman: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    id_pic: Mapped[int] = mapped_column(ForeignKey('pic_ruangan.id_user'), nullable=False)
    

    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    operational_hours: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pic_image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)



    pic: Mapped["PICRuangan"] = relationship("PICRuangan", back_populates="ruangans", lazy="selectin")
    peminjamans: Mapped[List["Peminjaman"]] = relationship("Peminjaman", back_populates="ruangan", cascade="all, delete-orphan", lazy="selectin")


    @property
    def id(self) -> int:
        return self.id_ruangan

    @property
    def name(self) -> str:
        return self.nama_ruangan

    @name.setter
    def name(self, value: str):
        self.nama_ruangan = value

    @property
    def capacity(self) -> int:
        return self.kapasitas

    @capacity.setter
    def capacity(self, value: int):
        self.kapasitas = value

    @property
    def price(self) -> int:
        return self.biaya_peminjaman

    @price.setter
    def price(self, value: int):
        self.biaya_peminjaman = value

    @property
    def facilities(self) -> str:
        return self.fasilitas

    @facilities.setter
    def facilities(self, value: str):
        self.fasilitas = value

    def to_dict(self):
        return {
            "id_ruangan": self.id_ruangan,
            "nama_ruangan": self.nama_ruangan,
            "kapasitas": self.kapasitas,
            "fasilitas": self.fasilitas,
            "biaya_peminjaman": self.biaya_peminjaman,
            "id_pic": self.id_pic,
            "location": self.location or "",
            "operational_hours": self.operational_hours or "",
            "image_url": self.image_url.split('|') if self.image_url else [],
            "pic_image_url": self.pic_image_url or "",

            "id": self.id_ruangan,
            "name": self.nama_ruangan,
            "capacity": self.kapasitas,
            "price": self.biaya_peminjaman,
            "facilities": [f.strip() for f in self.fasilitas.split(',')] if self.fasilitas else [],
            "pic_name": self.pic.nama if self.pic else "",
            "pic_email": self.pic.email if self.pic else "",
            "pic_phone": self.pic.no_telepon if self.pic else ""
        }

Room = Ruangan