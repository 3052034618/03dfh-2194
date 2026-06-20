import React, { useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { StoryPage, SpecialMark, MeetingFocus } from '../../types';
import { cn } from '../../utils/idGenerator';
import { SpecialMarkStamp, StatusFlag, PageCountBadge } from '../common/Badges';
import { GripVertical, MessageSquare, Bookmark, Check, AlertCircle, Eye, MoreHorizontal, Radio } from 'lucide-react';
import { STATUS_FLAGS } from '../../utils/tagConfig';
import { useAnnotationStore } from '../../store/useAnnotationStore';
import { useConclusionStore, selectProcessStatus, PROCESS_STATUS_LABELS, PROCESS_STATUS_COLORS } from '../../store/useConclusionStore';

interface StoryPageCardProps {
  page: StoryPage;
  selected: boolean;
  meetingFocus: MeetingFocus | null;
  onClick: () => void;
  onOpenAnnotation: () => void;
  onToggleMark: (mark: SpecialMark) => void;
  onSetStatus: (s: StoryPage['reviewStatus']) => void;
}

export const StoryPageCard: React.FC<StoryPageCardProps> = ({
  page,
  selected,
  meetingFocus,
  onClick,
  onOpenAnnotation,
  onToggleMark,
  onSetStatus,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const rawAnns = useAnnotationStore((s) => s.annotations[page.id]);
  const anns = useMemo(() => rawAnns || [], [rawAnns]);
  const rawConclusion = useConclusionStore((s) => s.conclusions[page.chapterId]);
  const conclusion = useMemo(
    () => rawConclusion?.find((c) => c.pageId === page.id),
    [rawConclusion, page.id],
  );
  const processStatus = useMemo(
    () => selectProcessStatus(page.id, anns),
    [page.id, anns],
  );
  const processColor = PROCESS_STATUS_COLORS[processStatus];
  const [menuOpen, setMenuOpen] = useState(false);

  const flagCfg = STATUS_FLAGS[page.reviewStatus];
  const isMemory = page.specialMarks.includes('recollection');
  const isMeetingFocus = meetingFocus?.pageId === page.id;

  const markOptions: { v: SpecialMark; label: string }[] = [
    { v: 'cover', label: '封面' },
    { v: 'color_page', label: '彩页' },
    { v: 'recollection', label: '回忆段落' },
    { v: 'spread_left', label: '跨页左' },
    { v: 'spread_right', label: '跨页右' },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative cursor-pointer animate-fade-in-up',
        selected && 'page-selected rounded-sm',
        isMeetingFocus && 'ring-2 ring-danger shadow-[0_0_20px_rgba(239,68,68,0.3)] rounded-sm',
      )}
      onClick={onClick}
    >
      {/* 会议焦点标识 */}
      {isMeetingFocus && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-0.5 rounded-full bg-danger text-ink-50 text-[9px] font-bold shadow-md animate-breathe">
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          会议焦点
        </div>
      )}
      {/* 状态旗标 */}
      <div
        className={cn(
          'absolute -top-1 -left-1 z-20 px-2 py-1 text-[10px] font-serif font-bold text-ink-50 flag-corner shadow-[0_2px_8px_rgba(0,0,0,0.3)]',
          flagCfg.bg,
        )}
      >
        {flagCfg.label}
      </div>

      <div className="polaroid-card hover:-translate-y-1">
        {/* 拖拽把手 */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 left-3 z-10 w-6 h-6 rounded bg-ink-950/60 text-ink-50/70 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-ink-950/90 hover:text-ink-50 transition-all cursor-grab active:cursor-grabbing"
          title="拖拽排序"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* 更多操作 */}
        <div className="absolute top-3 right-3 z-10">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="w-6 h-6 rounded bg-ink-950/60 text-ink-50/70 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-ink-950/90 hover:text-ink-50 transition-all"
              title="标记"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                <div className="absolute right-0 top-8 z-40 min-w-[150px] rounded-lg border border-ink-600/60 bg-ink-800 shadow-soft py-1 text-sm animate-fade-in-up">
                  <div className="px-3 py-1.5 text-xs text-ink-300 border-b border-ink-700/70">特殊标记</div>
                  {markOptions.map((o) => {
                    const active = page.specialMarks.includes(o.v);
                    return (
                      <button
                        key={o.v}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMark(o.v);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-ink-50/10',
                          active ? 'text-accent-400' : 'text-ink-100',
                        )}
                      >
                        <span>{o.label}</span>
                        {active && <Bookmark className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                  <div className="px-3 py-1.5 text-xs text-ink-300 border-t border-ink-700/70 mt-1">审稿状态</div>
                  {([
                    { v: 'pending', label: '待审', icon: Eye },
                    { v: 'needs_revision', label: '需修改', icon: AlertCircle },
                    { v: 'approved', label: '通过', icon: Check },
                  ] as const).map((o) => {
                    const active = page.reviewStatus === o.v;
                    const Ico = o.icon;
                    return (
                      <button
                        key={o.v}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetStatus(o.v);
                          setMenuOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-ink-50/10',
                          active ? 'text-accent-400' : 'text-ink-100',
                        )}
                      >
                        <Ico className="w-3.5 h-3.5" />
                        <span>{o.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 印章区 */}
        <div className="absolute top-12 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {page.specialMarks.slice(0, 3).map((m) => (
            <div key={m} className="transform scale-90 origin-top-left">
              <SpecialMarkStamp mark={m} />
            </div>
          ))}
        </div>

        {/* 批注计数 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAnnotation();
          }}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-10 chip border-accent-400/50 bg-accent-400/20 text-accent-400"
          title={`${anns.length} 条批注`}
        >
          <MessageSquare className="w-3 h-3" />
          {anns.length}
        </button>

        {/* 图片 */}
        <div className="relative aspect-[5/7] overflow-hidden rounded-sm bg-ink-950">
          <img src={page.imageUrl} alt={`第${page.pageNumber}页`} className="w-full h-full object-cover" loading="lazy" />
          {isMemory && <div className="absolute inset-0 recollection-overlay pointer-events-none" />}
        </div>

        {/* 页码条 */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PageCountBadge n={page.pageNumber} />
            <span className={cn('chip border text-[9px]', processColor.bg, processColor.text, processColor.border)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', processColor.dot)} />
              {PROCESS_STATUS_LABELS[processStatus]}
            </span>
            <div className="flex -space-x-1">
              {anns.slice(0, 3).map((a, i) => {
                const color =
                  a.creatorRole === 'author'
                    ? '#10B981'
                    : a.creatorRole === 'editor'
                    ? '#D97757'
                    : a.creatorRole === 'art_supervisor'
                    ? '#0EA5E9'
                    : '#D946EF';
                return (
                  <div
                    key={a.id + i}
                    className="w-4 h-4 rounded-full border-2 border-ink-50"
                    style={{ background: color }}
                    title={a.creatorRole}
                  />
                );
              })}
            </div>
          </div>
          <StatusFlag status={page.reviewStatus} compact />
        </div>
      </div>
    </div>
  );
};
