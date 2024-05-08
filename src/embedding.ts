import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import ollama from "ollama";

// Open a file and return paragraphs
export async function parseFile(filename: string): Promise<string[]> {
  const fileStream = fs.createReadStream(filename, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const paragraphs: string[] = [];
  let buffer: string[] = [];

  for await (const line of rl) {
    const strippedLine = line.trim();
    if (strippedLine) {
      buffer.push(strippedLine);
    } else if (buffer.length) {
      paragraphs.push(buffer.join(" "));
      buffer = [];
    }
  }
  if (buffer.length) {
    paragraphs.push(buffer.join(" "));
  }
  console.log("Parsed", paragraphs.length, "paragraphs");
  return paragraphs;
}

// Save embeddings to a JSON file
export function saveEmbeddings(filename: string, embeddings: any): void {
  fs.writeFileSync(`${filename}.json`, JSON.stringify(embeddings));
}

// Load embeddings from a JSON file
export async function getEmbeddings(
  filename: string,
  modelname: string,
  chunks: string[]
): Promise<Vector[]> {
  // Check if embeddings are already saved
  let embeddings = loadEmbeddings(filename);
  if (embeddings !== false) {
    return embeddings;
  }

  // Get embeddings from ollama
  embeddings = await Promise.all(
    chunks.map(async (chunk) => {
      const result = await ollama.embeddings({
        model: modelname,
        prompt: chunk,
      });
      return result.embedding as Vector;
    })
  );

  // Save embeddings
  saveEmbeddings(filename, embeddings);
  return embeddings;
}
export function loadEmbeddings(filename: string) {
  const filePath = `${filename}.json`;
  if (!fs.existsSync(filePath)) {
    console.log("Embeddings file not found:", filePath);
    return false;
  }
  return JSON.parse(fs.readFileSync(filePath, { encoding: "utf8" }));
}

// Find cosine similarity of every chunk to a given embedding
type Vector = number[];

function norm(vector: Vector): number {
  return Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
}

function dotProduct(a: Vector, b: Vector): number {
  return a.reduce((sum, val, idx) => sum + val * b[idx], 0);
}

export function findMostSimilar(
  needle: Vector,
  haystack: Vector[]
): number[][] {
  const needleNorm = norm(needle);
  const similarityScores = haystack.map((item, index) => {
    return [dotProduct(needle, item) / (needleNorm * norm(item)), index];
  });

  return similarityScores.sort((a, b) => b[0] - a[0]);
}

export const SYSTEM_PROMPT_EN = `You are a helpful reading assistant who answers questions
    based on snippets of text provided in context. Answer only using the context provided,
    being as concise as possible. If you're unsure, just say that you don't know.
    Context:
  `;

export const SYSTEM_PROMPT = `Sei un assistente di studio chiamato MauroGPT. 
Sei specializzato nella materia di Macchine e Azionamenti Elettrici.
Il tuo obiettivo è fornire assistenza educativa rispondendo alle domande relative a questo campo,
utilizzando i pezzi di testo forniti come contesto.Rispondi solo utilizzanto il contesto fornito.
Se non sai la risposta devi dire che non lo sai, non provare a inventare una risposta.
Contesto:
`;
