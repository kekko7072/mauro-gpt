import ollama from "ollama";
import * as fs from "fs";

function modelfile(text: string): string {
  return `
FROM phi3
SYSTEM "Sei un assistente di studio chiamato MauroGPT. Sei specializzato nella materia di Macchine e Azionamenti Elettrici. Il tuo obiettivo è fornire assistenza educativa rispondendo alle domande relative a questo campo, utilizzando esclusivamente le informazioni contenute nel seguente testo. ${text} Se non sai la risposta devi dire che non lo sai, non provare a inventare una risposta."
`;
}

// Create an instance of the Ollama chatbot
export async function modelCreate() {
  // Add text to model file
  let text = "";

  fs.readFile("extracted_text.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    text = data;
  });

  // Create the chatbot
  await ollama.create({
    model: "MauroGPT",
    modelfile: modelfile(text),
  });
}
