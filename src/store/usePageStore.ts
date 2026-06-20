import { create } from 'zustand';
import type { StoryPage, SpecialMark, PageReviewStatus } from '../types';
import { generateMockPages } from '../data/mockData';
import { generateId } from '../utils/idGenerator';

interface PageState {
  pages: Record<string, StoryPage[]>;
  selectedPageId: string | null;
  statusFilter: PageReviewStatus | 'all';
  initPagesForChapter: (chapterId: string, count?: number) => void;
  getPagesForChapter: (chapterId: string) => StoryPage[];
  getPageById: (chapterId: string, pageId: string) => StoryPage | undefined;
  setSelectedPage: (pageId: string | null) => void;
  setStatusFilter: (f: PageReviewStatus | 'all') => void;
  uploadPages: (chapterId: string, files: File[]) => Promise<void>;
  reorderPages: (chapterId: string, activeId: string, overId: string) => void;
  toggleSpecialMark: (chapterId: string, pageId: string, mark: SpecialMark) => void;
  setPageStatus: (chapterId: string, pageId: string, status: PageReviewStatus) => void;
  setPageStatusBatch: (chapterId: string, pageIds: string[], status: PageReviewStatus) => void;
  getPageStats: (chapterId: string) => { pending: number; needs_revision: number; approved: number };
}

const buildInitialState = (): Record<string, StoryPage[]> => {
  const pages = generateMockPages('chap_001', 20);
  return { chap_001: pages };
};

export const usePageStore = create<PageState>((set, get) => ({
  pages: buildInitialState(),
  selectedPageId: null,
  statusFilter: 'all',

  initPagesForChapter: (chapterId, count = 0) => {
    set((state) => {
      if (state.pages[chapterId]) return state;
      return {
        pages: {
          ...state.pages,
          [chapterId]: generateMockPages(chapterId, count),
        },
      };
    });
  },

  getPagesForChapter: (chapterId) => {
    const list = get().pages[chapterId] || [];
    const filtered = list.slice().sort((a, b) => a.sortOrder - b.sortOrder);
    const filter = get().statusFilter;
    if (filter === 'all') return filtered;
    return filtered.map((p) => ({ ...p })).filter((p) => p.reviewStatus === filter);
  },

  getPageById: (chapterId, pageId) => get().pages[chapterId]?.find((p) => p.id === pageId),

  setSelectedPage: (pageId) => set({ selectedPageId: pageId }),

  setStatusFilter: (f) => set({ statusFilter: f }),

  uploadPages: async (chapterId, files) => {
    const urls: string[] = [];
    for (const f of files) {
      urls.push(URL.createObjectURL(f));
    }
    const chapterPages = get().pages[chapterId] || [];
    const startOrder = chapterPages.length;
    const newPages: StoryPage[] = urls.map((url, idx) => ({
      id: generateId('page'),
      chapterId,
      pageNumber: chapterPages.length + idx + 1,
      imageUrl: url,
      specialMarks: [],
      reviewStatus: 'pending',
      sortOrder: startOrder + idx,
      createdAt: new Date().toISOString(),
    }));
    set((state) => ({
      pages: {
        ...state.pages,
        [chapterId]: [...chapterPages, ...newPages],
      },
    }));
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
      return {
        pages: { ...state.pages, [chapterId]: reordered },
      };
    });
  },

  toggleSpecialMark: (chapterId, pageId, mark) => {
    set((state) => {
      const list = state.pages[chapterId] || [];
      return {
        pages: {
          ...state.pages,
          [chapterId]: list.map((p) =>
            p.id !== pageId
              ? p
              : {
                  ...p,
                  specialMarks: p.specialMarks.includes(mark)
                    ? p.specialMarks.filter((m) => m !== mark)
                    : [...p.specialMarks, mark],
                },
          ),
        },
      };
    });
  },

  setPageStatus: (chapterId, pageId, status) => {
    set((state) => {
      const list = state.pages[chapterId] || [];
      return {
        pages: {
          ...state.pages,
          [chapterId]: list.map((p) => (p.id !== pageId ? p : { ...p, reviewStatus: status })),
        },
      };
    });
  },

  setPageStatusBatch: (chapterId, pageIds, status) => {
    const idSet = new Set(pageIds);
    set((state) => {
      const list = state.pages[chapterId] || [];
      return {
        pages: {
          ...state.pages,
          [chapterId]: list.map((p) => (idSet.has(p.id) ? { ...p, reviewStatus: status } : p)),
        },
      };
    });
  },

  getPageStats: (chapterId) => {
    const list = get().pages[chapterId] || [];
    return list.reduce(
      (acc, p) => {
        acc[p.reviewStatus]++;
        return acc;
      },
      { pending: 0, needs_revision: 0, approved: 0 },
    );
  },
}));
