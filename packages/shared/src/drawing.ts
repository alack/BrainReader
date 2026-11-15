import { z } from 'zod';

// 흰색은 지우개로 쓴다. 전체 지우기는 따로 있다 (2017년에는 흰색이 곧 전체 지우기였다, REVIEW C8).
export const PALETTE = [
  '#111111',
  '#e53935',
  '#fb8c00',
  '#fdd835',
  '#43a047',
  '#1e88e5',
  '#8e24aa',
  '#8d6e63',
  '#9e9e9e',
  '#ffffff',
] as const;

export const BRUSH_WIDTHS = [0.004, 0.01, 0.025] as const;

// 획 한 조각. 좌표는 캔버스 크기에 대한 비율(0~1)이라 화면 크기가 달라도 같은 그림이 된다.
// 한 획을 그리는 동안 일정 간격으로 조각을 보내고, 다음 조각의 첫 점은 앞 조각의 마지막 점이다.
export const strokeSchema = z.object({
  strokeId: z.string().min(1).max(40),
  color: z.enum(PALETTE),
  width: z.number().min(0.002).max(0.05),
  points: z
    .array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]))
    .min(1)
    .max(64),
});

export type Stroke = z.infer<typeof strokeSchema>;
