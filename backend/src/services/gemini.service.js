
import { GoogleGenAI } from "@google/genai";

export const analyzeIngredientsWithAI = async ({
  ingredients = [],
  healthProfile = {},
  language = "en",
}) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  console.log("Gemini API key loaded:", Boolean(apiKey));

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment");
  }

  if (!ingredients.length) {
    throw new Error("No ingredients provided");
  }

  // Create client at request time, not when module is imported
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are a food ingredient analysis assistant.

Analyze these ingredients according to the user's profile.

User profile:
Allergies: ${JSON.stringify(healthProfile.allergies || [])}
Conditions: ${JSON.stringify(healthProfile.conditions || [])}
Diet: ${healthProfile.diet || "Not specified"}

Ingredients:
${JSON.stringify(ingredients)}

Rules:
- Explain ingredients in simple language.
- Identify possible relevance to allergies, conditions and diet.
- Never invent medical risks.
- Never claim medical safety.
- Unknown information must remain unverified.
- Do not assume unfamiliar means harmful.
- Return valid JSON only.
- Use ${language === "hi" ? "Hindi" : "English"}.

Return:
{
  "summary": "Overall explanation",
  "ingredientAnalysis": [
    {
      "ingredient": "Original name",
      "commonName": "Common name",
      "explanation": "Simple explanation",
      "profileConcerns": [],
      "concernLevel": "none | possible | unknown"
    }
  ],
  "overallAssessment": "OK | CAUTION | AVOID | UNVERIFIED"
}
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const result = JSON.parse(response.text);

  if (
    !Array.isArray(result.ingredientAnalysis) ||
    !["OK", "CAUTION", "AVOID", "UNVERIFIED"].includes(
      result.overallAssessment
    )
  ) {
    throw new Error("Invalid Gemini response format");
  }

  return result;
};
