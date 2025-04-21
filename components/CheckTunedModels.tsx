import { Button } from "./ui/button";

const CheckTunedModels = () => {
  const API = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const tunedModelList = () => {
    fetch(
      `"https://generativelanguage.googleapis.com/v1beta/tunedModels?key=${API}"`
    ).then((res) => console.log(res));
  };
  return (
    <Button
      className=" bg-green-700 hover:bg-green-600 text-white mt-5"
      onClick={tunedModelList}
    >
      Check Tuned models
    </Button>
  );
};

export default CheckTunedModels;
