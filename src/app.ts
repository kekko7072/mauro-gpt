import { chatWithModel } from "./chat";
//mport { modelCreate } from "./model_create";
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function initChat() {
  console.log(String.raw`
███╗   ███╗ █████╗ ██╗   ██╗██████╗  ██████╗      ██████╗ ██████╗ ████████╗
████╗ ████║██╔══██╗██║   ██║██╔══██╗██╔═══██╗    ██╔════╝ ██╔══██╗╚══██╔══╝
██╔████╔██║███████║██║   ██║██████╔╝██║   ██║    ██║  ███╗██████╔╝   ██║   
██║╚██╔╝██║██╔══██║██║   ██║██╔══██╗██║   ██║    ██║   ██║██╔═══╝    ██║   
██║ ╚═╝ ██║██║  ██║╚██████╔╝██║  ██║╚██████╔╝    ╚██████╔╝██║        ██║   
╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝      ╚═════╝ ╚═╝        ╚═╝   
`);
  const response = await chatWithModel(
    "Presentati, racconta chi sei e cosa fai. Risposta breve ma concisa con massimo 3 righe."
  );
  console.log(`${response}\n`);
}

function startChat() {
  rl.question("Utente: ", async (question: string) => {
    const response = await chatWithModel(question);
    console.log(`\n\nMauroGPT: ${response}\n`);
    // Loop the chat interaction
    startChat();
  });
}
// 1. Create the chatbot
//modelCreate();

// 3. Init the chat
initChat().then(() => {
  // 4. Start the chat and loop the interaction
  startChat();
});
