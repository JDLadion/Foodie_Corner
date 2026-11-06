import axios from 'axios';
import { defineStore } from 'pinia';

export type Category = 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage';
export type Stock = 'available' | 'low' | 'out';
export type SortBy = 'default' | 'name' | 'priceLow' | 'priceHigh';

export interface MenuItem {
  id: number;
  name: string;
  category: Category;
  price: number;
  stock: Stock;
  favorite: boolean;
  emoji: string;
}

export type NewMenuItem = Omit<MenuItem, 'id' | 'favorite'>;

const TOKEN_KEY = 'foodie-auth-token';

const emojiByCategory: Record<Category, string> = {
  Appetizer: '🥟',
  'Main Course': '🍲',
  Dessert: '🍮',
  Beverage: '🥭',
};

function authConfig() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { headers: { Authorization: 'Bearer ' + token } } : {};
}

function normalizeItem(item: MenuItem): MenuItem {
  const emoji = typeof item.emoji === 'string' ? item.emoji.trim() : '';
  return {
    ...item,
    emoji: emoji.startsWith('data:image/') || emoji.length <= 8 ? emoji : emojiByCategory[item.category],
  };
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    items: [] as MenuItem[],
    searchQuery: '',
    selectedCategory: 'All' as 'All' | Category,
    sortBy: 'default' as SortBy,
    showFavoritesOnly: false,
  }),

  getters: {
    filteredMenu(state): MenuItem[] {
      let list = state.items.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesCategory =
          state.selectedCategory === 'All' || item.category === state.selectedCategory;
        const matchesFavorite = !state.showFavoritesOnly || item.favorite;
        return matchesSearch && matchesCategory && matchesFavorite;
      });

      if (state.sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      else if (state.sortBy === 'priceLow') list = [...list].sort((a, b) => a.price - b.price);
      else if (state.sortBy === 'priceHigh') list = [...list].sort((a, b) => b.price - a.price);

      return list;
    },
    totalItems: (state) => state.items.length,
    favoriteCount: (state) => state.items.filter((i) => i.favorite).length,
    totalMenuValue: (state) => state.items.reduce((sum, i) => sum + i.price, 0),
    averagePrice(): number {
      return this.items.length === 0 ? 0 : this.totalMenuValue / this.items.length;
    },
  },

  actions: {
    clearItems() {
      this.items = [];
    },

    async loadItems() {
      // Clear the previous account's in-memory menu before loading this account.
      this.items = [];

      if (!localStorage.getItem(TOKEN_KEY)) {
        return;
      }

      const response = await axios.get<MenuItem[]>('/menu-items', authConfig());
      this.items = response.data.map(normalizeItem);
    },

    async addItem(data: NewMenuItem) {
      const response = await axios.post<MenuItem>('/menu-items', data, authConfig());
      this.items.push(normalizeItem(response.data));
    },

    async removeItem(id: number) {
      await axios.delete('/menu-items/' + id, authConfig());
      this.items = this.items.filter((i) => i.id !== id);
    },

    async toggleFavorite(id: number) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;

      const response = await axios.put<MenuItem>(
        '/menu-items/' + id,
        { ...item, favorite: !item.favorite },
        authConfig(),
      );
      Object.assign(item, normalizeItem(response.data));
    },

    async cycleStock(id: number) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;

      const stock = item.stock === 'available' ? 'low' : item.stock === 'low' ? 'out' : 'available';
      const response = await axios.put<MenuItem>(
        '/menu-items/' + id,
        { ...item, stock },
        authConfig(),
      );
      Object.assign(item, normalizeItem(response.data));
    },

    async updateItem(updated: MenuItem) {
      const response = await axios.put<MenuItem>(
        '/menu-items/' + updated.id,
        updated,
        authConfig(),
      );
      const index = this.items.findIndex((i) => i.id === updated.id);
      if (index !== -1) this.items[index] = normalizeItem(response.data);
    },
  },
});
