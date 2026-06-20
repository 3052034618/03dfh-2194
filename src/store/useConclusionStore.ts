import { create } from 'zustand';
import type { PageConclusion, MeetingMinutes, PageProcessStatus, MeetingPageConclusion } from '../types';
import { generateId } from '../utils/idGenerator';

const STORAGE_KEY = 'mangaflow_conclusions';
const MINUTES_STORAGE_KEY = 'mangaflow_meeting_minutes';

const loadConclusionsFromStorage = (): Record<string, PageConclusion[]> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveConclusionsToStorage = (conclusions: Record<string, PageConclusion[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conclusions));
  } catch {}
};

const loadMinutesFromStorage = (): MeetingMinutes[] => {
  try {
    const raw = localStorage.getItem(MINUTES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const saveMinutesToStorage = (minutes: MeetingMinutes[]) => {
  try {
    localStorage.setItem(MINUTES_STORAGE_KEY, JSON.stringify(minutes));
  } catch {}
};

interface ConclusionState {
  conclusions: Record<string, PageConclusion[]>;
  meetingMinutes: MeetingMinutes[];
  upsertConclusion: (data: Omit<PageConclusion, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => PageConclusion;
  deleteConclusion: (id: string) => void;
  getConclusionForPage: (pageId: string) => PageConclusion | undefined;
  addMeetingMinutes: (minutes: Omit<MeetingMinutes, 'id'>) => MeetingMinutes;
  getMinutesForChapter: (chapterId: string) => MeetingMinutes[];
}

export const useConclusionStore = create<ConclusionState>((set, get) => ({
  conclusions: loadConclusionsFromStorage() || {},
  meetingMinutes: loadMinutesFromStorage(),

  upsertConclusion: (data) => {
    const now = new Date().toISOString();
    const chapterId = data.chapterId;

    let conclusion: PageConclusion;
    if (data.id) {
      conclusion = {
        ...data,
        id: data.id,
        updatedAt: now,
      } as PageConclusion;
    } else {
      conclusion = {
        id: generateId('conc'),
        pageId: data.pageId,
        chapterId: data.chapterId,
        finalOpinion: data.finalOpinion,
        assigneeUserId: data.assigneeUserId,
        createdAt: now,
        updatedAt: now,
        resolvedAt: data.resolvedAt,
      };
    }

    set((state) => {
      const chapterConclusions = state.conclusions[chapterId] || [];
      const existingIdx = chapterConclusions.findIndex((c) => c.id === conclusion.id);
      let updated: PageConclusion[];
      if (existingIdx >= 0) {
        updated = [
          ...chapterConclusions.slice(0, existingIdx),
          conclusion,
          ...chapterConclusions.slice(existingIdx + 1),
        ];
      } else {
        updated = [...chapterConclusions, conclusion];
      }
      const next = { ...state.conclusions, [chapterId]: updated };
      saveConclusionsToStorage(next);
      return { conclusions: next };
    });

    return conclusion;
  },

  deleteConclusion: (id) => {
    set((state) => {
      const next: Record<string, PageConclusion[]> = {};
      for (const [cid, list] of Object.entries(state.conclusions)) {
        const filtered = list.filter((c) => c.id !== id);
        if (filtered.length > 0) next[cid] = filtered;
      }
      saveConclusionsToStorage(next);
      return { conclusions: next };
    });
  },

  getConclusionForPage: (pageId) => {
    const all = get().conclusions;
    for (const list of Object.values(all)) {
      const found = list.find((c) => c.pageId === pageId);
      if (found) return found;
    }
    return undefined;
  },

  addMeetingMinutes: (minutes) => {
    const full: MeetingMinutes = {
      ...minutes,
      id: generateId('min'),
    };
    set((state) => {
      const next = [...state.meetingMinutes, full];
      saveMinutesToStorage(next);
      return { meetingMinutes: next };
    });
    return full;
  },

  getMinutesForChapter: (chapterId) => {
    return get().meetingMinutes.filter((m) => m.chapterId === chapterId).sort((a, b) => b.endedAt.localeCompare(a.endedAt));
  },
}));

export function selectConclusionForPage(pageId: string): PageConclusion | undefined {
  return useConclusionStore.getState().getConclusionForPage(pageId);
}

export function selectProcessStatus(pageId: string, annotations: any[]): PageProcessStatus {
  const conclusion = selectConclusionForPage(pageId);
  const unresolvedCount = annotations.filter((a) => !a.resolved).length;
  const totalCount = annotations.length;

  if (conclusion?.resolvedAt) return 'fully_resolved';
  if (totalCount === 0) return 'pending_review';
  if (unresolvedCount === 0) return 'fully_resolved';
  if (unresolvedCount < totalCount) return 'partially_resolved';
  return 'needs_revision';
}

export const PROCESS_STATUS_LABELS: Record<PageProcessStatus, string> = {
  pending_review: '待审核',
  needs_revision: '待修改',
  partially_resolved: '部分解决',
  fully_resolved: '已完成',
};

export const PROCESS_STATUS_COLORS: Record<PageProcessStatus, { bg: string; text: string; border: string; dot: string }> = {
  pending_review: { bg: 'bg-ink-700/60', text: 'text-ink-200', border: 'border-ink-600/60', dot: 'bg-ink-400' },
  needs_revision: { bg: 'bg-danger/15', text: 'text-[#F5C7B8]', border: 'border-danger/40', dot: 'bg-danger' },
  partially_resolved: { bg: 'bg-accent-400/15', text: 'text-accent-400', border: 'border-accent-400/40', dot: 'bg-accent-400' },
  fully_resolved: { bg: 'bg-success/15', text: 'text-success', border: 'border-success/40', dot: 'bg-success' },
};
