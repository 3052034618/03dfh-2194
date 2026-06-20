import React, { useState, useMemo, useEffect } from 'react';
import type { StoryPage, UserRole, AnnotationTag, MeetingFocus, User as UserType } from '../../types';
import { TAG_LABELS, TAG_COLORS, ROLE_LABELS } from '../../utils/tagConfig';
import { cn } from '../../utils/idGenerator';
import { MessageSquarePlus, User as UserIcon, Palette, Scroll, Type, Filter, Tag, EyeOff, Radio, FileText, UserCheck } from 'lucide-react';
import { useAnnotationStore } from '../../store/useAnnotationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useConclusionStore, selectProcessStatus, PROCESS_STATUS_LABELS, PROCESS_STATUS_COLORS } from '../../store/useConclusionStore';

interface AnnotationPanelProps {
  page: StoryPage | undefined;
  meetingFocus: MeetingFocus | null;
  onOpenCanvas: () => void;
}

const ROLE_ICONS = {
  author: UserIcon,
  editor: Scroll,
  art_supervisor: Palette,
  text_editor: Type,
};

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({ page, meetingFocus, onOpenCanvas }) => {
  const roleFilter = useAnnotationStore((s) => s.roleFilter);
  const tagFilter = useAnnotationStore((s) => s.tagFilter);
  const setRoleFilter = useAnnotationStore((s) => s.setRoleFilter);
  const setTagFilter = useAnnotationStore((s) => s.setTagFilter);
  const rawAnns = useAnnotationStore((s) => (page ? s.annotations[page.id] : undefined));
  const anns = useMemo(() => {
    if (!rawAnns) return [];
    return rawAnns
      .filter((a) => (roleFilter === 'all' ? true : a.creatorRole === roleFilter))
      .filter((a) => (tagFilter === 'all' ? true : a.tag === tagFilter))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [rawAnns, roleFilter, tagFilter]);
  const focusAnnId = meetingFocus?.selectedAnnotationId;
  const selectedAnnId = useAnnotationStore((s) => s.selectedAnnotationId);
  const setSelectedAnn = useAnnotationStore((s) => s.setSelectedAnnotation);
  const users = useAuthStore((s) => s.allUsers);
  const upsertConclusion = useConclusionStore((s) => s.upsertConclusion);
  const rawConclusions = useConclusionStore((s) => (page ? s.conclusions[page.chapterId] : undefined));
  const conclusion = useMemo(
    () => (page ? rawConclusions?.find((c) => c.pageId === page.id) : undefined),
    [rawConclusions, page],
  );
  const processStatus = useMemo(
    () => (page ? selectProcessStatus(page.id, anns) : 'pending_review'),
    [page, anns],
  );
  const processColor = PROCESS_STATUS_COLORS[processStatus];

  const [showConclusionForm, setShowConclusionForm] = useState(false);
  const [conclusionText, setConclusionText] = useState(conclusion?.finalOpinion || '');
  const [assigneeId, setAssigneeId] = useState<string | null>(conclusion?.assigneeUserId || null);

  useEffect(() => {
    if (conclusion) {
      setConclusionText(conclusion.finalOpinion);
      setAssigneeId(conclusion.assigneeUserId);
    } else {
      setConclusionText('');
      setAssigneeId(null);
    }
  }, [conclusion]);

  const handleSaveConclusion = () => {
    if (!page) return;
    const now = new Date().toISOString();
    upsertConclusion({
      id: conclusion?.id,
      pageId: page.id,
      chapterId: page.chapterId,
      finalOpinion: conclusionText.trim(),
      assigneeUserId: assigneeId,
      resolvedAt: processStatus === 'fully_resolved' ? now : conclusion?.resolvedAt || null,
    });
    setShowConclusionForm(false);
  };

  const roles: (UserRole | 'all')[] = ['all', 'editor', 'art_supervisor', 'text_editor', 'author'];
  const tags: (AnnotationTag | 'all')[] = [
    'all',
    'unclear_composition',
    'dialog_obstruction',
    'fast_pacing',
    'layout_issue',
    'text_error',
    'art_style',
    'continuity',
    'other',
  ];

  return (
    <aside className="h-full w-[360px] flex-shrink-0 border-l border-ink-700/60 bg-ink-850/70 backdrop-blur-sm flex flex-col">
      {/* 会议焦点提示 */}
      {meetingFocus && meetingFocus.pageId === page?.id && (
        <div className="px-4 py-2.5 bg-danger/10 border-b border-danger/30 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-danger animate-pulse" />
          <span className="text-[11px] text-danger font-medium">
            当前为会议讨论焦点
            {focusAnnId && <span className="ml-1">· 正在讨论 #{anns.findIndex((a) => a.id === focusAnnId) + 1}</span>}
          </span>
        </div>
      )}
      {/* 头部 */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-ink-700/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-accent-400" />
            <div className="section-title text-sm">批注面板</div>
            {anns.length > 0 && (
              <span className="chip border border-accent-400/50 bg-accent-400/15 text-accent-400 text-[10px]">
                {anns.length} 条
              </span>
            )}
          </div>
          <button
            onClick={onOpenCanvas}
            disabled={!page}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <EyeOff className="w-3 h-3" />
            逐格审稿
          </button>
        </div>

        {/* 筛选器 */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-1 text-[10px] text-ink-300 mb-1">
              <Filter className="w-3 h-3" /> 按角色
            </div>
            <div className="flex flex-wrap gap-1">
              {roles.map((r) => {
                const active = roleFilter === r;
                const Ico = r === 'all' ? null : ROLE_ICONS[r];
                return (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] border transition-all flex items-center gap-1',
                      active
                        ? 'border-accent-400 bg-accent-400/20 text-accent-400'
                        : 'border-ink-700/60 text-ink-300 hover:border-ink-600/70 bg-ink-900/30',
                    )}
                  >
                    {Ico && <Ico className="w-2.5 h-2.5" />}
                    {r === 'all' ? '全部' : ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1 text-[10px] text-ink-300 mb-1">
              <Tag className="w-3 h-3" /> 按标签
            </div>
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 6).map((t) => {
                const active = tagFilter === t;
                const c = t === 'all' ? null : TAG_COLORS[t];
                return (
                  <button
                    key={t}
                    onClick={() => setTagFilter(t)}
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] border transition-all',
                      active
                        ? c
                          ? `${c.bg} ${c.text} ${c.border}`
                          : 'border-accent-400 bg-accent-400/20 text-accent-400'
                        : 'border-ink-700/60 text-ink-300 hover:border-ink-600/70 bg-ink-900/30',
                    )}
                  >
                    {t === 'all' ? '全部' : TAG_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 批注列表 */}
      <div className="flex-1 overflow-auto p-3">
        {!page ? (
          <div className="h-full flex items-center justify-center text-sm text-ink-400 text-center px-6">
            <div>
              <MessageSquarePlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              选择一张分镜页<br />查看或添加批注
            </div>
          </div>
        ) : anns.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-ink-400 text-center px-6">
            <div>
              <div className="w-10 h-10 rounded-full bg-ink-700/60 flex items-center justify-center mx-auto mb-2">
                <EyeOff className="w-4 h-4 text-ink-300" />
              </div>
              第 <span className="font-mono text-accent-400">{page.pageNumber}</span> 页暂无批注
              <div className="text-xs text-ink-300/70 mt-1">点击右上角"逐格审稿"开始</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {anns.map((a, i) => {
              const c = TAG_COLORS[a.tag];
              const RIco = ROLE_ICONS[a.creatorRole];
              return (
                <div
                  key={a.id}
                  onClick={() => setSelectedAnn(selectedAnnId === a.id ? null : a.id)}
                  className={cn(
                    'rounded-lg border p-3 transition-all animate-fade-in-up cursor-pointer',
                    a.id === focusAnnId
                      ? 'border-danger bg-danger/10 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                      : a.id === selectedAnnId
                      ? 'border-accent-400/60 bg-accent-400/10'
                      : a.resolved
                      ? 'border-success/30 bg-success/5 opacity-80'
                      : 'border-ink-700/60 bg-ink-900/40 hover:border-ink-600/80 hover:bg-ink-800/40',
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-accent-400 bg-accent-400/15 px-1.5 py-0.5 rounded">
                        #{i + 1}
                      </span>
                      <span className={cn('chip border text-[10px]', c.bg, c.text, c.border)}>
                        {TAG_LABELS[a.tag]}
                      </span>
                    </div>
                    <div className={cn('chip border text-[10px]', a.resolved ? 'bg-success/20 text-success border-success/40' : 'bg-ink-700/50 text-ink-200 border-ink-600/60')}>
                      {a.resolved ? '✓ 已解决' : '待修改'}
                    </div>
                  </div>
                  <p className="text-sm text-ink-100 leading-relaxed mb-2.5">{a.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-ink-300">
                      <RIco className="w-3 h-3" />
                      {ROLE_LABELS[a.creatorRole]}
                    </div>
                    <div className="text-[10px] text-ink-400 font-mono">{a.createdAt.slice(5, 16).replace('T', ' ')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 会审结论区 */}
      {page && (
        <div className="flex-shrink-0 border-t border-ink-700/60 bg-gradient-to-b from-ink-800/30 to-transparent">
          <div className="px-4 py-3 border-b border-ink-700/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent-400" />
                <span className="text-sm font-semibold text-ink-100 section-title">会审结论</span>
              </div>
              <span className={cn('chip border text-[10px]', processColor.bg, processColor.text, processColor.border)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', processColor.dot)} />
                {PROCESS_STATUS_LABELS[processStatus]}
              </span>
            </div>

            {conclusion?.finalOpinion && !showConclusionForm ? (
              <div className="space-y-2">
                <div className="text-sm text-ink-100 leading-relaxed whitespace-pre-wrap bg-ink-900/50 rounded-lg p-3 border border-ink-700/50">
                  {conclusion.finalOpinion}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-ink-300">
                    <UserCheck className="w-3.5 h-3.5 text-accent-400" />
                    {conclusion.assigneeUserId
                      ? users.find((u) => u.id === conclusion.assigneeUserId)?.name || '负责人'
                      : '未指定负责人'}
                  </div>
                  {conclusion.resolvedAt && (
                    <div className="text-[10px] text-success">
                      ✓ {conclusion.resolvedAt.slice(5, 16).replace('T', ' ')}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowConclusionForm(true)}
                  className="text-xs text-accent-400 hover:text-accent-300 transition-colors"
                >
                  编辑结论
                </button>
              </div>
            ) : showConclusionForm ? (
              <div className="space-y-3">
                <textarea
                  value={conclusionText}
                  onChange={(e) => setConclusionText(e.target.value)}
                  placeholder="记录本页的最终处理意见..."
                  className="w-full h-20 text-sm bg-ink-900/70 border border-ink-600/60 rounded-lg p-2.5 text-ink-100 placeholder:text-ink-500 resize-none focus:outline-none focus:border-accent-400/60"
                />
                <div className="space-y-1">
                  <label className="text-xs text-ink-400">负责人</label>
                  <div className="flex flex-wrap gap-1.5">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setAssigneeId(assigneeId === u.id ? null : u.id)}
                        className={cn(
                          'chip text-[10px] border transition-all',
                          assigneeId === u.id
                            ? 'bg-accent-400/20 text-accent-400 border-accent-400/60'
                            : 'bg-ink-800/50 text-ink-300 border-ink-700/60 hover:border-ink-600/70',
                        )}
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveConclusion}
                    className="btn-primary text-xs py-1.5 flex-1"
                  >
                    保存结论
                  </button>
                  <button
                    onClick={() => {
                      setShowConclusionForm(false);
                      setConclusionText(conclusion?.finalOpinion || '');
                      setAssigneeId(conclusion?.assigneeUserId || null);
                    }}
                    className="btn-ghost text-xs py-1.5 px-3"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConclusionForm(true)}
                className="w-full text-sm text-ink-400 hover:text-ink-200 bg-ink-900/40 border border-dashed border-ink-700/60 rounded-lg p-3 transition-all hover:border-ink-600/70 hover:bg-ink-800/50"
              >
                + 记录会审结论
              </button>
            )}
          </div>
        </div>
      )}

      {/* 页脚统计 */}
      {page && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-ink-700/60 bg-ink-900/40">
          <div className="flex items-center justify-between text-xs">
            <div className="text-ink-300">
              当前：第 <span className="font-mono text-accent-400">{page.pageNumber}</span> 页
            </div>
            <div className="text-ink-300 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-danger" />
                {anns.filter((a) => !a.resolved).length} 待改
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                {anns.filter((a) => a.resolved).length} 解决
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
