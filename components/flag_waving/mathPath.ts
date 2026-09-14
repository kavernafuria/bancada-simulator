import { PathPattern, Point } from './types';

export function pointToSegmentDistance(
  p: Point,
  a: Point,
  b: Point
): { distance: number; projection: Point; t: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const dist = Math.hypot(p.x - a.x, p.y - a.y);
    return { distance: dist, projection: { ...a }, t: 0 };
  }

  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  const dist = Math.hypot(p.x - projX, p.y - projY);

  return {
    distance: dist,
    projection: { x: projX, y: projY },
    t,
  };
}

export function findClosestPointOnPath(
  p: Point,
  points: Point[]
): {
  minDistance: number;
  closestPoint: Point;
  segmentIndex: number;
  normalizedProgress: number;
} {
  let minDistance = Infinity;
  let closestPoint: Point = points[0] || { x: 0, y: 0 };
  let bestSegIndex = 0;
  let bestT = 0;

  const totalSegments = points.length - 1;
  if (totalSegments <= 0) {
    return { minDistance: 0, closestPoint, segmentIndex: 0, normalizedProgress: 0 };
  }

  for (let i = 0; i < totalSegments; i++) {
    const a = points[i];
    const b = points[i + 1];
    const res = pointToSegmentDistance(p, a, b);
    if (res.distance < minDistance) {
      minDistance = res.distance;
      closestPoint = res.projection;
      bestSegIndex = i;
      bestT = res.t;
    }
  }

  const normalizedProgress = (bestSegIndex + bestT) / totalSegments;

  return {
    minDistance,
    closestPoint,
    segmentIndex: bestSegIndex,
    normalizedProgress,
  };
}

export function pointsToSvgPath(points: Point[]): string {
  if (!points.length) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }
  return d;
}

export const PATH_PATTERNS: PathPattern[] = [
  {
    id: 1,
    name: 'Onda da Ruada',
    subtitle: 'Etapa 1 de 2: Tremular Rítmico de Entrada',
    description: 'Siga a onda inicial do corredor de fumaça, conduzindo o bandeirão de um lado ao outro da avenida.',
    timeLimit: 8,
    generatePoints: (w: number, h: number): Point[] => {
      const points: Point[] = [];
      const samples = 180;
      const padX = w * 0.12;
      const padY = h * 0.18;
      const usableW = w - padX * 2;
      const usableH = h - padY * 2;

      for (let i = 0; i <= samples; i++) {
        const progress = i / samples;
        const x = padX + progress * usableW;
        const wave = Math.sin(progress * Math.PI * 4);
        const y = padY + usableH * 0.5 + wave * (usableH * 0.38);
        points.push({ x, y });
      }
      return points;
    },
    svgPathD: (w: number, h: number): string => {
      return pointsToSvgPath(PATH_PATTERNS[0].generatePoints(w, h));
    },
  },
  {
    id: 2,
    name: 'Vagalhão de Fogo & Curva Cega',
    subtitle: 'Etapa 2 de 2: Apogeu da Ruada (DIFÍCIL)',
    description: 'O ônibus do time aponta na curva! Mantém o mastro firme e faça o contorno rápido sob fumaça densa!',
    timeLimit: 7,
    generatePoints: (w: number, h: number): Point[] => {
      const points: Point[] = [];
      const samples = 220;
      const padX = w * 0.10;
      const padY = h * 0.14;
      const usableW = w - padX * 2;
      const usableH = h - padY * 2;

      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const x = padX + t * usableW;
        // High frequency double-wave with sharp sinusoidal amplitude changes for high difficulty
        const waveMain = Math.sin(t * Math.PI * 7);
        const waveAccent = Math.cos(t * Math.PI * 3.5) * 0.45;
        const waveCombined = (waveMain + waveAccent) / 1.35;
        const y = padY + usableH * 0.5 + waveCombined * (usableH * 0.42);
        points.push({ x, y });
      }
      return points;
    },
    svgPathD: (w: number, h: number): string => {
      return pointsToSvgPath(PATH_PATTERNS[1].generatePoints(w, h));
    },
  },
];
