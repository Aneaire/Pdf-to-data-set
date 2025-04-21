import { useJsonlToArray } from "@/lib/react-query/mutation";
import { Button } from "./ui/button";

const TestGenAI = () => {
  const { mutateAsync: jsonlToArray } = useJsonlToArray();

  const handleTest = async () => {
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/marketingstrategies-1x1f3kfq0jip:generateContent?key=AIzaSyCVcu3lJ8CphZPJug3thAMU-HtYF-ppJlg",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "LXIII" }] }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
    } catch (error) {
      console.error("Error during API call:", error);
    }
  };
  return (
    <Button className=" mx-auto mt-5" onClick={handleTest}>
      Test Gen AI SDK
    </Button>
  );
};

export default TestGenAI;
