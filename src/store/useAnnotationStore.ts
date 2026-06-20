import { create } from 'zustand';
import type { Annotation, AnnotationTag, AnnotationRegion, UserRole } from '../types';
import { initMockPageIds, generateMockPages } from '../data/mockData';
import { generateId } from '../utils/idGenerator';
import { mockAnnotations } from '../data/mockData';

const initAnnotationState = (): Record<string, Annotation[]> => {
  const pages = generateMockPages('chap_001', 20);
  const anns = initMockPageIds(pages);
  const grouped: Record<string, Annotation[]> = {};
  for (const a of anns) {
    if (!grouped[a.pageId]) grouped[a.pageId] = [];
    grouped[a.pageId].push(a);
  }
  return grouped;
};

interface AnnotationState {
  annotations: Record<string, Annotation[]>;
  selectedAnnotationId: string | null;
  roleFilter: UserRole | 'all';
  tagFilter: AnnotationTag | 'all';
  setRoleFilter: (r: UserRole | 'all') => void;
  setTagFilter: (t: AnnotationTag | 'all') => void;
  getAnnotationsForPage: (pageId: string) => Annotation[];
  getAllAnnotationsForChapter: (pageIds: string[]) => Annotation[];
  addAnnotation: (
    pageId: string,
    data: { tag: AnnotationTag; description: string; region: AnnotationRegion; createdBy: string; creatorRole: UserRole },
  ) => string;
  updateAnnotation: (annotationId: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (annotationId: string) => void;
  resolveAnnotation: (annotationId: string, resolved: boolean) => void;
  setSelectedAnnotation: (id: string | null) => void;
  generateChecklist: (pageIds: string[], pages: { id: string; pageNumber: number; imageUrl: string }[]) => ChecklistItem[];
  exportChecklistMarkdown: (pageIds: string[], pages: { id: string; pageNumber: number; imageUrl: string }[]) => string;
}

export interface ChecklistItem {
  pageId: string;
  pageNumber: number;
  imageUrl: string;
  annotations: Annotation[];
  totalCount: number;
  resolvedCount: number;
}

export const useAnnotationStore = create<AnnotationState>((set, get) => ({
  annotations: initAnnotationState(),
  selectedAnnotationId: null,
  roleFilter: 'all',
  tagFilter: 'all',

  setRoleFilter: (r) => set({ roleFilter: r }),
  setTagFilter: (t) => set({ tagFilter: t }),

  getAnnotationsForPage: (pageId) => {
    const list = get().annotations[pageId] || [];
    const role = get().roleFilter;
    const tag = get().tagFilter;
    return list
      .filter((a) => (role === 'all' ? true : a.creatorRole === role))
      .filter((a) => (tag === 'all' ? true : a.tag === tag))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  getAllAnnotationsForChapter: (pageIds) => {
    const all: Annotation[] = [];
    for (const pid of pageIds) {
      all.push(...(get().annotations[pid] || []));
    }
    return all;
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
    set((state) => ({
      annotations: {
        ...state.annotations,
        [pageId]: [...(state.annotations[pageId] || []), annotation],
      },
    }));
    return id;
  },

  updateAnnotation: (annotationId, updates) => {
    set((state) => {
      const next: Record<string, Annotation[]> = {};
      for (const [pid, list] of Object.entries(state.annotations)) {
        next[pid] = list.map((a) => (a.id === annotationId ? { ...a, ...updates } : a));
      }
      return { annotations: next };
    });
  },

  deleteAnnotation: (annotationId) => {
    set((state) => {
      const next: Record<string, Annotation[]> = {};
      for (const [pid, list] of Object.entries(state.annotations)) {
        next[pid] = list.filter((a) => a.id !== annotationId);
      }
      return { annotations: next };
    });
  },

  resolveAnnotation: (annotationId, resolved) => {
    get().updateAnnotation(annotationId, { resolved });
  },

  setSelectedAnnotation: (id) => set({ selectedAnnotationId: id }),

  generateChecklist: (pageIds, pages) => {
    const pageMap = new Map(pages.map((p) => [p.id, p]));
    const items: ChecklistItem[] = [];
    for (const pid of pageIds) {
      const anns = get().annotations[pid] || [];
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
  },

  exportChecklistMarkdown: (pageIds, pages) => {
    const items = get().generateChecklist(pageIds, pages);
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
  },
}));

export { mockAnnotations };
