import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

/* ======================
   CONFIG CLIENT
====================== */

const CONFIG_FILE = "./config/config.json";

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({
      businessName: "Salon Belle Coupe",
      welcomeMessage: "Bienvenue chez Salon Belle Coupe ✂️\nPour quelle raison nous contactez-vous ?\n1️⃣ Coupe cheveux\n2️⃣ Barbe\n3️⃣ Prix\n\nRépondez avec un numéro."
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE));
}

const config = loadConfig();

/* ======================
   CALENDRIER
====================== */

const CALENDAR_FILE = "./data/calendar.json";

function loadCalendar() {
  if (!fs.existsSync(CALENDAR_FILE)) {
    fs.writeFileSync(CALENDAR_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(CALENDAR_FILE));
}

function saveCalendar(data) {
  fs.writeFileSync(CALENDAR_FILE, JSON.stringify(data, null, 2));
}

/* ======================
   ROUTES PAGES
====================== */

// 👉 Page d'accueil → redirige automatiquement vers le bot
app.get("/", (req, res) => {
  res.redirect("/chat.html");
});

// Page calendrier commerçant
app.get("/calendar", (req, res) => {
  res.json(loadCalendar());
});

/* ======================
   CHAT BOT LOGIQUE
====================== */

let sessions = {};

app.post("/chat", (req, res) => {
  const { userId, message } = req.body;

  if (!sessions[userId]) {
    sessions[userId] = { step: 0 };
    return res.json({ reply: config.welcomeMessage });
  }

  const session = sessions[userId];
  const calendar = loadCalendar();

  // Étape 1 : choix service
  if (session.step === 0) {
    if (message === "1") {
      session.service = "Cou

