export type UserRole = 'author' | 'editor' | 'art_supervisor' | 'text_editor';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarColor: string;
}

export interface Work {
  id: string;
  title: string;
  coverImage: string;
  authorName: string;
  updatedAt: string;
  status: 'serializing' | 'completed' | 'hiatus';
  latestEpisode: number;
  totalChapters: number;
}

export interface Chapter {
  id: string;
  workId: string;
  episodeNumber: number;
  title: string;
  createdAt: string;
  reviewStatus: 'draft' | 'reviewing' | 'revising' | 'approved';
}

export type StoryBeatType = 'opening' | 'development' | 'climax' | 'recollection' | 'transition' | 'ending';

export interface StoryBeat {
  id: string;
  chapterId: string;
  orderIndex: number;
  description: string;
  relatedStartPage: number;
  relatedEndPage: number;
  type: StoryBeatType;
}

export type SpecialMark = 'cover' | 'spread_left' | 'spread_right' | 'recollection' | 'color_page';
export type PageReviewStatus = 'pending' | 'needs_revision' | 'approved';

export interface StoryPage {
  id: string;
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  specialMarks: SpecialMark[];
  reviewStatus: PageReviewStatus;
  sortOrder: number;
  createdAt: string;
}

export type AnnotationTag =
  | 'unclear_composition'
  | 'dialog_obstruction'
  | 'fast_pacing'
  | 'layout_issue'
  | 'text_error'
  | 'art_style'
  | 'continuity'
  | 'other';

export interface AnnotationRegion {
  type: 'circle' | 'rectangle';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
}

export interface Annotation {
  id: string;
  pageId: string;
  createdBy: string;
  creatorRole: UserRole;
  tag: AnnotationTag;
  description: string;
  region: AnnotationRegion;
  createdAt: string;
  resolved: boolean;
}

export type PageProcessStatus = 'pending_review' | 'needs_revision' | 'partially_resolved' | 'fully_resolved';

export interface PageConclusion {
  id: string;
  pageId: string;
  chapterId: string;
  finalOpinion: string;
  assigneeUserId: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface MeetingPageConclusion {
  pageId: string;
  pageNumber: number;
  finalOpinion: string;
  assigneeUserId: string | null;
  annotationCount: number;
  unresolvedCount: number;
  resolvedAt: string | null;
}

export interface MeetingMinutes {
  id: string;
  chapterId: string;
  startedBy: string;
  startedAt: string;
  endedAt: string;
  totalPages: number;
  pagesWithConclusions: number;
  pageConclusions: MeetingPageConclusion[];
}

export interface MeetingFocus {
  chapterId: string;
  pageId: string | null;
  statusFilter: PageReviewStatus | 'all';
  roleFilter: UserRole | 'all';
  tagFilter: AnnotationTag | 'all';
  selectedAnnotationId: string | null;
  startedBy: string;
  startedAt: string;
}
