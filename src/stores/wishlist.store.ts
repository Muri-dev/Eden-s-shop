import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  inStock: boolean;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleWishlist: (item: WishlistItem) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().isInWishlist(item.productId)) {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      toggleWishlist: (item) => {
        const exists = get().isInWishlist(item.productId);
        if (exists) {
          get().removeItem(item.productId);
          return false;
        } else {
          get().addItem(item);
          return true;
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "eden_customer_wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
