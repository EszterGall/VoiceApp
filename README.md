# SeeVoice — Your world, spoken

SeeVoice is a browser-based accessibility prototype designed to make short printed or image-based text easier to access for people who are blind or have low vision. It converts text in an uploaded image into editable text and can read that text aloud. Basic playback commands can be given by voice.

## What the current prototype does
- Select an image and preview it before processing.
- Recognize English text in the image using Tesseract.js.
- Edit, paste or type text in the text area.
- Read text aloud using the browser's SpeechSynthesis API.
- Select an available system voice and adjust the speaking rate.
- Use English voice commands: `read this`, `pause`, `continue`, `repeat`, `read slower`, `read faster`, and `stop`.
- Use large on-screen controls as an alternative to voice commands.

## Project files
- `index.html` — page structure and external library loading.
- `style.css` — visual design, responsive layout and accessibility styling.
- `app.js` — interface logic, speech playback and voice command handling.
- `ocr.js` — separate integration layer for Tesseract.js OCR.
- `ai.md` — disclosure of AI assistance and runtime components.

## Run locally
1. Extract the project ZIP.
2. Open a terminal in the `SeeVoice` folder.
3. Start a local server: `python -m http.server 8000`
4. Open `http://localhost:8000` in a browser. Chrome is recommended for testing voice recognition.
5. Allow microphone access when prompted and select an image to test OCR.

An internet connection is required because Tesseract.js and its English language data are loaded from a CDN. A local HTTP server is recommended; browser microphone APIs may not work from a `file://` address.

## Browser and language limitations
- OCR is currently configured for English (`eng`) in `ocr.js`.
- Voice command recognition is configured for English (`en-US`).
- Speech synthesis voices depend on the browser and operating system.
- The Web Speech speech-recognition feature is not available in every browser. If unavailable, use the on-screen controls.
- OCR quality depends on image sharpness, lighting, text size and layout.

## Suggested demo flow
1. Start the app and allow microphone access.
2. Upload a clear photo containing a short English text.
3. Select **Recognize text** and wait for the result.
4. Press **Start voice assistant** and say **“read this”**.
5. Try **“pause”**, **“continue”**, **“read slower”** and **“stop”**.
6. Show that the text can also be read with the on-screen buttons.

## Important note
This is an experimental prototype, not a certified assistive product. OCR and speech recognition can make mistakes. Important information—especially medication instructions, dates, addresses or financial details—must be checked independently.
