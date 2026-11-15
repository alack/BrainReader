import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { BRUSH_WIDTHS, PALETTE, type Stroke } from '@brainreader/shared';

const WIDTH = 800;
const HEIGHT = 600;
const FLUSH_MS = 40; // 이 간격으로 모은 점을 한 조각으로 보낸다
const MAX_POINTS = 64;

type Point = [number, number];

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.width * WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const [first, ...rest] = s.points;
  if (!first) return;
  if (rest.length === 0) {
    ctx.beginPath();
    ctx.arc(first[0] * WIDTH, first[1] * HEIGHT, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(first[0] * WIDTH, first[1] * HEIGHT);
  for (const [x, y] of rest) ctx.lineTo(x * WIDTH, y * HEIGHT);
  ctx.stroke();
}

function clearCanvas(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// strokes는 화면에 그려야 할 전체 목록이다. 이 컴포넌트는 그 목록을 그리기만 하고
// 출제자일 때는 새 획 조각을 onStroke로 넘긴다. 목록 관리와 전송은 부모가 한다.
export function Canvas({
  strokes,
  canDraw,
  onStroke,
  onClear,
}: {
  strokes: Stroke[];
  canDraw: boolean;
  onStroke: (stroke: Stroke) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawn = useRef<{ list: Stroke[]; count: number }>({ list: [], count: 0 });
  const [color, setColor] = useState<Stroke['color']>(PALETTE[0]);
  const [width, setWidth] = useState<number>(BRUSH_WIDTHS[1]);

  // 획 목록이 뒤에 붙기만 했으면 새 것만 그리고, 지워졌거나 통째로 바뀌었으면 처음부터 다시 그린다.
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const prev = drawn.current;
    const appended = strokes.length >= prev.count && prev.list.length > 0 && strokes[0] === prev.list[0];
    if (!appended || prev.count === 0) clearCanvas(ctx);
    const from = appended && prev.count > 0 ? prev.count : 0;
    for (const s of strokes.slice(from)) drawStroke(ctx, s);
    drawn.current = { list: strokes, count: strokes.length };
  }, [strokes]);

  // 그리는 중인 획의 상태. 렌더링과 무관하므로 ref에 둔다.
  const active = useRef<{ id: string; last: Point | null; pending: Point[]; timer: number } | null>(null);

  const flush = () => {
    const a = active.current;
    if (!a || a.pending.length === 0) return;
    const points = a.last ? [a.last, ...a.pending] : a.pending;
    onStroke({ strokeId: a.id, color, width, points });
    a.last = a.pending[a.pending.length - 1]!;
    a.pending = [];
  };

  const toPoint = (e: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    return [clamp((e.clientX - rect.left) / rect.width), clamp((e.clientY - rect.top) / rect.height)];
  };

  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    active.current = { id, last: null, pending: [toPoint(e)], timer: window.setInterval(flush, FLUSH_MS) };
  };

  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    const a = active.current;
    if (!a) return;
    const p = toPoint(e);
    // 보내기 전에 내 화면에는 바로 그려서 끊김 없이 보이게 한다.
    const ctx = ref.current?.getContext('2d');
    const prev = a.pending[a.pending.length - 1] ?? a.last;
    if (ctx && prev) drawStroke(ctx, { strokeId: a.id, color, width, points: [prev, p] });
    a.pending.push(p);
    if (a.pending.length >= MAX_POINTS - 1) flush();
  };

  const up = () => {
    const a = active.current;
    if (!a) return;
    flush();
    window.clearInterval(a.timer);
    active.current = null;
  };

  // 출제자 차례가 끝나면 그리던 획을 정리한다.
  useEffect(() => {
    if (!canDraw) up();
  });

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <canvas
        ref={ref}
        data-testid="canvas"
        width={WIDTH}
        height={HEIGHT}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{
          width: '100%',
          maxWidth: WIDTH,
          aspectRatio: `${WIDTH} / ${HEIGHT}`,
          border: '1px solid #999',
          touchAction: 'none',
          cursor: canDraw ? 'crosshair' : 'default',
          background: '#fff',
        }}
      />
      {canDraw && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {PALETTE.map((c) => (
            <button
              key={c}
              aria-label={c === '#ffffff' ? '지우개' : `색 ${c}`}
              onClick={() => setColor(c)}
              style={{
                width: 28,
                height: 28,
                background: c,
                border: color === c ? '3px solid #333' : '1px solid #999',
              }}
            />
          ))}
          {BRUSH_WIDTHS.map((w) => (
            <button key={w} onClick={() => setWidth(w)} disabled={width === w}>
              {w === BRUSH_WIDTHS[0] ? '가늘게' : w === BRUSH_WIDTHS[1] ? '보통' : '굵게'}
            </button>
          ))}
          <button onClick={onClear}>전체 지우기</button>
        </div>
      )}
    </div>
  );
}
