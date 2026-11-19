(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const textArea = byId("recognizedText");
  const status = byId("status");
  const ocrStatus = byId("ocrStatus");
  const welcome = byId("voiceWelcome");
  const enableVoiceButton = byId("enableVoiceButton");
  const voiceToggleButton = byId("voiceToggleButton");
  const speedInput = byId("speed");
  const voiceSelect = byId("voiceSelect");

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canSpeak = ("speechSynthesis" in window) &&
                   ("SpeechSynthesisUtterance" in window);

  let recognition = null;
  let voiceOn = false;
  let restarting = false;
  let chosenImage = null;
  let imageUrl = null;

  function message(text) {
    status.textContent = text;
  }

  function normalize(text) {
    return String(text || "")
      .toLocaleLowerCase("hu-HU")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function updateVoiceUi(active, text) {
    byId("voiceState").textContent = active
      ? "Hangvezérlés aktív"
      : "Hangvezérlés nincs bekapcsolva";
    voiceToggleButton.textContent = active
      ? "Hangvezérlés kikapcsolása"
      : "Hangvezérlés indítása";
    if (text) message(text);
  }

  function selectedVoice() {
    if (!canSpeak) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.name === voiceSelect.value) ||
      voices.find(v => v.lang && v.lang.toLowerCase().startsWith("hu")) ||
      voices[0] || null;
  }

  function readText() {
    if (!canSpeak) {
      message("A felolvasást ez a böngésző nem támogatja.");
      return;
    }
    const text = textArea.value.trim();
    if (!text) {
      message("Először tölts fel egy képet, vagy írj be szöveget.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hu-HU";
    utterance.rate = Number(speedInput.value) || 0.9;
    const voice = selectedVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => message("A felolvasás elindult.");
    utterance.onend = () => message("A felolvasás befejeződött.");
    utterance.onerror = () => message("A böngésző nem tudta lejátszani a szöveget.");
    window.speechSynthesis.speak(utterance);
  }

  function loadVoices() {
    if (!canSpeak) {
      voiceSelect.innerHTML = "<option value=''>A felolvasás nem támogatott</option>";
      voiceSelect.disabled = true;
      return;
    }
    const oldValue = voiceSelect.value;
    const voices = window.speechSynthesis.getVoices();
    voiceSelect.replaceChildren();
    if (!voices.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Eszköz alapértelmezett hangja";
      voiceSelect.append(option);
      return;
    }
    voices.forEach(voice => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.append(option);
    });
    const preferred = voices.find(v => v.name === oldValue) ||
      voices.find(v => v.lang && v.lang.toLowerCase().startsWith("hu")) ||
      voices[0];
    voiceSelect.value = preferred.name;
  }

  function stopListening(showMessage = true) {
    voiceOn = false;
    restarting = false;
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    updateVoiceUi(false, showMessage ? "A hangvezérlés kikapcsolva." : "");
    byId("welcomeStatus").textContent = "A hangvezérlés nincs bekapcsolva.";
  }

  function processCommand(spoken) {
    const command = normalize(spoken);
    if (!command) return;

    if (/(olvasd fel|felolvasas|kezdj olvasni|olvasas indul)/.test(command)) {
      readText();
    } else if (/(szunet|allj meg|varj)/.test(command)) {
      if (canSpeak && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        message("A felolvasás szünetel.");
      } else message("Most nincs folyamatban felolvasás.");
    } else if (/(folytatas|tovabb)/.test(command)) {
      if (canSpeak && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        message("A felolvasás folytatódik.");
      } else message("Nincs szüneteltetett felolvasás.");
    } else if (/(ismeteld|ismetles|ujra)/.test(command)) {
      readText();
    } else if (/(lassabban|lassits)/.test(command)) {
      speedInput.value = Math.max(0.6, Number(speedInput.value) - 0.1).toFixed(1);
      speedInput.dispatchEvent(new Event("input"));
      message("A felolvasás sebessége csökkent.");
    } else if (/(gyorsabban|gyorsits)/.test(command)) {
      speedInput.value = Math.min(1.5, Number(speedInput.value) + 0.1).toFixed(1);
      speedInput.dispatchEvent(new Event("input"));
      message("A felolvasás sebessége nőtt.");
    } else if (/(allj|leallit|stop)/.test(command)) {
      if (canSpeak) window.speechSynthesis.cancel();
      message("A felolvasás leállt.");
    } else {
      message(`Ezt hallottam: „${spoken}”. Próbáld: olvasd fel, szünet, folytatás vagy állj.`);
    }
  }

  function startListening() {
    if (!SpeechRecognition) {
      updateVoiceUi(false, "Ez a böngésző nem támogatja a hangfelismerést. Használd a képernyőn lévő gombokat, vagy próbáld Chrome-ban.");
      byId("welcomeStatus").textContent = "A hangfelismerés nem érhető el ebben a böngészőben.";
      return;
    }
    if (voiceOn) return;

    try {
      recognition = new SpeechRecognition();
      recognition.lang = "hu-HU";
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        voiceOn = true;
        restarting = false;
        welcome.hidden = true;
        updateVoiceUi(true, "Figyelek. Mondd ki valamelyik hangutasítást.");
        byId("welcomeStatus").textContent = "A hangvezérlés aktív.";
        enableVoiceButton.disabled = false;
        enableVoiceButton.textContent = "Hangvezérlés bekapcsolása";
      };

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (event.results[i].isFinal) {
            const spoken = event.results[i][0].transcript;
            processCommand(spoken);
          }
        }
      };

      recognition.onerror = (event) => {
        const errors = {
          "not-allowed": "A mikrofonengedély megtagadva. Engedélyezd a mikrofont a böngészőben.",
          "service-not-allowed": "A böngésző nem engedélyezi a beszédfelismerő szolgáltatást.",
          "audio-capture": "Nem található mikrofon. Ellenőrizd a mikrofon csatlakozását.",
          "network": "A beszédfelismerés hálózati hibába ütközött. Ellenőrizd az internetkapcsolatot.",
          "language-not-supported": "A böngésző nem támogatja a magyar beszédfelismerést."
        };
        if (errors[event.error]) {
          voiceOn = false;
          restarting = false;
          updateVoiceUi(false, errors[event.error] + " A gombok továbbra is használhatók.");
          byId("welcomeStatus").textContent = errors[event.error];
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          message("A hangfelismerés átmenetileg nem működik. Próbáld újra a hangvezérlés gombbal.");
        }
      };

      recognition.onend = () => {
        if (voiceOn && !restarting) {
          restarting = true;
          window.setTimeout(() => {
            restarting = false;
            if (!voiceOn || !recognition) return;
            try { recognition.start(); }
            catch (_) {
              voiceOn = false;
              updateVoiceUi(false, "A hangfelismerés leállt. Indítsd újra a gombbal.");
            }
          }, 700);
        }
      };

      enableVoiceButton.disabled = true;
      enableVoiceButton.textContent = "Mikrofon indítása…";
      recognition.start();
    } catch (_) {
      voiceOn = false;
      enableVoiceButton.disabled = false;
      enableVoiceButton.textContent = "Hangvezérlés bekapcsolása";
      updateVoiceUi(false, "Nem sikerült elindítani a mikrofont. Ellenőrizd az engedélyeket, vagy használd a gombokat.");
    }
  }

  enableVoiceButton.addEventListener("click", startListening);
  voiceToggleButton.addEventListener("click", () => {
    if (voiceOn) stopListening();
    else startListening();
  });
  byId("continueWithoutVoice").addEventListener("click", () => {
    welcome.hidden = true;
    message("Hangvezérlés nélkül használod az alkalmazást.");
  });

  speedInput.addEventListener("input", () => {
    byId("speedValue").textContent = `${Number(speedInput.value).toFixed(1).replace(".", ",")}×`;
  });

  byId("readButton").addEventListener("click", readText);
  byId("pauseButton").addEventListener("click", () => {
    if (!canSpeak) return message("A felolvasást ez a böngésző nem támogatja.");
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      message("A felolvasás folytatódik.");
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      message("A felolvasás szünetel.");
    } else message("Most nincs folyamatban felolvasás.");
  });
  byId("stopButton").addEventListener("click", () => {
    if (canSpeak) window.speechSynthesis.cancel();
    message("A felolvasás leállt.");
  });

  byId("imageInput").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      chosenImage = null;
      byId("scanButton").disabled = true;
      ocrStatus.textContent = "Kérjük, képfájlt válassz.";
      return;
    }
    chosenImage = file;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = URL.createObjectURL(file);
    byId("imagePreview").src = imageUrl;
    byId("imagePreviewWrap").hidden = false;
    byId("scanButton").disabled = false;
    ocrStatus.textContent = `Kiválasztva: ${file.name}`;
  });

  byId("scanButton").addEventListener("click", async () => {
    if (!chosenImage) {
      ocrStatus.textContent = "Először válassz ki egy képet.";
      return;
    }
    const button = byId("scanButton");
    button.disabled = true;
    ocrStatus.textContent = "Szövegfelismerés folyamatban…";
    try {
      if (!window.SeeVoiceOCR) throw new Error("A képfelismerő nem töltődött be. Frissítsd az oldalt, és ellenőrizd az internetkapcsolatot.");
      const result = await window.SeeVoiceOCR.recognizeImage(chosenImage, progress => {
        ocrStatus.textContent = `Szövegfelismerés… ${progress}%`;
      });
      textArea.value = result;
      ocrStatus.textContent = result
        ? "A szöveg felismerése befejeződött."
        : "Nem találtam szöveget. Próbálj élesebb, világosabb képet.";
      if (result) message("A szöveg elkészült. Mondd: olvasd fel, vagy használd a Felolvasás gombot.");
    } catch (error) {
      ocrStatus.textContent = error && error.message ? error.message : "A képfelismerés nem sikerült.";
    } finally {
      button.disabled = !chosenImage;
    }
  });

  loadVoices();
  if (canSpeak) window.speechSynthesis.onvoiceschanged = loadVoices;

  window.addEventListener("beforeunload", () => {
    voiceOn = false;
    if (recognition) {
      try { recognition.stop(); } catch (_) {}
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (canSpeak) window.speechSynthesis.cancel();
  });
})();
