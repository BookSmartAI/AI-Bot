import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Servir dossier public ---
app.use(express.static(path.join(__dirname, "public")));

// --- Charger config client ---
function loadClientConfig(clientName) {
  const filePath = path.join(__dirname, "config", `${clientName}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// --- Route API pour envoyer config au chat ---
app.get("/api/config", (req, res) => {
  const client = req.query.client || "demo";
  const config = loadClientConfig(client);
  if (!config) return res.status(404).json({ error: "Client not found" });
  res.json(config);
});

// --- Page chat ---
app.get("/chat.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

// --- Page calendrier ---
app.get("/calendar.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "calendar.html"));
});

// --- Home simple ---
app.get("/", (req, res) => {
  res.send("Bot server running");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
