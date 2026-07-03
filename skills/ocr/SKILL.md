---
name: ocr
description: Use to read text, numbers, or labels that live inside an image, canvas, chart, screenshot, or rendered PDF, anywhere the value is visually present but the DOM and alt text expose no readable text. Call rotom_ocr, optionally passing element hints so it OCRs just the target region instead of the whole page. This is the right move the moment you would otherwise guess at a value you can see but cannot select. Needs the server's optional tesseract.js dependency; if it is missing, fall back to vision-fallback.
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
