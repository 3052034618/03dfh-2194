import React, { useRef, useState, useEffect } from 'react';
import type { Annotation, AnnotationRegion, AnnotationTag, UserRole } from '../../types';
import { TAG_COLORS, TAG_LABELS, ROLE_LABELS } from '../../utils/tagConfig';
import { cn } from '../../utils/idGenerator';
import { Circle, Square, Trash2, ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAnnotationStore } from '../../store/useAnnotationStore';

interface DrawingState {
  tool: 'circle' | 'rectangle';
  startX?: number;
  startY?: number;
  currentX?: number;
  currentY?: number;
}

interface AnnotationCanvasProps {
  pageId: string;
  imageUrl: string;
  onClose: () => void;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({ pageId, imageUrl, onClose }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [drawing, setDrawing] = useState<DrawingState | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const annotations = useAnnotationStore((s) => s.getAnnotationsForPage(pageId));
  const addAnnotation = useAnnotationStore((s) => s.addAnnotation);
  const deleteAnnotation = useAnnotationStore((s) => s.deleteAnnotation);
  const resolveAnnotation = useAnnotationStore((s) => s.resolveAnnotation);
  const [selectedAnn, setSelectedAnn] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingRegion, setPendingRegion] = useState<AnnotationRegion | null>(null);
  const [formTag, setFormTag] = useState<AnnotationTag>('unclear_composition');
  const [formDesc, setFormDesc] = useState('');
  const currentUser = useAuthStore((s) => s.currentUser);
  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser.role);

  useEffect(() => {
    setCurrentRole(currentUser.role);
  }, [currentUser.role]);

  const getImgDimensions = () => {
    const img = imgRef.current;
    if (!img) return { w: 0, h: 0, offsetX: 0, offsetY: 0 };
    const rect = img.getBoundingClientRect();
    const wrap = wrapperRef.current?.getBoundingClientRect();
    return {
      w: rect.width,
      h: rect.height,
      offsetX: rect.left - (wrap?.left || 0) - pan.x,
      offsetY: rect.top - (wrap?.top || 0) - pan.y,
    };
  };

  const getRelativePoint = (clientX: number, clientY: number) => {
    const { w, h, offsetX, offsetY } = getImgDimensions();
    const wrap = wrapperRef.current?.getBoundingClientRect();
    if (!wrap || w === 0) return { rx: 0, ry: 0 };
    const rx = ((clientX - wrap.left - offsetX) / w) * 100 * zoom;
    const ry = ((clientY - wrap.top - offsetY) / h) * 100 * zoom;
    return { rx: Math.max(0, Math.min(100, rx)), ry: Math.max(0, Math.min(100, ry)) };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || showForm) return;
    const { rx, ry } = getRelativePoint(e.clientX, e.clientY);
    setDrawing({
      tool: e.shiftKey ? 'rectangle' : 'circle',
      startX: rx,
      startY: ry,
      currentX: rx,
      currentY: ry,
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const { rx, ry } = getRelativePoint(e.clientX, e.clientY);
    setDrawing({ ...drawing, currentX: rx, currentY: ry });
  };

  const onMouseUp = () => {
    if (!drawing || drawing.startX === undefined || drawing.currentX === undefined) return;
    const sx = Math.min(drawing.startX, drawing.currentX);
    const ex = Math.max(drawing.startX, drawing.currentX);
    const sy = Math.min(drawing.startY!, drawing.currentY!);
    const ey = Math.max(drawing.startY!, drawing.currentY!);
    const w = ex - sx;
    const h = ey - sy;
    // 太小忽略
    if (w < 3 || h < 3) {
      setDrawing(null);
      return;
    }
    const region: AnnotationRegion =
      drawing.tool === 'circle'
        ? {
            type: 'circle',
            x: (sx + ex) / 2,
            y: (sy + ey) / 2,
            radius: Math.max(w, h) / 2,
          }
        : { type: 'rectangle', x: sx, y: sy, width: w, height: h };
    setPendingRegion(region);
    setShowForm(true);
    setDrawing(null);
  };

  const handleSubmit = () => {
    if (!pendingRegion) return;
    if (!formDesc.trim()) return;
    addAnnotation(pageId, {
      tag: formTag,
      description: formDesc.trim(),
      region: pendingRegion,
      createdBy: currentUser.id,
      creatorRole: currentRole,
    });
    setShowForm(false);
    setPendingRegion(null);
    setFormDesc('');
    setFormTag('unclear_composition');
  };

  const tagList: AnnotationTag[] = [
    'unclear_composition',
    'dialog_obstruction',
    'fast_pacing',
    'layout_issue',
    'text_error',
    'art_style',
    'continuity',
    'other',
  ];

  const renderRegion = (region: AnnotationRegion, color: string, key: string, label?: React.ReactNode) => {
    if (region.type === 'circle') {
      const r = region.radius || 10;
      return (
        <g key={key}>
          <circle
            cx={`${region.x}%`}
            cy={`${region.y}%`}
            r={`${r}%`}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="annotation-circle"
            vectorEffect="non-scaling-stroke"
          />
          <circle
            cx={`${region.x + r * Math.cos(Math.PI / 4)}%`}
            cy={`${region.y + r * Math.sin(Math.PI / 4)}%`}
            r={3.5}
            fill={color}
          />
          {label}
        </g>
      );
    }
    return (
      <g key={key}>
        <rect
          x={`${region.x}%`}
          y={`${region.y}%`}
          width={`${region.width}%`}
          height={`${region.height}%`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray="6 4"
          className="annotation-circle"
          vectorEffect="non-scaling-stroke"
          rx="3"
        />
        <circle
          cx={`${region.x + (region.width || 0)}%`}
          cy={`${region.y}%`}
          r={3.5}
          fill={color}
        />
        {label}
      </g>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-ink-950/60">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-ink-700/60 bg-ink-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-ink-900/70 border border-ink-700/60">
            <span className="text-xs text-ink-300 px-2">工具：</span>
            <button
              onClick={() => setDrawing(null)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs flex items-center gap-1 transition-all',
                !drawing || drawing.tool === 'circle'
                  ? 'bg-ink-600 text-ink-50'
                  : 'text-ink-300 hover:bg-ink-700',
              )}
              title="圈选（默认）"
            >
              <Circle className="w-3.5 h-3.5" /> 圆形
            </button>
            <button
              onClick={() => setDrawing({ tool: 'rectangle' })}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs flex items-center gap-1 transition-all',
                drawing?.tool === 'rectangle' ? 'bg-ink-600 text-ink-50' : 'text-ink-300 hover:bg-ink-700',
              )}
              title="矩形选区（Shift + 拖拽）"
            >
              <Square className="w-3.5 h-3.5" /> 矩形
            </button>
          </div>

          <div className="h-5 w-px bg-ink-700/60" />

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-ink-900/70 border border-ink-700/60">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
              className="p-1.5 rounded-md text-ink-200 hover:bg-ink-700/80 transition-all"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-ink-200 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1.5 rounded-md text-ink-200 hover:bg-ink-700/80 transition-all"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded-md text-ink-200 hover:bg-ink-700/80 transition-all"
              title="重置缩放"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-ink-400">
            在图片上 <span className="text-accent-400">拖拽</span> 圈出问题区域（按住 Shift 切矩形）
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 角色切换（模拟不同身份批注） */}
          <div className="text-xs text-ink-300 mr-1">批注身份:</div>
          {(['editor', 'art_supervisor', 'text_editor', 'author'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setCurrentRole(r)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[11px] border transition-all',
                currentRole === r
                  ? 'border-accent-400 bg-accent-400/20 text-accent-400'
                  : 'border-ink-700/60 text-ink-300 hover:border-ink-600/80',
              )}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
          <button onClick={onClose} className="btn-secondary text-xs py-1.5 px-3">
            返回
          </button>
        </div>
      </div>

      {/* 画布 */}
      <div
        ref={wrapperRef}
        className="flex-1 relative overflow-auto select-none flex items-center justify-center p-6 cursor-crosshair"
        onWheel={(e) => {
          if (e.ctrlKey) {
            e.preventDefault();
            setZoom((z) => Math.max(0.5, Math.min(2.5, z + (e.deltaY > 0 ? -0.15 : 0.15))));
          }
        }}
      >
        <div
          className="relative shadow-soft rounded-sm overflow-hidden"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
          }}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="分镜页"
            className="block max-h-[70vh] w-auto"
            draggable={false}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {/* 已有批注 */}
            {annotations.map((a, i) => (
              <g
                key={a.id}
                className="pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnn(a.id);
                }}
              >
                {renderRegion(
                  a.region,
                  selectedAnn === a.id ? '#fff' : TAG_COLORS[a.tag].stroke,
                  a.id,
                  <g>
                    <foreignObject
                      x={`${a.region.type === 'circle'
                        ? Math.max(0, (a.region.x || 0) + (a.region.radius || 0) * 0.7)
                        : Math.max(0, (a.region.x || 0) + (a.region.width || 0))}%`}
                      y={`${a.region.type === 'circle'
                        ? Math.max(0, (a.region.y || 0) - (a.region.radius || 0) * 0.7)
                        : Math.max(0, (a.region.y || 0) - 4)}%`}
                      width="10"
                      height="5"
                    >
                      <div
                        className={cn(
                          'text-[9px] whitespace-nowrap px-1 rounded font-bold font-mono',
                          a.resolved ? 'bg-success/90 text-ink-50' : 'bg-accent-400 text-ink-50',
                        )}
                        style={{ display: 'inline-block' }}
                      >
                        #{i + 1}
                      </div>
                    </foreignObject>
                  </g>,
                )}
                {a.resolved && (
                  <foreignObject
                    x={`${(a.region.x || 0) - 1}%`}
                    y={`${(a.region.y || 0) - 2}%`}
                    width="3"
                    height="3"
                  >
                    <div className="bg-success rounded-full w-4 h-4 flex items-center justify-center text-ink-50">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  </foreignObject>
                )}
              </g>
            ))}

            {/* 正在绘制 */}
            {drawing && drawing.startX !== undefined && drawing.currentX !== undefined && (
              <>
                {drawing.tool === 'circle'
                  ? (() => {
                      const sx = Math.min(drawing.startX, drawing.currentX);
                      const ex = Math.max(drawing.startX, drawing.currentX);
                      const sy = Math.min(drawing.startY!, drawing.currentY!);
                      const ey = Math.max(drawing.startY!, drawing.currentY!);
                      const cx = (sx + ex) / 2;
                      const cy = (sy + ey) / 2;
                      const r = Math.max(ex - sx, ey - sy) / 2;
                      return (
                        <circle
                          cx={`${cx}%`}
                          cy={`${cy}%`}
                          r={`${r}%`}
                          fill="rgba(217,119,87,0.08)"
                          stroke="#D97757"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    })()
                  : (() => {
                      const sx = Math.min(drawing.startX, drawing.currentX);
                      const ex = Math.max(drawing.startX, drawing.currentX);
                      const sy = Math.min(drawing.startY!, drawing.currentY!);
                      const ey = Math.max(drawing.startY!, drawing.currentY!);
                      return (
                        <rect
                          x={`${sx}%`}
                          y={`${sy}%`}
                          width={`${ex - sx}%`}
                          height={`${ey - sy}%`}
                          fill="rgba(217,119,87,0.08)"
                          stroke="#D97757"
                          strokeWidth="2.5"
                          strokeDasharray="6 4"
                          vectorEffect="non-scaling-stroke"
                          rx="3"
                        />
                      );
                    })()}
              </>
            )}

            {/* 待确认区域 */}
            {pendingRegion &&
              renderRegion(pendingRegion, '#fff', 'pending', null)}
          </svg>
        </div>
      </div>

      {/* 批注列表 & 表单 */}
      <div className="flex-shrink-0 h-64 border-t border-ink-700/60 bg-ink-850 flex">
        {/* 批注列表 */}
        <div className="flex-1 overflow-auto p-4 border-r border-ink-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm section-title">批注列表（{annotations.length}）</div>
          </div>
          {annotations.length === 0 ? (
            <div className="text-sm text-ink-400 text-center py-8">暂无批注，在图片上拖拽圈出问题区域以添加</div>
          ) : (
            <div className="space-y-2">
              {annotations.map((a, i) => {
                const active = selectedAnn === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAnn(a.id)}
                    className={cn(
                      'rounded-lg p-3 border transition-all cursor-pointer',
                      active
                        ? 'border-accent-400/60 bg-accent-400/5 shadow-[0_0_15px_rgba(217,119,87,0.15)]'
                        : 'border-ink-700/60 bg-ink-900/40 hover:border-ink-600/70 hover:bg-ink-800/50',
                      a.resolved && 'opacity-70',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-accent-400">#{i + 1}</span>
                        <span
                          className={cn(
                            'chip border text-[10px]',
                            TAG_COLORS[a.tag].bg,
                            TAG_COLORS[a.tag].text,
                            TAG_COLORS[a.tag].border,
                          )}
                        >
                          {TAG_LABELS[a.tag]}
                        </span>
                        <span className="text-[10px] text-ink-300">{ROLE_LABELS[a.creatorRole]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveAnnotation(a.id, !a.resolved);
                          }}
                          className={cn(
                            'p-1 rounded transition-all',
                            a.resolved
                              ? 'bg-success/30 text-success'
                              : 'text-ink-300 hover:bg-success/20 hover:text-success',
                          )}
                          title={a.resolved ? '标记为未解决' : '标记为已解决'}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAnnotation(a.id);
                            if (selectedAnn === a.id) setSelectedAnn(null);
                          }}
                          className="p-1 rounded text-ink-300 hover:bg-danger/20 hover:text-danger transition-all"
                          title="删除批注"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-ink-100 leading-relaxed">{a.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 添加表单 */}
        <div className="w-[380px] flex-shrink-0 p-4">
          {showForm && pendingRegion ? (
            <div className="h-full flex flex-col">
              <div className="text-sm section-title mb-3 flex items-center justify-between">
                <span>新建批注</span>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setPendingRegion(null);
                  }}
                  className="p-1 rounded text-ink-300 hover:bg-ink-700/70"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mb-3">
                <label className="text-xs text-ink-300 mb-1.5 block">问题类型</label>
                <div className="flex flex-wrap gap-1.5">
                  {tagList.map((t) => {
                    const active = formTag === t;
                    const c = TAG_COLORS[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setFormTag(t)}
                        className={cn(
                          'chip border text-[11px] transition-all',
                          active
                            ? `${c.bg} ${c.text} ${c.border} ring-1 ring-offset-1 ring-offset-ink-850 shadow-[0_0_12px_var(--tw-shadow-color)]`
                            : 'border-ink-700/60 text-ink-200 hover:border-ink-600/80 bg-ink-900/30',
                        )}
                        style={active ? { boxShadow: `0 0 12px ${c.stroke}40` } : undefined}
                      >
                        {TAG_LABELS[t]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-xs text-ink-300 mb-1.5 block">修改说明</label>
                <textarea
                  autoFocus
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
                  }}
                  placeholder="描述问题和修改建议..."
                  rows={4}
                  className="input-field resize-none text-sm"
                />
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="text-[10px] text-ink-400">
                  以 <span className="text-accent-400">{ROLE_LABELS[currentRole]}</span> 身份提交
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setPendingRegion(null);
                      setFormDesc('');
                    }}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!formDesc.trim()}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    提交批注 (Ctrl+Enter)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-ink-700/50 flex items-center justify-center mb-3">
                <Circle className="w-7 h-7 text-ink-400" />
              </div>
              <div className="text-sm text-ink-200 mb-1">在左侧图片上拖拽</div>
              <div className="text-xs text-ink-400 leading-relaxed max-w-[260px]">
                用鼠标在图片上圈出有问题的区域，系统会弹出表单让你选择标签并填写修改说明。
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
