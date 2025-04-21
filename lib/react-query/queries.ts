import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Models } from "appwrite";
import {
  getCategories,
  getInfinitePdfInfos,
  getPdfInfo,
} from "../appwrite/api";
import { QUERY_KEY } from "./QUERY_KEY";

export const useGetCategories = () => {
  return useQuery({
    queryKey: [QUERY_KEY.categories],
    queryFn: () => getCategories(),
  });
};

export const useGetPdfInfo = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY.pdfInfos, id],
    queryFn: () => getPdfInfo(id),
  });
};

export const useGetInfinitePdfInfos = (
  categoriesId?: { category: string; $id: string }[],
  search?: string
) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY.pdfInfoList],
    queryFn: ({ pageParam }) =>
      getInfinitePdfInfos({ pageParam, categoriesId, search }) as any,
    getNextPageParam: (lastPage: Models.Document) => {
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }
      const lastId = lastPage?.documents[lastPage?.documents.length - 1].$id;
      return lastId;
    },
  });
};
