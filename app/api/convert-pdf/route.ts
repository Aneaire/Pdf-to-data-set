// app/api/convert-pdf/route.ts
import pdf from "pdf-parse";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Changed to POST and Request type
  try {
    const { fileUrl } = await req.json(); // Extract fileUrl from the request body

    if (!fileUrl) {
      return new Response(JSON.stringify({ error: "fileUrl is required" }), {
        // Changed to Response
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);

    const data = await pdf(buffer);
    const text = data.text;

    return new Response(JSON.stringify({ text }), {
      // Changed to Response
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error converting PDF:", error);
    return new Response(JSON.stringify({ error: "Failed to convert PDF" }), {
      // Changed to Response
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
