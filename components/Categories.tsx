import { useCreateCategories } from "@/lib/react-query/mutation";
import { useGetCategories } from "@/lib/react-query/queries";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod"; // Import zod

import { SelectionType, useMinorStore } from "@/store/minor";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "./common/Loading";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";

const categoryFormSchema = z.object({
  categoryName: z
    .string()
    .min(1, { message: "Category name cannot be empty." })
    .max(35, { message: "Category name must be 50 characters or less." }),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const Categories = () => {
  const { data: categories } = useGetCategories();
  const { mutateAsync: createCategories, isLoading: isCreating } =
    useCreateCategories();
  const addCategory = useMinorStore((state) => state.addCategory);
  const setSelection = useMinorStore((state) => state.setSelection);
  const addCategoryBoard = useMinorStore((state) => state.addCategoryBoard);
  const selection = useMinorStore((state) => state.selection);

  const router = useRouter();
  const [animationParent] = useAutoAnimate();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      categoryName: "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (
        categories?.documents.find(
          (category) => category.category === values.categoryName
        )
      ) {
        toast.error("Category already exists");
        form.reset();
        return;
      }
      await createCategories(values.categoryName);
      form.reset();
    } catch (error) {
      toast.error("Failed to create category");
      console.error("Failed to create category:", error);
    }
  }
  const selectionOptions: SelectionType[] = ["to upload", "for board"];

  const handleCycleSelection = () => {
    const currentIndex = selectionOptions.indexOf(selection);
    const nextIndex = (currentIndex + 1) % selectionOptions.length;
    const nextSelection = selectionOptions[nextIndex];
    setSelection(nextSelection);
  };

  const handleCategoriesButton = (category: string, $id: string) => {
    if (selection === "to upload") {
      addCategory({ category, $id });
      return;
    }
    addCategoryBoard({ category, $id });
  };

  return (
    <>
      <div className="w-full border-dashed border border-white/25 rounded-md p-4">
        <div>
          <h2 className=" flex">
            You are selecting{" "}
            <button
              onClick={handleCycleSelection}
              className="cursor-pointer bg-blue-700 hover:bg-blue-600 rounded underline px-2 ml-1"
            >
              {selection}
            </button>
          </h2>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex gap-2 w-full sm:w-fit ml-auto mb-4"
          >
            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input placeholder="Add a category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-orange-700 hover:bg-orange-600 text-white whitespace-nowrap shrink-0" // Added shrink-0
            >
              {isCreating ? <Loading /> : "Add Category"}
            </Button>
          </form>
        </Form>

        {/* Display categories */}
        <ul ref={animationParent} className=" flex flex-wrap gap-2">
          {categories?.documents.map((category) => (
            <li key={category.$id}>
              <Badge
                onClick={() =>
                  handleCategoriesButton(category.category, category.$id)
                }
                className=" text-sm cursor-pointer"
              >
                {category.category}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Categories;
