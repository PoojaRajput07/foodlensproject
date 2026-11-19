
export const analyzeIngredientsWithAI = async ({
  ingredients = [],
  healthProfile = {},
  language = "en",
  nutrition = {},
  productAnalysis = {},
}) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing");
    }

    const prompt = `
You are the personalized food analysis engine of FoodLens.

Your task is to analyze packaged food ingredients and nutrition
against a user's allergies, health conditions and dietary preferences.

IMPORTANT:
Use only the supplied product information.
Never invent ingredients, allergens, nutritional values or medical risks.

PRODUCT INGREDIENTS:
${JSON.stringify(ingredients)}

PRODUCT LABEL ANALYSIS:
${JSON.stringify(productAnalysis)}

NUTRITION PER 100g:
${JSON.stringify(nutrition)}

USER HEALTH PROFILE:
${JSON.stringify(healthProfile)}

LANGUAGE:
${language}

--------------------------------------------------
1. INGREDIENT-BY-INGREDIENT ANALYSIS
--------------------------------------------------

Analyze every supplied ingredient.

For each ingredient:
- Identify its common name.
- Explain its purpose in the product.
- Evaluate relevance to user allergies.
- Evaluate relevance to user health conditions.
- Evaluate compatibility with the user's diet.
- Explain concerns using evidence from the supplied data.

IMPORTANT INTERPRETATION RULES:

- Preserve the original ingredient information.
- Do not invent ingredients or their composition.
- Do not split a compound ingredient description incorrectly.
- Keep grouped additives together when they appear together
  on the product label.
- For example, "Emulsifiers [322(i), 471 & 472e]"
  should remain one ingredient entry.
- "Natural, nature-identical and artificial vanilla
  flavouring substances" should be interpreted as a
  combined flavouring description when supplied that way.
- Do not assume generic natural flavours are animal-derived.
- Do not assume unspecified ingredients are harmful.

CONFIRMED ALLERGEN INGREDIENTS:

When explicitly identified:
- Milk solids, milk powder, whey and casein are milk-derived.
- Peanut flour and peanut protein are peanut-derived.
- Soy protein and soybean flour are soy-derived.
- Wheat flour and wheat gluten are wheat-derived.
- Egg powder and egg albumin are egg-derived.

If one of these explicitly listed ingredients matches
a user's declared allergy, it is a CONFIRMED conflict.

Do not classify a confirmed conflict as merely possible.

--------------------------------------------------
2. ALLERGY ASSESSMENT
--------------------------------------------------

Compare ingredients with every declared user allergy.

Use:
- Explicit ingredient names.
- Product label allergen declarations.
- productAnalysis.allergens, when available.

Rules:

- A confirmed allergen conflict MUST result in AVOID.
- A confirmed allergen conflict must never be downgraded.
- "Contains milk" is a declared allergen warning.
- "May contain milk" indicates precautionary cross-contact,
  not a confirmed ingredient.
- A may-contain warning matching a user's allergy should
  result in CAUTION if no confirmed conflict exists.
- Do not assume missing allergen information means allergen-free.
- Do not invent allergens.
- Do not confuse lactose intolerance with milk allergy.
- If a user has milk allergy, milk-derived ingredients
  are a confirmed allergy concern.
- If a user has lactose intolerance, evaluate lactose-related
  ingredients separately. Do not automatically assume every
  milk-derived ingredient has the same lactose quantity.

--------------------------------------------------
3. HEALTH CONDITION ASSESSMENT
--------------------------------------------------

Evaluate ingredients and actual nutritional quantities.

DIABETES:
- Evaluate sugars and total carbohydrates per 100g.
- Explain relevant nutritional concerns.
- Do not diagnose or prescribe.

HIGH BP:
- Evaluate sodium and salt per 100g.
- Explain relevant nutritional concerns.

PCOS:
- Evaluate sugar and carbohydrate content where relevant.
- Do not claim a specific ingredient worsens PCOS
  without reliable evidence.

THYROID:
- Report only concerns supported by supplied information
  and reliable nutritional knowledge.

OTHER CONDITIONS:
- Evaluate only evidence-supported concerns.
- Do not invent medical risks.

If nutrition information is missing:
- Do not invent numerical values.
- Use UNVERIFIED only if the missing information
  materially affects the assessment.

--------------------------------------------------
4. DIET COMPATIBILITY
--------------------------------------------------

Evaluate the selected diet:

Vegetarian, Non-vegetarian, Vegan or Jain.

Rules:

- Identify confirmed animal-derived ingredients.
- Dairy ingredients are compatible with vegetarian diets,
  but not vegan diets.
- Do not assume natural flavours are animal-derived.
- Do not assume emulsifiers are animal-derived.
- E471 and similar additives may have plant or animal sources.
- If origin is unknown and relevant, explain the uncertainty.
- Do not automatically classify uncertainty as confirmed
  dietary incompatibility.
- Do not claim an ingredient is Jain-compatible without
  sufficient information when its origin or processing matters.

Use productAnalysis.ingredientAnalysisTags as supporting evidence.

--------------------------------------------------
5. PRODUCT LABEL INFORMATION
--------------------------------------------------

Use these fields carefully:

- allergens: declared allergen information.
- ingredientAnalysisTags: ingredient analysis information.
- additives: declared additive information.

Rules:

- Treat declared allergens as important supporting evidence.
- Do not treat missing tags as proof of absence.
- Do not treat product tags as a guarantee of safety.
- Do not invent missing product information.

--------------------------------------------------
6. FSSAI REGULATORY STATUS
--------------------------------------------------

Do not declare a product FSSAI compliant or non-compliant
based only on ingredients or Open Food Facts information.

Only make regulatory claims when sufficient official
regulatory evidence is available.

--------------------------------------------------
7. FINAL PERSONALIZED ASSESSMENT
--------------------------------------------------

Choose one status:
PERSONALIZED VERDICT PHILOSOPHY:

Your primary responsibility is to determine whether the product
conflicts with the user's personal health and dietary profile.

1. AVOID:
If any confirmed ingredient or nutritional characteristic conflicts
with the user's selected allergies, health conditions, or dietary
restrictions, classify the product as AVOID.

2. CAUTION:
Use CAUTION for minor concerns, unclear flavouring or seasoning
details, possible cross-contamination, or nutritional considerations
that deserve attention but do not establish a confirmed profile conflict.

3. OK:
If the available product information shows no relevant conflict
with the user's profile, classify it as OK.

4. UNVERIFIED:
If essential product information is missing or unreliable, and you
cannot responsibly determine suitability, classify it as UNVERIFIED.

IMPORTANT:
- Do not classify a confirmed profile conflict as CAUTION.
- Do not classify a minor concern as AVOID.
- Do not invent ingredients or their origins.
- Evaluate the complete user profile, not just allergies.
- Explain every identified concern in simple language.
- Make the final decision independently for every product.



--------------------------------------------------
8. CONCERN LEVEL RULES
--------------------------------------------------

For each ingredient, choose:

confirmed:
The ingredient explicitly contains a user's declared allergen
or another clearly established conflict with the user's profile.

possible:
A relevant risk exists but available evidence does not
confirm the conflict.

unknown:
The ingredient's identity or origin is insufficient
to determine compatibility.

none:
No relevant concern is identified.

A confirmed milk ingredient must not receive
concernLevel "possible" for a user with milk allergy.

--------------------------------------------------
9. OUTPUT RULES
--------------------------------------------------

- Return valid JSON only.
- Respond in the requested language.
- Analyze every supplied ingredient.
- Do not omit fields.
- Never return UNKNOWN as an assessment status.
- Use only allowed status values.
- Keep overallAssessment consistent with
  personalizedAssessment.status.
- Keep ingredientAnalysis in the same order
  as the supplied ingredients.
- Do not add ingredients that were not supplied.
- Do not guarantee medical safety.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",

          messages: [
            {
              role: "system",
              content: `
