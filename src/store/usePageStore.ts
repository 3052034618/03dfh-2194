import { create } from 'zustand';
import type { StoryPage, SpecialMark, PageReviewStatus } from '../types';
import { generateMockPages, buildMockAnnotationMap } from '../data/mockData';
import { generateId } from '../utils/idGenerator';
import { filesToBase64 } from '../utils/imageUtils';

const STORAGE_KEY = 'mangaflow_pages';

interface PageState {
  pages: Record<string, StoryPage[]>;
  selectedPageId: string | null;
  statusFilter: PageReviewStatus | 'all';
  setSelectedPage: (pageId: string | null) => void;
  setStatusFilter: (f: PageReviewStatus | 'all') => void;
  initPagesForChapter: (chapterId: string, count?: number) => void;
  uploadPages: (chapterId: string, files: File[]) => Promise<void>;
  reorderPages: (chapterId: string, activeId: string, overId: string) => void;
  toggleSpecialMark: (chapterId: string, pageId: string, mark: SpecialMark) => void;
  setPageStatus: (chapterId: string, pageId: string, status: PageReviewStatus) => void;
  setPageStatusBatch: (chapterId: string, pageIds: string[], status: PageReviewStatus) => void;
}

const loadFromStorage = (): Record<string, StoryPage[]> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveToStorage = (pages: Record<string, StoryPage[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch {}
};

const buildInitialState = (): Record<string, StoryPage[]> => {
  const stored = loadFromStorage();
  if (stored && Object.keys(stored).length > 0) return stored;
  const pages = generateMockPages('chap_001', 20);
  const result = { chap_001: pages };
  saveToStorage(result);
  return result;
};

export const usePageStore = create<PageState>((set, get) => ({
  pages: buildInitialState(),
  selectedPageId: null,
  statusFilter: 'all',

  setSelectedPage: (pageId) => set({ selectedPageId: pageId }),

  setStatusFilter: (f) => set({ statusFilter: f }),

  initPagesForChapter: (chapterId, count = 0) => {
    set((state) => {
      if (state.pages[chapterId]) return state;
      const newPages = generateMockPages(chapterId, count);
      const next = { ...state.pages, [chapterId]: newPages };
      saveToStorage(next);
      return { pages: next };
    });
  },

  uploadPages: async (chapterId, files) => {
    const urls = await filesToBase64(files);
    set((state) => {
      const chapterPages = state.pages[chapterId] || [];
      const startOrder = chapterPages.length;
      const newPages: StoryPage[] = urls.map((url, idx) => ({
        id: generateId('page'),
        chapterId,
        pageNumber: chapterPages.length + idx + 1,
        imageUrl: url,
        specialMarks: [],
        reviewStatus: 'pending' as PageReviewStatus,
        sortOrder: startOrder + idx,
        createdAt: new Date().toISOString(),
      }));
      const next = { ...state.pages, [chapterId]: [...chapterPages, ...newPages] };
      saveToStorage(next);
      return { pages: next };
    });
  },

  reorderPages: (chapterId, activeId, overId) => {
    if (activeId === overId) return;
    set((state) => {
      const list = [...(state.pages[chapterId] || [])].sort((a, b) => a.sortOrder - b.sortOrder);
      const oldIndex = list.findIndex((p) => p.id === activeId);
      const newIndex = list.findIndex((p) => p.id === overId);
      if (oldIndex < 0 || newIndex < 0) return state;
      const [moved] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, moved);
      const reordered = list.map((p, idx) => ({ ...p, sortOrder: idx, pageNumber: idx + 1 }));
      const next = { ...state.pages, [chapterId]: reordered };
      saveToStorage(next);
      return { pages: next };
    });
  },

  toggleSpecialMark: (chapterId, pageId, mark) => {
    set((state) => {
      const list = state.pages[chapterId] || [];
      const updated = list.map((p) =>
        p.id !== pageId
          ? p
          : {
              ...p,
              specialMarks: p.specialMarks.includes(mark)
                ? p.specialMarks.filter((m) => m !== mark)
                : [...p.specialMarks, mark],
            },
      );
      const next = { ...state.pages, [chapterId]: updated };
      saveToStorage(next);
      return { pages: next };
    });
  },

  setPageStatus: (chapterId, pageId, status) => {
    set((state) => {
      const list = state.pages[chapterId] || [];
      const updated = list.map((p) => (p.id !== pageId ? p : { ...p, reviewStatus: status }));
      const next = { ...state.pages, [chapterId]: updated };
      saveToStorage(next);
      return { pages: next };
    });
  },

  setPageStatusBatch: (chapterId, pageIds, status) => {
    const idSet = new Set(pageIds);
    set((state) => {
      const list = state.pages[chapterId] || [];
      const updated = list.map((p) => (idSet.has(p.id) ? { ...p, reviewStatus: status } : p));
      const next = { ...state.pages, [chapterId]: updated };
      saveToStorage(next);
      return { pages: next };
    });
  },
}));

export function selectFilteredPages(chapterId: string, statusFilter: PageReviewStatus | 'all'): StoryPage[] {
  const state = usePageStore.getState();
  const list = (state.pages[chapterId] || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
  if (statusFilter === 'all') return list;
  return list.filter((p) => p.reviewStatus === statusFilter);
}

export function selectAllPages(chapterId: string): StoryPage[] {
  return (usePageStore.getState().pages[chapterId] || []).slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function selectPageStats(chapterId: string): { pending: number; needs_revision: number; approved: number; total: number } {
  const list = usePageStore.getState().pages[chapterId] || [];
  const stats = { pending: 0, needs_revision: 0, approved: 0, total: list.length };
  for (const p of list) stats[p.reviewStatus]++;
  return stats;
}
