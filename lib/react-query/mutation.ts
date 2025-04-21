import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  convertPdfToText,
  createCategories,
  IJsonToArray,
  IPdfInfo,
  jsonlToArray,
  processListOfPdfs,
  savePdfInfo,
  textToJsonl,
} from "../appwrite/api";
import { QUERY_KEY } from "./QUERY_KEY";

export const useSavePdfInfo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pdfInfo: IPdfInfo) => savePdfInfo(pdfInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.pdfInfoList] });
    },
  });
};

export const useConvertPdfToText = () => {
  return useMutation({
    mutationFn: (fileUrl: string) => convertPdfToText(fileUrl),
  });
};

export const useJsonlToArray = () => {
  return useMutation({
    mutationFn: (values: IJsonToArray) => jsonlToArray(values),
  });
};

export const useTextToJsonl = () => {
  return useMutation({
    mutationFn: (extractedText: string) => textToJsonl(extractedText),
  });
};

export const useCreateCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: string) => createCategories(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.categories] });
    },
  });
};

export const useProcessListOfPdfs = () => {
  return useMutation({
    mutationFn: (ids: string[]) => processListOfPdfs(ids),
  });
};