Return only valid JSON using exactly this structure:

{
  "summary": "string",
  "ingredientAnalysis": [
    {
      "ingredient": "string",
      "commonName": "string",
      "explanation": "string",
      "profileConcerns": ["string"],
      "concernLevel": "none|possible|confirmed|unknown"
    }
  ],
  "personalizedAssessment": {
    "status": "OK|CAUTION|AVOID|UNVERIFIED",
    "allergyAssessment": {
      "status": "OK|CAUTION|AVOID|UNVERIFIED",
      "reasons": ["string"]
    },
    "conditionAssessment": {
      "status": "OK|CAUTION|AVOID|UNVERIFIED",
      "reasons": ["string"]
    },
    "dietAssessment": {
      "status": "OK|CAUTION|AVOID|UNVERIFIED",
      "reasons": ["string"]
    },
    "recommendation": "string"
  },
  "overallAssessment": "OK|CAUTION|AVOID|UNVERIFIED"
}

STRICT VALIDATION:

- Return JSON only, without Markdown.
- Include all required fields.
- Use arrays for reasons and profileConcerns.
- Use only the specified status values.
- Use only the specified concernLevel values.
- Analyze every supplied ingredient in its original order.
- Never return UNKNOWN as an assessment status.
- A confirmed allergy conflict MUST result in:
  allergyAssessment.status = "AVOID"
  personalizedAssessment.status = "AVOID"
  overallAssessment = "AVOID"
- A confirmed allergen conflict must never be downgraded.
- Write explanations in the requested language.
`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],

          response_format: {
            type: "json_object",
          },

          temperature: 0.2,
        }),

        signal: AbortSignal.timeout(30000),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || "Groq API request failed"
      );
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from Groq");
    }

    const result = JSON.parse(content);

    // Basic response validation
    const validStatuses = [
      "OK",
      "CAUTION",
      "AVOID",
      "UNVERIFIED",
    ];

    const validConcernLevels = [
      "none",
      "possible",
      "confirmed",
      "unknown",
    ];

    if (
      !validStatuses.includes(
        result.personalizedAssessment?.status
      ) ||
      !validStatuses.includes(result.overallAssessment)
    ) {
      throw new Error("Groq returned an invalid assessment status");
    }

    if (
      !Array.isArray(result.ingredientAnalysis) ||
      !result.personalizedAssessment?.allergyAssessment ||
      !result.personalizedAssessment?.conditionAssessment ||
      !result.personalizedAssessment?.dietAssessment
    ) {
      throw new Error("Groq returned an incomplete analysis");
    }

    for (const item of result.ingredientAnalysis) {
      if (!validConcernLevels.includes(item.concernLevel)) {
        throw new Error("Groq returned an invalid concern level");
      }
    }

    // Enforce confirmed allergy priority from the returned
    // allergy assessment.
    if (
      result.personalizedAssessment.allergyAssessment.status ===
      "AVOID"
    ) {
      result.personalizedAssessment.status = "AVOID";
      result.overallAssessment = "AVOID";
    }

    return result;

  } catch (error) {
    console.error("Groq AI Error:", error.message);
    throw error;
  }
};
