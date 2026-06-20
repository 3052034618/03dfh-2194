import type { Work, Chapter, StoryBeat, StoryPage, Annotation, User } from '../types';

export const mockUsers: User[] = [
  { id: 'user_001', name: '林秋野', role: 'author', avatarColor: '#10B981' },
  { id: 'user_002', name: '苏编辑', role: 'editor', avatarColor: '#D97757' },
  { id: 'user_003', name: '陈监修', role: 'art_supervisor', avatarColor: '#0EA5E9' },
  { id: 'user_004', name: '文小白', role: 'text_editor', avatarColor: '#D946EF' },
];

export const mockWorks: Work[] = [
  {
    id: 'work_001',
    title: '月下青鸾',
    coverImage: 'https://picsum.photos/seed/manga1cover/600/800',
    authorName: '林秋野',
    updatedAt: '2026-06-20',
    status: 'serializing',
    latestEpisode: 23,
    totalChapters: 23,
  },
  {
    id: 'work_002',
    title: '星尘档案馆',
    coverImage: 'https://picsum.photos/seed/manga2cover/600/800',
    authorName: '林秋野',
    updatedAt: '2026-06-15',
    status: 'serializing',
    latestEpisode: 8,
    totalChapters: 8,
  },
  {
    id: 'work_003',
    title: '旧日棋局',
    coverImage: 'https://picsum.photos/seed/manga3cover/600/800',
    authorName: '林秋野',
    updatedAt: '2026-05-28',
    status: 'hiatus',
    latestEpisode: 15,
    totalChapters: 15,
  },
];

export const mockChapters: Chapter[] = [
  {
    id: 'chap_001',
    workId: 'work_001',
    episodeNumber: 23,
    title: '第二十三话 · 月下重逢',
    createdAt: '2026-06-19',
    reviewStatus: 'reviewing',
  },
];

export const mockStoryBeats: StoryBeat[] = [
  {
    id: 'beat_001',
    chapterId: 'chap_001',
    orderIndex: 1,
    type: 'opening',
    description: '开篇：主角独自立于月下城楼，远景交代战后孤城氛围。',
    relatedStartPage: 1,
    relatedEndPage: 3,
  },
  {
    id: 'beat_002',
    chapterId: 'chap_001',
    orderIndex: 2,
    type: 'development',
    description: '发展：脚步声渐近，旧友从阴影中走出，两人对视沉默。',
    relatedStartPage: 4,
    relatedEndPage: 7,
  },
  {
    id: 'beat_003',
    chapterId: 'chap_001',
    orderIndex: 3,
    type: 'recollection',
    description: '回忆：闪回三年前决战前夕，两人约定的画面。',
    relatedStartPage: 8,
    relatedEndPage: 10,
  },
  {
    id: 'beat_004',
    chapterId: 'chap_001',
    orderIndex: 4,
    type: 'development',
    description: '发展：旧友递出密信，揭露朝中有人暗中布下杀局。',
    relatedStartPage: 11,
    relatedEndPage: 14,
  },
  {
    id: 'beat_005',
    chapterId: 'chap_001',
    orderIndex: 5,
    type: 'climax',
    description: '高潮：城外伏兵尽出，两人背靠背准备迎战。',
    relatedStartPage: 15,
    relatedEndPage: 17,
  },
  {
    id: 'beat_006',
    chapterId: 'chap_001',
    orderIndex: 6,
    type: 'ending',
    description: '收束：月下刀光剑影，画面定格在两人默契一笑，留待下回。',
    relatedStartPage: 18,
    relatedEndPage: 20,
  },
];

const seedImages = [
  'mangap1','mangap2','mangap3','mangap4','mangap5',
  'mangap6','mangap7','mangap8','mangap9','mangap10',
  'mangap11','mangap12','mangap13','mangap14','mangap15',
  'mangap16','mangap17','mangap18','mangap19','mangap20',
];

export const generateMockPages = (chapterId: string, count = 20): StoryPage[] => {
  const pages: StoryPage[] = [];
  for (let i = 0; i < count; i++) {
    const pageNumber = i + 1;
    const specialMarks: StoryPage['specialMarks'] = [];
    let status: StoryPage['reviewStatus'] = 'pending';
    if (pageNumber === 1) specialMarks.push('cover');
    if (pageNumber === 2) specialMarks.push('color_page');
    if (pageNumber === 8 || pageNumber === 9 || pageNumber === 10) specialMarks.push('recollection');
    if (pageNumber >= 4 && pageNumber <= 7) status = 'approved';
    if (pageNumber >= 11 && pageNumber <= 14) status = 'needs_revision';
    if (pageNumber >= 15 && pageNumber <= 17) status = 'needs_revision';
    if (pageNumber >= 18) status = 'pending';
    pages.push({
      id: `page_${chapterId}_${pageNumber}`,
      chapterId,
      pageNumber,
      imageUrl: `https://picsum.photos/seed/${seedImages[i] || 'manga' + pageNumber}/800/1120`,
      specialMarks,
      reviewStatus: status,
      sortOrder: i,
      createdAt: '2026-06-19',
    });
  }
  return pages;
};

