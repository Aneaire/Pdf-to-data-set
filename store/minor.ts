import { create } from "zustand";

// Define the possible values for selection as a type for better type safety
export type SelectionType = "to upload" | "for board";

export interface MinorState {
  selectedCategories: { category: string; $id: string }[];
  addCategory: ({ category, $id }: { category: string; $id: string }) => void;
  removeCategory: ({ $id }: { $id: string }) => void;
  clearCategories: () => void;

  selectedCategoriesBoard: { category: string; $id: string }[];
  addCategoryBoard: ({
    category,
    $id,
  }: {
    category: string;
    $id: string;
  }) => void;
  removeCategoryBoard: ({ $id }: { $id: string }) => void;
  clearCategoriesBoard: () => void;

  processedJson: { input: string; output: string }[];
  addProcessedJson: (json: { input: string; output: string }[]) => void;
  clearProcessedJson: () => void;

  selection: SelectionType;
  setSelection: (newSelection: SelectionType) => void;
}

export const useMinorStore = create<MinorState>((set) => ({
  selectedCategories: [],
  selectedCategoriesBoard: [],
  processedJson: [],

  selection: "to upload",

  addCategory: ({ category, $id }: { category: string; $id: string }) =>
    set((state) => {
      const alreadyHasCategory = state.selectedCategories.some(
        (m) => m.category === category
      );
      if (!alreadyHasCategory) {
        return {
          selectedCategories: [...state.selectedCategories, { category, $id }],
        };
      }
      return state;
    }),

  removeCategory: ({ $id }: { $id: string }) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.filter((m) => m.$id !== $id),
    })),

  clearCategories: () =>
    set({
      selectedCategories: [],
    }),

  addCategoryBoard: ({ category, $id }: { category: string; $id: string }) =>
    set((state) => {
      const alreadyHasCategory = state.selectedCategoriesBoard.some(
        (m) => m.category === category
      );
      if (!alreadyHasCategory) {
        return {
          selectedCategoriesBoard: [
            ...state.selectedCategoriesBoard,
            { category, $id },
          ],
        };
      }
      return state;
    }),

  removeCategoryBoard: ({ $id }: { $id: string }) =>
    set((state) => ({
      selectedCategoriesBoard: state.selectedCategoriesBoard.filter(
        (m) => m.$id !== $id
      ),
    })),

  clearCategoriesBoard: () =>
    set({
      selectedCategoriesBoard: [],
    }),

  addProcessedJson: (json: { input: string; output: string }[]) =>
    set((state) => ({
      processedJson: [...state.processedJson, ...json],
    })),

  clearProcessedJson: () =>
    set({
      processedJson: [],
    }),

  setSelection: (newSelection: SelectionType) =>
    set({ selection: newSelection }),
}));
