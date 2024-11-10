import axios from "axios";
import ollama from "ollama";

interface ApiResponse {
  markdown: string;
}

export async function fetchDataIntoString(id: string): Promise<string> {
  try {
    const response = await axios({
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.cloud.llamaindex.ai/api/parsing/job/${id}/result/text`,
      headers: {
        Accept: "application/json",
        Authorization:
          "Bearer llx-Ga5W3vrn9mggiGt3jlBP5Snrg6rdsMZishyAvRo6f9Hh1r8s",
      },
    });

    console.log("Fetched data from endpoint");
    const text = response.data.text;

    console.log("Parsed", text.length, "characters");

    return text;
  } catch (error) {
    console.error("Error fetching data from endpoint:", error);
    throw error;
  }
}

// Fetch data from an endpoint and return paragraphs
export async function fetchDataIntoPargraphs(id: string): Promise<string[]> {
  try {
    const response = await axios({
      method: "get",
      maxBodyLength: Infinity,
      url: `https://api.cloud.llamaindex.ai/api/parsing/job/${id}/result/text`,
      headers: {
        Accept: "application/json",
        Authorization:
          "Bearer llx-Ga5W3vrn9mggiGt3jlBP5Snrg6rdsMZishyAvRo6f9Hh1r8s",
      },
    });

    console.log("Fetched data from endpoint");
    const text = response.data.text;

    console.log("Parsed", text.length, "characters");

    const paragraphs: string[] = [];
    let buffer: string[] = [];

    const lines = text.split("\n");
    for (const line of lines) {
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
  } catch (error) {
    console.error("Error fetching data from endpoint:", error);
    throw error;
  }
}

// Save embeddings to a JSON file
export function saveEmbeddings(filename: string, embeddings: any): void {
  const fs = require("fs");
  fs.writeFileSync(`${filename}.json`, JSON.stringify(embeddings));
}

// Load embeddings from a JSON file
export async function getEmbeddings(
  filename: string,
  modelname: string,
  chunks: string[]
): Promise<Vector[]> {
  const fs = require("fs");

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
  const fs = require("fs");
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

export const SYSTEM_PROMPT = `Sei MauroGPT, rispondi alle domande su Macchine e Azionamenti Elettrici.
Il tuo obiettivo è fornire assistenza educativa rispondendo alle domande relative a questo campo.
`;

export function QUERY_PROMPT(article: string, question: string): string {
  return `Utilizza l'articolo per ripondere alla domanda.
Se non trovi la risposta nell'articolo scrivi "Non lo so".
Articolo:
${article}

Domanda: ${question}
`;
}
