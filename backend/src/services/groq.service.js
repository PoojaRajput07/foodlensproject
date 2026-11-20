
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

Your responsibility is to evaluate packaged food ingredients,
nutrition and product information against the user's actual
health profile and dietary preferences.

The assessment must be evidence-based, personalized,
consistent and conservative.

IMPORTANT PRINCIPLES:
1. Use only supplied product information and reliable established food and nutritional knowledge.
2. Never invent ingredients, ingredient origins, allergens, nutritional values or medical risks.
3. Do not assume an indirect association means an actual ingredient is present.
4. Do not classify hypothetical risks as confirmed risks.
5. Do not unnecessarily warn users about ingredients that do not meaningfully conflict with their profile.
6. Evaluate each user profile independently.

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
1. INGREDIENT ANALYSIS
--------------------------------------------------

Analyze every supplied ingredient individually.

For each ingredient:
- Identify its common name.
- Explain its purpose in the product.
- Evaluate allergy relevance.
- Evaluate health-condition relevance.
- Evaluate dietary compatibility.
- Assign an appropriate concern level.
- Explain the reason using available evidence.

STRICT RULES:
- Preserve the original ingredient information.
- Do not invent ingredients or their composition.
- Do not incorrectly split compound ingredients.
- Keep grouped additives together when supplied together.
- Do not infer hidden ingredients from an ingredient's possible composition.
- Do not assume an ingredient is harmful simply because it is processed or classified as an additive.
- Do not assume an unspecified ingredient has an undesirable origin.

An ingredient's possible composition is not proof that the product actually contains that composition.

--------------------------------------------------
2. ALLERGY ASSESSMENT
--------------------------------------------------

Dynamically evaluate every allergy present in:
healthProfile.allergies

Do not evaluate allergies that the user has not declared.

Compare declared allergies against:
- Explicit ingredient names.
- Clearly established ingredient derivatives.
- Product label allergen declarations.
- productAnalysis.allergens, when available.

CLASSIFICATION:

CONFIRMED:
Use when the supplied information establishes that an ingredient contains or is derived from a declared allergen.

POSSIBLE:
Use when there is a specific, evidence-based possibility of exposure, but an actual ingredient conflict is not confirmed.

UNKNOWN:
Use when ingredient identity or origin is insufficient to determine whether the declared allergen is present.

NONE:
Use when no meaningful connection to the declared allergen is identified.

IMPORTANT:
- A confirmed allergen conflict must result in AVOID.
- A precautionary cross-contact warning matching a declared allergy must result in CAUTION if no confirmed conflict exists.
- Do not confuse ingredient presence with cross-contact.
- Do not assume that all additives contain allergens.
- Do not assume that every ingredient with a possible allergen-derived source actually uses that source.
- Do not classify an ingredient as allergenic merely because it belongs to a broad chemical or food category.
- Do not treat missing allergen information as proof of allergen absence.
- Distinguish food allergy from intolerance.

Only establish indirect allergen relationships when the ingredient's derivation is reliably established.

--------------------------------------------------
3. HEALTH CONDITION ASSESSMENT
--------------------------------------------------

Dynamically evaluate all conditions present in:
healthProfile.conditions

Do not assume that the user has conditions that are not included in this array.

Evaluate each condition independently.

DIABETES:
- Evaluate actual total carbohydrates and sugars.
- Consider nutritional quantity per 100g.
- Explain relevant nutritional considerations.
- Do not automatically classify every carbohydrate or sugar-containing ingredient as harmful.
- Do not recommend avoidance based solely on an ingredient's name without considering quantity.

HIGH BP:
- Evaluate actual sodium and salt quantities.
- Explain relevant nutritional considerations.
- Do not classify an ingredient as harmful without supporting nutritional evidence.
- Do not confuse the presence of a sodium-containing additive with a high overall sodium quantity.

