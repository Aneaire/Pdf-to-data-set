import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// Import the Input component
import { Input } from "@/components/ui/input";
import { useProcessListOfPdfs } from "@/lib/react-query/mutation";
import { useGetInfinitePdfInfos } from "@/lib/react-query/queries";
import { useMinorStore } from "@/store/minor";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
// Import the custom hook
import useDebounce from "@/hooks/useDebounce"; // Adjust path if needed
import LoadingSquare from "./common/LoadingSquare";
import DisplayProcessedJson from "./DisplayProcessedJson";
import SelectedCategories from "./SelectedCategories";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

const FormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
  // Add search field to the form schema if you want RHF to manage it (optional)
  // search: z.string().optional(),
});

const DisplayFile = () => {
  const selectedCategoriesBoard = useMinorStore(
    (state) => state.selectedCategoriesBoard
  );
  const {
    mutateAsync: processListOfPdfs,
    isLoading: isProcessing,
    isSuccess,
  } = useProcessListOfPdfs();

  // --- Search State ---
  const [searchTerm, setSearchTerm] = useState(""); // Input's immediate value
  const debouncedSearchTerm = useDebounce(searchTerm, 400); // Debounced value (e.g., 400ms delay)
  // --- End Search State ---

  const {
    data: files,
    isLoading: isLoadingFiles, // Rename to avoid conflict
    isFetching: isFetchingFiles, // Use isFetching for subsequent loads/searches
    refetch,
  } = useGetInfinitePdfInfos(selectedCategoriesBoard, debouncedSearchTerm); // Pass debounced term
  const [animationParent] = useAutoAnimate();
  const addProcessedJson = useMinorStore((state) => state.addProcessedJson);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
      // search: "", // If using RHF for search field
    },
  });

  const allItemIds = useMemo(() => {
    if (!files?.pages) return [];
    return files.pages.flatMap((page) =>
      page.documents.map((doc: any) => doc.$id)
    );
  }, [files]);

  const selectedItems = form.watch("items");

  // Refetch when categories change. React Query handles refetch on query key change (debouncedSearchTerm).
  useEffect(() => {
    refetch();
    // Optionally reset selection when categories change if desired
    // form.setValue("items", []);
  }, [selectedCategoriesBoard, refetch, debouncedSearchTerm]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // Filter out any selected IDs that might no longer be visible due to search
    const currentlyVisibleIds = new Set(allItemIds);
    const itemsToProcess = data.items.filter((id) =>
      currentlyVisibleIds.has(id)
    );

    if (itemsToProcess.length === 0) {
      // Handle case where selection is empty or only contains hidden items
      console.warn("No visible items selected for processing.");
      // Maybe show a toast or message
      return;
    }

    const response = await processListOfPdfs(itemsToProcess);
    addProcessedJson(response);
  }

  const handleSelectAllChange = (checked: boolean | "indeterminate") => {
    // Select/Deselect only the currently visible items based on the search
    if (checked) {
      form.setValue("items", allItemIds, { shouldValidate: true });
    } else {
      // If deselecting all, clear everything regardless of visibility
      form.setValue("items", [], { shouldValidate: true });
      // Alternative: Only remove visible items from selection
      // const currentSelection = form.getValues("items");
      // const visibleIdsSet = new Set(allItemIds);
      // const newSelection = currentSelection.filter(id => !visibleIdsSet.has(id));
      // form.setValue("items", newSelection, { shouldValidate: true });
    }
  };

  // Adjust isAllSelected based on *currently visible* items due to search
  const isAllVisibleSelected = useMemo(() => {
    if (allItemIds.length === 0) return false;
    const visibleIdsSet = new Set(allItemIds);
    // Check if every visible ID is included in the selected items
    return (
      allItemIds.every((id) => selectedItems.includes(id)) &&
      selectedItems.some((id) => visibleIdsSet.has(id))
    ); // Ensure selection isn't just hidden items
  }, [allItemIds, selectedItems]);

  const isLoading = isLoadingFiles; // Use the renamed loading state for initial load

  return (
    <div
      className=" w-full border border-gray-500 p-2 md:p-4 rounded-md flex flex-col" // Added flex flex-col
      ref={animationParent}
    >
      {/* Search Input outside the main form field but part of the overall component */}
      <div className="mb-4 relative">
        <Input
          type="search" // Use type="search" for potential browser features (like clear button)
          placeholder="Search file titles and categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-8" // Add padding for potential loading indicator
        />
        {/* Show subtle loading indicator when searching */}
        {isFetchingFiles &&
          !isLoadingFiles && ( // Show only on subsequent fetches
            <LoadingSquare
              size={16}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          )}
      </div>

      {/* Initial Loading State */}
      {isLoading && (
        <div className="flex justify-center py-10">
          <LoadingSquare size={60} />
        </div>
      )}

      {/* Form and List (only show if not initial loading) */}
      {!isLoading && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex flex-col flex-1"
          >
            {" "}
            {/* Added flex */}
            <FormField
              control={form.control}
              name="items"
              render={() => (
                // Make FormItem flex column and take remaining space
                <FormItem className="flex flex-col flex-1 min-h-0">
                  {" "}
                  {/* Added flex */}
                  <div className="mb-2 flex-shrink-0">
                    {" "}
                    {/* Prevent shrinking */}
                    <FormDescription>
                      Select the items you want to create a data-set for
                    </FormDescription>
                    <SelectedCategories type="board" />
                  </div>
                  {/* --- Select All Checkbox --- */}
                  {allItemIds.length > 0 && (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2 border-b border-gray-600 flex-shrink-0">
                      {" "}
                      {/* Prevent shrinking */}
                      <FormControl>
                        <Checkbox
                          id="select-all"
                          checked={isAllVisibleSelected} // Use the new state
                          onCheckedChange={handleSelectAllChange}
                          aria-label="Select all visible items"
                        />
                      </FormControl>
                      <FormLabel
                        htmlFor="select-all"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Select All Visible (
                        {
                          selectedItems.filter((id) => allItemIds.includes(id))
                            .length
                        }{" "}
                        / {allItemIds.length}){" "}
                        {/* Show count of selected *visible* items */}
                      </FormLabel>
                    </FormItem>
                  )}
                  {/* --- End Select All Checkbox --- */}
                  {/* Scrollable File List Area */}
                  {/* Added flex-1 and min-h-0 to allow shrinking and scrolling */}
                  <div className="space-y-1 overflow-y-auto scroll-smooth pt-1 flex-1 min-h-0">
                    {" "}
                    {/* Takes remaining space */}
                    {files?.pages.map((page) =>
                      page.documents.map((item: any) => (
                        <FormField
                          key={item.$id}
                          control={form.control}
                          name="items"
                          render={({ field }) => (
                            <FormItem
                              key={item.$id}
                              className="flex flex-row items-start space-x-3 space-y-0 border-b border-gray-500/45 p-2 rounded hover:bg-gray-800/50 transition-colors"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.$id)}
                                  onCheckedChange={(checked) =>
                                    checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.$id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.$id
                                          )
                                        )
                                  }
                                />
                              </FormControl>
                              <p className="text-sm font-normal cursor-pointer line-clamp-2 flex-1">
                                {item.title}
                              </p>
                              <span className=" ml-auto gap-1.5 flex flex-wrap pl-2">
                                {item.categories.map((category: any) => (
                                  <Badge
                                    key={category.$id}
                                    variant={"secondary"}
                                  >
                                    {category.category}
                                  </Badge>
                                ))}
                              </span>
                            </FormItem>
                          )}
                        />
                      ))
                    )}
                    {/* Message when no files match search/filters */}
                    {allItemIds.length === 0 && !isFetchingFiles && (
                      <p className="p-4 text-center text-muted-foreground">
                        No files found matching your search or selected
                        categories.
                      </p>
                    )}
                  </div>
                  <FormMessage className="flex-shrink-0 pt-1" />{" "}
                  {/* Prevent shrinking */}
                </FormItem>
              )}
            />
            {/* Footer section */}
            <span className=" flex justify-between items-center pt-2 flex-shrink-0 border-t border-gray-600">
              {" "}
              {/* Prevent shrinking */}
              <Button
                type="submit"
                disabled={
                  isProcessing ||
                  selectedItems.filter((id) => allItemIds.includes(id))
                    .length === 0
                } // Disable if processing or no *visible* items selected
              >
                {isProcessing ? (
                  <LoadingSquare size={20} />
                ) : (
                  `Process (${
                    selectedItems.filter((id) => allItemIds.includes(id)).length
                  })` // Show count of selected *visible* items
                )}
              </Button>
              {isSuccess && <DisplayProcessedJson />}
            </span>
          </form>
        </Form>
      )}
    </div>
  );
};

export default DisplayFile;
