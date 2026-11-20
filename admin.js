(function () {
  const $ = s => document.querySelector(s);
  const NAMES = { quiz: "🧠 Quiz", factory: "⚙️ Catena di montaggio", puzzle: "🧩 Enigma" };
  let cfg, prog, dirty = false;

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("show"), 2200); }
  function touch() { dirty = true; $("#bSave").textContent = "💾 Salva *"; }
  window.addEventListener("beforeunload", e => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  // campo legato a un oggetto: field(obj, key, label, type)
  function field(obj, key, label, type = "text", attrs = "") {
    const wrap = document.createElement("div");
    const id = "f" + Math.random().toString(36).slice(2);
    wrap.innerHTML = `<label for="${id}">${esc(label)}</label>` + (type === "textarea"
      ? `<textarea id="${id}" ${attrs}></textarea>` : `<input id="${id}" type="${type}" ${attrs}>`);
    const el = wrap.querySelector("input,textarea");
    el.value = obj[key] ?? "";
    el.oninput = () => { obj[key] = type === "number" ? Number(el.value) : el.value; touch(); };
    return wrap;
  }
  function box(title, help) {
    const b = document.createElement("div"); b.className = "box";
    b.innerHTML = (title ? `<h3>${esc(title)}</h3>` : "") + (help ? `<p class="muted">${help}</p>` : "");
    return b;
  }
  function btn(text, cls, fn) { const b = document.createElement("button"); b.className = "btn sm " + (cls || ""); b.textContent = text; b.onclick = fn; return b; }
  function move(arr, i, d) { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; touch(); }

  /* ---------- TESTI ---------- */
  function renderTesti() {
    const t = $("#t-testi"); t.innerHTML = "";
    const b = box("Intestazione");
    b.append(field(cfg, "name", "Nome"), field(cfg, "title", "Titolo grande (es. Dott. Luck)"),
      field(cfg, "degree", "Corso di laurea", "textarea"), field(cfg, "dedication", "Dedica iniziale", "textarea"));
    t.append(b);
    cfg.envelopes.forEach((e, i) => {
      const eb = box(`Busta n. ${i + 1}`, `Si vince con: <b>${NAMES[cfg.order[i]] || "—"}</b> (l'ordine si cambia in “Difficoltà e ordine”).`);
      eb.append(field(e, "title", "Titolo sul biglietto"), field(e, "message", "Messaggio", "textarea"));
      t.append(eb);
    });
  }

  /* ---------- QUIZ ---------- */
  function renderQuiz() {
    const t = $("#t-quiz"), Q = cfg.quiz; t.innerHTML = "";
    const h = box("Sfida Quiz");
    h.append(field(Q, "title", "Titolo"), field(Q, "intro", "Introduzione", "textarea"));
    t.append(h);
    Q.questions.forEach((q, i) => {
      const b = box(`Domanda ${i + 1}`, "Seleziona il pallino della risposta giusta.");
      b.append(field(q, "q", "Testo della domanda", "textarea"));
      const name = "c" + i + Math.random().toString(36).slice(2, 6);
      q.options.forEach((o, k) => {
        const r = document.createElement("div"); r.className = "opt-row";
        r.innerHTML = `<input type="radio" name="${name}" ${Number(q.correct) === k ? "checked" : ""} aria-label="Risposta giusta"><input type="text">`;
        const [radio, txt] = r.querySelectorAll("input");
        txt.value = o; txt.oninput = () => { q.options[k] = txt.value; touch(); };
        radio.onchange = () => { q.correct = k; touch(); };
        const del = btn("✕", "ko", () => { if (q.options.length <= 2) return toast("Servono almeno 2 risposte"); q.options.splice(k, 1); if (q.correct >= q.options.length || q.correct === k) q.correct = 0; else if (q.correct > k) q.correct--; touch(); renderQuiz(); });
        del.style.flex = "none"; r.append(del); b.append(r);
      });
      const tools = document.createElement("div"); tools.className = "tools";
      tools.append(
        btn("+ Risposta", "", () => { q.options.push(""); touch(); renderQuiz(); }),
        btn("↑", "", () => { move(Q.questions, i, -1); renderQuiz(); }),
        btn("↓", "", () => { move(Q.questions, i, 1); renderQuiz(); }),
        btn("Elimina domanda", "ko", () => { if (confirm("Eliminare questa domanda?")) { Q.questions.splice(i, 1); touch(); renderQuiz(); } }));
      b.append(tools); t.append(b);
    });
    const add = btn("+ Aggiungi domanda", "pri", () => { Q.questions.push({ q: "", options: ["", "", "", ""], correct: 0 }); touch(); renderQuiz(); });
    add.style.width = "100%"; t.append(add);
  }

  /* ---------- ENIGMI ---------- */
  function renderEnigmi() {
    const t = $("#t-enigmi"), P = cfg.puzzle; t.innerHTML = "";
    const h = box("Sfida Enigma", "Luck riordina le lettere di ogni parola. Alla fine il lucchetto si apre con il numero di lettere di ogni parola (calcolato da solo).");
    h.append(field(P, "title", "Titolo"), field(P, "intro", "Introduzione", "textarea"), field(P, "finalPrompt", "Testo del lucchetto finale", "textarea"));
    const code = document.createElement("p"); code.className = "muted";
    const upd = () => code.innerHTML = `Codice attuale del lucchetto: <b>${P.words.map(w => String(w.word || "").replace(/[^A-Za-zÀ-ü]/g, "").length).join("") || "—"}</b>`;
    upd(); h.append(code); t.append(h);
    P.words.forEach((w, i) => {
      const b = box(`Parola ${i + 1}`);
      const f = field(w, "word", "Parola (solo lettere, meglio senza spazi)");
      f.querySelector("input").addEventListener("input", upd);
      b.append(f, field(w, "hint", "Indizio"));
      const tools = document.createElement("div"); tools.className = "tools";
      tools.append(btn("↑", "", () => { move(P.words, i, -1); renderEnigmi(); }), btn("↓", "", () => { move(P.words, i, 1); renderEnigmi(); }),
        btn("Elimina", "ko", () => { if (P.words.length <= 1) return toast("Serve almeno una parola"); P.words.splice(i, 1); touch(); renderEnigmi(); }));
      b.append(tools); t.append(b);
    });
    const add = btn("+ Aggiungi parola", "pri", () => { P.words.push({ word: "", hint: "" }); touch(); renderEnigmi(); });
    add.style.width = "100%"; t.append(add);
  }

  /* ---------- DIFFICOLTÀ E ORDINE ---------- */
  function renderDiff() {
    const t = $("#t-diff"); t.innerHTML = "";
    const o = box("Ordine delle sfide", "La prima sfida fa vincere la Busta 1, la seconda la Busta 2, la terza la Busta 3.");
    cfg.order.forEach((ch, i) => {
      const r = document.createElement("div"); r.className = "order-item";
      r.innerHTML = `<span class="pill">Busta ${i + 1}</span><b>${NAMES[ch]}</b>`;
      r.append(btn("↑", "", () => { move(cfg.order, i, -1); renderDiff(); renderTesti(); }), btn("↓", "", () => { move(cfg.order, i, 1); renderDiff(); renderTesti(); }));
      o.append(r);
    });
    const sw = document.createElement("label"); sw.className = "switch";
    sw.innerHTML = `<input type="checkbox" ${cfg.sequential ? "checked" : ""}> Sblocco in sequenza (una sfida alla volta)`;
    sw.querySelector("input").onchange = e => { cfg.sequential = e.target.checked; touch(); };
    o.append(sw); t.append(o);

    const q = box("Quiz");
    const th = field(cfg.quiz, "threshold", `Risposte giuste necessarie (su ${cfg.quiz.questions.length})`, "number", `min="1" max="${cfg.quiz.questions.length}"`);
    q.append(th); t.append(q);

    const f = box("Catena di montaggio", "Più bassa la velocità e la % di difettosi, più è facile. Ogni 4 pezzi buoni Luck recupera una vita.");
    f.append(field(cfg.factory, "title", "Titolo"), field(cfg.factory, "intro", "Istruzioni", "textarea"));
    const row = document.createElement("div"); row.className = "row";
    row.append(field(cfg.factory, "target", "Pezzi buoni per vincere", "number", 'min="1" max="50"'),
      field(cfg.factory, "lives", "Vite", "number", 'min="1" max="9"'));
    const row2 = document.createElement("div"); row2.className = "row";
    row2.append(field(cfg.factory, "speed", "Velocità nastro (40 facile – 150 difficile)", "number", 'min="20" max="250"'),
      field(cfg.factory, "defectRate", "Quota difettosi (0–0.8)", "number", 'min="0" max="0.8" step="0.05"'));
    f.append(row, row2); t.append(f);
  }

  /* ---------- PREMIO FINALE ---------- */
  function renderPremio() {
    const t = $("#t-premio"), X = cfg.final; t.innerHTML = "";
    const b = box("Premio finale segreto", "Si sblocca dopo le 3 buste: Luck gratta una patina dorata e legge il messaggio. <b>Non scrivere cos'è il regalo</b> se vuoi mantenere la sorpresa: questi testi li vede Luck.");
    b.append(field(X, "title", "Titolo (visibile dopo le 3 buste)"), field(X, "lockedText", "Testo quando è ancora bloccato", "textarea"),
      field(X, "message", "Messaggio sotto il gratta e vinci", "textarea"));
    t.append(b);
    const h = box("Indizi (facoltativi)", "Compare un indizio sulla card del premio: il primo con 0 buste, il secondo dopo 1 busta, e così via (l'ultimo resta fino alla fine).");
    X.hints = X.hints || [];
    X.hints.forEach((_, i) => {
      const r = document.createElement("div"); r.className = "opt-row";
      const inp = document.createElement("input"); inp.type = "text"; inp.value = X.hints[i]; inp.placeholder = "Es. Ti starà a pennello…";
      inp.oninput = () => { X.hints[i] = inp.value; touch(); };
      const del = btn("✕", "ko", () => { X.hints.splice(i, 1); touch(); renderPremio(); }); del.style.flex = "none";
      r.append(inp, del); h.append(r);
    });
    const tools = document.createElement("div"); tools.className = "tools";
    tools.append(btn("+ Aggiungi indizio", "", () => { X.hints.push(""); touch(); renderPremio(); }));
    h.append(tools); t.append(h);
  }

  /* ---------- STATO ---------- */
  async function renderStato(reload) {
    const t = $("#t-stato");
    if (reload) { try { prog = await DB.loadProgress(); } catch (e) { toast("Impossibile leggere lo stato"); } }
    t.innerHTML = "";
    const b = box("Buste vinte", "Si aggiorna in tempo reale da quello che fa Luck nell'app.");
    const won = new Map(prog.envelopes.map(e => [e.n, e]));
    for (let n = 1; n <= 3; n++) {
      const e = won.get(n), r = document.createElement("div"); r.className = "env-status";
      r.innerHTML = `<span class="pill ${e ? "ok" : ""}">${e ? "✓ Vinta" : "Non ancora"}</span><div style="flex:1"><b>Busta ${n}</b><div class="muted">${e ? new Date(e.at).toLocaleString("it-IT") : NAMES[cfg.order[n - 1]]}</div></div>`;
      r.append(e ? btn("Togli", "ko", () => setProg(p => { p.envelopes = p.envelopes.filter(x => x.n !== n); if (p.envelopes.length < 3) p.final_claimed_at = null; }))
        : btn("Assegna", "ok", () => setProg(p => { p.envelopes.push({ n, challenge: "admin", at: new Date().toISOString() }); })));
      b.append(r);
    }
    const f = document.createElement("div"); f.className = "env-status";
    f.innerHTML = `<span class="pill ${prog.final_claimed_at ? "ok" : ""}">${prog.final_claimed_at ? "✓ Riscattato" : "Non ancora"}</span><div style="flex:1"><b>Premio finale</b><div class="muted">${prog.final_claimed_at ? new Date(prog.final_claimed_at).toLocaleString("it-IT") : "Dopo le 3 buste"}</div></div>`;
    if (prog.final_claimed_at) f.append(btn("Togli", "ko", () => setProg(p => { p.final_claimed_at = null; })));
    b.append(f);
    const tools = document.createElement("div"); tools.className = "tools";
    tools.append(btn("↻ Aggiorna", "", () => renderStato(true)),
      btn("Reset tutto", "ko", () => { if (confirm("Azzerare tutte le buste e il premio finale?")) setProg(p => { p.envelopes = []; p.final_claimed_at = null; }); }));
    b.append(tools); t.append(b);
    const s = box("Account");
    s.append(btn(DB.mode === "online" ? "Esci" : "Modalità locale", "", async () => { if (DB.mode !== "online") return; await DB.signOut(); location.reload(); }));
    t.append(s);
  }
  async function setProg(fn) {
    const p = JSON.parse(JSON.stringify(prog)); fn(p); p.envelopes.sort((a, b) => a.n - b.n);
    try { await DB.setProgress(p); prog = p; toast("Stato aggiornato"); renderStato(); }
    catch (e) { toast("Errore: " + (e.message || e)); }
  }

  function renderAll() { renderTesti(); renderQuiz(); renderEnigmi(); renderDiff(); renderPremio(); renderStato(); }

  /* ---------- azioni ---------- */
  $("#nav").onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    document.querySelectorAll("#nav button").forEach(x => x.classList.toggle("on", x === b));
    document.querySelectorAll(".tab").forEach(x => x.classList.toggle("on", x.id === "t-" + b.dataset.t));
    if (b.dataset.t === "diff") renderDiff();
    if (b.dataset.t === "stato") renderStato(true);
    window.scrollTo(0, 0);
  };
  function validate() {
    const bad = cfg.quiz.questions.findIndex(q => !q.q.trim() || q.options.some(o => !String(o).trim()));
    if (bad >= 0) return `Completa la domanda ${bad + 1} del quiz (testo e tutte le risposte).`;
    if (!cfg.quiz.questions.length) return "Serve almeno una domanda nel quiz.";
    if (cfg.puzzle.words.some(w => !String(w.word).replace(/[^A-Za-zÀ-ü]/g, ""))) return "C'è una parola dell'enigma vuota.";
    cfg.quiz.threshold = Math.max(1, Math.min(cfg.quiz.questions.length, Number(cfg.quiz.threshold) || 1));
    cfg.final.hints = (cfg.final.hints || []).filter(h => String(h).trim());
    return null;
  }
  $("#bSave").onclick = async () => {
    const err = validate(); if (err) return toast(err);
    try { await DB.saveConfig(cfg); dirty = false; $("#bSave").textContent = "💾 Salva"; toast("Salvato ✓"); }
    catch (e) { toast("Errore nel salvataggio: " + (e.message || e)); }
  };
  $("#bPreview").onclick = () => {
    try { localStorage.setItem("buste.previewConfig", JSON.stringify(cfg)); } catch (e) {}
    window.open("index.html?preview=1", "_blank");
  };

  async function enter() {
    $("#login").hidden = true; $("#app").hidden = false;
    $("#mode").textContent = DB.mode === "online" ? "online" : "locale";
    $("#localWarn").hidden = DB.mode === "online";
    cfg = await DB.loadConfig();
    prog = await DB.loadProgress();
    renderAll();
  }
  async function boot() {
    if (DB.mode !== "online") return enter();
    if (!DB.client) { document.body.innerHTML = "<p style='padding:20px'>Connessione assente: riprova quando sei online.</p>"; return; }
    if (await DB.session()) return enter();
    $("#login").hidden = false;
    $("#lGo").onclick = async () => {
      $("#lErr").textContent = "";
      try { await DB.signIn($("#lEmail").value.trim(), $("#lPass").value); enter(); }
      catch (e) { $("#lErr").textContent = /confirm/i.test(e.message || "") ? "Devi prima confermare l'email: apri il link che ti è arrivato." : "Accesso non riuscito: controlla email e password."; }
    };
    $("#lSign").onclick = async () => {
      const email = $("#lEmail").value.trim(), pass = $("#lPass").value;
      $("#lErr").style.color = ""; $("#lErr").textContent = "";
      if (!email || pass.length < 8) { $("#lErr").textContent = "Inserisci email e una password di almeno 8 caratteri."; return; }
      try {
        const d = await DB.signUp(email, pass);
        if (d.session) return enter();
        $("#lErr").style.color = "var(--ok)";
        $("#lErr").textContent = "Fatto! Apri l'email di conferma che ti è arrivata, poi torna qui ed entra.";
      } catch (e) { $("#lErr").textContent = "Registrazione non riuscita: " + (e.message || e); }
    };
  }
  boot();
})();
