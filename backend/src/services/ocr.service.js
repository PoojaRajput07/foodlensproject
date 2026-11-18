
import { createWorker } from "tesseract.js";
import fs from "fs";

export async function extractTextFromImage(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error("Uploaded image file not found.");
  }

  let worker;

  try {
    worker = await createWorker("eng");

    const {
      data: { text },
    } = await worker.recognize(filePath);

    return text?.trim() || "";
  } catch (error) {
    console.error("Tesseract OCR error:", error);
    throw new Error("Failed to extract text from image.");
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

export function isOcrAvailable() {
  return true;
}
