import { Account, Client, Databases, Functions, Storage } from "appwrite";

export const config = {
  url: process.env.NEXT_PUBLIC_APPWRITE_URL!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  mainId: process.env.NEXT_PUBLIC_APPWRITE_MAIN_COLLECTION_ID!,
  pdfInfosId: process.env.NEXT_PUBLIC_APPWRITE_PDFINFOS_COLLECTION_ID!,
  categoriesId: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!,

  // gemini key
  geminiKey: process.env.GEMINI_API_KEY!,
};

export const client = new Client();

client.setEndpoint(config.url!).setProject(config.projectId!);

export const databases = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
