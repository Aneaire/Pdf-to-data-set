import { NextRequest, NextResponse } from "next/server"; // Using Next.js types

// Assuming you might use GenAI later, keeping the import, otherwise remove it
// import { GoogleGenerativeAI } from "@google/generative-ai";
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const dynamic = "force-dynamic"; // Ensure fresh fetch on each request

export async function POST(req: NextRequest): Promise<NextResponse> {
  // URL containing the JSONL data
  const jsonlUrl =
    "https://sphocqq45o.ufs.sh/f/wjpB984YCGhRYRNTo5m9e4cgAYfW1HNsZUvOm5ERTVakP0Qj";

  try {
    // 1. Fetch the JSONL content from the URL
    const response = await fetch(jsonlUrl);

    // Check if the fetch was successful
    if (!response.ok) {
      throw new Error(
        `Failed to fetch JSONL data: ${response.status} ${response.statusText}`
      );
    }

    // 2. Read the response body as text
    const jsonlText = await response.text();

    // 3. Process the JSONL text into a JavaScript array
    const jsonArray: Record<string, any>[] = []; // Initialize an array to hold the objects

    // Split the text into lines
    const lines = jsonlText.split("\n");

    // Iterate over each line
    for (const line of lines) {
      const trimmedLine = line.trim(); // Remove leading/trailing whitespace

      // Skip empty lines
      if (!trimmedLine) {
        continue;
      }

      try {
        // Parse each non-empty line as a JSON object
        const jsonObject = JSON.parse(trimmedLine);
        jsonArray.push(jsonObject); // Add the parsed object to the array
      } catch (parseError) {
        console.warn(
          `Skipping invalid JSON line: "${trimmedLine}"`,
          parseError
        );
        // Optional: Decide if you want to stop processing on error or just skip the line
        // throw new Error(`Failed to parse JSON line: ${trimmedLine}`); // Uncomment to stop on first error
      }
    }

    // 4. Return the resulting array as a JSON response
    return NextResponse.json(jsonArray, {
      status: 200,
      // Headers are automatically set by NextResponse.json
    });
  } catch (error) {
    console.error("Error processing JSONL:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to process JSONL data", details: errorMessage },
      {
        status: 500,
      }
    );
  }
}
