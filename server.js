import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIG =====
const CONFIG_DIR = path.join(__dirname, "config");
const DATA_DIR = path.join(__dirname, "data");

// 👉 Client par défaut
const DEFAULT_CLIENT = "abattageks";

// ===== MIDDLEWARE =====
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ===== OUTILS =====

function loadConfig(clientId) {
  const filePath = path.join(CONFIG_DIR, `${clientId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw);
}

function loadCalendar(clientId) {
  const filePath = path.join(DATA_DIR, `calendar_${clientId}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw);
}

function saveCalendar(clientId, data) {
  const filePath = path.join(DATA_DIR, `calendar_${clientId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ===== ROUTES HTML =====

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

app.get("/chat.html", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

app.get("/calendar.html", (req, res) => {
  res.sendFile(path.join(__dirname, "calendar.html"));
});

// ===== API CHAT =====

const sessions = {}; 
// sessions[userId] = { step, serviceKey, date }

app.post("/chat", (req, res) => {
  const { userId, message, client } = req.body;

  const clientId = client || DEFAULT_CLIENT;
  const config = loadConfig(clientId);

  if (!config) {
    return res.json({ reply: "❌ Client introuvable." });
  }

  if (!sessions[userId]) {
    sessions[userId] = { step: 0 };
  }

  const session = sessions[userId];

  // STEP 0 → message d’accueil
  if (session.step === 0) {
    session.step = 1;
    return res.json({ reply: config.welcomeMessage });
  }

  // STEP 1 → choix du service
  if (session.step === 1) {
    const key = message.trim().toUpperCase();

    if (!config.services[key]) {
      return res.json({ reply: "Merci de choisir A, B, C ou D 🙂" });
    }

    session.serviceKey = key;
    session.step = 2;

    return res.json({ reply: config.services[key].response });
  }

  // STEP 2 → date
  if (session.step === 2) {
    session.date = message.trim();
    session.step = 3;
    return res.json({ reply: config.booking.askTimeMessage });
  }

  // STEP 3 → heure + sauvegarde calendrier
  if (session.step === 3) {
    const time = message.trim();
    const date = session.date;

    const calendar = loadCalendar(clientId);

    // Vérifie si déjà réservé
    const exists = calendar.find(
      (r) => r.date === date && r.time === time
    );

    if (exists) {
      return res.json({
        reply: "⛔ Ce créneau est déjà réservé. Merci de choisir une autre heure."
      });
    }

    calendar.push({
      service: config.services[session.serviceKey].label,
      date,
      time,
      userId
    });

    saveCalendar(clientId, calendar);

    const confirmation = config.booking.confirmationMessage
      .replace("{date}", date)
      .replace("{time}", time);

    delete sessions[userId];

    return res.json({ reply: confirmation });
  }
});

// ===== API CALENDRIER =====

app.get("/api/calendar", (req, res) => {
  const clientId = req.query.client || DEFAULT_CLIENT;
  const calendar = loadCalendar(clientId);
  res.json(calendar);
});

// ===== LANCEMENT =====

app.listen(PORT, () => {
  console.log("Bot server running on port " + PORT);
});
