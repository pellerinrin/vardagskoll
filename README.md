# Vardagskoll 🧡

En lugn liten app för ensamstående föräldrar — håller koll på vilka dagar barnen är hos dig, matplanering, aktivitetstips, städschema och påminnelser om gympakläder.

Byggd som en installerbar PWA (Progressive Web App): ingen backend, ingen databas — all data sparas lokalt i din webbläsare på din enhet.

## Funktioner

- **Kalender** — markera exakt vilka dagar/veckor barnen är hos dig
- **Mat** — matförslag med ingredienser, egna recept, inköpslista
- **Aktivitet** — förslag på saker att göra ute/inne/gratis, planera på valfri dag
- **Städ** — veckoschema som nollställs varje måndag, inspirerat av Städ-Kevins (Kevin Florström) metoder med 🧽-tips per uppgift, plus "Läget hemma": ta tillfälliga bilder som AI-analyseras via Skrivbordets `/api/assistent` (bilderna sparas aldrig, bara råden)
- **Aktuellt där du bor** — färska aktivitetstips via webbsökning (samma `/api/assistent`)
- **Gympapåminnelser** — lägg in vilka dagar barnen har gympa, få påminnelse 1 och 2 dagar innan
- **Installerbar** — lägg till på hemskärmen så fungerar den som en riktig app, även offline

All grundfunktionalitet ovan (kalender, mat, aktiviteter, städ) kräver **ingen inloggning** — allt sparas lokalt på enheten, precis som från början.

## Ett gemensamt medlemskap med Skrivbordet & Assistenten

Loggar du in under **Mer** med samma e-post och lösenord som [Skrivbordet](https://github.com/pellerinrin/skrivbordet) låses två saker upp: jobbresor därifrån visas med en 🧳-markering i kalendern, och barnens schema (dagar, gympa, matplan, städ) skickas upp så [Assistenten](https://github.com/pellerinrin/assistenten) kan skriva morgonbriefen. AI-funktionerna ("Läget hemma", "Aktuellt där du bor") kräver också inloggning. Inloggningen är samma Supabase-konto som Skrivbordet (`@supabase/supabase-js` laddas via CDN) — alla anrop till `/api/delat` och `/api/assistent` skickar `Authorization: Bearer <access_token>`. Vardagskoll och Assistenten ligger båda på `pellerinrin.github.io` (samma ursprung), så en inloggning i den ena gäller automatiskt i den andra.

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
