import { PathPattern, Point } from '../types';

// Distance from point P to line segment AB
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

  // Projection scalar t of P onto AB
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

// Find closest point on path and segment index
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

// Format SVG path string from point array
export function pointsToSvgPath(points: Point[]): string {
  if (!points.length) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }
  return d;
}

// 3 Consecutive Target Patterns
export const PATH_PATTERNS: PathPattern[] = [
  {
    id: 1,
    name: 'Zigue-Zague de Arquibancada',
    subtitle: 'Padrão 1 de 3: Tremular Rítmico',
    description: 'Siga a onda inicial da torcida em zigue-zague suave, de um lado ao outro.',
    timeLimit: 8, // 8 seconds
    generatePoints: (w: number, h: number): Point[] => {
      const points: Point[] = [];
      const samples = 180;
      const padX = w * 0.12;
      const padY = h * 0.18;
      const usableW = w - padX * 2;
      const usableH = h - padY * 2;

      // 4-phase horizontal sine wave sweeping from left to right, going downwards
      for (let i = 0; i <= samples; i++) {
        const progress = i / samples; // 0 to 1
        const x = padX + progress * usableW;
        // 3 crests and troughs with slight vertical descent
        const wave = Math.sin(progress * Math.PI * 5);
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
    name: 'Símbolo do Infinito (Oito)',
    subtitle: 'Padrão 2 de 3: Giro de Mastro',
    description: 'O movimento clássico de tremular o mastro: desenhe a curva contínua em formato de 8.',
    timeLimit: 10,
    generatePoints: (w: number, h: number): Point[] => {
      const points: Point[] = [];
      const samples = 220;
      const cx = w * 0.5;
      const cy = h * 0.5;
      const rx = w * 0.36;
      const ry = h * 0.32;

      // Parametric Lemniscate / Figure 8
      // x(t) = cx + rx * sin(t)
      // y(t) = cy + ry * sin(t) * cos(t) = cy + (ry / 2) * sin(2t)
      // Start at left apex (t = -PI/2) and trace full loop back to near start
      for (let i = 0; i <= samples; i++) {
        const u = i / samples; // 0 to 1
        const t = -Math.PI / 2 + u * Math.PI * 2; // from -PI/2 to 3PI/2
        const x = cx + rx * Math.sin(t);
        const y = cy + ry * Math.sin(t) * Math.cos(t) * 1.8;
        points.push({ x, y });
      }
      return points;
    },
    svgPathD: (w: number, h: number): string => {
      return pointsToSvgPath(PATH_PATTERNS[1].generatePoints(w, h));
    },
  },
  {
    id: 3,
    name: 'Grande Bandeirão em Vagalhão',
    subtitle: 'Padrão 3 de 3: Vagalhão Decisivo',
    description: 'Vagalhão de alta amplitude! Mantenha a firmeza do toque nas curvas fechadas.',
    timeLimit: 9,
    generatePoints: (w: number, h: number): Point[] => {
      const points: Point[] = [];
      const samples = 200;
      const padX = w * 0.12;
      const padY = h * 0.15;
      const usableW = w - padX * 2;
      const usableH = h - padY * 2;

      // S-Loop combination: sweeping curve up, loop drop, sweeping curve down to final apex
      for (let i = 0; i <= samples; i++) {
        const t = i / samples; // 0 to 1
        const x = padX + t * usableW;
        // Combination of fundamental and second harmonic to simulate stadium cloth ripple
        const y1 = Math.sin(t * Math.PI * 3.5);
        const y2 = Math.cos(t * Math.PI * 1.5) * 0.3;
        const wave = (y1 + y2) / 1.3;
        const y = padY + usableH * 0.5 + wave * (usableH * 0.4);
        points.push({ x, y });
      }
      return points;
    },
    svgPathD: (w: number, h: number): string => {
      return pointsToSvgPath(PATH_PATTERNS[2].generatePoints(w, h));
    },
  },
];