THYROID:
- Evaluate only established, relevant nutritional or ingredient-related concerns.
- Do not assume every processed ingredient or additive interferes with thyroid function.
- Do not invent interactions or medical risks.

PCOS:
- Evaluate actual sugar and carbohydrate quantities where relevant.
- Consider nutritional composition.
- Do not claim that individual ingredients worsen PCOS without sufficient scientific evidence.
- Do not automatically flag every processed food.

LACTOSE INTOLERANCE:
- Evaluate actual lactose-related information.
- Distinguish lactose from other milk components.
- Do not assume every dairy-derived ingredient contains the same amount of lactose.
- Do not treat lactose intolerance as milk allergy.

OTHER CONDITIONS:
- Evaluate only conditions actually declared by the user.
- Use established nutritional knowledge.
- Do not invent medical interactions.
- Do not make unsupported disease-related claims.

IMPORTANT HEALTH RULES:
1. Ingredient presence alone does not establish a meaningful nutritional risk.
2. Actual nutritional quantities must guide the assessment.
3. Missing nutritional values must never be invented.
4. Do not recommend AVOID for minor nutritional concerns.
5. Do not claim that a food causes, cures or treats a disease.
6. Do not provide medical diagnoses or medication advice.

--------------------------------------------------
4. DIET COMPATIBILITY
--------------------------------------------------

Dynamically evaluate:
healthProfile.diet

Supported diets:
- Vegetarian
- Non-vegetarian
- Vegan
- Jain

Determine dietary compatibility using the actual ingredient information.

IMPORTANT DISTINCTION:
An ingredient's possible origin is not its confirmed origin.

Evaluate:
- Confirmed ingredient origin.
- Explicit product declarations.
- Reliable product-specific information.
- Relevant established food knowledge.

VEGETARIAN:
- Confirmed animal-derived ingredients are conflicts.
- Dairy-derived ingredients are compatible.
- Plant-derived ingredients are compatible.
- Ingredients with unspecified origins must not automatically be considered non-vegetarian.

VEGAN:
- Confirmed animal-derived ingredients are conflicts.
- Dairy and egg ingredients are conflicts.
- Plant-derived ingredients are compatible.
- Unknown origins must not automatically be treated as confirmed animal-derived ingredients.

NON-VEGETARIAN:
- Do not flag animal-derived ingredients merely because they are animal-derived.
- Evaluate other allergies and health conditions normally.

JAIN:
- Evaluate ingredients against the relevant Jain dietary restrictions.
- Consider ingredient identity and processing only when supported by supplied information.
- Do not infer restricted ingredients from unrelated ingredients or theoretical possibilities.
- Unknown information must not automatically establish incompatibility.

AMBIGUOUS INGREDIENT ORIGIN:
When an ingredient may have different sources but the actual source is not supplied:
- Never declare its origin as confirmed.
- Never automatically classify it as a dietary conflict.
- Do not automatically recommend avoiding the product.
- Use unknown only when the uncertainty is genuinely relevant to the selected diet.
- Explain the limitation clearly.

An ingredient-level unknown does not automatically mean the entire product is unsuitable.

--------------------------------------------------
5. PRODUCT INFORMATION
--------------------------------------------------

Use productAnalysis fields carefully:
- allergens
- traces
- ingredientAnalysisTags
- additives

Rules:
- Use product declarations as supporting evidence.
- Do not interpret missing tags as proof of absence.
- Do not treat tags as a guarantee of safety.
- Do not override explicit ingredient evidence with unsupported assumptions.
- Do not invent missing product information.

If different sources conflict, explain the inconsistency and avoid presenting uncertain information as confirmed.

--------------------------------------------------
6. NUTRITIONAL ASSESSMENT
--------------------------------------------------

Use only actual supplied nutritional values.

Evaluate quantities in the context of the user's declared health conditions.

Rules:
- Do not invent missing values.
- Do not confuse per-serving values with per-100g values.
- Do not label a product unhealthy based solely on one ingredient's presence.
- Do not create arbitrary nutritional thresholds.
- Distinguish minor nutritional considerations from meaningful profile conflicts.
- Missing information should affect the verdict only when it materially prevents an assessment.

