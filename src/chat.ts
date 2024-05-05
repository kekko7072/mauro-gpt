import ollama from "ollama";

export async function chatWithModel(input: string): Promise<string> {
  const response = await ollama.chat({
    model: "MauroGPT",
    messages: [{ role: "user", content: input }],
  });
  return response.message.content;
}
