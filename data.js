/* Livello dati condiviso tra app e admin: Supabase se configurato, altrimenti localStorage. */
(function () {
  const S = window.APP_SETTINGS || {};
  const configured = !!(S.SUPABASE_URL && S.SUPABASE_KEY);
  let sb = null;
  try {
    if (configured && window.supabase) sb = window.supabase.createClient(S.SUPABASE_URL, S.SUPABASE_KEY);
  } catch (e) { sb = null; }

  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const K = { cfg: "buste.config", prog: "buste.progress", queue: "buste.queue" };

  function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
  function merge(base, over) {
    if (!isObj(over)) return JSON.parse(JSON.stringify(base));
    const out = JSON.parse(JSON.stringify(base));
    for (const k of Object.keys(over)) out[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : over[k];
    return out;
  }
  const emptyProgress = () => ({ envelopes: [], final_claimed_at: null });
  function need() { if (!sb) throw new Error("offline"); }

  function applyWin(p, n, challenge) {
    if (p.envelopes.some(e => e.n === n) || p.envelopes.length >= 3 || n < 1 || n > 3) return p;
    p.envelopes.push({ n, challenge, at: new Date().toISOString() });
    return p;
  }

  const DB = {
    mode: configured ? "online" : "local",
    client: sb,
    merge,

    async loadConfig() {
      const def = window.DEFAULT_CONFIG;
      if (configured) {
        try {
          need();
          const { data, error } = await sb.from("config").select("data").eq("id", 1).single();
          if (error) throw error;
          ls.set(K.cfg, data.data || {});
        } catch (e) { /* usa la cache */ }
      }
      return merge(def, ls.get(K.cfg, {}));
    },

    async saveConfig(cfg) {
      if (configured) {
        need();
        const { error } = await sb.from("config").upsert({ id: 1, data: cfg, updated_at: new Date().toISOString() });
        if (error) throw error;
      }
      ls.set(K.cfg, cfg);
    },

    async flushQueue() {
      if (!configured) return;
      const q = ls.get(K.queue, []);
      if (!q.length) return;
      const rest = [];
      for (const item of q) {
        try {
          need();
          const { error } = item.type === "final"
            ? await sb.rpc("claim_final")
            : await sb.rpc("win_envelope", { n: item.n, challenge: item.challenge });
          if (error) throw error;
        } catch (e) { rest.push(item); }
      }
      ls.set(K.queue, rest);
    },

    async loadProgress() {
      if (configured) {
        await this.flushQueue();
        try {
          need();
          const { data, error } = await sb.from("progress").select("envelopes, final_claimed_at").eq("id", 1).single();
          if (error) throw error;
          const p = { envelopes: data.envelopes || [], final_claimed_at: data.final_claimed_at };
          // le vincite ancora in coda (offline) restano visibili
          for (const it of ls.get(K.queue, [])) it.type === "final" ? (p.final_claimed_at = p.final_claimed_at || new Date().toISOString()) : applyWin(p, it.n, it.challenge);
          ls.set(K.prog, p);
          return p;
        } catch (e) { /* cache */ }
      }
      return Object.assign(emptyProgress(), ls.get(K.prog, {}));
    },

    async win(n, challenge) {
      const p = applyWin(Object.assign(emptyProgress(), ls.get(K.prog, {})), n, challenge);
      ls.set(K.prog, p);
      if (configured) {
        try {
          need();
          const { error } = await sb.rpc("win_envelope", { n, challenge });
          if (error) throw error;
        } catch (e) { const q = ls.get(K.queue, []); q.push({ type: "win", n, challenge }); ls.set(K.queue, q); }
      }
      return p;
    },

    async claimFinal() {
      const p = Object.assign(emptyProgress(), ls.get(K.prog, {}));
      if (!p.final_claimed_at) p.final_claimed_at = new Date().toISOString();
      ls.set(K.prog, p);
      if (configured) {
        try { need(); const { error } = await sb.rpc("claim_final"); if (error) throw error; }
        catch (e) { const q = ls.get(K.queue, []); q.push({ type: "final" }); ls.set(K.queue, q); }
      }
      return p;
    },

    // --- solo admin ---
    async setProgress(p) {
      if (configured) {
        need();
        const { error } = await sb.from("progress").update({ envelopes: p.envelopes, final_claimed_at: p.final_claimed_at, updated_at: new Date().toISOString() }).eq("id", 1);
        if (error) throw error;
      }
      ls.set(K.prog, p);
      ls.set(K.queue, []);
    },
    async session() { if (!sb) return null; const { data } = await sb.auth.getSession(); return data.session; },
    async signIn(email, password) { need(); const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; },
    async signOut() { if (sb) await sb.auth.signOut(); }
  };
  window.DB = DB;
})();
