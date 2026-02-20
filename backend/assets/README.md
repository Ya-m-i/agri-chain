# RSBSA form template (optional)

To generate PDFs that match the official RSBSA enrollment form:

## Preferred: PDF template (exact layout, no stretching)

1. Convert your official RSBSA form to a single-page PDF:
   - Open the form image (scan or photo) in a viewer
   - **Print → Save as PDF**, or use an online image-to-PDF converter
   - Save as **rsbsa-form-template.pdf**

2. Place **rsbsa-form-template.pdf** in this folder: `backend/assets/`

3. The server will fill this template with farmer data using **pdf-lib** (exact A4: 595 x 842 points, no distortion). If this file is missing, the server falls back to image overlay or HTML form.

To adjust where text is drawn on the PDF, edit the **COORDS** object in `backend/utils/rsbsaPdfFill.js` (x and yFromTop in points).

## Fallback: image overlay

If you only have an image of the form:

- Save it as **rsbsa-form-template.png** or **rsbsa-form-template.jpg**
- Place it in `backend/assets/`
- The server will use it as a background and overlay data (positions tunable in `rsbsaPdfOverlay.js`).

If neither a PDF nor an image template is present, the built-in HTML form layout is used.
