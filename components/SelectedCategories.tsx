import { useMinorStore } from "@/store/minor";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Badge } from "./ui/badge";

const SelectedCategories = ({
  type = "upload",
}: {
  type?: "upload" | "board";
}) => {
  const [animationParent] = useAutoAnimate();
  const categories =
    type === "upload"
      ? useMinorStore((state) => state.selectedCategories)
      : useMinorStore((state) => state.selectedCategoriesBoard);
  const removeCategory =
    type === "upload"
      ? useMinorStore((state) => state.removeCategory)
      : useMinorStore((state) => state.removeCategoryBoard);

  return (
    <div
      className={`w-full ${
        type === "board" && categories.length > 0 && "mt-2"
      }`}
    >
      {type === "upload" && <h2>Select a category for the file</h2>}
      <ul ref={animationParent} className=" flex flex-wrap gap-2 text-sm">
        {type === "board" && categories.length > 0 && "Categories:"}
        {categories?.map((category) => (
          <li key={category.$id}>
            <Badge
              onClick={() => removeCategory({ $id: category.$id })}
              className=" text-sm cursor-pointer"
            >
              {category.category}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelectedCategories;
