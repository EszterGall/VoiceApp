# SeeVoice – A világod, hallhatóan

A SeeVoice egy böngészőben futó akadálymentesítési prototípus, amely képeken található szöveget ismer fel, majd felolvassa azt. A felolvasás magyar nyelvű hangutasításokkal is vezérelhető.

## Funkciók
- Belépéskor azonnal megjelenő, kiemelt hangvezérlési ablak.
- Egyetlen felhasználói kattintással elindítható mikrofon és folyamatos hangutasítás-figyelés.
- Magyar nyelvű hangutasítások: `olvasd fel`, `szünet`, `folytatás`, `ismételd`, `lassabban`, `gyorsabban`, `állj`.
- Kép feltöltése és előnézete.
- Angol szöveg felismerése Tesseract.js segítségével.
- A felismert szöveg szerkesztése, illetve saját szöveg beírása vagy beillesztése.
- Felolvasás a böngésző SpeechSynthesis API-jával, beszédhang- és sebességválasztással.
- A hangvezérlés nélküli, képernyőn lévő gombokkal történő használat lehetősége.

## Projektfájlok
- `index.html` – a felület szerkezete és a külső könyvtár betöltése.
- `style.css` – középre rendezett, nagy betűs, kontrasztos és reszponzív megjelenés.
- `app.js` – hangvezérlés, felolvasás és felhasználói műveletek.
- `ocr.js` – Tesseract.js képfelismerési integráció.
- `ai.md` – az AI-eszközök és futásidejű technológiák leírása.

## Futtatás helyben
1. Csomagold ki a ZIP-fájlt.
2. Nyiss terminált a `SeeVoice` mappában.
3. Indíts helyi webszervert: `python -m http.server 8000`
4. Nyisd meg a `http://localhost:8000` címet Chrome-ban.
5. A kezdőablakban kattints a **Hangvezérlés bekapcsolása** gombra, majd engedélyezd a mikrofon használatát.
6. Tölts fel egy képet, válaszd a **Szöveg felismerése** lehetőséget, majd mondd: **„Olvasd fel”**.

## GitHub Pages közzététel
A `SeeVoice` mappa tartalmát (ne magát a mappát) töltsd fel a repository gyökérkönyvtárába, hogy az `index.html` közvetlenül a gyökérben legyen. Ezután a repository Settings → Pages menüpontjában állítsd be a `main` ágat és a `/(root)` mappát. A hangvezérléshez HTTPS szükséges; a GitHub Pages ezt biztosítja.

## Böngésző- és nyelvi korlátok
- A hangfelismerés `hu-HU` nyelvre van állítva, és Chrome-ban működik a legmegbízhatóbban. Internetkapcsolat szükséges lehet a böngésző beszédfelismerő szolgáltatásához.
- A böngésző biztonsági okokból nem engedélyezi a mikrofon automatikus, kattintás nélküli bekapcsolását. Ezért a belépéskor látható ablakban egyszer rá kell kattintani a hangvezérlés indítására, és engedélyezni kell a mikrofont.
- A beszédhangok az operációs rendszertől és a böngészőtől függenek; a magyar felolvasóhang elérhetősége eszközönként eltérhet.
- A képfelismerés jelenleg angol nyelvű (`eng`).
- A felismerés pontossága függ a kép élességétől, megvilágításától, a betűmérettől és az elrendezéstől.

## Fontos
Ez kísérleti prototípus, nem minősített segédeszköz. A képfelismerés és a beszédfelismerés hibázhat. Gyógyszeradagolással, dátumokkal, címekkel, pénzügyekkel vagy más fontos információkkal kapcsolatos szöveget mindig ellenőrizz külön is.
