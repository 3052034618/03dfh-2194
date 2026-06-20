import { create } from 'zustand';
import type { Annotation, AnnotationTag, AnnotationRegion, UserRole, MeetingFocus } from '../types';
import { generateMockPages, buildMockAnnotationMap } from '../data/mockData';
import { generateId } from '../utils/idGenerator';
import { usePageStore } from './usePageStore';

const STORAGE_KEY = 'mangaflow_annotations';
const MEETING_STORAGE_KEY = 'mangaflow_meeting';

export interface ChecklistItem {
  pageId: string;
  pageNumber: number;
  imageUrl: string;
  annotations: Annotation[];
  totalCount: number;
  resolvedCount: number;
}

interface AnnotationState {
  annotations: Record<string, Annotation[]>;
  selectedAnnotationId: string | null;
  roleFilter: UserRole | 'all';
  tagFilter: AnnotationTag | 'all';
  meetingFocus: MeetingFocus | null;
  setRoleFilter: (r: UserRole | 'all') => void;
  setTagFilter: (t: AnnotationTag | 'all') => void;
  addAnnotation: (
    pageId: string,
    data: { tag: AnnotationTag; description: string; region: AnnotationRegion; createdBy: string; creatorRole: UserRole },
  ) => string;
  updateAnnotation: (annotationId: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (annotationId: string) => void;
  resolveAnnotation: (annotationId: string, resolved: boolean) => void;
  setSelectedAnnotation: (id: string | null, pageId?: string) => void;
  startMeeting: (focus: Omit<MeetingFocus, 'startedAt'>) => void;
  updateMeetingFocus: (updates: Partial<MeetingFocus>) => void;
  syncStatusFilterToMeeting: (statusFilter: MeetingFocus['statusFilter']) => void;
  endMeeting: () => void;
}

const loadFromStorage = (): Record<string, Annotation[]> | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveToStorage = (annotations: Record<string, Annotation[]>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
  } catch {}
};

const loadMeetingFromStorage = (): MeetingFocus | null => {
  try {
    const raw = localStorage.getItem(MEETING_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
};

const saveMeetingToStorage = (focus: MeetingFocus | null) => {
  try {
    if (focus) {
      localStorage.setItem(MEETING_STORAGE_KEY, JSON.stringify(focus));
    } else {
      localStorage.removeItem(MEETING_STORAGE_KEY);
    }
  } catch {}
};

const buildInitialState = (): Record<string, Annotation[]> => {
  const stored = loadFromStorage();
  if (stored && Object.keys(stored).length > 0) return stored;
  const pages = generateMockPages('chap_001', 20);
  const result = buildMockAnnotationMap(pages);
  saveToStorage(result);
  return result;
};

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: buildInitialState(),
  selectedAnnotationId: null,
  roleFilter: 'all',
  tagFilter: 'all',
  meetingFocus: loadMeetingFromStorage(),

  setRoleFilter: (r) => {
    set({ roleFilter: r });
    const meeting = get().meetingFocus;
    if (meeting) {
      get().updateMeetingFocus({ roleFilter: r });
    }
  },
  setTagFilter: (t) => {
    set({ tagFilter: t });
    const meeting = get().meetingFocus;
    if (meeting) {
      get().updateMeetingFocus({ tagFilter: t });
    }
  },

  addAnnotation: (pageId, data) => {
    const id = generateId('ann');
    const annotation: Annotation = {
      id,
      pageId,
      tag: data.tag,
      description: data.description,
      region: data.region,
      createdBy: data.createdBy,
      creatorRole: data.creatorRole,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    set((state) => {
      const next = {
        ...state.annotations,
        [pageId]: [...(state.annotations[pageId] || []), annotation],
      };
      saveToStorage(next);
      return { annotations: next };
    });
    return id;
  },

  updateAnnotation: (annotationId, updates) => {
    set((state) => {
      const next: Record<string, Annotation[]> = {};
      for (const [pid, list] of Object.entries(state.annotations)) {
        next[pid] = list.map((a) => (a.id === annotationId ? { ...a, ...updates } : a));
      }
      saveToStorage(next);
      return { annotations: next };
    });
  },

  deleteAnnotation: (annotationId) => {
    set((state) => {
      const next: Record<string, Annotation[]> = {};
      for (const [pid, list] of Object.entries(state.annotations)) {
        next[pid] = list.filter((a) => a.id !== annotationId);
      }
      saveToStorage(next);
      return { annotations: next };
    });
  },

  resolveAnnotation: (annotationId, resolved) => {
    get().updateAnnotation(annotationId, { resolved });
  },

  setSelectedAnnotation: (id, pageId) => {
    set({ selectedAnnotationId: id });
    const meeting = get().meetingFocus;
    if (meeting) {
      const updates: Partial<MeetingFocus> = { selectedAnnotationId: id };
      if (pageId && meeting.pageId !== pageId) {
        updates.pageId = pageId;
      }
      get().updateMeetingFocus(updates);
    }
  },

  startMeeting: (focus) => {
    const meeting: MeetingFocus = {
      ...focus,
      startedAt: new Date().toISOString(),
    };
    set({
      meetingFocus: meeting,
      roleFilter: focus.roleFilter,
      tagFilter: focus.tagFilter,
      selectedAnnotationId: focus.selectedAnnotationId,
    });
    const pageStore = usePageStore.getState();
    if (pageStore.statusFilter !== focus.statusFilter) {
      pageStore.setStatusFilter(focus.statusFilter);
    }
    saveMeetingToStorage(meeting);
  },

  updateMeetingFocus: (updates) => {
    set((state) => {
      if (!state.meetingFocus) return state;
      const next = { ...state.meetingFocus, ...updates };
      saveMeetingToStorage(next);
      if (updates.statusFilter) {
        const pageStore = usePageStore.getState();
        if (pageStore.statusFilter !== updates.statusFilter) {
          pageStore.setStatusFilter(updates.statusFilter);
        }
      }
      return { meetingFocus: next };
    });
  },

  syncStatusFilterToMeeting: (statusFilter) => {
    const meeting = get().meetingFocus;
    if (meeting && meeting.statusFilter !== statusFilter) {
      get().updateMeetingFocus({ statusFilter });
    }
  },

  endMeeting: () => {
    set({ meetingFocus: null });
    saveMeetingToStorage(null);
  },
}));

