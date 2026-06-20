import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopNavbar } from '../components/review/TopNavbar';
import { StoryBeatSidebar } from '../components/review/StoryBeatSidebar';
import { StoryPageGrid } from '../components/review/StoryPageGrid';
import { AnnotationPanel } from '../components/review/AnnotationPanel';
import { AnnotationCanvas } from '../components/review/AnnotationCanvas';
import { StatusBoard } from '../components/status/StatusBoard';
import { ChecklistModal } from '../components/checklist/ChecklistModal';
import { FileUploadZone } from '../components/review/FileUploadZone';
import { Modal } from '../components/common/Modal';
import { useWorkStore } from '../store/useWorkStore';
import { usePageStore, selectFilteredPages, selectAllPages, selectPageStats } from '../store/usePageStore';
import { useAnnotationStore } from '../store/useAnnotationStore';
import { useAuthStore } from '../store/useAuthStore';
import type { PageReviewStatus, SpecialMark, UserRole } from '../types';
import { ImagePlus } from 'lucide-react';

const ReviewBoardPage: React.FC = () => {
  const { workId, chapterId } = useParams<{ workId: string; chapterId: string }>();
  const navigate = useNavigate();

  const work = useWorkStore((s) => s.works.find((w) => w.id === workId));
  const chapter = useWorkStore((s) => s.chapters.find((c) => c.id === chapterId));
  const beats = useWorkStore((s) => s.storyBeats.filter((b) => b.chapterId === chapterId).sort((a, b) => a.orderIndex - b.orderIndex));
  const setCurrentWork = useWorkStore((s) => s.setCurrentWork);
  const setCurrentChapter = useWorkStore((s) => s.setCurrentChapter);

  const rawPages = usePageStore((s) => s.pages[chapterId || ''] || []);
  const selectedId = usePageStore((s) => s.selectedPageId);
  const statusFilter = usePageStore((s) => s.statusFilter);
  const setSelected = usePageStore((s) => s.setSelectedPage);
  const setFilter = usePageStore((s) => s.setStatusFilter);
  const reorder = usePageStore((s) => s.reorderPages);
  const toggleMark = usePageStore((s) => s.toggleSpecialMark);
  const setPageStatus = usePageStore((s) => s.setPageStatus);
  const uploadPages = usePageStore((s) => s.uploadPages);
  const initPages = usePageStore((s) => s.initPagesForChapter);

  const currentUser = useAuthStore((s) => s.currentUser);
  const [viewMode, setViewMode] = useState<'grid' | 'status'>('grid');
  const [beatCollapsed, setBeatCollapsed] = useState(false);
  const [canvasPageId, setCanvasPageId] = useState<string | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [role, setRole] = useState<UserRole>(currentUser.role);

  useEffect(() => {
    if (workId) setCurrentWork(workId);
    if (chapterId) {
      setCurrentChapter(chapterId);
      initPages(chapterId, 0);
    }
  }, [workId, chapterId]);

  useEffect(() => {
    setRole(currentUser.role);
  }, [currentUser.role]);

  const allPages = useMemo(
    () => rawPages.slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [rawPages],
  );

  const filteredPages = useMemo(
    () =>
      statusFilter === 'all'
        ? allPages
        : allPages.filter((p) => p.reviewStatus === statusFilter),
    [allPages, statusFilter],
  );

  const stats = useMemo(
    () => selectPageStats(chapterId || ''),
    [rawPages, chapterId],
  );

  const selectedPage = useMemo(
    () => allPages.find((p) => p.id === selectedId),
    [allPages, selectedId],
  );

  const canvasPage = useMemo(
    () => allPages.find((p) => p.id === canvasPageId),
    [allPages, canvasPageId],
  );

  const handleJumpToPage = useCallback(
    (pageNumber: number) => {
      const target = allPages.find((p) => p.pageNumber === pageNumber);
      if (target) setSelected(target.id);
    },
    [allPages, setSelected],
  );

  const totalStats = useMemo(() => ({ ...stats, total: allPages.length }), [stats, allPages.length]);

  return (
    <div className="h-full w-full flex flex-col bg-ink-900">
      <TopNavbar
        work={work}
        chapter={chapter}
        stats={totalStats}
        statusFilter={statusFilter}
        onStatusFilter={(s) => setFilter(s)}
        onGenerateChecklist={() => setChecklistOpen(true)}
        onGoDashboard={() => navigate('/')}
        onGoStatusBoard={() => setViewMode('status')}
        viewMode={viewMode}
        onSwitchView={(v) => setViewMode(v)}
        currentRole={role}
        onChangeRole={setRole}
      />

      <div className="flex-1 flex overflow-hidden">
        <StoryBeatSidebar
          beats={beats}
          pages={allPages}
          selectedPage={selectedPage}
          collapsed={beatCollapsed}
          onToggleCollapse={() => setBeatCollapsed((v) => !v)}
          onJumpToPage={handleJumpToPage}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative bg-ink-900 bg-paper-texture">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-ink-700/60 bg-ink-850/60 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-sm text-ink-200">
                {viewMode === 'grid' ? (
                  <>
                    共 <span className="font-mono font-bold text-accent-400">{allPages.length}</span> 页分镜
                    {statusFilter !== 'all' && (
                      <>
                        {' · 当前筛选 '}
                        <span className="font-mono text-accent-400">{filteredPages.length}</span> 页
                      </>
                    )}
                  </>
                ) : (
                  <>
                    状态看板：待审 <span className="font-mono text-ink-400">{stats.pending}</span> · 需修改{' '}
                    <span className="font-mono text-danger">{stats.needs_revision}</span> · 通过{' '}
                    <span className="font-mono text-success">{stats.approved}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUploadOpen(true)}
                className="btn-secondary text-xs py-1.5 flex items-center gap-1.5"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                追加分镜
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <StoryPageGrid
              pages={filteredPages}
              selectedId={selectedId}
              onSelect={setSelected}
              onReorder={(a, o) => chapterId && reorder(chapterId, a, o)}
              onOpenAnnotation={(pid) => setCanvasPageId(pid)}
              onToggleMark={(pid, m: SpecialMark) => chapterId && toggleMark(chapterId, pid, m)}
              onSetStatus={(pid, s: PageReviewStatus) => chapterId && setPageStatus(chapterId, pid, s)}
              onUpload={(files) => chapterId && uploadPages(chapterId, files)}
            />
          ) : (
            <StatusBoard
              pages={allPages}
              onSetStatus={(pid, s) => chapterId && setPageStatus(chapterId, pid, s)}
              onSelectPage={setSelected}
              onOpenAnnotation={(pid) => setCanvasPageId(pid)}
            />
          )}
        </div>

        <AnnotationPanel page={selectedPage} onOpenCanvas={() => selectedId && setCanvasPageId(selectedId)} />
      </div>

      {canvasPage && (
        <Modal open={!!canvasPage} onClose={() => setCanvasPageId(null)} size="full" className="!rounded-xl">
          <AnnotationCanvas pageId={canvasPage.id} imageUrl={canvasPage.imageUrl} onClose={() => setCanvasPageId(null)} />
        </Modal>
      )}

      <ChecklistModal open={checklistOpen} onClose={() => setChecklistOpen(false)} pages={allPages} />

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        size="md"
        title={
          <div className="flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-accent-400" />
            追加分镜页
          </div>
        }
      >
        <div className="p-5">
          <FileUploadZone
            onUpload={(files) => {
              if (chapterId) uploadPages(chapterId, files);
              setUploadOpen(false);
            }}
          />
          <p className="text-xs text-ink-400 mt-4 leading-relaxed">
            上传后分镜会自动追加到当前话次末尾，并自动分配新的页码。可在主视图中拖拽调整顺序。
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewBoardPage;
