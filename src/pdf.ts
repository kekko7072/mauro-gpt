import fs from "fs";
import pdfParse from "pdf-parse";

// Function to extract text from PDF
export async function extractTextFromPDF(pdfPath: string): Promise<string> {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdfParse(pdfBuffer);
  return pdfData.text;
}

// Function to save extracted text to a file
export function saveTextToFile(text: string, filePath: string) {
  fs.writeFileSync(filePath, text, "utf-8");
  console.log(`Extracted text saved to ${filePath}`);
}