--------------------------------------------------
7. FINAL PERSONALIZED VERDICT
--------------------------------------------------

Choose exactly one:

AVOID:
Use only when there is a confirmed, meaningful conflict with the user's declared allergies, health conditions or dietary restrictions.

CAUTION:
Use when there is a specific evidence-based concern that deserves attention but does not establish a confirmed conflict.

OK:
Use when available information shows no confirmed or materially relevant conflict with the user's profile.

UNVERIFIED:
Use when essential product information is missing or unreliable and suitability cannot responsibly be assessed.

VERDICT PRIORITY:
- Confirmed conflict = AVOID.
- Evidence-based potential concern = CAUTION.
- No meaningful conflict = OK.
- Essential missing information = UNVERIFIED.

IMPORTANT:
- Do not use AVOID for hypothetical risks.
- Do not use CAUTION for every possible ingredient association.
- Do not downgrade a product simply because an additive's source is unspecified.
- Do not use UNVERIFIED for minor uncertainties.
- Do not ignore actual confirmed conflicts.
- Evaluate all declared allergies, conditions and dietary preferences before making the final decision.

A product may receive OK even when an individual ingredient has an unknown origin, provided that this uncertainty does not establish a material conflict.

--------------------------------------------------
8. INGREDIENT CONCERN LEVEL
--------------------------------------------------

For every ingredient, assign exactly one:

confirmed:
A directly established conflict with the user's profile.

possible:
A specific evidence-supported potential concern.

unknown:
Insufficient information to establish a relevant ingredient property or origin.

none:
No relevant conflict or meaningful concern.

IMPORTANT:
- Do not assign confirmed based on assumptions.
- Do not assign possible without supporting evidence.
- Do not assign unknown merely because an ingredient is unfamiliar.
- Do not confuse ingredient uncertainty with product unsuitability.
- Keep ingredient concern levels consistent with the overall assessment.

--------------------------------------------------
9. FSSAI REGULATORY STATUS
--------------------------------------------------

Do not declare products compliant or non-compliant without sufficient official regulatory evidence.

--------------------------------------------------
10. OUTPUT REQUIREMENTS
--------------------------------------------------

- Return valid JSON only.
- Respond in the requested language.
- Analyze every supplied ingredient.
- Preserve the original ingredient order.
- Do not add ingredients that were not supplied.
- Do not omit required output fields.
- Use only allowed assessment statuses.
- Never return UNKNOWN as an overall assessment status.
- Keep overallAssessment consistent with personalizedAssessment.status.
- Explain every meaningful concern in simple language.
- Do not guarantee medical safety.
- Make the final assessment based on the complete health profile, not one isolated ingredient.

FINAL INSTRUCTION:
Your objective is accurate personalized food judgment, not maximum warning generation.

