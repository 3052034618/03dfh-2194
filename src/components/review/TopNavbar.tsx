import React from 'react';
import { BookOpen, LayoutGrid, ListTodo, ClipboardList, Filter, Users, Video, VideoOff, Radio } from 'lucide-react';
import type { Work, Chapter, PageReviewStatus, UserRole, MeetingFocus } from '../../types';
import { STATUS_FLAGS } from '../../utils/tagConfig';
import { cn } from '../../utils/idGenerator';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/tagConfig';
import { useAuthStore } from '../../store/useAuthStore';

interface TopNavbarProps {
  work: Work | undefined;
  chapter: Chapter | undefined;
  stats: { pending: number; needs_revision: number; approved: number; total: number };
  statusFilter: PageReviewStatus | 'all';
  onStatusFilter: (s: PageReviewStatus | 'all') => void;
  onGenerateChecklist: () => void;
  onGoDashboard: () => void;
  onGoStatusBoard: () => void;
  viewMode: 'grid' | 'status';
  onSwitchView: (v: 'grid' | 'status') => void;
  currentRole: UserRole;
  onChangeRole: (r: UserRole) => void;
  meetingFocus: MeetingFocus | null;
  onStartMeeting: () => void;
  onEndMeeting: () => void;
  onJumpToMeetingFocus: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  work,
  chapter,
  stats,
  statusFilter,
  onStatusFilter,
  onGenerateChecklist,
  onGoDashboard,
  onGoStatusBoard,
  viewMode,
  onSwitchView,
  currentRole,
  onChangeRole,
  meetingFocus,
  onStartMeeting,
  onEndMeeting,
  onJumpToMeetingFocus,
}) => {
  const users = useAuthStore((s) => s.allUsers);
  const filters: { v: PageReviewStatus | 'all'; label: string; key: keyof typeof stats | 'all' }[] = [
    { v: 'all', label: '全部', key: 'all' },
    { v: 'pending', label: '待审', key: 'pending' },
    { v: 'needs_revision', label: '需修改', key: 'needs_revision' },
    { v: 'approved', label: '通过', key: 'approved' },
  ];

  const progressPct = stats.total > 0 ? ((stats.approved + stats.needs_revision) / stats.total) * 100 : 0;
  const meetingUser = meetingFocus ? users.find((u) => u.id === meetingFocus.startedBy) : null;

  return (
    <header className="flex-shrink-0 h-16 border-b border-ink-700/60 bg-ink-800/90 backdrop-blur-md flex items-center px-5 gap-5">
      {/* Logo & 作品 */}
      <button
        onClick={onGoDashboard}
        className="flex items-center gap-2.5 pr-4 border-r border-ink-700/60 hover:opacity-80 transition-opacity"
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-400 to-[#B4523E] flex items-center justify-center shadow-[0_0_20px_rgba(217,119,87,0.35)]">
          <BookOpen className="w-4.5 h-4.5 text-ink-50" />
        </div>
        <div className="text-left">
          <div className="font-serif text-ink-50 font-bold tracking-wide leading-tight">MangaFlow</div>
          <div className="text-[10px] text-ink-300 leading-tight">分镜会审工作台</div>
        </div>
      </button>

      {/* 话次信息 */}
      {work && chapter && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <div className="text-[11px] text-ink-300 flex items-center gap-1.5">
                <span className="font-serif text-accent-400">{work.title}</span>
                <span className="text-ink-500">·</span>
                <span>第 {chapter.episodeNumber} 话</span>
              </div>
              <div className="section-title text-base truncate">{chapter.title}</div>
            </div>
          </div>
        </div>
      )}

      {/* 会议模式指示 */}
      {meetingFocus && (
        <button
          onClick={onJumpToMeetingFocus}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/40 text-danger animate-breathe hover:bg-danger/20 transition-all"
          title="跳转到当前会议焦点"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-xs font-medium">会议进行中</span>
          {meetingUser && (
            <span className="text-[10px] text-danger/80">· {meetingUser.name}</span>
          )}
        </button>
      )}

      {/* 进度条 */}
      <div className="hidden lg:flex items-center gap-3 w-72">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[10px] text-ink-300 mb-1">
            <span>审稿进度</span>
            <span className="font-mono">
              {stats.approved + stats.needs_revision}/{stats.total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-ink-700/70 overflow-hidden flex">
            <div
              className="h-full"
              style={{
                width: `${(stats.approved / Math.max(1, stats.total)) * 100}%`,
                background: STATUS_FLAGS.approved.flag,
              }}
            />
            <div
              className="h-full"
              style={{
                width: `${(stats.needs_revision / Math.max(1, stats.total)) * 100}%`,
                background: STATUS_FLAGS.needs_revision.flag,
              }}
            />
          </div>
        </div>
      </div>

      {/* 筛选 Tabs */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-ink-900/50 border border-ink-700/60">
        <Filter className="w-3.5 h-3.5 text-ink-400 mx-1.5" />
        {filters.map((f) => {
          const active = statusFilter === f.v;
          const count = f.key === 'all' ? stats.total : stats[f.key];
          return (
            <button
              key={f.v}
              onClick={() => onStatusFilter(f.v)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1',
                active
                  ? 'bg-accent-400 text-ink-50 shadow-[0_0_10px_rgba(217,119,87,0.3)]'
                  : 'text-ink-200 hover:bg-ink-700/60',
              )}
            >
              {f.label}
              <span className={cn('font-mono text-[10px]', active ? 'text-ink-50/90' : 'text-ink-400')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 视图切换 */}
      <div className="flex items-center gap-1 p-0.5 rounded-lg bg-ink-900/50 border border-ink-700/60">
        <button
          onClick={() => onSwitchView('grid')}
          className={cn(
            'px-2 py-1 rounded-md transition-all',
            viewMode === 'grid' ? 'bg-ink-600/80 text-ink-50' : 'text-ink-300 hover:text-ink-100',
          )}
          title="网格视图"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onGoStatusBoard}
          className={cn(
            'px-2 py-1 rounded-md transition-all',
            viewMode === 'status' ? 'bg-ink-600/80 text-ink-50' : 'text-ink-300 hover:text-ink-100',
          )}
          title="状态看板"
        >
          <ListTodo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 角色切换（模拟多人协作） */}
      <div className="relative group">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ink-900/50 border border-ink-700/60 cursor-pointer hover:border-ink-600/80">
          <Users className="w-3.5 h-3.5 text-ink-300" />
          <span className={cn('chip border text-[10px]', ROLE_COLORS[currentRole])}>
            {ROLE_LABELS[currentRole]}
          </span>
        </div>
        <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-50 w-44 rounded-lg border border-ink-700/60 bg-ink-800 shadow-soft py-1 animate-fade-in-up">
          {(['author', 'editor', 'art_supervisor', 'text_editor'] as UserRole[]).map((r) => {
            const active = currentRole === r;
            return (
              <button
                key={r}
                onClick={() => onChangeRole(r)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-ink-50/10',
                  active ? 'text-accent-400' : 'text-ink-100',
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{
                      background: users.find((u) => u.role === r)?.avatarColor,
                    }}
                  />
                  {ROLE_LABELS[r]}
                </span>
                <span className="text-xs text-ink-400">{users.find((u) => u.role === r)?.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 会议控制 */}
      {meetingFocus ? (
        <button onClick={onEndMeeting} className="btn-secondary flex items-center gap-2 text-sm py-1.5 border-danger/40 text-danger hover:bg-danger/10">
          <VideoOff className="w-4 h-4" />
          结束会议
        </button>
      ) : (
        <button onClick={onStartMeeting} className="btn-secondary flex items-center gap-2 text-sm py-1.5 border-accent-400/40 text-accent-400 hover:bg-accent-400/10">
          <Video className="w-4 h-4" />
          发起会议
        </button>
      )}

      {/* 生成修改清单 */}
      <button onClick={onGenerateChecklist} className="btn-primary flex items-center gap-2 text-sm py-1.5">
        <ClipboardList className="w-4 h-4" />
        生成修改清单
      </button>
    </header>
  );
};
