// app/api/convert-to-jsonl/route.ts

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { GoogleGenerativeAI } from "@google/generative-ai"; // Ensure you have the GenAI import

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const IMPROVEMENT_PROMPT = `You are an AI assistant specialized in preparing data for Large Language Model fine-tuning. Your goal is to process the provided text and transform it into a JSONL format.

**Instructions:**

1.  **Format:** The output must be in JSONL format, meaning each line is a self-contained, valid JSON object.
2.  **Structure:** Each JSON object must contain exactly two string keys: "input" and "output".
3.  **Content ("input"):** The value for the "input" key should be a clear and concise question, instruction, or topic related to a specific part of the source text. Examples: "Explain the Theory of Mercantilism.", "What are the limitations of Mercantilism?", "Define Absolute Advantage.", "List the stages of the IPLC."
4.  **Content ("output"):** The value for the "output" key should be the direct answer, explanation, definition, or relevant information extracted *strictly* from the provided source text that corresponds to the "input". Do not infer or add external knowledge. Summarize lists or tables concisely if necessary, focusing on the main point.
5.  **Granularity:** Break down the text into logical, reasonably sized chunks. Aim for multiple JSONL entries covering the different concepts discussed.
6.  **Accuracy:** Ensure the "output" accurately reflects the information in the source text.

**Example JSONL line:**
{"input": "Explain the Theory of Absolute Advantage.", "output": "The Theory of Absolute Advantage defines it as a nation's ability to produce goods more efficiently (cost-effectively) than any other country. It suggests countries should specialize in producing goods where they have this advantage, export the surplus, and import goods they produce less efficiently, thereby improving living standards."}

**Now, process the following text according to these instructions:**

`;

async function formatToJsonl(extractedText: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Choose your model

    const prompt = `${IMPROVEMENT_PROMPT}\n\nOriginal Text:\n${extractedText}\n\nJSONL:`; // Changed the final marker slightly for clarity, though JSON: is probably fine too.

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Remove potential code fences and trim whitespace
    responseText = responseText
      .replace(/^```(?:jsonl|json)?\s*/i, "") // Remove starting fence (case-insensitive, optional language tag)
      .replace(/```\s*$/, "") // Remove ending fence
      .trim(); // Trim leading/trailing whitespace

    // --- Parsing JSONL to JavaScript Array ---
    const jsonArray: Record<string, any>[] = [];
    const lines = responseText.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        continue; // Skip empty lines
      }

      try {
        const jsonObject = JSON.parse(trimmedLine);
        jsonArray.push(jsonObject); // Add the valid object to the array
      } catch (parseError) {
        console.warn(
          `Skipping invalid JSON line during server-side parsing: "${trimmedLine}"`,
          parseError
        );
        // Decide if you want to stop or just skip. Skipping is often more robust.
      }
    }

    // --- Convert JavaScript Array back to JSON String ---
    const jsonArrayString = JSON.stringify(jsonArray, null, 2); // Use null, 2 for pretty-printing if desired, or just JSON.stringify(jsonArray)

    console.log("Final JSON Array String:", jsonArrayString);
    return jsonArrayString; // Return the stringified array
  } catch (geminiError) {
    console.error("Error calling Gemini:", geminiError);
    // If the Gemini API call fails, return an empty string to avoid sending partial/error data
    return "";
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { extractedText } = await req.json();

    if (!extractedText) {
      return new NextResponse(
        JSON.stringify({ error: "extractedText is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const jsonlContent = await formatToJsonl(extractedText);

    return new NextResponse(jsonlContent, {
      status: 200,
      headers: {
        "Content-Type": "application/jsonl", // or "application/x-jsonlines"
        "Content-Disposition": 'attachment; filename="training_data.jsonl"',
      },
    });
  } catch (error) {
    console.error("Error converting to JSONL:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to convert to JSONL" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
