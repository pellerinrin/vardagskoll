# Vardagskoll 🧡

En lugn liten app för ensamstående föräldrar — håller koll på vilka dagar barnen är hos dig, matplanering, aktivitetstips, städschema och påminnelser om gympakläder.

Byggd som en installerbar PWA (Progressive Web App): ingen backend, ingen databas — all data sparas lokalt i din webbläsare på din enhet.

## Funktioner

- **Kalender** — markera exakt vilka dagar/veckor barnen är hos dig
- **Mat** — matförslag med ingredienser, egna recept, inköpslista
- **Aktivitet** — förslag på saker att göra ute/inne/gratis, planera på valfri dag
- **Städ** — veckoschema som nollställs varje måndag
- **Gympapåminnelser** — lägg in vilka dagar barnen har gympa, få påminnelse 1 och 2 dagar innan
- **Installerbar** — lägg till på hemskärmen så fungerar den som en riktig app, även offline

## Jobbresor från Skrivbordet

Om [Skrivbordet](https://github.com/pellerinrin/skrivbordet) körs på **samma origin** (samma domän, t.ex. samma GitHub Pages-konto) visar kalendern automatiskt en 🧳-markering på dagar du lagt in som jobbresa där. Delningen sker via `localStorage`-nyckeln `delade-handelser-v1` (se `shared.js`) och uppdateras direkt om båda apparna är öppna samtidigt. Vardagskoll läser bara denna data — jobbresor läggs till och tas bort i Skrivbordet.

## Köra lokalt

Öppna `index.html` direkt i en webbläsare, eller starta en lokal server:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1
```

Öppna sedan `http://localhost:8641/`.

## Installera på telefonen

- **Android/Chrome:** öppna sidan → knappen "Installera appen" dyker upp under fliken **Mer**
- **iPhone/Safari:** öppna sidan → tryck **Dela** → **"Lägg till på hemskärmen"**

## Teknik

Ren HTML/CSS/JavaScript, inga byggverktyg eller beroenden. `shared.js` innehåller datum- och påminnelselogik som delas mellan sidan och service workern (`sw.js`), som cachar appen för offline-bruk och gör ett bästa-möjliga-försök att skicka bakgrundspåminnelser (stöds bara på Android/Chrome, installerad app).
