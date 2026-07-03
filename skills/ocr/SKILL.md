---
name: ocr
description: Use to read text that lives inside an image, canvas, or rendered PDF where the DOM exposes no text. Call rotom_ocr, optionally with element hints to OCR just that element. Requires the optional tesseract.js dependency in the server.
---

# ocr

## How to use
1. `rotom_open` the page.
2. Call `rotom_ocr` with element hints to OCR a specific element, or with no hints (optionally `fullPage: true`) to OCR the whole view.
3. You get back the recognized text.

## Rules
- Prefer `rotom_get_text` / `rotom_extract` for real DOM text — OCR is only for text that is pixels.
- OCR is approximate: verify critical values, and crop to the element (via hints) for better accuracy than full-page.
- If the tool reports tesseract.js is missing, install it in the server: `npm install tesseract.js`.