A warning must have a meaningful reason.
A confirmed conflict must never be ignored.
An indirect association must never be presented as a confirmed ingredient conflict.
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

    const assessment = result.personalizedAssessment;

    if (
      !assessment ||
      !validStatuses.includes(assessment.status) ||
      !validStatuses.includes(result.overallAssessment)
    ) {
      throw new Error("Groq returned an invalid assessment status");
    }

    if (
      !Array.isArray(result.ingredientAnalysis) ||
      !assessment.allergyAssessment ||
      !assessment.conditionAssessment ||
      !assessment.dietAssessment ||
      !Array.isArray(assessment.allergyAssessment.reasons) ||
      !Array.isArray(assessment.conditionAssessment.reasons) ||
      !Array.isArray(assessment.dietAssessment.reasons) ||
      typeof result.summary !== "string" ||
      typeof assessment.recommendation !== "string"
    ) {
      throw new Error("Groq returned an incomplete analysis");
    }

    for (const section of [
      assessment.allergyAssessment,
      assessment.conditionAssessment,
      assessment.dietAssessment,
    ]) {
      if (!validStatuses.includes(section.status)) {
        throw new Error("Groq returned an invalid section status");
      }
    }

    if (result.ingredientAnalysis.length !== ingredients.length) {
      throw new Error("Groq did not analyze every supplied ingredient");
    }

    for (let i = 0; i < result.ingredientAnalysis.length; i++) {
      const item = result.ingredientAnalysis[i];

      if (
        !item ||
        !validConcernLevels.includes(item.concernLevel) ||
        !Array.isArray(item.profileConcerns) ||
        typeof item.ingredient !== "string" ||
        typeof item.commonName !== "string" ||
        typeof item.explanation !== "string"
      ) {
        throw new Error("Groq returned an invalid ingredient analysis");
      }

      // Preserve the original ingredient text and order.
      item.ingredient = ingredients[i];
    }

    // AVOID always has priority when a confirmed allergy conflict
    // has been identified by the allergy assessment.
    if (assessment.allergyAssessment.status === "AVOID") {
      assessment.status = "AVOID";
      result.overallAssessment = "AVOID";
    }

    // Keep the two overall verdict fields consistent.
    if (assessment.status !== "AVOID") {
      result.overallAssessment = assessment.status;
    }

    return result;
  } catch (error) {
    console.error("Groq AI Error:", error.message);
    throw error;
  }
};



export const searchProductByBarcodeWithAI = async ({ barcode }) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }

  if (!barcode || !/^\d{8,14}$/.test(String(barcode))) {
    throw new Error("Invalid barcode");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",

        messages: [
          {
            role: "system",
            content: `
You are a food product research assistant.

Search the web for the exact barcode provided.

Important rules:
1. Do not guess or invent product information.
2. Confirm that the source refers to the exact barcode.
3. Prefer official manufacturer websites and reliable food databases.
4. Extract ingredients only when they are actually available in a source.
5. Never create a fake ingredient list.
6. If the exact product cannot be confirmed, set found to false.
7. If the product is found but ingredients are unavailable, keep ingredientsText empty.
8. Include source URLs and explain what each source confirms.

Return ONLY valid JSON in this format:

{
  "found": false,
  "barcode": "",
  "barcodeMatchConfirmed": false,
  "barcodeEvidence": "",
  "productName": "",
  "brand": "",
  "ingredientsText": "",
  "ingredients": [],
  "nutrition": {},
  "allergens": [],
  "traces": [],
  "sources": [
    {
      "title": "",
      "url": "",
      "whatItConfirms": ""
    }
  ],
  "confidence": "low",
  "notes": ""
}
            `,
          },
          {
            role: "user",
            content: `
Search for this exact food product barcode: ${barcode}

Find its product name, brand, complete ingredient list,
nutrition information, allergens and traces.

Verify the barcode match using the source.
Do not use information about a similar product with a different barcode.

Return the result in the required JSON format.
            `,
          },
        ],

        tools: [{ type: "browser_search" }],
        tool_choice: "required",
        temperature: 0.1,
        max_completion_tokens: 3000,
        reasoning_effort: "low",
      }),
      signal: AbortSignal.timeout(90000),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Groq product search failed"
    );
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty search response");
  }

  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let result;

  try {
    result = JSON.parse(cleaned);
  } catch {
    throw new Error("Groq returned an invalid product search response");
  }

  if (String(result.barcode) !== String(barcode)) {
    return {
      found: false,
      barcode,
      notes: "Returned barcode does not match scanned barcode",
    };
  }

  if (!Array.isArray(result.ingredients)) {
    result.ingredients = [];
  }

  if (!Array.isArray(result.sources)) {
    result.sources = [];
  }

  if (!Array.isArray(result.allergens)) {
    result.allergens = [];
  }

  if (!Array.isArray(result.traces)) {
    result.traces = [];
  }

  return result;
};
