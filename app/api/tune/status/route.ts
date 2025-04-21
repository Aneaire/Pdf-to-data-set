// app/api/tune/status/route.ts
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Use NextRequest for easier URL parsing
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error("API Key not found.");
    return NextResponse.json(
      { error: "Server configuration error: API Key missing." },
      { status: 500 }
    );
  }

  // Get operation name from query parameter: e.g., /api/tune/status?name=operations/xyz...
  const operationName = request.nextUrl.searchParams.get("name");

  if (
    !operationName ||
    typeof operationName !== "string" ||
    !operationName.startsWith("operations/")
  ) {
    return NextResponse.json(
      {
        error:
          'Missing or invalid "name" query parameter. It should start with "operations/".',
      },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`;
    console.log(`Checking status for: ${operationName}`);
    console.log(`Calling URL: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        // 'Content-Type': 'application/json', // Not strictly needed for GET
      },
      // Add cache control if needed, though status might change frequently
      // cache: 'no-store',
    });

    const data = await response.json(); // Attempt to parse JSON regardless of status

    if (!response.ok) {
      console.error(
        `Google API Error checking status for ${operationName}:`,
        data
      );
      const errorDetail =
        data?.error?.message || `HTTP error! Status: ${response.status}`;
      return NextResponse.json(
        {
          error: `Failed to get operation status: ${errorDetail}`,
          details: data?.error?.details,
        },
        { status: response.status }
      );
    }

    console.log(`Operation Status for ${operationName}:`, data);
    // The 'data' object here is the Operation object.
    // It contains 'name', 'metadata', 'done' (boolean), and potentially 'error' or 'response' if done.
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(
      `Error in /api/tune/status checking ${operationName}:`,
      error
    );
    return NextResponse.json(
      {
        error: "Internal Server Error while checking status.",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
