import { create } from 'zustand';
import type { Work, Chapter, StoryBeat } from '../types';
import { mockWorks, mockChapters, mockStoryBeats } from '../data/mockData';

interface WorkState {
  works: Work[];
  chapters: Chapter[];
  storyBeats: StoryBeat[];
  currentWorkId: string | null;
  currentChapterId: string | null;
  setCurrentWork: (id: string) => void;
  setCurrentChapter: (id: string) => void;
  getWorkById: (id: string) => Work | undefined;
  getChapterById: (id: string) => Chapter | undefined;
  getChaptersByWork: (workId: string) => Chapter[];
  getBeatsByChapter: (chapterId: string) => StoryBeat[];
  getBeatForPage: (chapterId: string, pageNumber: number) => StoryBeat | undefined;
}

export const useWorkStore = create<WorkState>((set, get) => ({
  works: mockWorks,
  chapters: mockChapters,
  storyBeats: mockStoryBeats,
  currentWorkId: 'work_001',
  currentChapterId: 'chap_001',
  setCurrentWork: (id) => set({ currentWorkId: id }),
  setCurrentChapter: (id) => set({ currentChapterId: id }),
  getWorkById: (id) => get().works.find((w) => w.id === id),
  getChapterById: (id) => get().chapters.find((c) => c.id === id),
  getChaptersByWork: (workId) => get().chapters.filter((c) => c.workId === workId),
  getBeatsByChapter: (chapterId) =>
    get()
      .storyBeats.filter((b) => b.chapterId === chapterId)
      .sort((a, b) => a.orderIndex - b.orderIndex),
  getBeatForPage: (chapterId, pageNumber) =>
    get()
      .getBeatsByChapter(chapterId)
      .find((b) => pageNumber >= b.relatedStartPage && pageNumber <= b.relatedEndPage),
}));
