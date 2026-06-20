import React from 'react';
import type { StoryBeat, StoryPage } from '../../types';
import { STORY_BEAT_LABELS, STORY_BEAT_COLORS } from '../../utils/tagConfig';
import { cn } from '../../utils/idGenerator';
import { ChevronLeft, ChevronRight, Play, Compass, Sparkles, History, ArrowRight, Flag } from 'lucide-react';

interface StoryBeatSidebarProps {
  beats: StoryBeat[];
  pages: StoryPage[];
  selectedPage: StoryPage | undefined;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onJumpToPage: (pageNumber: number) => void;
}

const BEAT_ICONS = {
  opening: Play,
  development: Compass,
  climax: Sparkles,
  recollection: History,
  transition: ArrowRight,
  ending: Flag,
};

export const StoryBeatSidebar: React.FC<StoryBeatSidebarProps> = ({
  beats,
  selectedPage,
  collapsed,
  onToggleCollapse,
  onJumpToPage,
}) => {
  const currentBeat = selectedPage
    ? beats.find((b) => selectedPage.pageNumber >= b.relatedStartPage && selectedPage.pageNumber <= b.relatedEndPage)
    : undefined;

  if (collapsed) {
    return (
      <div className="h-full w-12 flex-shrink-0 border-r border-ink-700/60 bg-ink-850 bg-paper-texture flex flex-col items-center py-3 gap-3">
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg bg-ink-700/60 hover:bg-ink-600/80 text-ink-100 flex items-center justify-center transition-all"
          title="展开剧情节点"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="w-8 h-px bg-ink-600/60 my-1" />
        {beats.map((b) => {
          const Ico = BEAT_ICONS[b.type];
          const active = currentBeat?.id === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onJumpToPage(b.relatedStartPage)}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all group relative',
                active
                  ? 'bg-accent-400 text-ink-50 shadow-[0_0_15px_rgba(217,119,87,0.4)]'
                  : 'bg-ink-700/50 text-ink-300 hover:bg-ink-600/70 hover:text-ink-100',
              )}
              title={`${STORY_BEAT_LABELS[b.type]} · P${b.relatedStartPage}-${b.relatedEndPage}`}
            >
              <Ico className="w-3.5 h-3.5" />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="h-full w-72 flex-shrink-0 border-r border-ink-700/60 bg-ink-850/60 backdrop-blur-sm bg-paper-texture flex flex-col">
      {/* 头 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-700/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-memory-50 text-memory" />
          <div className="section-title text-sm">剧情节点</div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="w-7 h-7 rounded-md hover:bg-ink-700/60 text-ink-200 flex items-center justify-center transition-all"
          title="收起"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-auto py-3 px-3 space-y-1">
        {beats.map((b) => {
          const Ico = BEAT_ICONS[b.type];
          const active = currentBeat?.id === b.id;
          return (
            <button
              key={b.id}
              onClick={() => onJumpToPage(b.relatedStartPage)}
              className={cn(
                'w-full text-left rounded-lg p-3 transition-all border',
                active
                  ? 'bg-memory/10 border-memory/40 shadow-[0_0_20px_rgba(232,213,163,0.1)]'
                  : 'bg-ink-900/30 border-ink-700/40 hover:bg-ink-800/50 hover:border-ink-600/60',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn('chip border', STORY_BEAT_COLORS[b.type])}>
                  <Ico className="w-3 h-3" />
                  {STORY_BEAT_LABELS[b.type]}
                </div>
                <span className="font-mono text-[10px] text-ink-300">
                  P{b.relatedStartPage}-{b.relatedEndPage}
                </span>
              </div>
              <p className={cn('text-xs leading-relaxed', active ? 'text-memory-50 text-memory' : 'text-ink-200')}>
                {b.description}
              </p>
              {/* 进度指示 */}
              {active && selectedPage && (
                <div className="mt-2.5 h-1 bg-ink-700/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-400 to-memory rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((selectedPage.pageNumber - b.relatedStartPage) / Math.max(1, b.relatedEndPage - b.relatedStartPage)) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 当前剧情提示 */}
      <div className="px-3 py-3 border-t border-ink-700/60 bg-ink-900/40">
        <div className="text-[10px] uppercase tracking-widest text-ink-300 mb-1">当前位置</div>
        {currentBeat ? (
          <div className="text-sm text-ink-100 line-clamp-2">{currentBeat.description}</div>
        ) : (
          <div className="text-sm text-ink-300/70">请选择分镜页查看剧情上下文</div>
        )}
      </div>
    </div>
  );
};
