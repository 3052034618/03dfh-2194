import type { AnnotationTag, UserRole, SpecialMark, StoryBeatType, PageReviewStatus } from '../types';

export const TAG_LABELS: Record<AnnotationTag, string> = {
  unclear_composition: '镜头不清',
  dialog_obstruction: '对白遮挡',
  fast_pacing: '节奏过快',
  layout_issue: '构图问题',
  text_error: '文字错误',
  art_style: '画风问题',
  continuity: '分镜衔接',
  other: '其他',
};

export interface TagColor {
  bg: string;
  text: string;
  border: string;
  stroke: string;
}
export const TAG_COLORS: Record<AnnotationTag, TagColor> = {
  unclear_composition: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40', stroke: '#60A5FA' },
  dialog_obstruction: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40', stroke: '#A78BFA' },
  fast_pacing: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40', stroke: '#FB923C' },
  layout_issue: { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/40', stroke: '#2DD4BF' },
  text_error: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40', stroke: '#FB7185' },
  art_style: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40', stroke: '#FBBF24' },
  continuity: { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/40', stroke: '#818CF8' },
  other: { bg: 'bg-zinc-500/20', text: 'text-zinc-300', border: 'border-zinc-500/40', stroke: '#A1A1AA' },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  author: '主笔',
  editor: '责编',
  art_supervisor: '美术监修',
  text_editor: '文字编辑',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  author: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  editor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  art_supervisor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  text_editor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
};

export const ROLE_AVATAR_COLORS: Record<UserRole, string> = {
  author: '#10B981',
  editor: '#D97757',
  art_supervisor: '#0EA5E9',
  text_editor: '#D946EF',
};

export const SPECIAL_MARK_LABELS: Record<SpecialMark, string> = {
  cover: '封面',
  spread_left: '跨页左',
  spread_right: '跨页右',
  recollection: '回忆',
  color_page: '彩页',
};

export const STORY_BEAT_LABELS: Record<StoryBeatType, string> = {
  opening: '开篇',
  development: '发展',
  climax: '高潮',
  recollection: '回忆',
  transition: '过渡',
  ending: '收束',
};

export const STORY_BEAT_COLORS: Record<StoryBeatType, string> = {
  opening: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  development: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  climax: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  recollection: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30',
  transition: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40',
  ending: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

export const STATUS_LABELS: Record<PageReviewStatus, string> = {
  pending: '待审',
  needs_revision: '需修改',
  approved: '通过',
};

export const STATUS_FLAGS: Record<PageReviewStatus, { bg: string; text: string; label: string; flag: string }> = {
  pending: { bg: 'bg-zinc-500/30', text: 'text-zinc-300', label: '待审', flag: '#71717A' },
  needs_revision: { bg: 'bg-[#B4523E]/30', text: 'text-[#F5C7B8]', label: '需修改', flag: '#B4523E' },
  approved: { bg: 'bg-[#3D6B6B]/30', text: 'text-[#A3CEC9]', label: '通过', flag: '#3D6B6B' },
};
