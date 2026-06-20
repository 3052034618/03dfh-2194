import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { StoryPage, SpecialMark, PageReviewStatus } from '../../types';
import { StoryPageCard } from './StoryPageCard';
import { FileUploadZone } from './FileUploadZone';

interface StoryPageGridProps {
  pages: StoryPage[];
  selectedId: string | null;
  onSelect: (pageId: string | null) => void;
  onReorder: (activeId: string, overId: string) => void;
  onOpenAnnotation: (pageId: string) => void;
  onToggleMark: (pageId: string, mark: SpecialMark) => void;
  onSetStatus: (pageId: string, status: PageReviewStatus) => void;
  onUpload: (files: File[]) => void;
  onUploadClick?: () => void;
}

export const StoryPageGrid: React.FC<StoryPageGridProps> = ({
  pages,
  selectedId,
  onSelect,
  onReorder,
  onOpenAnnotation,
  onToggleMark,
  onSetStatus,
  onUpload,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="flex-1 overflow-auto p-6">
            {pages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="max-w-lg w-full">
                  <FileUploadZone onUpload={onUpload} />
                </div>
              </div>
            ) : (
              <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
                {pages.map((p) => (
                  <StoryPageCard
                    key={p.id}
                    page={p}
                    selected={selectedId === p.id}
                    onClick={() => onSelect(p.id === selectedId ? null : p.id)}
                    onOpenAnnotation={() => onOpenAnnotation(p.id)}
                    onToggleMark={(m) => onToggleMark(p.id, m)}
                    onSetStatus={(s) => onSetStatus(p.id, s)}
                  />
                ))}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
