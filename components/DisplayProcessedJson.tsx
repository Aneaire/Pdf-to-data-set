import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMinorStore } from "@/store/minor";
// Import necessary icons
import { CheckIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
// Using nightOwl theme as per your code
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Button } from "./ui/button";

const DisplayProcessedJson = () => {
  // Keep open state logic as needed, setting to true might be for debugging
  const [open, setOpen] = useState(true); // Usually start closed
  const processedData = useMinorStore((state) => state.processedJson);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!processedData) return;
    const jsonString = JSON.stringify(processedData, null, 2);
    try {
      await navigator.clipboard.writeText(jsonString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // --- ADD THE DOWNLOAD HANDLER ---
  const handleDownload = () => {
    if (!processedData) return;
    try {
      const jsonString = JSON.stringify(processedData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "processed_data.json"; // Filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to prepare download: ", err);
    }
  };
  // --- END DOWNLOAD HANDLER ---

  const renderCodeBlock = () => {
    if (!processedData) {
      return <p className="p-4 text-muted-foreground">No data available.</p>;
    }
    try {
      const jsonString = JSON.stringify(processedData, null, 2);

      return (
        <SyntaxHighlighter
          language="json"
          style={nightOwl} // Use the imported theme
          customStyle={{
            margin: 0,
            fontSize: "0.875rem",
            backgroundColor: "transparent",
            padding: "1rem",
          }}
          codeTagProps={{
            style: {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
          }}
          wrapLines={true}
          showLineNumbers={false}
          className="!bg-transparent"
        >
          {jsonString}
        </SyntaxHighlighter>
      );
    } catch (error) {
      console.error("Error stringifying data:", error);
      return <p className="p-4 text-red-500">Error displaying data.</p>;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Show Processed Data</Button>
        </DialogTrigger>
        <DialogContent className="w-full px-4 sm:max-w-[600px] md:max-w-[800px] lg:max-w-[900px] flex flex-col max-h-[90vh] bg-gray-950 border border-slate-600">
          <DialogHeader>
            {/* Use text-slate-100 or similar for better contrast on dark BG */}
            <DialogTitle className="text-slate-100">Processed Data</DialogTitle>
            <DialogDescription className="text-slate-400">
              The following data was processed. You can copy or download it
              below.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mt-4 flex-1 overflow-auto rounded-md border border-slate-700 bg-slate-950 min-h-0">
            {" "}
            {/* Adjusted container BG/border */}
            {renderCodeBlock()}
            {/* --- Container for Buttons --- */}
            <div className="absolute top-2 right-2 z-10 flex gap-1">
              {" "}
              {/* Use flexbox for buttons */}
              {processedData && (
                <>
                  {/* Download Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    onClick={handleDownload}
                    aria-label="Download JSON file"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>

                  {/* Copy Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                    onClick={handleCopy}
                    aria-label="Copy code to clipboard"
                  >
                    {isCopied ? (
                      <CheckIcon className="h-4 w-4 text-green-400" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                </>
              )}
            </div>
            {/* --- End Button Container --- */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DisplayProcessedJson;
