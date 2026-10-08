import os
import shutil
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

load_dotenv()

from database import engine, SessionLocal
import models, schemas

# ---- AI + PDF services ----
from services.ai_report import generate_radiology_report
from services.pdf_report import generate_report_pdf

# ---- AUTH ----
from auth import hash_password, verify_password, create_access_token
from deps import get_current_user


# ---------- Create Tables ----------
models.Base.metadata.create_all(bind=engine)


# ---------- App ----------
app = FastAPI(title="Medical AI Assistant API")

# Allowed frontend address(es). On your laptop this is http://localhost:3000.
# When deployed, set FRONTEND_URL in your host's environment variables.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000").rstrip("/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Static Files ----------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory=UPLOAD_DIR), name="files")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ---------- DB Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# 🔐 AUTH APIs
# =====================================================

@app.post("/register", response_model=schemas.TokenOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter_by(email=user.email).first()
    if existing:
        raise HTTPException(400, "Email already registered")

    obj = models.User(
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role.lower()
    )

    db.add(obj)
    db.commit()
    db.refresh(obj)

    token = create_access_token({"user_id": obj.id, "role": obj.role})

    return {"access_token": token, "token_type": "bearer"}


@app.post("/login", response_model=schemas.TokenOut)
def login(form: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):

    user = db.query(models.User).filter_by(email=form.username).first()

    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    token = create_access_token({"user_id": user.id, "role": user.role})

    return {"access_token": token, "token_type": "bearer"}


# =====================================================
# 🏠 ROOT
# =====================================================

@app.get("/")
def home():
    return {"message": "Medical AI Assistant Backend Running"}


# =====================================================
# 👤 PATIENT APIs (Protected)
# =====================================================

@app.post("/patients", response_model=schemas.PatientOut)
def create_patient(
    patient: schemas.PatientCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    obj = models.Patient(**patient.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/patients", response_model=list[schemas.PatientOut])
def list_patients(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.Patient).all()


# =====================================================
# 🧠 IMAGE UPLOAD + AI REPORT (Protected)
# =====================================================

@app.post("/upload-image/{patient_id}", response_model=schemas.ReportOut)
def upload_image(
    patient_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    patient = db.get(models.Patient, patient_id)
    if not patient:
        raise HTTPException(404, "Patient not found")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in (".png", ".jpg", ".jpeg", ".webp"):
        raise HTTPException(400, "Only PNG, JPG or WEBP images are supported")

    # unique file name, forward slashes so the URL works in the browser
    file_path = f"{UPLOAD_DIR}/{uuid.uuid4().hex}{ext}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        findings, impression = generate_radiology_report(
            file_path, age=patient.age, gender=patient.gender
        )
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        print("AI error:", e)
        raise HTTPException(502, "AI report generation failed. Please try again.")

    report = models.Report(
        patient_id=patient_id,
        image_path=file_path,
        findings=findings,
        impression=impression,
        final_report=None
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


# =====================================================
# 📄 REPORT APIs (Protected)
# =====================================================

@app.get("/patients/{patient_id}/reports",
         response_model=list[schemas.ReportOut])
def reports_by_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return (
        db.query(models.Report)
        .filter_by(patient_id=patient_id)
        .order_by(models.Report.id.desc())
        .all()
    )


# =====================================================
# ✍️ FINAL REPORT UPDATE (Doctor Only)
# =====================================================

@app.put("/reports/{report_id}/final")
def update_final_report(
    report_id: int,
    data: schemas.FinalReportUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.role != "doctor":
        raise HTTPException(403, "Doctor access required")

    report = db.get(models.Report, report_id)

    if not report:
        raise HTTPException(404, "Report not found")

    report.final_report = data.final_report
    db.commit()

    return {"status": "updated by doctor"}


# =====================================================
# 🗑️ DELETE REPORT (Doctor Only)
# =====================================================

@app.delete("/reports/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.role != "doctor":
        raise HTTPException(403, "Doctor access required")

    report = db.get(models.Report, report_id)

    if not report:
        raise HTTPException(404, "Report not found")

    # delete image file if exists
    if report.image_path and os.path.exists(report.image_path):
        try:
            os.remove(report.image_path)
        except Exception as e:
            print("File delete error:", e)

    db.delete(report)
    db.commit()

    return {"message": "Report deleted successfully"}


# =====================================================
# 📥 PDF DOWNLOAD (token sent in the Authorization header)
# =====================================================

@app.get("/reports/{report_id}/pdf")
def download_pdf(
    report_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    report = db.get(models.Report, report_id)
    if not report:
        raise HTTPException(404, "Report not found")

    patient = db.get(models.Patient, report.patient_id)

    pdf_dir = "pdf_reports"
    os.makedirs(pdf_dir, exist_ok=True)

    pdf_path = os.path.join(pdf_dir, f"report_{report_id}.pdf")

    generate_report_pdf(report, patient, pdf_path)

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"report_{report_id}.pdf"
    )