export function selectAnnotationsForPage(
  pageId: string,
  roleFilter: UserRole | 'all',
  tagFilter: AnnotationTag | 'all',
): Annotation[] {
  const state = useAnnotationStore.getState();
  const list = state.annotations[pageId] || [];
  return list
    .filter((a) => (roleFilter === 'all' ? true : a.creatorRole === roleFilter))
    .filter((a) => (tagFilter === 'all' ? true : a.tag === tagFilter))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function selectAnnotationCount(pageId: string): number {
  const state = useAnnotationStore.getState();
  return (state.annotations[pageId] || []).length;
}

export function selectAnnotationsForPageRaw(pageId: string): Annotation[] {
  const state = useAnnotationStore.getState();
  return (state.annotations[pageId] || []).slice();
}

export function generateChecklist(
  pageIds: string[],
  pages: { id: string; pageNumber: number; imageUrl: string }[],
  annotationsOverride?: Record<string, Annotation[]>,
): ChecklistItem[] {
  const annsToUse = annotationsOverride || useAnnotationStore.getState().annotations;
  const pageMap = new Map(pages.map((p) => [p.id, p]));
  const items: ChecklistItem[] = [];
  for (const pid of pageIds) {
    const anns = annsToUse[pid] || [];
    if (anns.length === 0) continue;
    const pageInfo = pageMap.get(pid);
    if (!pageInfo) continue;
    items.push({
      pageId: pid,
      pageNumber: pageInfo.pageNumber,
      imageUrl: pageInfo.imageUrl,
      annotations: anns.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      totalCount: anns.length,
      resolvedCount: anns.filter((a) => a.resolved).length,
    });
  }
  return items.sort((a, b) => a.pageNumber - b.pageNumber);
}

export function exportChecklistMarkdown(
  pageIds: string[],
  pages: { id: string; pageNumber: number; imageUrl: string }[],
  annotationsOverride?: Record<string, Annotation[]>,
): string {
  const items = generateChecklist(pageIds, pages, annotationsOverride);
  const roleMap: Record<UserRole, string> = {
    author: '主笔',
    editor: '责编',
    art_supervisor: '美术监修',
    text_editor: '文字编辑',
  };
  const tagMap: Record<AnnotationTag, string> = {
    unclear_composition: '镜头不清',
    dialog_obstruction: '对白遮挡',
    fast_pacing: '节奏过快',
    layout_issue: '构图问题',
    text_error: '文字错误',
    art_style: '画风问题',
    continuity: '分镜衔接',
    other: '其他',
  };
  const lines: string[] = [];
  lines.push('# 分镜修改清单');
  lines.push('');
  lines.push(`生成时间：${new Date().toLocaleString('zh-CN')}`);
  lines.push('');
  for (const item of items) {
    lines.push(`## 第 ${item.pageNumber} 页（${item.resolvedCount}/${item.totalCount} 已解决）`);
    lines.push('');
    for (let i = 0; i < item.annotations.length; i++) {
      const a = item.annotations[i];
      const status = a.resolved ? '✅' : '⬜';
      lines.push(`${status} **${i + 1}. [${tagMap[a.tag]}]** (${roleMap[a.creatorRole]}) ${a.description}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}
