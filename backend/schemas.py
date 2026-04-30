from pydantic import BaseModel


# =========================
# Patient
# =========================

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str


class PatientOut(PatientCreate):
    id: int

    class Config:
        from_attributes = True


# =========================
# Report
# =========================

class ReportCreate(BaseModel):
    patient_id: int
    findings: str
    impression: str


class ReportOut(BaseModel):
    id: int
    patient_id: int
    image_path: str | None = None
    findings: str | None = None
    impression: str | None = None
    final_report: str | None = None

    class Config:
        from_attributes = True


# =========================
# Final Report Update
# =========================

class FinalReportUpdate(BaseModel):
    final_report: str


# =========================
# User Auth Schemas (NEW)
# =========================

class UserCreate(BaseModel):
    email: str
    password: str
    role: str


class UserLogin(BaseModel):
    email: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
