# RSBSA form template image (optional)

To generate PDFs that look **exactly** like the official RSBSA enrollment form:

1. Save your official RSBSA form image (scan or photo) as:
   - **rsbsa-form-template.png** or
   - **rsbsa-form-template.jpg**

2. Place it in this folder: `backend/assets/`

3. The PDF endpoint will then use this image as the background and overlay farmer data on top. If this file is missing, the server falls back to the built-in HTML form layout.

Recommended: single-page A4 form image (same layout as the official "ANI AT KITA RSBSA ENROLLMENT FORM") for best alignment. You can tune overlay positions in `backend/utils/rsbsaPdfOverlay.js` (POS object) if needed.
