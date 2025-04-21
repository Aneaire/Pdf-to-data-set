import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchAndParseJsonl(url: string) {
  if (!url) {
    console.error("No URL provided to fetchAndParseJsonl.");
    return null;
  }

  try {
    // 1. Fetch the data from the URL
    const response = await fetch(url);

    // 2. Check if the request was successful
    if (!response.ok) {
      console.error(
        `Failed to fetch JSONL data from ${url}: ${response.status} ${response.statusText}`
      );
      // You could throw an error here instead if you prefer the caller to handle it
      // throw new Error(`HTTP error! status: ${response.status}`);
      return null; // Return null to indicate failure
    }

    // 3. Read the response body as text
    const jsonlText = await response.text();

    // 4. Process the JSONL text into a JavaScript array
    const jsonArray = [];
    const lines = jsonlText.split("\n"); // Split the text into lines

    // 5. Iterate over each line, parse, and collect
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
        // Log a warning for the invalid line but continue with others
        console.warn(
          `Skipping invalid JSON line in ${url}: "${trimmedLine}"`,
          parseError
        );
        // Optional: If you want to stop processing entirely on the first error,
        // you could re-throw the error or return null here.
        // return null;
      }
    }

    // 6. Return the resulting array
    return jsonArray;
  } catch (error) {
    // Catch network errors (fetch failed) or other unexpected errors
    console.error(`Error fetching or parsing JSONL from ${url}:`, error);
    return null; // Return null to indicate failure
  }
}

export function downloadFileFromUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
