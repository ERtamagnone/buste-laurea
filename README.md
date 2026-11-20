# Le Buste del Dottore 🎓

Webapp (PWA) per iPhone: 3 sfide → 3 buste, più un premio finale a sorpresa.

- `index.html` – l'app
- `admin.html` – pannello admin (testi, quiz, enigmi, difficoltà, ordine, premio finale, stato e reset)

## 1. Supabase (salvataggio online)
1. Crea un progetto gratuito su supabase.com.
2. **Authentication → Users → Add user → Create new user**: la tua email e una password (spunta "Auto confirm").
3. **Authentication → Sign In / Providers**: disattiva "Allow new users to sign up".
4. **SQL Editor**: incolla `supabase.sql`, sostituisci `TUA_EMAIL@esempio.it` con la tua email e premi **Run**.
5. **Project Settings → API**: copia *Project URL* e la chiave *anon/publishable* in `config.js`.

## 2. GitHub Pages
1. Carica i file in un repository GitHub.
2. **Settings → Pages → Deploy from a branch → main / (root)**.
3. Dopo un minuto l'app è su `https://TUONOME.github.io/NOMEREPO/`.

## 3. Uso
- Admin: apri `.../admin.html`, accedi, personalizza tutto e premi **Salva**. Con **Anteprima** provi l'app senza registrare vincite.
- Prima di consegnarla: **Stato → Reset tutto**.
- Su iPhone: apri il link in **Safari → Condividi → Aggiungi alla schermata Home**.
