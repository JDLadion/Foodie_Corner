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

const STORAGE_KEY = 'foodie-menu-items';

const emojiByCategory: Record<Category, string> = {
  Appetizer: '🥟',
  'Main Course': '🍲',
  Dessert: '🍮',
  Beverage: '🥭',
};

const defaultItems: MenuItem[] = [
  { id: 1, name: 'Chicken Adobo', category: 'Main Course', price: 150, stock: 'available', favorite: true, emoji: '🍗' },
  { id: 2, name: 'Lumpiang Shanghai', category: 'Appetizer', price: 90, stock: 'available', favorite: false, emoji: '🥟' },
  { id: 3, name: 'Leche Flan', category: 'Dessert', price: 60, stock: 'low', favorite: true, emoji: '🍮' },
  { id: 4, name: 'Mango Shake', category: 'Beverage', price: 75, stock: 'available', favorite: false, emoji: '🥭' },
  { id: 5, name: 'Sinigang na Baboy', category: 'Main Course', price: 180, stock: 'out', favorite: false, emoji: '🍲' },
];

function normalizeItem(item: MenuItem): MenuItem {
  const emoji = typeof item.emoji === 'string' ? item.emoji.trim() : '';
  const isImageData = emoji.startsWith('data:image/');

  return {
    ...item,
    emoji: isImageData ? emoji : emoji.length > 8 ? emojiByCategory[item.category] : emoji,
  };
}

function load(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const items = (JSON.parse(raw) as MenuItem[]).map(normalizeItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return items;
    }
  } catch {
    // ignore corrupted / unavailable storage
  }
  return defaultItems.map((i) => ({ ...i }));
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    items: load(),
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
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      } catch {
        // storage unavailable; keep working in memory
      }
    },
    addItem(data: NewMenuItem) {
      const nextId = Math.max(0, ...this.items.map((i) => i.id)) + 1;
      this.items.push({ ...data, id: nextId, favorite: false });
      this.save();
    },
    removeItem(id: number) {
      this.items = this.items.filter((i) => i.id !== id);
      this.save();
    },
    toggleFavorite(id: number) {
      const item = this.items.find((i) => i.id === id);
      if (item) {
        item.favorite = !item.favorite;
        this.save();
      }
    },
    cycleStock(id: number) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;
      item.stock = item.stock === 'available' ? 'low' : item.stock === 'low' ? 'out' : 'available';
      this.save();
    },
    updateItem(updated: MenuItem) {
      const index = this.items.findIndex((i) => i.id === updated.id);
      if (index !== -1) {
        this.items[index] = { ...updated };
        this.save();
      }
    },
  },
});
