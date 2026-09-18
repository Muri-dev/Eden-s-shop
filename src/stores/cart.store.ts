import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string; // unique item id (e.g. productId-variantId)
  productId: string;
  variantId?: string | null;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  variantName?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  stockLimit: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscountValue?: number | null;
}

interface CartStore {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  shippingCost: number;
  selectedShippingMethodId: string | null;
  
  // Actions
  addItem: (item: Omit<CartItem, "id">) => { success: boolean; message: string };
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  setShippingMethod: (methodId: string, cost: number) => void;
  
  // Computed getters
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotalItems: () => number;
  getGrandTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      shippingCost: 0,
      selectedShippingMethodId: null,

      addItem: (item) => {
        const id = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === id);

        if (existingIndex > -1) {
          const existingItem = currentItems[existingIndex];
          const newQuantity = existingItem.quantity + item.quantity;
          
          if (newQuantity > item.stockLimit) {
            return {
              success: false,
              message: `Only ${item.stockLimit} units available in stock.`,
            };
          }

          const updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...existingItem,
            quantity: newQuantity,
          };

          set({ items: updatedItems });
          return { success: true, message: "Cart quantity updated." };
        } else {
          if (item.quantity > item.stockLimit) {
            return {
              success: false,
              message: `Only ${item.stockLimit} units available in stock.`,
            };
          }

          set({ items: [...currentItems, { ...item, id }] });
          return { success: true, message: "Product added to your bag." };
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const currentItems = get().items;
        const target = currentItems.find((i) => i.id === id);
        if (!target) return;

        const safeQuantity = Math.min(quantity, target.stockLimit);

        set({
          items: currentItems.map((item) =>
            item.id === id ? { ...item, quantity: safeQuantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      setShippingMethod: (methodId, cost) => {
        set({ selectedShippingMethodId: methodId, shippingCost: cost });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().appliedCoupon;
        if (!coupon || subtotal <= 0) return 0;

        if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
          return 0;
        }

        let discount = 0;
        if (coupon.discountType === "PERCENTAGE") {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountValue && discount > coupon.maxDiscountValue) {
            discount = coupon.maxDiscountValue;
          }
        } else {
          discount = coupon.discountValue;
        }

        return Math.min(discount, subtotal);
      },

      getTotalItems: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const shipping = get().shippingCost;
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: "eden_shopping_bag",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
