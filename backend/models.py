from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


# =========================
# Patient
# =========================

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)

    reports = relationship("Report", back_populates="patient")


# =========================
# Report
# =========================

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("patients.id"))
    image_path = Column(String)

    findings = Column(Text)
    impression = Column(Text)
    final_report = Column(Text)

    patient = relationship("Patient", back_populates="reports")


# =========================
# User (NEW — for login)
# =========================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="doctor")  # doctor / admin
