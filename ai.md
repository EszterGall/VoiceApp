# AI-eszközök és technológiák

A projekt kialakításához ChatGPT nyújtott támogatást.

## A támogatás felhasználása
- A látássérült és gyengénlátó felhasználókat segítő alapkoncepció és funkciók megtervezése.
- A felhasználói folyamat és a prototípus hatókörének kialakítása.
- A HTML-, CSS- és JavaScript-kód megírásának és továbbfejlesztésének támogatása.
- A hangvezérlés, a nagy kontrasztú felület és az akadálymentes használat szempontjainak átgondolása.
- A dokumentáció és a tesztelési útmutató elkészítése.

## Futás közben használt technológiák
- **Tesseract.js:** a feltöltött képen található angol szöveg felismerése az `ocr.js` fájlon keresztül.
- **Web Speech API – SpeechSynthesis:** a felismert vagy beírt szöveg böngészőben történő felolvasása.
- **Web Speech API – SpeechRecognition:** magyar nyelvű hangutasítások felismerése, ha a böngésző támogatja.
- Az alkalmazás futás közben nem hív generatív AI API-t, és nem igényel API-kulcsot.

## Korlátok
A mikrofon engedélyezéséhez a felhasználónak interakcióra van szüksége; a böngésző nem enged automatikus mikrofonindítást oldalbetöltéskor. A hangfelismerés böngésző- és eszközfüggő, a Tesseract OCR jelenleg angol nyelvre van beállítva. A prototípust célböngészőben és lehetőség szerint akadálymentesítési felhasználókkal is tesztelni kell.
