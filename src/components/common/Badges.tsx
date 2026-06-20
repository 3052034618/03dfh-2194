import React from 'react';
import type { AnnotationTag, UserRole, SpecialMark, StoryBeatType, PageReviewStatus } from '../../types';
import { TAG_LABELS, TAG_COLORS, ROLE_LABELS, ROLE_COLORS, SPECIAL_MARK_LABELS, STORY_BEAT_LABELS, STORY_BEAT_COLORS, STATUS_FLAGS } from '../../utils/tagConfig';
import { cn } from '../../utils/idGenerator';
import { BookOpen, Palette, Type, User, Scroll, Sparkles, Eye, AlertCircle, Check } from 'lucide-react';

export const TagBadge: React.FC<{ tag: AnnotationTag; showLabel?: boolean; size?: 'sm' | 'md' }> = ({ tag, showLabel = true, size = 'sm' }) => {
  const cfg = TAG_COLORS[tag];
  return (
    <span className={cn('chip border', cfg.bg, cfg.text, cfg.border, size === 'sm' ? 'text-[10px]' : 'text-xs')}>
      {showLabel && TAG_LABELS[tag]}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole; showLabel?: boolean }> = ({ role, showLabel = true }) => {
  const cfg = ROLE_COLORS[role];
  const IconComp =
    role === 'author' ? User : role === 'editor' ? Scroll : role === 'art_supervisor' ? Palette : Type;
  return (
    <span className={cn('chip border', cfg)}>
      <IconComp className="w-3 h-3" />
      {showLabel && ROLE_LABELS[role]}
    </span>
  );
};

export const SpecialMarkStamp: React.FC<{ mark: SpecialMark }> = ({ mark }) => {
  const isCover = mark === 'cover';
  const isMemory = mark === 'recollection';
  const isColor = mark === 'color_page';
  const isSpreadL = mark === 'spread_left';
  const isSpreadR = mark === 'spread_right';

  const txt = SPECIAL_MARK_LABELS[mark];
  if (isCover)
    return (
      <div className="stamp-badge stamp-appear">
        <Sparkles className="w-3 h-3 inline mr-0.5" />
        表纸 · {txt}
      </div>
    );
  if (isMemory)
    return (
      <div className="border-2 border-memory/70 text-memory-50 text-[10px] font-serif px-2 py-0.5 rotate-[-6deg] bg-memory/10">
        回想 · {txt}
      </div>
    );
  if (isColor)
    return (
      <div className="border-2 border-fuchsia-400/60 text-fuchsia-300 text-[10px] font-serif px-2 py-0.5 rotate-[4deg] bg-fuchsia-400/10">
        ✦ 彩页
      </div>
    );
  if (isSpreadL || isSpreadR)
    return (
      <div className="border border-sky-400/50 text-sky-300 text-[10px] font-serif px-2 py-0.5 bg-sky-400/10">
        跨页 {isSpreadL ? '◀ 左' : '右 ▶'}
      </div>
    );
  return null;
};

export const StatusFlag: React.FC<{ status: PageReviewStatus; compact?: boolean }> = ({ status, compact = false }) => {
  const cfg = STATUS_FLAGS[status];
  const Icon = status === 'approved' ? Check : status === 'needs_revision' ? AlertCircle : Eye;
  if (compact) {
    return (
      <div className="w-2 h-2 rounded-full" style={{ background: cfg.flag }} />
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ background: cfg.flag }} />
      <span className={cn('text-xs font-medium', cfg.text)}>{cfg.label}</span>
    </div>
  );
};

export const StoryBeatBadge: React.FC<{ type: StoryBeatType }> = ({ type }) => {
  return <span className={cn('chip border', STORY_BEAT_COLORS[type])}>{STORY_BEAT_LABELS[type]}</span>;
};

export const UserAvatar: React.FC<{ color: string; name: string; size?: number; showName?: boolean }> = ({
  color,
  name,
  size = 24,
  showName = false,
}) => (
  <div className="flex items-center gap-2">
    <div
      className="rounded-full flex items-center justify-center text-ink-50 font-bold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.42 }}
    >
      {name?.charAt(0) || '?'}
    </div>
    {showName && <span className="text-sm text-ink-100 font-medium">{name}</span>}
  </div>
);

export const PageCountBadge: React.FC<{ n: number }> = ({ n }) => (
  <span className="font-mono text-xs px-1.5 py-0.5 bg-ink-700/60 rounded text-ink-200 border border-ink-600/50">
    P.{String(n).padStart(2, '0')}
  </span>
);

export { BookOpen };
