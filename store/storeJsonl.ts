import { create } from "zustand";

// Define the shape of the objects you'll store in the array
interface Item {
  id: string | number; // Or whatever unique identifier you use
  name: string;
  // Add other properties your objects will have
  value?: any;
  createdAt?: Date;
}

// Define the state structure and the actions
interface ItemState {
  items: Item[]; // The array holding your objects
  addItem: (newItem: Item) => void; // Action to add an object
  addItems: (newItems: Item[]) => void; // Action to add multiple objects
  removeItem: (itemId: string | number) => void; // Optional: Action to remove an item by ID
  clearItems: () => void; // Optional: Action to clear the entire array
  updateItem: (itemId: string | number, updatedData: Partial<Item>) => void; // Optional: Action to update an item
}

// Create the store
export const useItemStore = create<ItemState>((set) => ({
  // --- STATE ---
  items: [], // Initial state is an empty array

  // --- ACTIONS ---

  /**
   * Adds a single new object to the items array.
   * @param newItem The object to add.
   */
  addItem: (newItem) =>
    set((state) => ({
      // Create a *new* array with the existing items and the new one
      // This ensures immutability, which is important for React state updates
      items: [...state.items, newItem],
    })),

  /**
   * Adds multiple new objects to the items array.
   * @param newItems An array of objects to add.
   */
  addItems: (newItems) =>
    set((state) => ({
      // Create a *new* array by concatenating the existing items and the new ones
      items: [...state.items, ...newItems],
    })),

  /**
   * Removes an item from the array based on its ID.
   * Assumes items have a unique 'id' property.
   * @param itemId The ID of the item to remove.
   */
  removeItem: (itemId) =>
    set((state) => ({
      // Create a *new* array containing only the items that *don't* match the ID
      items: state.items.filter((item) => item.id !== itemId),
    })),

  /**
   * Clears all items from the array.
   */
  clearItems: () => set({ items: [] }), // Reset the items array to empty

  /**
   * Updates an existing item in the array based on its ID.
   * Merges the existing item data with the provided updated data.
   * @param itemId The ID of the item to update.
   * @param updatedData An object containing the properties to update.
   */
  updateItem: (itemId, updatedData) =>
    set((state) => ({
      // Create a *new* array by mapping over the existing items
      items: state.items.map(
        (item) =>
          item.id === itemId
            ? { ...item, ...updatedData } // If ID matches, create a new object merging old and new data
            : item // Otherwise, keep the original item
      ),
    })),
}));

// --- Optional: Selector Hooks (for performance optimization if needed) ---
// You can define selectors outside the component to prevent unnecessary re-renders
// if only specific parts of the state are used.

export const useItems = () => useItemStore((state) => state.items);
export const useAddItem = () => useItemStore((state) => state.addItem);
// ... add selectors for other actions/state parts as needed
