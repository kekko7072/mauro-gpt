import ollama from "ollama";
import {
  SYSTEM_PROMPT,
  findMostSimilar,
  getEmbeddings,
  loadEmbeddings,
  parseFile,
} from "./embedding";
import path from "path";

export async function chatWithModel(input: string): Promise<string> {
  const filename = path.join(__dirname, "extracted_text.txt");
  const paragraphs = await parseFile(filename);

  const embeddings = await getEmbeddings(
    filename,
    "nomic-embed-text",
    paragraphs
  );

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
        content: SYSTEM_PROMPT + relevantParagraphs,
      },
      { role: "user", content: input },
    ],
  });

  return response.message.content;
}
