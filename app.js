(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const textArea = $("recognizedText");
  const status = $("status");
  const ocrStatus = $("ocrStatus");
  const voiceButton = $("voiceToggleButton");
  const welcome = $("voiceWelcome");
  const enableVoiceButton = $("enableVoiceButton");
  const speedInput = $("speed");
  const voiceSelect = $("voiceSelect");
  let selectedImage = null;
  let previewUrl = null;
  let recognition = null;
  let listening = false;
  let voiceEnabled = false;
  let shouldRestart = false;
  let restartTimer = null;
  const hasSpeechSynthesis = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  function sayStatus(message) { status.textContent = message; }
  function setVoiceState(active, message) {
    $("voiceIndicator").classList.toggle("active", active);
    $("voiceState").textContent = active ? "Hangvezérlés aktív – figyelek" : "Hangvezérlés nincs bekapcsolva";
    voiceButton.textContent = active ? "Hangvezérlés kikapcsolása" : "Hangvezérlés indítása";
    sayStatus(message);
  }

  function getSelectedVoice() {
    if (!hasSpeechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.name === voiceSelect.value) ||
      voices.find(v => v.lang.toLowerCase().startsWith("hu")) || voices[0] || null;
  }

  function speak(content = textArea.value) {
    if (!hasSpeechSynthesis) { sayStatus("Ebben a böngészőben nem érhető el a felolvasás."); return; }
    const cleanText = String(content || "").trim();
    if (!cleanText) { sayStatus("Még nincs felolvasható szöveg. Tölts fel egy képet, vagy írj be szöveget."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "hu-HU";
    utterance.rate = Number(speedInput.value) || 0.9;
    const voice = getSelectedVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => sayStatus("Felolvasás folyamatban.");
    utterance.onend = () => sayStatus("A felolvasás befejeződött.");
    utterance.onerror = (event) => { if (!["canceled", "interrupted"].includes(event.error)) sayStatus("A böngésző nem tudta lejátszani a beszédet."); };
    window.speechSynthesis.speak(utterance);
  }

  function populateVoices() {
    if (!hasSpeechSynthesis) { voiceSelect.innerHTML = "<option value=''>Nem érhető el</option>"; voiceSelect.disabled = true; return; }
    const voices = window.speechSynthesis.getVoices();
    const old = voiceSelect.value;
    voiceSelect.replaceChildren();
    if (!voices.length) { const o = document.createElement("option"); o.value = ""; o.textContent = "Eszköz alapértelmezett hangja"; voiceSelect.append(o); return; }
    voices.forEach(v => { const o = document.createElement("option"); o.value = v.name; o.textContent = `${v.name} (${v.lang})`; voiceSelect.append(o); });
    voiceSelect.value = voices.some(v => v.name === old) ? old : (voices.find(v => v.lang.toLowerCase().startsWith("hu")) || voices[0]).name;
  }
  populateVoices();
  if (hasSpeechSynthesis) window.speechSynthesis.onvoiceschanged = populateVoices;

  function stopRecognition() {
    shouldRestart = false;
    clearTimeout(restartTimer);
    if (recognition && listening) { try { recognition.stop(); } catch (_) {} }
    listening = false;
    voiceEnabled = false;
    setVoiceState(false, "A hangvezérlés kikapcsolva.");
  }

  function startRecognition() {
    if (!SpeechRecognition) {
      voiceEnabled = false;
      setVoiceState(false, "A hangfelismerés nem támogatott ebben a böngészőben. Használj Chrome-ot, vagy a képernyőn lévő gombokat.");
      $("welcomeStatus").textContent = "A hangfelismerés nem támogatott. Javasoljuk a Chrome böngészőt.";
      return false;
    }
    if (listening) return true;
    recognition = new SpeechRecognition();
    recognition.lang = "hu-HU";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      listening = true;
      voiceEnabled = true;
      shouldRestart = true;
      setVoiceState(true, "Figyelek. Mondd ki a kívánt utasítást!");
      $("welcomeStatus").textContent = "A hangvezérlés aktív. Már adhatsz is utasításokat.";
      enableVoiceButton.textContent = "Hangvezérlés aktív";
    };
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result?.[0]?.transcript;
      if (transcript) handleCommand(transcript);
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldRestart = false; voiceEnabled = false;
        setVoiceState(false, "A mikrofon engedélyezése nem sikerült. Engedélyezd a mikrofont a böngésző címsoránál, majd próbáld újra.");
        $("welcomeStatus").textContent = "A mikrofonhoz engedély szükséges. Ellenőrizd a böngésző beállításait.";
      } else if (event.error === "audio-capture") {
        sayStatus("Nem található használható mikrofon. Ellenőrizd a csatlakoztatást és a beállításokat.");
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        sayStatus("Átmeneti hangfelismerési hiba. Újra próbálok kapcsolódni.");
      }
    };
    recognition.onend = () => {
      listening = false;
      if (shouldRestart && voiceEnabled) {
        clearTimeout(restartTimer);
        restartTimer = setTimeout(() => {
          if (!shouldRestart || !voiceEnabled || listening) return;
          try { recognition.start(); } catch (error) { console.warn("Recognition restart:", error); }
        }, 450);
      } else if (!voiceEnabled) {
        $("voiceIndicator").classList.remove("active");
      }
    };
    try { recognition.start(); return true; }
    catch (error) { console.error("Speech recognition start:", error); sayStatus("Nem sikerült elindítani a mikrofont. Próbáld újra a gombbal."); return false; }
  }

  function enableVoice() {
    if (!SpeechRecognition) { startRecognition(); return; }
    shouldRestart = true;
    voiceEnabled = true;
    enableVoiceButton.disabled = true;
    enableVoiceButton.textContent = "Mikrofon csatlakoztatása…";
    const started = startRecognition();
    if (!started) { enableVoiceButton.disabled = false; enableVoiceButton.textContent = "Hangvezérlés bekapcsolása"; }
    else { welcome.hidden = true; }
  }

  function handleCommand(command) {
    const c = command.toLocaleLowerCase("hu-HU").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (/(olvasd fel|felolvasas|kezdj olvasni|olvasas indul|read this|read aloud)/.test(c)) speak();
    else if (/(szunet|allj meg|pause|varj)/.test(c)) {
      if (hasSpeechSynthesis && window.speechSynthesis.speaking) { window.speechSynthesis.pause(); sayStatus("A felolvasás szünetel."); }
      else sayStatus("Jelenleg nincs folyamatban felolvasás.");
    } else if (/(folytatas|tovabb|resume|continue)/.test(c)) {
      if (hasSpeechSynthesis && window.speechSynthesis.paused) { window.speechSynthesis.resume(); sayStatus("A felolvasás folytatódik."); }
      else sayStatus("Nincs szüneteltetett felolvasás.");
    } else if (/(ismeteld|ismetles|ujra|repeat|again)/.test(c)) speak();
    else if (/(lassabban|lassits|slower|slow down)/.test(c)) {
      speedInput.value = Math.max(0.6, Number(speedInput.value) - 0.2).toFixed(1);
      speedInput.dispatchEvent(new Event("input")); sayStatus("Lassabb sebesség beállítva. Mondd: olvasd fel.");
    } else if (/(gyorsabban|gyorsits|faster|speed up)/.test(c)) {
      speedInput.value = Math.min(1.5, Number(speedInput.value) + 0.2).toFixed(1);
      speedInput.dispatchEvent(new Event("input")); sayStatus("Gyorsabb sebesség beállítva. Mondd: olvasd fel.");
    } else if (/(allj|leallit|stop|cancel)/.test(c)) {
      if (hasSpeechSynthesis) window.speechSynthesis.cancel(); sayStatus("A felolvasás leállt.");
    } else sayStatus(`Ezt hallottam: „${command}”. Próbáld: olvasd fel, szünet, folytatás vagy állj.`);
  }

  $("continueWithoutVoice").addEventListener("click", () => { welcome.hidden = true; sayStatus("Hangvezérlés nélkül használod az alkalmazást."); });
  enableVoiceButton.addEventListener("click", enableVoice);
  voiceButton.addEventListener("click", () => {
    if (voiceEnabled) stopRecognition();
    else {
      shouldRestart = true; voiceEnabled = true;
      if (startRecognition()) sayStatus("A hangvezérlés elindult.");
    }
  });

  speedInput.addEventListener("input", () => { $("speedValue").textContent = `${Number(speedInput.value).toFixed(1).replace(".", ",")}×`; });
  $("imageInput").addEventListener("change", (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { selectedImage = null; $("scanButton").disabled = true; ocrStatus.textContent = "Kérjük, képfájlt válassz."; event.target.value = ""; return; }
    selectedImage = file;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    $("imagePreview").src = previewUrl; $("imagePreviewWrap").hidden = false;
    $("scanButton").disabled = false; ocrStatus.textContent = `Kiválasztva: ${file.name}`;
  });
  $("scanButton").addEventListener("click", async () => {
    if (!selectedImage) { ocrStatus.textContent = "Először válassz ki egy képet."; return; }
    const button = $("scanButton"); button.disabled = true; ocrStatus.textContent = "Szövegfelismerés előkészítése…";
    try {
      const recognized = await window.SeeVoiceOCR.recognizeImage(selectedImage, p => { ocrStatus.textContent = `Szövegfelismerés… ${p}%`; });
      textArea.value = recognized;
      ocrStatus.textContent = recognized ? "A szöveg felismerése sikerült. Már fel is olvashatod." : "Nem találtam szöveget. Próbálj élesebb, világosabb képet.";
      if (recognized) sayStatus("A szöveg elkészült. Mondd: olvasd fel, vagy nyomd meg a Felolvasás gombot.");
    } catch (error) { console.error("OCR error:", error); ocrStatus.textContent = error instanceof Error ? error.message : "A kép felismerése nem sikerült."; }
    finally { button.disabled = !selectedImage; }
  });
  $("readButton").addEventListener("click", () => speak());
  $("pauseButton").addEventListener("click", () => {
    if (!hasSpeechSynthesis) return sayStatus("A felolvasás nem támogatott.");
    if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); sayStatus("A felolvasás folytatódik."); }
    else if (window.speechSynthesis.speaking) { window.speechSynthesis.pause(); sayStatus("A felolvasás szünetel."); }
    else sayStatus("Nincs folyamatban felolvasás.");
  });
  $("stopButton").addEventListener("click", () => { if (hasSpeechSynthesis) window.speechSynthesis.cancel(); sayStatus("A felolvasás leállt."); });
  window.addEventListener("beforeunload", () => {
    shouldRestart = false; clearTimeout(restartTimer);
    if (recognition && listening) recognition.stop();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (hasSpeechSynthesis) window.speechSynthesis.cancel();
  });
})();
