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

  // Extract text from the PDF
  const extractedText = await extractTextFromPDF(
    "docs/dispenseLibroZigliotto.pdf"
  );

  // Save extracted text to file
  saveTextToFile(extractedText, filename);

  let paragraphs: string[];
  let embeddings: Vector[];

  const loadedEmbeddings = loadEmbeddings(filename);

  if (loadedEmbeddings) {
    // If embeddings are loaded, set paragraphs and embeddings directly
    paragraphs = await fetchDataIntoPargraphs(extractedText); // Load paragraphs based on input or file content
    embeddings = loadedEmbeddings;
  } else {
    console.log("No embeddings found, generating new embeddings...");
    // If no embeddings are loaded, fetch paragraphs and generate embeddings
    paragraphs = await fetchDataIntoPargraphs(extractedText);
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

  console.log("Most similar chunks:", mostSimilarChunks);

  //console.log("Paragraphs:", paragraphs);

  // Construct a context that includes relevant paragraphs based on the similarity scores
  const relevantParagraphs = mostSimilarChunks
    .map((item) => paragraphs[item[1]])
    .join("\n");

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
