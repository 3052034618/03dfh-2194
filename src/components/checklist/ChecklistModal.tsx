import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import type { StoryPage, Annotation } from '../../types';
import { TAG_LABELS, TAG_COLORS, ROLE_LABELS, type TagColor } from '../../utils/tagConfig';
import { cn } from '../../utils/idGenerator';
import { useAnnotationStore } from '../../store/useAnnotationStore';
import { ClipboardCheck, Copy, FileDown, Check as CheckIcon, MessageSquare } from 'lucide-react';

interface ChecklistModalProps {
  open: boolean;
  onClose: () => void;
  pages: StoryPage[];
}

type AnnotationWithPage = Annotation & { pageId: string; pageNumber: number };

export const ChecklistModal: React.FC<ChecklistModalProps> = ({ open, onClose, pages }) => {
  const items = useAnnotationStore((s) => s.generateChecklist(
    pages.map((p) => p.id),
    pages.map((p) => ({ id: p.id, pageNumber: p.pageNumber, imageUrl: p.imageUrl })),
  ));
  const resolveAnn = useAnnotationStore((s) => s.resolveAnnotation);
  const exportMd = useAnnotationStore((s) => s.exportChecklistMarkdown);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'by_page' | 'by_role'>('by_page');

  const stats = useMemo(() => {
    const total = items.reduce((acc, i) => acc + i.totalCount, 0);
    const resolved = items.reduce((acc, i) => acc + i.resolvedCount, 0);
    return { total, resolved, pending: total - resolved, pages: items.length };
  }, [items]);

  const handleCopy = async () => {
    const md = exportMd(
      pages.map((p) => p.id),
      pages.map((p) => ({ id: p.id, pageNumber: p.pageNumber, imageUrl: p.imageUrl })),
    );
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const md = exportMd(
      pages.map((p) => p.id),
      pages.map((p) => ({ id: p.id, pageNumber: p.pageNumber, imageUrl: p.imageUrl })),
    );
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `分镜修改清单_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const groupedByRole: { role: string; items: AnnotationWithPage[] }[] = useMemo(() => {
    const map = new Map<string, { role: string; items: AnnotationWithPage[] }>();
    for (const item of items) {
      for (const a of item.annotations) {
        if (!map.has(a.creatorRole)) {
          map.set(a.creatorRole, { role: a.creatorRole, items: [] });
        }
        const withPage: AnnotationWithPage = {
          ...a,
          pageId: item.pageId,
          pageNumber: item.pageNumber,
        };
        map.get(a.creatorRole)!.items.push(withPage);
      }
    }
    return Array.from(map.values());
  }, [items]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-400/20 flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-accent-400" />
          </div>
          <div>
            <div>分镜修改清单</div>
            <div className="text-[11px] text-ink-300 font-normal mt-0.5">
              共 <span className="font-mono text-accent-400">{stats.pages}</span> 页 ·{' '}
              <span className="font-mono text-accent-400">{stats.total}</span> 条问题 · 已解决{' '}
              <span className="font-mono text-success">{stats.resolved}</span> / 待修改{' '}
              <span className="font-mono text-danger">{stats.pending}</span>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex gap-1 p-0.5 rounded-lg bg-ink-900/60 border border-ink-700/60">
            <button
              onClick={() => setView('by_page')}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-all',
                view === 'by_page' ? 'bg-ink-600 text-ink-50' : 'text-ink-300 hover:text-ink-100',
              )}
            >
              按页码分组
            </button>
            <button
              onClick={() => setView('by_role')}
              className={cn(
                'px-3 py-1 rounded-md text-xs transition-all',
                view === 'by_role' ? 'bg-ink-600 text-ink-50' : 'text-ink-300 hover:text-ink-100',
              )}
            >
              按角色分组
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="btn-secondary text-xs py-1.5 flex items-center gap-1.5">
              {copied ? <CheckIcon className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '已复制' : '复制文本'}
            </button>
            <button onClick={handleDownload} className="btn-primary text-xs py-1.5 flex items-center gap-1.5">
              <FileDown className="w-3.5 h-3.5" />
              导出 Markdown
            </button>
          </div>
        </div>
      }
    >
      <div className="p-5">
        {/* 总览进度 */}
        <div className="mb-6 rounded-xl border border-ink-700/60 bg-ink-900/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm section-title">整体进度</div>
            <div className="text-xs text-ink-300">
              {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
            </div>
          </div>
          <div className="h-2 rounded-full bg-ink-800/80 overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-success to-[#5A9A8F] transition-all"
              style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-danger to-[#D97757] transition-all"
              style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-ink-300">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success" /> 已解决 ({stats.resolved})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-danger" /> 待修改 ({stats.pending})
              </span>
            </div>
            <span>生成时间 {new Date().toLocaleString('zh-CN')}</span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-ink-400">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
            暂无修改项，所有分镜都已通过！🎉
          </div>
        ) : view === 'by_page' ? (
          <div className="space-y-4">
            {items.map((item) => {
              const pageInfo = pages.find((p) => p.id === item.pageId);
              return (
                <div
                  key={item.pageId}
                  className="rounded-xl border border-ink-700/60 bg-ink-900/30 overflow-hidden animate-fade-in-up"
                >
                  <div className="flex items-center gap-4 px-4 py-3 border-b border-ink-700/50 bg-ink-800/50">
                    <div className="w-14 flex-shrink-0 aspect-[3/4] rounded overflow-hidden bg-ink-950">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-serif text-lg font-bold text-ink-50">
                          第 {item.pageNumber} 页
                        </span>
                        {pageInfo?.specialMarks.length! > 0 &&
                          pageInfo?.specialMarks.map((m) => (
                            <span
                              key={m}
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded border',
                                m === 'cover'
                                  ? 'bg-accent-400/20 text-accent-400 border-accent-400/40'
                                  : m === 'recollection'
                                  ? 'bg-memory/20 text-memory border-memory/40'
                                  : 'bg-ink-700/60 text-ink-200 border-ink-600/50',
                              )}
                            >
                              {m === 'cover' ? '封面' : m === 'recollection' ? '回忆' : m}
                            </span>
                          ))}
                      </div>
                      <div className="text-xs text-ink-300 flex items-center gap-3">
                        <span>
                          <span className="text-success">{item.resolvedCount}</span> /{' '}
                          <span className="text-ink-100">{item.totalCount}</span> 已解决
                        </span>
                        {item.resolvedCount < item.totalCount && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-danger/20 text-[#F5C7B8] border border-danger/40">
                            {item.totalCount - item.resolvedCount} 项待修改
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-ink-700/40">
                    {item.annotations.map((a, i) => {
                      const c = TAG_COLORS[a.tag];
                      return (
                        <div
                          key={a.id}
                          className={cn(
                            'px-4 py-3 flex items-start gap-3 transition-all',
                            a.resolved && 'opacity-60 bg-success/5',
                          )}
                        >
                          <button
                            onClick={() => resolveAnn(a.id, !a.resolved)}
                            className={cn(
                              'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                              a.resolved
                                ? 'border-success bg-success text-ink-50'
                                : 'border-ink-500 hover:border-accent-400',
                            )}
                          >
                            {a.resolved && <CheckIcon className="w-3 h-3" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono text-[10px] text-accent-400">#{i + 1}</span>
                              <span className={cn('chip border text-[10px]', c.bg, c.text, c.border)}>
                                {TAG_LABELS[a.tag]}
                              </span>
                              <span className="text-[10px] text-ink-300">{ROLE_LABELS[a.creatorRole]}</span>
                            </div>
                            <p className="text-sm text-ink-100 leading-relaxed">{a.description}</p>
                          </div>
                          <div className="text-[10px] text-ink-400 font-mono flex-shrink-0 mt-1">
                            {a.createdAt.slice(5, 16).replace('T', ' ')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-5">
            {groupedByRole.map((g) => (
              <div key={g.role} className="rounded-xl border border-ink-700/60 bg-ink-900/30 overflow-hidden">
                <div className="px-4 py-3 border-b border-ink-700/50 bg-ink-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-accent-400" />
                    <span className="section-title text-sm">{ROLE_LABELS[g.role as keyof typeof ROLE_LABELS]}批注</span>
                  </div>
                  <span className="text-xs text-ink-300 font-mono">{g.items.length} 条</span>
                </div>
                <div className="divide-y divide-ink-700/40">
                  {g.items.map((a: any, i) => {
                    const c = TAG_COLORS[a.tag];
                    return (
                      <div
                        key={a.id}
                        className={cn(
                          'px-4 py-3 flex items-start gap-3',
                          a.resolved && 'opacity-60 bg-success/5',
                        )}
                      >
                        <button
                          onClick={() => resolveAnn(a.id, !a.resolved)}
                          className={cn(
                            'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                            a.resolved
                              ? 'border-success bg-success text-ink-50'
                              : 'border-ink-500 hover:border-accent-400',
                          )}
                        >
                          {a.resolved && <CheckIcon className="w-3 h-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-ink-700/60 text-ink-200 border border-ink-600/50">
                              P.{String(a.pageNumber).padStart(2, '0')}
                            </span>
                            <span className="font-mono text-[10px] text-accent-400">#{i + 1}</span>
                            <span className={cn('chip border text-[10px]', c.bg, c.text, c.border)}>
                              {TAG_LABELS[a.tag]}
                            </span>
                          </div>
                          <p className="text-sm text-ink-100 leading-relaxed">{a.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
