# Le Buste del Dottore 🎓

Webapp (PWA) per iPhone: 3 sfide → 3 buste, più un premio finale a sorpresa.

- `index.html` – l'app
- `admin.html` – pannello admin (testi, quiz, enigmi, difficoltà, ordine, premio finale, stato e reset)

## 1. Supabase
Già configurato: tabelle, regole di sicurezza e chiave in `config.js`. Lo schema è in `supabase.sql`, nel caso servisse ricrearlo.

## 2. GitHub Pages
**Settings → Pages → Deploy from a branch → main / (root)**. Su un account gratuito il repository deve essere pubblico. Il sito sarà su `https://ertamagnone.github.io/buste-laurea/`.

## 3. Uso
- Admin: apri `.../admin.html`, accedi, personalizza tutto e premi **Salva**. Con **Anteprima** provi l'app senza registrare vincite.
- Prima di consegnarla: **Stato → Reset tutto**.
- Su iPhone: apri il link in **Safari → Condividi → Aggiungi alla schermata Home**.
