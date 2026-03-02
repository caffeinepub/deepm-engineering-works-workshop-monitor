export function getContainerProgress(stage: string): number {
  const map: Record<string, number> = {
    "Not Started": 0,
    Basement: 20,
    "Door Rear End": 40,
    "Door Front End": 60,
    Sidewall: 80,
    Roofing: 100,
  };
  return map[stage] ?? 0;
}

export function getCabinProgress(stage: string): number {
  const map: Record<string, number> = {
    "Not Started": 0,
    "Cage Angle": 20,
    "Wood Chips": 40,
    "Back Plywood": 60,
    "Aluminium Sheet": 80,
    Soset: 100,
  };
  return map[stage] ?? 0;
}

export function getPaintingProgress(stage: string): number {
  const map: Record<string, number> = {
    "Not Started": 0,
    "Primer Done": 50,
    "Fully Painted": 100,
  };
  return map[stage] ?? 0;
}

export function isDelayed(expectedDate: string, progress: number): boolean {
  if (progress >= 100) return false;
  if (!expectedDate) return false;
  return new Date(expectedDate) < new Date();
}

export function getDaysWaiting(entryDate: string): number {
  const today = new Date();
  const entry = new Date(entryDate);
  const diff = today.getTime() - entry.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
