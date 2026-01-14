import fs from "fs";
import path from "path";

const clientId = process.argv[2];

if (!clientId) {
  console.log("❌ Utilisation : node createClient nomduclient");
  process.exit();
}

const configTemplate = path.join("config", "template.json");
const dataTemplate = path.join("data", "template.json");

const newConfig = path.join("config", `${clientId}.json`);
const newData = path.join("data", `${clientId}.json`);

if (fs.existsSync(newConfig)) {
  console.log("❌ Ce client existe déjà");
  process.exit();
}

fs.copyFileSync(configTemplate, newConfig);
fs.copyFileSync(dataTemplate, newData);

console.log(`✅ Nouveau bot créé : ${clientId}`);
console.log(`Chat : http://localhost:3000/${clientId}`);
console.log(`Calendrier : http://localhost:3000/calendar/${clientId}`);