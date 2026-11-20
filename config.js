/* =========================================================
   IMPOSTAZIONI
   Inserisci qui URL e chiave "publishable/anon" del tuo progetto Supabase
   (Supabase → Project Settings → API). Sono pubbliche per design:
   la sicurezza è garantita dalle regole RLS in supabase.sql.
   Se li lasci vuoti l'app funziona in "modalità locale" (solo su questo dispositivo).
   ========================================================= */
window.APP_SETTINGS = {
  SUPABASE_URL: "",
  SUPABASE_KEY: ""
};

/* =========================================================
   CONFIGURAZIONE DI DEFAULT
   Usata solo se il database non è raggiungibile.
   Tutto si modifica dalla pagina admin.html.
   ========================================================= */
window.DEFAULT_CONFIG = {
  name: "Luck",
  title: "Dott. Luck",
  degree: "Laurea Magistrale in Ingegneria della Produzione Industriale e dell'Innovazione Tecnologica",
  dedication: "Ce l'hai fatta, Ingegnere! 🎓 Ora l'ultima sessione d'esame: supera le prove e conquista le buste.",

  // ordine delle sfide: la prima sblocca la busta 1, la seconda la busta 2, ecc.
  order: ["quiz", "factory", "puzzle"],
  sequential: true,

  envelopes: [
    { title: "Busta n. 1", message: "Prima prova superata a pieni voti! Apri la busta n. 1 💌" },
    { title: "Busta n. 2", message: "Linea di produzione a zero difetti! Apri la busta n. 2 💌" },
    { title: "Busta n. 3", message: "Enigma risolto, Ingegnere! Apri la busta n. 3 💌" }
  ],

  quiz: {
    title: "Quiz su Luck",
    intro: "Quanto conosci te stesso? Rispondi alle domande.",
    threshold: 4,
    questions: [
      { q: "Qual è il piatto preferito di Luck?", options: ["Pizza", "Sushi", "Lasagne", "Carbonara"], correct: 0 },
      { q: "In che anno Luck ha iniziato l'università?", options: ["2018", "2019", "2020", "2021"], correct: 1 },
      { q: "Qual è l'esame più temuto della magistrale?", options: ["Impianti industriali", "Ricerca operativa", "Gestione dell'innovazione", "Tutti!"], correct: 3 },
      { q: "Cosa non manca mai prima di un esame?", options: ["Caffè", "Ansia", "Appunti degli altri", "Tutte le risposte"], correct: 3 },
      { q: "Dove festeggiamo stasera?", options: ["A casa", "Al ristorante", "In discoteca", "Ovunque, basta esserci!"], correct: 3 }
    ]
  },

  factory: {
    title: "Catena di montaggio",
    intro: "Tocca gli ingranaggi DIFETTOSI (rossi e crepati) prima che escano dalla linea. Lascia passare quelli buoni!",
    target: 10,
    lives: 3,
    speed: 70,
    defectRate: 0.35
  },

  puzzle: {
    title: "Enigma dell'ingegnere",
    intro: "Riordina le lettere e trova le parole dell'ingegnere della produzione.",
    words: [
      { word: "LEAN", hint: "Produzione snella, alla Toyota" },
      { word: "KAIZEN", hint: "Miglioramento continuo, in giapponese" },
      { word: "PROTOTIPO", hint: "Il primo esemplare di un'idea" }
    ],
    finalPrompt: "Il lucchetto si apre con il numero di lettere di ogni parola, in ordine."
  },

  final: {
    title: "Premio finale",
    lockedText: "Conquista tutte e 3 le buste per scoprire cosa c'è qui dentro…",
    hints: [],
    message: "Il premio finale ti aspetta: chiedi il pacco misterioso! 🎁"
  }
};
