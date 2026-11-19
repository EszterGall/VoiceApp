# SeeVoice – egyszerű, nagybetűs felolvasó

A SeeVoice böngészőben futó prototípus. Képet lehet feltölteni, a képen található angol szöveget OCR-rel felismertetni, majd a szöveget hangosan felolvastatni.

## Funkciók
- Egyszerű, világos háttér és fekete szöveg.
- Nagy betűméret, jól látható gombok és billentyűzetes fókuszjelölés.
- Belépéskor megjelenő hangvezérlés-indító ablak.
- Magyar hangparancsok: `olvasd fel`, `szünet`, `folytatás`, `ismételd`, `lassabban`, `gyorsabban`, `állj`.
- Kép feltöltése, előnézete és angol OCR-felismerése Tesseract.js-szel.
- Szerkeszthető felismert szöveg és böngészős felolvasás.
- A hangvezérlés nélkül is minden fő funkció elérhető a képernyőn lévő gombokkal.

## Fájlok
- `index.html` – oldal felépítése.
- `style.css` – egyszerű, világos megjelenés.
- `app.js` – hangvezérlés, felolvasás és eseménykezelés.
- `ocr.js` – Tesseract.js OCR-integráció.
- `ai.md` – technológiai és AI-használati leírás.

## Indítás
1. Csomagold ki a projektet.
2. Nyiss terminált a `SeeVoice` mappában.
3. Futtasd: `python -m http.server 8000`
4. Nyisd meg: `http://localhost:8000`
5. Kattints a hangvezérlés indítására, majd engedélyezd a mikrofont. Vagy válaszd a hangvezérlés nélküli folytatást.

## GitHub Pages
Töltsd fel a `SeeVoice` mappa tartalmát a repository gyökérkönyvtárába, majd a Settings → Pages részen válaszd a `main` ágat és a `/(root)` mappát. A GitHub Pages HTTPS-t használ.

## Fontos kompatibilitási tudnivaló
Nem létezik olyan böngészős beszédfelismerő kód, amely minden böngészőben, eszközön, mikrofonon és internetkapcsolat mellett garantáltan működik. A `SpeechRecognition` / `webkitSpeechRecognition` támogatása korlátozott, és a magyar nyelvi támogatás is böngészőfüggő. Chrome-ban, HTTPS-en, engedélyezett mikrofonnal van a legjobb esély a működésre. Ha a beszédfelismerés nem támogatott vagy hibát jelez, a weboldal ezt jelzi, és a gombos vezérlés továbbra is használható.

A böngésző adatvédelmi szabályai miatt a mikrofon nem kapcsolható be automatikusan a látogató jóváhagyása nélkül.

## Korlátok
- Az OCR jelenleg angol nyelvre (`eng`) van beállítva.
- A hangos felolvasás a böngésző és az operációs rendszer elérhető hangjait használja.
- Az OCR és a beszédfelismerés hibázhat; fontos információkat ellenőrizni kell.
