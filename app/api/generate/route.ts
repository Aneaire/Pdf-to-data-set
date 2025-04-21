// Example: app/api/generate/route.ts (Simplified)
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    /* ... error handling ... */
  }

  try {
    const { prompt, tunedModelName } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "Missing or invalid field: prompt" },
        { status: 400 }
      );
    }
    // Crucially, check that tunedModelName is provided and looks valid
    if (
      !tunedModelName ||
      typeof tunedModelName !== "string" ||
      !tunedModelName.startsWith("tunedModels/")
    ) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid field: tunedModelName (must start with tunedModels/)",
        },
        { status: 400 }
      );
    }

    const generationApiUrl = `https://generativelanguage.googleapis.com/v1beta/${tunedModelName}:generateContent?key=${apiKey}`;

    const response = await fetch(generationApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // generationConfig: { /* ... */ } // Optional config
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Google API Error (generateContent):", data);
      const errorDetail =
        data?.error?.message || `HTTP error! Status: ${response.status}`;
      return NextResponse.json(
        {
          error: `Generation failed: ${errorDetail}`,
          details: data?.error?.details,
        },
        { status: response.status }
      );
    }

    // Return the generated content
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error during generation.",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
