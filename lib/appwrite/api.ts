import { useMinorStore } from "@/store/minor";
import { ID, Models, Query } from "appwrite";
import { config, databases } from "./config";

export type ICategories = Models.Document & {
  category: string;
  pdfs: string[];
};

export const createCategories = async (category: string) => {
  try {
    const categoriesDoc = await databases.createDocument(
      config.mainId,
      config.categoriesId,
      ID.unique(),
      {
        category,
        pdfs: [],
      }
    );

    return categoriesDoc;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      config.mainId,
      config.categoriesId,
      [Query.orderDesc("$createdAt")]
    );
    return categories;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export type IPdfInfo = {
  fileUrl: string;
  title: string;
  fileSize: number;
  categories?: string[] | ICategories[];
  categoryFlags?: string[];
} & Partial<Models.Document>;

export const savePdfInfo = async (pdfInfo: IPdfInfo) => {
  try {
    const { fileUrl, title, fileSize } = pdfInfo;
    const selectedCategories = useMinorStore.getState().selectedCategories;
    const pdf = await databases.createDocument(
      config.mainId,
      config.pdfInfosId,
      ID.unique(),
      {
        fileUrl,
        title,
        fileSize,
        categories: [...selectedCategories.map((c) => c.$id)],
        categoryFlags: [
          ...selectedCategories.map((c) => c.category.toLowerCase()),
        ],
      } as IPdfInfo
    );

    if (!pdf) {
      throw new Error("Failed to save pdf info");
    }

    return pdf;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPdfInfo = async (id: string) => {
  try {
    const pdfInfo = await databases.getDocument(
      config.mainId,
      config.pdfInfosId,
      id
    );
    return pdfInfo as IPdfInfo;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPdfInfos = async () => {
  try {
    const pdfInfos = await databases.listDocuments(
      config.mainId,
      config.pdfInfosId
    );
    return pdfInfos;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getInfinitePdfInfos = async ({
  pageParam,
  categoriesId,
  search,
}: {
  pageParam: number;
  categoriesId?: { category: string; $id: string }[];
  search?: string;
}) => {
  const queries: any[] = [Query.orderDesc("$createdAt"), Query.limit(30)];

  if (categoriesId && categoriesId?.length > 0) {
    queries.push(
      Query.contains("categoryFlags", [
        ...categoriesId.map((c) => c.category.toLowerCase()),
      ])
    );
  }

  if (search) {
    queries.push(
      Query.or([
        Query.search("title", search),
        Query.contains("categoryFlags", search),
      ])
    );
  }

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      config.mainId,
      config.pdfInfosId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.error(error);
  }
};

export const convertPdfToText = async (fileUrl: string) => {
  try {
    const response = await fetch("/api/convert-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileUrl }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.text;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const processListOfPdfs = async (ids: string[]) => {
  try {
    const promises = ids.map(async (id) => {
      const pdfInfo = await getPdfInfo(id);
      console.log("pdfInfo", pdfInfo);
      const fileUrl = pdfInfo.fileUrl;
      console.log("fileUrl", fileUrl);
      const response = await convertPdfToText(fileUrl);
      console.log("response", response);
      const jsonlContent = await textToJsonl(response);
      console.log("jsonlContent", jsonlContent);
      return jsonlContent;
    });

    const results = await Promise.all(promises);
    console.log("results", results.flat());
    return results.flat();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const textToJsonl = async (extractedText: string) => {
  try {
    const response = await fetch("/api/convert-to-jsonl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ extractedText }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const text = await response.json();
    return text;
  } catch (error) {
    console.error("Error converting text to JSONL:", error);
    throw error;
  }
};

export type IJsonToArray = {
  data: string;
  type?: "url" | "text";
};

export const jsonlToArray = async ({ data, type = "url" }: IJsonToArray) => {
  if (!data) {
    console.error("No URL provided to fetchAndParseJsonl.");
    return null;
  }

  try {
    // 1. Fetch the data from the URL
    const response = type === "url" ? await fetch(data) : new Response(data);

    // 2. Check if the request was successful
    if (!response.ok) {
      console.error(
        `Failed to fetch JSONL data from ${data}: ${response.status} ${response.statusText}`
      );
      // You could throw an error here instead if you prefer the caller to handle it
      // throw new Error(`HTTP error! status: ${response.status}`);
      return null; // Return null to indicate failure
    }

    // 3. Read the response body as text
    const jsonlText = type === "url" ? await response.text() : data;

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
          `Skipping invalid JSON line in ${data}: "${trimmedLine}"`,
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
    console.error(`Error fetching or parsing JSONL from ${data}:`, error);
    return null; // Return null to indicate failure
  }
};