const buildMockAnnotations = (pages: StoryPage[]): Annotation[] => {
  const pageMap = new Map<number, string>();
  for (const p of pages) {
    pageMap.set(p.pageNumber, p.id);
  }
  return [
    {
      id: 'ann_001',
      pageId: pageMap.get(11)!,
      createdBy: 'user_002',
      creatorRole: 'editor' as const,
      tag: 'unclear_composition' as const,
      description: '这个远景镜头角度不够清楚，建议增加主角面部特写以凸显表情。',
      region: { type: 'rectangle' as const, x: 30, y: 20, width: 40, height: 35 },
      createdAt: '2026-06-20T10:30',
      resolved: false,
    },
    {
      id: 'ann_002',
      pageId: pageMap.get(11)!,
      createdBy: 'user_003',
      creatorRole: 'art_supervisor' as const,
      tag: 'layout_issue' as const,
      description: '下方人物站位构图略偏，可右移腾出对白区。',
      region: { type: 'circle' as const, x: 65, y: 70, radius: 18 },
      createdAt: '2026-06-20T10:45',
      resolved: false,
    },
    {
      id: 'ann_003',
      pageId: pageMap.get(12)!,
      createdBy: 'user_004',
      creatorRole: 'text_editor' as const,
      tag: 'dialog_obstruction' as const,
      description: '此处对话框遮挡了关键手势动作，请调整对白框位置到画面上方。',
      region: { type: 'rectangle' as const, x: 20, y: 55, width: 35, height: 25 },
      createdAt: '2026-06-20T11:00',
      resolved: false,
    },
    {
      id: 'ann_004',
      pageId: pageMap.get(13)!,
      createdBy: 'user_002',
      creatorRole: 'editor' as const,
      tag: 'fast_pacing' as const,
      description: '这段信息交代节奏太快，建议拆分为两格并加一格主角反应特写。',
      region: { type: 'rectangle' as const, x: 10, y: 10, width: 80, height: 80 },
      createdAt: '2026-06-20T11:15',
      resolved: false,
    },
    {
      id: 'ann_005',
      pageId: pageMap.get(15)!,
      createdBy: 'user_003',
      creatorRole: 'art_supervisor' as const,
      tag: 'art_style' as const,
      description: '月光阴影处理可加强层次感，参考第15话中类似场景。',
      region: { type: 'circle' as const, x: 50, y: 40, radius: 25 },
      createdAt: '2026-06-20T14:20',
      resolved: false,
    },
    {
      id: 'ann_006',
      pageId: pageMap.get(16)!,
      createdBy: 'user_004',
      creatorRole: 'text_editor' as const,
      tag: 'text_error' as const,
      description: '"背水一战"四字的字体在该场景下太现代，建议换古风字型。',
      region: { type: 'rectangle' as const, x: 45, y: 30, width: 25, height: 12 },
      createdAt: '2026-06-20T14:35',
      resolved: false,
    },
    {
      id: 'ann_007',
      pageId: pageMap.get(14)!,
      createdBy: 'user_002',
      creatorRole: 'editor' as const,
      tag: 'continuity' as const,
      description: '此处与上一页的视角衔接有跳跃感，建议加一格过渡。',
      region: { type: 'rectangle' as const, x: 15, y: 25, width: 50, height: 40 },
      createdAt: '2026-06-20T11:30',
      resolved: false,
    },
    {
      id: 'ann_008',
      pageId: pageMap.get(17)!,
      createdBy: 'user_003',
      creatorRole: 'art_supervisor' as const,
      tag: 'unclear_composition' as const,
      description: '高速运动格的速度线方向不统一，建议统一为从左上到右下。',
      region: { type: 'circle' as const, x: 45, y: 55, radius: 20 },
      createdAt: '2026-06-20T14:50',
      resolved: false,
    },
  ].filter((a) => a.pageId) as Annotation[];
};

export const buildMockAnnotationMap = (pages: StoryPage[]): Record<string, Annotation[]> => {
  const anns = buildMockAnnotations(pages);
  const grouped: Record<string, Annotation[]> = {};
  for (const a of anns) {
    if (!grouped[a.pageId]) grouped[a.pageId] = [];
    grouped[a.pageId].push(a);
  }
  return grouped;
};
