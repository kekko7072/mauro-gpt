import ollama from "ollama";
import {
  SYSTEM_PROMPT,
  findMostSimilar,
  getEmbeddings,
  loadEmbeddings,
  fetchDataIntoPargraphs,
  QUERY_PROMPT,
  Vector,
} from "./embedding";
import path from "path";
import { extractTextFromPDF, saveTextToFile } from "./pdf";

export async function chatWithModel(input: string): Promise<string> {
  const filename = path.join(__dirname, "extracted_text.txt");

  try {
    // Extract text from the PDF
    const extractedText = await extractTextFromPDF(
      "docs/dispenseLibroZigliotto.pdf"
    );
    console.log("Extracted Text:", extractedText);

    // Define file path to save text
    const filename = path.join(__dirname, "extracted_text.txt");

    // Save extracted text to file
    saveTextToFile(extractedText, filename);
  } catch (error) {
    console.error("Error:", error);
  }

  let paragraphs: string[];
  let embeddings: Vector[];

  const loadedEmbeddings = loadEmbeddings(filename);
  if (loadedEmbeddings) {
    // If embeddings are loaded, set paragraphs and embeddings directly
    paragraphs = await fetchDataIntoPargraphs(input); // Load paragraphs based on input or file content
    embeddings = loadedEmbeddings;
  } else {
    // If no embeddings are loaded, fetch paragraphs and generate embeddings
    paragraphs = await fetchDataIntoPargraphs(input);
    embeddings = await getEmbeddings(filename, paragraphs);
  }

  console.log("Embeddings loaded: " + embeddings.length);

  const promptEmbedding = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt: input,
  });

  const mostSimilarChunks = findMostSimilar(
    promptEmbedding.embedding,
    embeddings
  ).slice(0, 5);

  // Construct a context that includes relevant paragraphs based on the similarity scores
  const relevantParagraphs = mostSimilarChunks
    .map((item) => paragraphs[item[1]])
    .join("\n");

  console.log("Model context:", relevantParagraphs); // This will show the actual text being used as context

  const response = await ollama.chat({
    model: "phi3",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      { role: "user", content: QUERY_PROMPT(relevantParagraphs, input) },
    ],
  });

  return response.message.content;
}
