/* OCR integration module. The Tesseract.js library is loaded in index.html. */
window.SeeVoiceOCR = (() => {
  const LANGUAGE = "hun+eng";

  async function preprocessImage(imageFile) {
    const image = await createImageBitmap(imageFile);
  
    const scale = 3;
    const canvas = document.createElement("canvas");
  
    canvas.width = image.width * scale;
    canvas.height = image.height * scale;
  
    const ctx = canvas.getContext("2d");
  
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    ctx.filter = "grayscale(1) contrast(1.8)";
    ctx.drawImage(
      image,
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    return canvas;
  }

  async function recognizeImage(imageFile, onProgress = () => {}) {
    if (!imageFile) throw new Error("Please choose an image first.");
    if (!imageFile.type || !imageFile.type.startsWith("image/")) {
      throw new Error("The selected file is not a supported image.");
    }
    if (!window.Tesseract || typeof window.Tesseract.recognize !== "function") {
      throw new Error("The OCR engine could not be loaded. Check your internet connection and reload the page.");
    }

    const processedImage = await preprocessImage(imageFile);

    const result = await window.Tesseract.recognize(
      processedImage,
      LANGUAGE,
      {
        logger: (message) => {
          if (message && message.status === "recognizing text") {
            const progress = Math.round((message.progress || 0) * 100);
            onProgress(progress);
          }
        }
      }
    );
    return (result?.data?.text || "").trim();
  }

  return { recognizeImage, language: LANGUAGE };
})();
