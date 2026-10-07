import os
from datetime import datetime
from xml.sax.saxutils import escape

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def _text(value) -> str:
    """Make text safe for ReportLab (it treats <, > and & as markup) and keep line breaks."""
    return escape(str(value or "")).replace("\n", "<br/>")


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.grey)
    canvas.drawString(20 * mm, 12 * mm, "Medical AI Assistant - demo project. Not for clinical use.")
    canvas.drawRightString(A4[0] - 20 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def generate_report_pdf(report, patient, output_path: str):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=22 * mm,
    )
    styles = getSampleStyleSheet()
    story = []

    small_grey = ParagraphStyle(
        "SmallGrey", parent=styles["Normal"], fontSize=8, textColor=colors.grey
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#92400e"),
        leading=12,
    )

    is_final = bool((report.final_report or "").strip())

    # ---------- Title ----------
    story.append(Paragraph("Medical AI Radiology Report", styles["Title"]))
    story.append(
        Paragraph(
            f"Report #{report.id} &nbsp;|&nbsp; Generated {datetime.now().strftime('%d %b %Y, %H:%M')}",
            ParagraphStyle("Center", parent=small_grey, alignment=1),
        )
    )
    story.append(Spacer(1, 10))

    # ---------- Status banner ----------
    if is_final:
        status_text = "<b>STATUS: FINAL</b> - reviewed by a doctor"
        bg, fg = colors.HexColor("#dcfce7"), colors.HexColor("#166534")
    else:
        status_text = "<b>STATUS: DRAFT</b> - awaiting doctor review"
        bg, fg = colors.HexColor("#fef3c7"), colors.HexColor("#92400e")

    status = Table(
        [[Paragraph(status_text, ParagraphStyle("Status", parent=styles["Normal"], textColor=fg))]],
        colWidths=[doc.width],
    )
    status.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), bg),
                ("BOX", (0, 0), (-1, -1), 0.5, fg),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(status)
    story.append(Spacer(1, 8))

    # ---------- Disclaimer ----------
    story.append(
        Paragraph(
            "AI-generated draft. This is not a diagnosis. It must be reviewed by a "
            "qualified physician before any clinical use.",
            disclaimer_style,
        )
    )
    story.append(Spacer(1, 12))

    # ---------- Patient Info ----------
    story.append(Paragraph(f"<b>Patient Name:</b> {_text(patient.name)}", styles["Normal"]))
    story.append(Paragraph(f"<b>Patient ID:</b> {patient.id}", styles["Normal"]))
    story.append(Paragraph(f"<b>Age:</b> {_text(patient.age)}", styles["Normal"]))
    story.append(Paragraph(f"<b>Gender:</b> {_text(patient.gender)}", styles["Normal"]))
    story.append(Spacer(1, 12))

    # ---------- Embedded Image (keeps aspect ratio) ----------
    if report.image_path and os.path.exists(report.image_path):
        story.append(Paragraph("Uploaded Scan", styles["Heading2"]))
        story.append(Spacer(1, 6))

        try:
            with PILImage.open(report.image_path) as im:
                w, h = im.size
            max_w, max_h = 120 * mm, 100 * mm
            scale = min(max_w / w, max_h / h)
            img = Image(report.image_path, width=w * scale, height=h * scale)
            img.hAlign = "CENTER"
            story.append(img)
        except Exception:
            story.append(Paragraph("(Image could not be embedded)", small_grey))

        story.append(Spacer(1, 12))

    # ---------- Findings ----------
    story.append(Paragraph("AI Findings", styles["Heading2"]))
    story.append(Paragraph(_text(report.findings), styles["Normal"]))
    story.append(Spacer(1, 12))

    # ---------- Impression ----------
    story.append(Paragraph("AI Impression", styles["Heading2"]))
    story.append(Paragraph(_text(report.impression), styles["Normal"]))
    story.append(Spacer(1, 12))

    # ---------- Final Doctor Report ----------
    story.append(Paragraph("Final Doctor Report", styles["Heading2"]))
    final_text = report.final_report if is_final else "Not yet finalized"
    story.append(Paragraph(_text(final_text), styles["Normal"]))
    story.append(Spacer(1, 16))

    # ---------- Traceability note ----------
    story.append(
        Paragraph(
            "Preliminary findings and impression were generated by an AI model from the "
            "uploaded image and basic patient details. AI output can be incomplete or wrong.",
            small_grey,
        )
    )

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)