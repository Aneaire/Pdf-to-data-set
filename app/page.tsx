"use client";

import Categories from "@/components/Categories";
import DisplayFile from "@/components/DisplayFile";
import SelectedCategories from "@/components/SelectedCategories";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Dropzone from "../components/Dropzone";

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="  min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className=" lg:w-3xl mx-auto space-y-2">
          <p className="  text-2xl md:text-3xl font-bold text-center pb-2">
            Tune Gemini with PDF
          </p>
          <SelectedCategories />
          <Dropzone />
          <Categories />
          <DisplayFile />
          {/* <TestGenAI />
          <TuningForm /> */}
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
