from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
import os


def generate_report_pdf(report, patient, output_path: str):
    doc = SimpleDocTemplate(output_path, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # ---------- Title ----------
    story.append(Paragraph("Medical AI Radiology Report", styles["Title"]))
    story.append(Spacer(1, 12))

    # ---------- Patient Info ----------
    story.append(Paragraph(f"<b>Patient Name:</b> {patient.name}", styles["Normal"]))
    story.append(Paragraph(f"<b>Age:</b> {patient.age}", styles["Normal"]))
    story.append(Paragraph(f"<b>Gender:</b> {patient.gender}", styles["Normal"]))
    story.append(Spacer(1, 12))

    # ---------- Embedded Image ----------
    if report.image_path and os.path.exists(report.image_path):
        story.append(Paragraph("<b>Uploaded Scan:</b>", styles["Heading2"]))
        story.append(Spacer(1, 6))

        img = Image(report.image_path)
        img.drawHeight = 90 * mm
        img.drawWidth = 90 * mm
        story.append(img)

        story.append(Spacer(1, 12))

    # ---------- Findings ----------
    story.append(Paragraph("<b>AI Findings:</b>", styles["Heading2"]))
    story.append(
        Paragraph(report.findings.replace("\n", "<br/>"), styles["Normal"])
    )
    story.append(Spacer(1, 12))

    # ---------- Impression ----------
    story.append(Paragraph("<b>AI Impression:</b>", styles["Heading2"]))
    story.append(
        Paragraph(report.impression.replace("\n", "<br/>"), styles["Normal"])
    )
    story.append(Spacer(1, 12))

    # ---------- Final Doctor Report ----------
    story.append(Paragraph("<b>Final Doctor Report:</b>", styles["Heading2"]))
    final_text = report.final_report or "Not yet finalized"
    story.append(
        Paragraph(final_text.replace("\n", "<br/>"), styles["Normal"])
    )

    doc.build(story)
