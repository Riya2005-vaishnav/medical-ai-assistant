# Medical AI Assistant

An AI-assisted radiology reporting tool. A doctor uploads a scan, a vision LLM drafts the **findings** and **impression**, and the doctor reviews, edits and approves the **final report**, which can be exported as a PDF.

> **Demo project, not a medical device.** AI output can be incomplete or wrong. Reports are drafts and must be reviewed by a qualified physician. Use only fake patient data and public sample images.

**Live demo:** https://medical-ai-assistant-ashen.vercel.app/
*(The backend runs on a free tier, so the first request after a quiet period can take about a minute to wake up.)*

---



## Features

- **Authentication** with JWT and role-based access (doctor / admin)
- **Patient management**: add patients, search by name, open a patient record
- **Scan upload** with image preview (PNG, JPG, WEBP)
- **AI-generated draft report** (findings and impression) from the actual image, using a vision LLM
- **Safety behaviour**: non-medical images are identified as such instead of being reported as "normal"
- **Doctor review workflow**: AI draft, then doctor's final report; only doctors can save the final report or delete a report
- **PDF export** with a DRAFT / FINAL status banner, disclaimer, patient details, the scan, and page footer
- **Modern UI** built with Tailwind CSS (sidebar layout, cards, loading skeletons, status badges)

---

## How it works

```
Upload scan  →  Backend stores image  →  Vision LLM drafts findings + impression
      →  Report saved as DRAFT  →  Doctor reviews / edits  →  Final report saved  →  PDF
```

The AI never produces the final report. It only drafts, and a doctor is always the last step.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React (Create React App), React Router, Axios, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Auth | JWT (python-jose), bcrypt (passlib) |
| AI | Google Gemini API (vision), configurable in `backend/services/ai_report.py` |
| PDF | ReportLab, Pillow |
| Hosting | Render (backend and database), Vercel (frontend) |

---

## Project structure

```
medical-ai-assistant/
├── backend/
│   ├── main.py              # FastAPI app and routes
│   ├── auth.py              # Password hashing and JWT
│   ├── deps.py              # Current-user dependency
│   ├── database.py          # SQLAlchemy engine and session
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── services/
│   │   ├── ai_report.py     # LLM report generation
│   │   └── pdf_report.py    # PDF generation
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.js           # Layout and routes
    │   ├── Patients.js      # Patient list and add form
    │   ├── PatientDetail.js # Patient page
    │   ├── Upload.js        # Scan upload
    │   ├── Reports.js       # Report cards, review, PDF download
    │   └── api.js           # Axios client with auth handling
    ├── tailwind.config.js
    └── vercel.json
```

---

## Run it locally

### Prerequisites

- Python 3.12 or newer
- Node.js 18 or newer
- PostgreSQL (create an empty database, for example `medical_ai_db`)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux
pip install -r requirements.txt
```

Create `backend/.env` (see the variables below), then start the server:

```bash
uvicorn main:app --port 8020
```

API docs are available at `http://127.0.0.1:8020/docs`. Tables are created automatically on startup.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`. Register an account, log in, add a fake patient and upload a public sample X-ray.

---

## Environment variables

**Backend (`backend/.env`):**

```
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@127.0.0.1:5432/medical_ai_db
SECRET_KEY=generate_a_long_random_value
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

Generate a secret key with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Frontend (Vercel or `frontend/.env`):**

```
REACT_APP_API_URL=http://127.0.0.1:8020
```

Never commit `.env` files. They are listed in `.gitignore`.

---

## API overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Create an account | Public |
| POST | `/login` | Get a JWT | Public |
| GET | `/patients` | List patients | Logged in |
| POST | `/patients` | Add a patient | Logged in |
| POST | `/upload-image/{patient_id}` | Upload a scan and generate an AI draft | Logged in |
| GET | `/patients/{patient_id}/reports` | List a patient's reports | Logged in |
| PUT | `/reports/{report_id}/final` | Save the final report | Doctor |
| DELETE | `/reports/{report_id}` | Delete a report | Doctor |
| GET | `/reports/{report_id}/pdf` | Download the PDF | Logged in |

---

## Deployment

- **Backend and PostgreSQL:** Render (Python web service with root directory `backend`, start command `uvicorn main:app --host 0.0.0.0 --port $PORT`)
- **Frontend:** Vercel (root directory `frontend`, with `REACT_APP_API_URL` pointing to the backend)
- Set `FRONTEND_URL` on the backend to the deployed frontend address so CORS allows it.

Notes for free tiers: the backend sleeps when idle, uploaded files are not stored permanently, and the free database has a limited lifetime.

---

## Security notes

- Secrets (API key, database URL, JWT secret) are loaded from environment variables, not from code.
- PDF downloads use the Authorization header, not a token in the URL.
- CORS is restricted to the configured frontend address.
- Only doctors can finalise or delete reports.
- Registration is open in this demo, so anyone can create a doctor account. A real system would need verified accounts and approval.

---

## Limitations and future work

- AI findings are not validated against clinical ground truth.
- No audit log of who approved which report.
- Uploaded images are stored on local disk. Moving them to object storage (for example S3) would make them persistent.
- Planned: admin approval for new doctors, report history and versioning, a dashboard with report statistics, and automated tests.

---

## Disclaimer

This project is for learning and portfolio purposes only. It is **not** intended for diagnosis, treatment or any clinical decision. Do not upload real patient data.

---

## Author

Built by Riya ([@Riya2005-vaishnav](https://github.com/Riya2005-vaishnav)). Feedback and suggestions are welcome.
