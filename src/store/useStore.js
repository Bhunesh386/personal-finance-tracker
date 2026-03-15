import { create } from 'zustand';

const useStore = create((set, get) => ({
  // ─── Theme ───
  theme: localStorage.getItem('theme') || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  initTheme: () => {
    const theme = get().theme;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // ─── User ───
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  // ─── Stock Prices (live) ───
  stockPrices: {},
  lastPriceUpdate: null,
  setStockPrices: (prices) => set({ stockPrices: { ...get().stockPrices, ...prices }, lastPriceUpdate: new Date() }),
  clearStockPrices: () => set({ stockPrices: {}, lastPriceUpdate: null }),

  // ─── Sidebar ───
  sidebarCollapsed: window.innerWidth < 1024,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // ─── Currency ───
  currency: 'INR',
  setCurrency: (currency) => set({ currency }),
}));

export default useStore;
