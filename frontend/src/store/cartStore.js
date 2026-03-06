import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // Ajouter un produit (déjà fait)
      addToCart: (product) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find(item => item.id === product.id);
        if (existingItem) {
          set({
            cart: currentCart.map(item => 
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            )
          });
        } else {
          set({ cart: [...currentCart, { ...product, quantity: 1 }] });
        }
      },

      // 🚨 NOUVEAU : Supprimer totalement un produit du panier
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => item.id !== productId) });
      },

      // 🚨 NOUVEAU : Augmenter ou diminuer la quantité
      updateQuantity: (productId, amount) => {
        set({
          cart: get().cart.map(item => {
            if (item.id === productId) {
              const newQuantity = item.quantity + amount;
              // On empêche la quantité de descendre en dessous de 1 (il faut cliquer sur supprimer pour l'enlever)
              return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
            }
            return item;
          })
        });
      },

      // 🚨 NOUVEAU : Vider tout le panier d'un coup
      clearCart: () => set({ cart: [] }),

      // Compter le nombre d'articles (déjà fait)
      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      // 🚨 NOUVEAU : Calculer le prix total de la commande !
      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'ecommerce-cart', 
    }
  )
);