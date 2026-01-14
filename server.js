import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// Load client config
function loadClientConfig(client) {
  const file = path.join(__dirname, "config", `${client}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

// API config
app.get("/api/config", (req, res) => {
  const client = req.query.client || "abattageks";
  const config = loadClientConfig(client);
  if (!config) return res.status(404).json({ error: "Client not found" });
  res.json(config);
});

// Root test
app.get("/", (req, res) => {
  res.send("Bot server running");
});

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
