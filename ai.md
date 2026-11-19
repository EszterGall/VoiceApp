# AI tools and usage

This project was developed with assistance from ChatGPT.

## How AI assistance was used
- Explored the accessibility problem and shaped the initial product concept.
- Helped plan the prototype's feature scope and user flow.
- Assisted with drafting and refining the HTML, CSS and JavaScript implementation.
- Helped prepare setup instructions, testing guidance and project documentation.
- Suggested accessibility practices, including semantic labels, keyboard focus indicators, high contrast, clear status messages and large controls.

## Runtime technologies
- **Tesseract.js** performs optical character recognition (OCR) in the browser through the separate `ocr.js` integration file.
- **Web Speech API** provides speech synthesis and, where supported by the browser, speech recognition.
- The application does **not** call a generative-AI API at runtime and does not require an API key.

## Human review and limitations
The implementation should be tested in the target browser and, where possible, with people who use assistive technology. OCR and speech recognition may be inaccurate. This prototype must not be treated as the only source for safety-critical information.
