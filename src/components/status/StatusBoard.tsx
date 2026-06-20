import React, { useMemo } from 'react';
import {
  DndContext,
  useDroppable,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { StoryPage, PageReviewStatus } from '../../types';
import { cn } from '../../utils/idGenerator';
import { STATUS_FLAGS } from '../../utils/tagConfig';
import { Eye, AlertCircle, Check, GripVertical, MessageSquare } from 'lucide-react';
import { useAnnotationStore } from '../../store/useAnnotationStore';

interface StatusBoardProps {
  pages: StoryPage[];
  onSetStatus: (pageId: string, status: PageReviewStatus) => void;
  onSelectPage: (pageId: string) => void;
  onOpenAnnotation: (pageId: string) => void;
}

const COLUMNS: { status: PageReviewStatus; label: string; icon: typeof Eye }[] = [
  { status: 'pending', label: '待审', icon: Eye },
  { status: 'needs_revision', label: '需修改', icon: AlertCircle },
  { status: 'approved', label: '通过', icon: Check },
];

const DraggableCard: React.FC<{
  page: StoryPage;
  onSelect: () => void;
  onOpenAnnotation: () => void;
}> = ({ page, onSelect, onOpenAnnotation }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  const rawAnns = useAnnotationStore((s) => s.annotations[page.id]);
  const annCount = useMemo(() => (rawAnns ? rawAnns.length : 0), [rawAnns]);
  const flag = STATUS_FLAGS[page.reviewStatus];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-lg border border-ink-700/60 bg-ink-800/70 p-2.5 hover:border-ink-500/70 transition-all cursor-pointer shadow-sm hover:shadow-md animate-fade-in-up',
        isDragging && 'shadow-soft ring-2 ring-accent-400/60',
      )}
      onClick={onSelect}
    >
      <div className="flex gap-3">
        <div className="w-16 flex-shrink-0 aspect-[3/4] rounded overflow-hidden bg-ink-950 relative">
          <img src={page.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-sm font-bold text-ink-100">
                P.{String(page.pageNumber).padStart(2, '0')}
              </span>
              <button
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded text-ink-400 hover:bg-ink-700/70 hover:text-ink-200 cursor-grab active:cursor-grabbing transition-all"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {page.specialMarks.length > 0 &&
                page.specialMarks.slice(0, 2).map((m) => (
                  <span
                    key={m}
                    className={cn(
                      'text-[9px] px-1.5 py-0.5 rounded',
                      m === 'recollection'
                        ? 'bg-memory/20 text-memory border border-memory/40'
                        : m === 'cover'
                        ? 'bg-accent-400/20 text-accent-400 border border-accent-400/40'
                        : 'bg-ink-700/60 text-ink-200 border border-ink-600/60',
                    )}
                  >
                    {m === 'cover' ? '封面' : m === 'recollection' ? '回忆' : m === 'color_page' ? '彩页' : m}
                  </span>
                ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className={cn('text-[10px] flex items-center gap-1', flag.text)}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: flag.flag }} />
              {flag.label}
            </div>
            {annCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAnnotation();
                }}
                className="text-[10px] chip border border-accent-400/40 bg-accent-400/10 text-accent-400 hover:bg-accent-400/20"
              >
                <MessageSquare className="w-2.5 h-2.5" />
                {annCount}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DroppableColumn: React.FC<{
  status: PageReviewStatus;
  label: string;
  Icon: typeof Eye;
  pages: StoryPage[];
  totalPages: number;
  onSelectPage: (id: string) => void;
  onOpenAnnotation: (id: string) => void;
}> = ({ status, label, Icon, pages, totalPages, onSelectPage, onOpenAnnotation }) => {
  const flag = STATUS_FLAGS[status];
  const total = pages.length;
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } });
  const annotationsMap = useAnnotationStore((s) => s.annotations);

  const unresolvedCount = useMemo(() => {
    return pages.filter((p) => {
      const anns = annotationsMap[p.id] || [];
      return anns.some((a) => !a.resolved);
    }).length;
  }, [pages, annotationsMap]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 min-w-0 flex flex-col rounded-xl border transition-colors overflow-hidden',
        isOver ? 'border-accent-400/60 bg-accent-400/5' : 'border-ink-700/60 bg-ink-900/40',
      )}
    >
      <div className={cn('px-4 py-3 border-b border-ink-700/60', flag.bg)}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" style={{ color: flag.flag }} />
            <span className="section-title text-sm">{label}</span>
          </div>
          <div className="text-xs">
            <span className="font-mono font-bold text-ink-50">{total}</span>
            <span className="text-ink-300/70 ml-0.5">页</span>
            {unresolvedCount > 0 && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-danger/30 text-[#F5C7B8]">
                {unresolvedCount} 有批注
              </span>
            )}
          </div>
        </div>
        <div className="h-1 bg-ink-800/70 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${totalPages > 0 ? (total / totalPages) * 100 : 0}%`,
              background: flag.flag,
              opacity: 0.4,
            }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3 space-y-2 min-h-[300px]">
        <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {pages.length === 0 ? (
            <div
              className={cn(
                'h-full flex items-center justify-center text-xs py-12 border-2 border-dashed rounded-lg transition-colors',
                isOver ? 'border-accent-400/60 text-accent-400 bg-accent-400/5' : 'border-ink-700/40 text-ink-400',
              )}
            >
              拖拽分镜页到此列
            </div>
          ) : (
            pages.map((p) => (
              <DraggableCard
                key={p.id}
                page={p}
                onSelect={() => onSelectPage(p.id)}
                onOpenAnnotation={() => onOpenAnnotation(p.id)}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
};

export const StatusBoard: React.FC<StatusBoardProps> = ({ pages, onSetStatus, onSelectPage, onOpenAnnotation }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const pageMap = useMemo(() => new Map(pages.map((p) => [p.id, p])), [pages]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const from = pageMap.get(activeId)?.reviewStatus;
    let to: PageReviewStatus | undefined;

    const colStatus = COLUMNS.find((c) => c.status === overId);
    if (colStatus) {
      to = colStatus.status;
    } else {
      const overPage = pageMap.get(overId);
      if (overPage) {
        to = overPage.reviewStatus;
      }
    }

    if (!from || !to || from === to) return;
    onSetStatus(activeId, to);
  };

  const totalPages = pages.length;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="h-full w-full p-6 flex gap-5 overflow-auto">
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col.status}
            status={col.status}
            label={col.label}
            Icon={col.icon}
            pages={pages.filter((p) => p.reviewStatus === col.status).sort((a, b) => a.pageNumber - b.pageNumber)}
            totalPages={totalPages}
            onSelectPage={onSelectPage}
            onOpenAnnotation={onOpenAnnotation}
          />
        ))}
      </div>
    </DndContext>
  );
};
