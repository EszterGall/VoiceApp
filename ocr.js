/* OCR integration module. The Tesseract.js library is loaded in index.html. */
window.SeeVoiceOCR = (() => {
  const LANGUAGE = "eng";

  async function recognizeImage(imageFile, onProgress = () => {}) {
    if (!imageFile) throw new Error("Please choose an image first.");
    if (!imageFile.type || !imageFile.type.startsWith("image/")) {
      throw new Error("The selected file is not a supported image.");
    }
    if (!window.Tesseract || typeof window.Tesseract.recognize !== "function") {
      throw new Error("The OCR engine could not be loaded. Check your internet connection and reload the page.");
    }

    const result = await window.Tesseract.recognize(imageFile, LANGUAGE, {
      logger: (message) => {
        if (message && message.status === "recognizing text") {
          const progress = Math.round((message.progress || 0) * 100);
          onProgress(progress);
        }
      }
    });
    return (result?.data?.text || "").trim();
  }

  return { recognizeImage, language: LANGUAGE };
})();
