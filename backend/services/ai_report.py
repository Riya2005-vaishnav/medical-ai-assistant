def generate_radiology_report(filename: str):
    # 🔹 Placeholder AI logic (replace later with ML model)

    findings = f"""
    Image analyzed: {filename}

    • No obvious fracture line detected
    • Lung fields appear clear
    • Cardiac silhouette normal
    • No acute abnormality noted
    """

    impression = """
    Normal radiographic appearance.
    Clinical correlation recommended.
    """

    return findings.strip(), impression.strip()
