(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const textArea = $("recognizedText");
  const status = $("status");
  const ocrStatus = $("ocrStatus");
  const voiceButton = $("voiceButton");
  const imageInput = $("imageInput");
  const scanButton = $("scanButton");
  const speedInput = $("speed");
  const voiceSelect = $("voiceSelect");

  let selectedImage = null;
  let previewUrl = null;
  let recognition = null;
  let listening = false;

  const hasSpeechSynthesis = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  function sayStatus(message) {
    if (status) status.textContent = message;
  }

  function getSelectedVoice() {
    if (!hasSpeechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const selected = voiceSelect.value;
    return voices.find((voice) => voice.name === selected) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) || voices[0] || null;
  }

  function speak(text = textArea.value) {
    if (!hasSpeechSynthesis) {
      sayStatus("Speech playback is not supported in this browser.");
      return;
    }
    const content = String(text || "").trim();
    if (!content) {
      sayStatus("There is no text to read yet. Choose an image or enter some text.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = Number(speedInput.value) || 0.9;
    const voice = getSelectedVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => sayStatus("Reading aloud.");
    utterance.onend = () => sayStatus("Finished reading.");
    utterance.onerror = (event) => {
      if (event.error !== "canceled" && event.error !== "interrupted") {
        sayStatus("The browser could not play the speech. Please try again.");
      }
    };
    window.speechSynthesis.speak(utterance);
  }

  function populateVoices() {
    if (!hasSpeechSynthesis) {
      voiceSelect.innerHTML = '<option value="">Speech voices unavailable</option>';
      voiceSelect.disabled = true;
      return;
    }
    const voices = window.speechSynthesis.getVoices();
    const previous = voiceSelect.value;
    voiceSelect.replaceChildren();
    if (!voices.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Default device voice";
      voiceSelect.appendChild(option);
      return;
    }
    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
    const preferred = voices.find((voice) => voice.name === previous) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("en")) || voices[0];
    voiceSelect.value = preferred.name;
  }

  if (hasSpeechSynthesis) {
    populateVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", populateVoices);
    window.speechSynthesis.onvoiceschanged = populateVoices;
  } else {
    populateVoices();
  }

  speedInput.addEventListener("input", () => {
    $("speedValue").textContent = `${Number(speedInput.value).toFixed(1)}×`;
  });

  imageInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      selectedImage = null;
      scanButton.disabled = true;
      ocrStatus.textContent = "Please select an image file.";
      imageInput.value = "";
      return;
    }
    selectedImage = file;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    $("imagePreview").src = previewUrl;
    $("imagePreviewWrap").hidden = false;
    scanButton.disabled = false;
    ocrStatus.textContent = `Selected: ${file.name}`;
  });

  scanButton.addEventListener("click", async () => {
    if (!selectedImage) {
      ocrStatus.textContent = "Choose an image before starting text recognition.";
      return;
    }
    scanButton.disabled = true;
    ocrStatus.textContent = "Preparing text recognition…";
    try {
      const recognized = await window.SeeVoiceOCR.recognizeImage(selectedImage, (progress) => {
        ocrStatus.textContent = `Recognizing text… ${progress}%`;
      });
      textArea.value = recognized;
      ocrStatus.textContent = recognized ? "Text recognized. You can listen now." : "No text found. Try a sharper, well-lit image.";
      if (recognized) sayStatus("Text recognized. Say ‘read this’ or press Read aloud.");
    } catch (error) {
      console.error("OCR error:", error);
      ocrStatus.textContent = error instanceof Error ? error.message : "Could not recognize this image. Please try again.";
    } finally {
      scanButton.disabled = !selectedImage;
    }
  });

  $("readButton").addEventListener("click", () => speak());
  $("pauseButton").addEventListener("click", () => togglePause());
  $("stopButton").addEventListener("click", stopReading);

  function togglePause() {
    if (!hasSpeechSynthesis) {
      sayStatus("Speech playback is not supported in this browser.");
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      sayStatus("Reading resumed.");
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      sayStatus("Reading paused.");
    } else {
      sayStatus("There is no active reading to pause.");
    }
  }

  function stopReading() {
    if (hasSpeechSynthesis) window.speechSynthesis.cancel();
    sayStatus("Reading stopped.");
  }

  function handleCommand(command) {
    const c = command.toLowerCase().trim();
    if (/(read this|start reading|read aloud)/.test(c)) speak();
    else if (/(pause|hold on|wait)/.test(c)) {
      if (hasSpeechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        sayStatus("Reading paused.");
      } else sayStatus("There is no active reading to pause.");
    } else if (/(continue|resume|go on)/.test(c)) {
      if (hasSpeechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        sayStatus("Reading resumed.");
      } else sayStatus("There is no paused reading to continue.");
    } else if (/(repeat|again)/.test(c)) speak();
    else if (/(read slower|slower|slow down)/.test(c)) {
      speedInput.value = Math.max(0.6, Number(speedInput.value) - 0.2).toFixed(1);
      speedInput.dispatchEvent(new Event("input"));
      sayStatus("Reading speed decreased. Say ‘read this’ to hear the text at the new speed.");
    } else if (/(read faster|faster|speed up)/.test(c)) {
      speedInput.value = Math.min(1.5, Number(speedInput.value) + 0.2).toFixed(1);
      speedInput.dispatchEvent(new Event("input"));
      sayStatus("Reading speed increased. Say ‘read this’ to hear the text at the new speed.");
    } else if (/(stop|cancel)/.test(c)) stopReading();
    else sayStatus(`I heard: “${command}”. Try “read this”, “pause”, “continue” or “stop”.`);
  }

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      sayStatus("Voice commands are not supported in this browser. Try Chrome, or use the on-screen controls.");
      return;
    }
    if (listening && recognition) {
      recognition.stop();
      return;
    }
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => {
      listening = true;
      voiceButton.classList.add("listening");
      $("voiceButtonText").textContent = "Listening… tap to stop";
      sayStatus("I'm listening. What would you like me to do?");
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) handleCommand(transcript);
    };
    recognition.onerror = (event) => {
      const message = event.error === "not-allowed"
        ? "Microphone access was blocked. Allow microphone access in your browser settings."
        : event.error === "no-speech"
          ? "I did not hear anything. Please try again."
          : "Voice recognition encountered a problem. Please try again or use the on-screen controls.";
      sayStatus(message);
    };
    recognition.onend = () => {
      listening = false;
      voiceButton.classList.remove("listening");
      $("voiceButtonText").textContent = "Start voice assistant";
    };
    try {
      recognition.start();
    } catch (error) {
      console.error("Speech recognition error:", error);
      sayStatus("The microphone could not be started. Please try again.");
    }
  }

  voiceButton.addEventListener("click", startListening);
  window.addEventListener("beforeunload", () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (recognition && listening) recognition.stop();
    if (hasSpeechSynthesis) window.speechSynthesis.cancel();
  });
})();
