import * as fs from "fs";
import * as path from "path";
import * as use from "@tensorflow-models/universal-sentence-encoder";
import * as tf from "@tensorflow/tfjs-node";

export type Vector = number[];

// Parse text into paragraphs
export async function fetchDataIntoPargraphs(
  fileContent: string
): Promise<string[]> {
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  for (const line of fileContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed) {
      buffer.push(trimmed);
    } else if (buffer.length) {
      paragraphs.push(buffer.join(" "));
      buffer = [];
    }
  }
  if (buffer.length) paragraphs.push(buffer.join(" "));

  console.log("Parsed", paragraphs.length, "paragraphs");
  return paragraphs;
}

// Save embeddings to a JSON file
export function saveEmbeddings(filename: string, embeddings: Vector[]): void {
  const filePath = path.resolve(__dirname, `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(embeddings));
}

// Load embeddings from a JSON file
export function loadEmbeddings(filename: string): Vector[] | false {
  const filePath = path.resolve(__dirname, `${filename}.json`);
  if (!fs.existsSync(filePath)) {
    console.log("Embeddings file not found:", filePath);
    return false;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Generate embeddings for text chunks locally using Universal Sentence Encoder
export async function getEmbeddings(
  filename: string,
  chunks: string[]
): Promise<Vector[]> {
  // Try to load saved embeddings first
  let embeddings = loadEmbeddings(filename);
  if (embeddings) return embeddings;

  const model = await use.load();
  const embeddingsTensor = await model.embed(chunks);
  embeddings = embeddingsTensor.arraySync() as Vector[];

  // Save embeddings
  saveEmbeddings(filename, embeddings);
  return embeddings;
}

// Calculate cosine similarity
function norm(vector: Vector): number {
  return Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0));
}

function dotProduct(a: Vector, b: Vector): number {
  return a.reduce((sum, val, idx) => sum + val * b[idx], 0);
}

// Find cosine similarity of every chunk to a given embedding
export function findMostSimilar(
  needle: Vector,
  haystack: Vector[]
): number[][] {
  const needleNorm = norm(needle);
  const similarityScores = haystack.map((item, index) => {
    return [dotProduct(needle, item) / (needleNorm * norm(item)), index];
  });

  console.log("Similarity scores:", similarityScores);

  return similarityScores.sort((a, b) => b[0] - a[0]);
}

export const SYSTEM_PROMPT = `Sei MauroGPT, rispondi alle domande su Macchine e Azionamenti Elettrici.
Il tuo obiettivo è fornire assistenza educativa rispondendo alle domande relative a questo campo. La tua risposta è composta da cio che trovi nell'articolo fornito.
`;

export function QUERY_PROMPT(article: string, question: string): string {
  return `Utilizza esclusivamente il contenuto presente nell'articolo per rispondere alla domanda.
Se non trovi la risposta nell'articolo scrivi "Non lo so".
Articolo:
${article}

Domanda: ${question}
`;
}
