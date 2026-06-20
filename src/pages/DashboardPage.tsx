import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkStore } from '../store/useWorkStore';
import { useAuthStore } from '../store/useAuthStore';
import { WorkCard, NewWorkCard } from '../components/dashboard/WorkCard';
import { UserAvatar } from '../components/common/Badges';
import { BookOpen, Sparkles, LayoutDashboard, Users } from 'lucide-react';
import type { Chapter } from '../types';

const DashboardPage: React.FC = () => {
  const works = useWorkStore((s) => s.works);
  const allChapters = useWorkStore((s) => s.chapters);
  const currentUser = useAuthStore((s) => s.currentUser);
  const setCurrentUser = useAuthStore((s) => s.setCurrentUser);
  const allUsers = useAuthStore((s) => s.allUsers);
  const navigate = useNavigate();

  const latestChaptersByWork = React.useMemo(() => {
    const map = new Map<string, Chapter>();
    for (const c of allChapters) {
      const prev = map.get(c.workId);
      if (!prev || c.episodeNumber > prev.episodeNumber) {
        map.set(c.workId, c);
      }
    }
    return map;
  }, [allChapters]);

  const totalEpisodes = works.reduce((acc, w) => acc + w.latestEpisode, 0);
  const serializingCount = works.filter((w) => w.status === 'serializing').length;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* 顶栏 */}
      <header className="flex-shrink-0 h-20 border-b border-ink-700/60 bg-ink-800/80 backdrop-blur-md px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-400 to-[#B4523E] flex items-center justify-center shadow-[0_0_25px_rgba(217,119,87,0.35)]">
            <BookOpen className="w-5 h-5 text-ink-50" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink-50 tracking-wider">MangaFlow</h1>
            <div className="text-[11px] text-ink-300 tracking-wide">漫画分镜会审 · 编辑部工作台</div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-ink-300 uppercase tracking-widest mb-0.5">当前身份</div>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-900/60 border border-ink-700/60 hover:border-ink-600/80 transition-all">
                <UserAvatar color={currentUser.avatarColor} name={currentUser.name} size={24} />
                <span className="text-sm font-medium text-ink-100">{currentUser.name}</span>
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-50 w-52 rounded-lg border border-ink-700/60 bg-ink-800 shadow-soft py-1 animate-fade-in-up">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-ink-400 border-b border-ink-700/60">
                  <Users className="w-3 h-3 inline mr-1" /> 团队成员（切换模拟身份）
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-ink-50/10',
                      u.id === currentUser.id ? 'text-accent-400' : 'text-ink-100',
                    )}
                  >
                    <UserAvatar color={u.avatarColor} name={u.name} size={20} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{u.name}</div>
                      <div className="text-[10px] text-ink-400">
                        {u.role === 'author' ? '主笔/作者' : u.role === 'editor' ? '责任编辑' : u.role === 'art_supervisor' ? '美术监修' : '文字编辑'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主体 */}
      <main className="flex-1 overflow-auto px-10 py-8 bg-paper-texture">
        {/* 欢迎语 & 统计卡片 */}
        <section className="mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="text-xs text-accent-400 tracking-widest uppercase mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 今日分镜会审
              </div>
              <h2 className="font-serif text-3xl font-bold text-ink-50 mb-1">
                下午好，{currentUser.name}
              </h2>
              <p className="text-sm text-ink-300">今天的任务：审阅「月下青鸾」第 23 话分镜稿，准备远程会审会议。</p>
            </div>
            <div className="flex gap-3">
              <StatCard label="在载作品" value={serializingCount} accent="text-emerald-300" icon={BookOpen} />
              <StatCard label="累计话次" value={totalEpisodes} accent="text-accent-400" icon={LayoutDashboard} />
              <StatCard label="团队成员" value={allUsers.length} accent="text-sky-300" icon={Users} />
            </div>
          </div>
        </section>

        {/* 快捷入口卡片 */}
        <section className="mb-8 rounded-2xl border border-ink-700/60 bg-gradient-to-br from-ink-800/90 to-ink-800/40 p-6 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-400/30 to-success/20 flex items-center justify-center border border-accent-400/30 flex-shrink-0">
              <Sparkles className="w-9 h-9 text-accent-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-ink-300 mb-1">待审稿任务 · 今日重点</div>
              <div className="font-serif text-2xl font-bold text-ink-50 mb-1">月下青鸾 · 第 23 话 · 月下重逢</div>
              <div className="text-sm text-ink-200">20 页分镜稿 · 14 页已有批注 · 建议集中讨论第 11-17 页</div>
            </div>
            <button
              onClick={() => navigate('/works/work_001/chapters/chap_001')}
              className="btn-primary px-5 py-2.5 text-base flex items-center gap-2 shadow-[0_8px_25px_rgba(217,119,87,0.35)]"
            >
              立即进入审稿
              <span aria-hidden>→</span>
            </button>
          </div>
        </section>

        {/* 作品列表 */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title text-xl">我的作品</h3>
              <p className="text-sm text-ink-300 mt-0.5">点击任意卡片进入对应话次的分镜会审</p>
            </div>
          </div>
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
            {works.map((w) => (
              <WorkCard key={w.id} work={w} latestChapter={latestChaptersByWork.get(w.id)} />
            ))}
            <NewWorkCard />
          </div>
        </section>
      </main>
    </div>
  );
};

import { cn } from '../utils/idGenerator';
import { type LucideIcon } from 'lucide-react';

const StatCard: React.FC<{ label: string; value: number; accent: string; icon: LucideIcon }> = ({
  label,
  value,
  accent,
  icon: Icon,
}) => (
  <div className="rounded-xl border border-ink-700/60 bg-ink-800/60 px-4 py-3 flex items-center gap-3 min-w-[120px]">
    <div className={cn('w-9 h-9 rounded-lg bg-ink-700/50 flex items-center justify-center', accent)}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <div className={cn('font-mono text-2xl font-bold', accent)}>{value}</div>
      <div className="text-[10px] text-ink-300 uppercase tracking-wide">{label}</div>
    </div>
  </div>
);

export default DashboardPage;
