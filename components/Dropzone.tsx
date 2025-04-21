// Dropzone.tsx
"use client";

import { useSavePdfInfo } from "@/lib/react-query/mutation";
import { useMinorStore } from "@/store/minor";
import { UploadDropzone } from "@uploadthing/react";
import { toast } from "sonner";
import { OurFileRouter } from "../app/api/uploadthing/core";

const Dropzone = () => {
  const { mutateAsync: savePdfInfo, isLoading: isSaving } = useSavePdfInfo();
  const clearCategories = useMinorStore((state) => state.clearCategories);
  const selectedCategories = useMinorStore((state) => state.selectedCategories);

  return (
    <UploadDropzone<OurFileRouter, "pdfUploader">
      endpoint="pdfUploader"
      disabled={selectedCategories.length <= 0 || isSaving}
      className=" border-2 border-white/25 z-10"
      onClientUploadComplete={async (res) => {
        console.log("Files: ", res);
        try {
          // const extractedText = await convertPdfToText(res[0].ufsUrl);
          // const jsonlContent = await textToJsonl(extractedText);
          await Promise.all(
            res.map(async (file) => {
              await savePdfInfo({
                fileUrl: file.ufsUrl,
                title: file.name,
                fileSize: file.size,
              });
            })
          ).then(() => {
            clearCategories();
            toast.dismiss("uploading");
            toast.success("Files uploaded successfully");
          });
        } catch (error) {
          console.error("Error during PDF processing:", error);
          toast.error("Error processing PDF");
        }
      }}
      onUploadError={(error: Error) => {
        toast.dismiss("uploading");
        toast.error(`ERROR! ${error.message}`);
      }}
      onUploadBegin={(name) => {
        toast.loading(`Uploading ${name}...`, { id: "uploading" });
      }}
      onChange={(acceptedFiles) => {
        console.log("Accepted files: ", acceptedFiles);
      }}
    />
  );
};

export default Dropzone;
