import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const DATA_DIR = "./data";
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function getCalendarFile(client){
  return `${DATA_DIR}/${client}.json`;
}

function loadCalendar(client){
  const file = getCalendarFile(client);
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(file));
}

function saveCalendar(client,data){
  fs.writeFileSync(getCalendarFile(client), JSON.stringify(data,null,2));
}

const sessions = {}; 

app.post("/chat", (req,res)=>{
  const {client, message} = req.body;
  if(!sessions[client]) sessions[client]={step:0};

  const session = sessions[client];
  const text = message.toLowerCase();
  let reply="";

  // STEP 0 → accueil
  if(session.step === 0){
    reply = 
`👋 Bonjour !
Pour quelle raison nous contactez-vous ?

1️⃣ Prendre rendez-vous  
2️⃣ Connaître les prix  
3️⃣ Nos services`;

    session.step = 1;
  }

  // STEP 1 → menu choix
  else if(session.step === 1){
    if(text.includes("1")){
      reply = "Parfait 🙂 Quelle date souhaitez-vous ? (ex: 2026-02-10)";
      session.step = 2;
    }
    else if(text.includes("2")){
      reply = "💈 Coupe : 25$ \n🧔 Barbe : 15$ \nCoupe + barbe : 35$";
    }
    else if(text.includes("3")){
      reply = "Nos services : Coupe, Barbe, Coupe enfant, Styling.";
    }
    else {
      reply = "Merci de répondre par 1, 2 ou 3 🙂";
    }
  }

  // STEP 2 → date
  else if(session.step === 2){
    session.date = message;
    reply = "À quelle heure ? (ex: 14:30)";
    session.step = 3;
  }

  // STEP 3 → heure + vérification
  else if(session.step === 3){
    const hour = message;
    const date = session.date;

    let calendar = loadCalendar(client);

    const exists = calendar.find(r => r.date === date && r.hour === hour);

    if(exists){
      reply = "❌ Ce créneau est déjà pris. Proposez une autre heure 🙂";
    } else {
      calendar.push({date,hour});
      saveCalendar(client,calendar);
      reply = `✅ Rendez-vous confirmé le ${date} à ${hour} ! Merci 🙂`;
      session.step = 0;
    }
  }

  res.json({reply});
});

app.get("/calendar-data", (req,res)=>{
  const client = req.query.client;
  const calendar = loadCalendar(client);
  res.json(calendar);
});

app.listen(3000, ()=> console.log("Bot server running"));

