import io
import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image

load_dotenv()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Check AI Studio for the current free Flash model name and update if needed
MODEL = "gemini-3.5-flash"

SYSTEM_PROMPT = """You are a radiology reporting assistant. You draft reports that a licensed physician will review.
Rules:
- Describe only what is visible in the image. Do not invent patient details or history.
- If image quality is limited or a finding is uncertain, say so clearly.
- If the image is not a medical scan, say that in the findings and leave the impression as "Not applicable".
- Use plain, professional language.
Return ONLY a JSON object with exactly two string keys: "findings" and "impression"."""


def _prepare_image(image_path: str) -> bytes:
    img = Image.open(image_path).convert("RGB")
    img.thumbnail((1568, 1568))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


def generate_radiology_report(image_path: str, age=None, gender=None):
    image_bytes = _prepare_image(image_path)
    context = f"Patient age: {age or 'unknown'}. Patient gender: {gender or 'unknown'}.\nDraft the report."

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
            context,
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
        ),
    )

    text = (response.text or "").strip()
    try:
        data = json.loads(text)
        return data.get("findings", ""), data.get("impression", "")
    except json.JSONDecodeError:
        return text, "Please review the findings above."