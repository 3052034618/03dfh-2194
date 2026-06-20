import React from 'react';
import type { Work, Chapter } from '../../types';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Edit3, FileText, Pause, RefreshCw, Plus } from 'lucide-react';
import { cn } from '../../utils/idGenerator';

interface WorkCardProps {
  work: Work;
  latestChapter?: Chapter;
}

export const WorkCard: React.FC<WorkCardProps> = ({ work, latestChapter }) => {
  const navigate = useNavigate();
  const latestChap = latestChapter;

  const statusCfg = {
    serializing: { label: '连载中', icon: RefreshCw, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    completed: { label: '已完结', icon: FileText, color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
    hiatus: { label: '休载中', icon: Pause, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  }[work.status];
  const StatusIcon = statusCfg.icon;

  return (
    <div
      className="group relative rounded-2xl border border-ink-700/60 bg-ink-800/60 backdrop-blur-sm overflow-hidden hover:border-accent-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(217,119,87,0.15)] animate-fade-in-up"
      onClick={() => latestChap && navigate(`/works/${work.id}/chapters/${latestChap.id}`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ink-950">
        <img
          src={work.coverImage}
          alt={work.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className={cn('chip border', statusCfg.color)}>
            <StatusIcon className="w-3 h-3" />
            {statusCfg.label}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-accent-400" />
            <span className="text-[11px] text-ink-200">
              已更新至 <span className="font-mono font-bold text-accent-400">第 {work.latestEpisode} 话</span>
            </span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-ink-50 mb-1 leading-tight tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            {work.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-ink-200/90">
            <span>作者 · {work.authorName}</span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-ink-700/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-ink-300">
          <Calendar className="w-3 h-3" />
          {work.updatedAt}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (latestChap) navigate(`/works/${work.id}/chapters/${latestChap.id}`);
          }}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Edit3 className="w-3 h-3" />
          进入审稿
        </button>
      </div>
    </div>
  );
};

export const NewWorkCard: React.FC = () => (
  <div className="rounded-2xl border-2 border-dashed border-ink-700/70 bg-ink-800/30 flex flex-col items-center justify-center p-6 min-h-[520px] text-center cursor-pointer hover:border-accent-400/50 hover:bg-accent-400/5 transition-all group">
    <div className="w-16 h-16 rounded-2xl bg-ink-700/50 flex items-center justify-center mb-4 group-hover:bg-accent-400/20 transition-all">
      <Plus className="w-7 h-7 text-ink-300 group-hover:text-accent-400 transition-all" />
    </div>
    <div className="font-serif text-lg text-ink-100 mb-1">新建连载作品</div>
    <div className="text-xs text-ink-400">创建新的漫画作品并开始分镜会审</div>
  </div>
);
