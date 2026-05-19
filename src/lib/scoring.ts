import { UoMType } from "@prisma/client";

/**
 * Compute progress score based on UoM type
 * Returns a value between 0 and 100 (can exceed 100 for overachievement)
 */
export function computeProgressScore(
  uomType: UoMType,
  target: number | null,
  achievement: number | null,
  targetDate?: Date | null,
  completionDate?: Date | null
): number {
  if (achievement === null || achievement === undefined) return 0;

  switch (uomType) {
    case UoMType.MIN:
      // Higher is better: Achievement / Target * 100
      if (!target || target === 0) return 0;
      return Math.min((achievement / target) * 100, 150); // cap at 150%

    case UoMType.MAX:
      // Lower is better: Target / Achievement * 100
      if (!achievement || achievement === 0) return 100; // achieved 0 when target is 0
      if (!target) return 0;
      return Math.min((target / achievement) * 100, 150);

    case UoMType.TIMELINE:
      // Date-based: compare completion vs deadline
      if (!targetDate || !completionDate) return 0;
      const deadline = new Date(targetDate).getTime();
      const completed = new Date(completionDate).getTime();
      if (completed <= deadline) return 100;
      // Penalise late completion — 1% per day late, min 0
      const daysLate = Math.floor((completed - deadline) / (1000 * 60 * 60 * 24));
      return Math.max(0, 100 - daysLate);

    case UoMType.ZERO:
      // Zero = success
      return achievement === 0 ? 100 : 0;

    default:
      return 0;
  }
}

/**
 * Compute overall goal sheet score (weighted average)
 */
export function computeSheetScore(
  goals: { weightage: number; progressScore: number | null }[]
): number {
  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (totalWeightage === 0) return 0;

  const weightedSum = goals.reduce(
    (sum, g) => sum + g.weightage * (g.progressScore ?? 0),
    0
  );

  return weightedSum / totalWeightage;
}

/**
 * Validate goal sheet weightage rules
 */
export function validateGoalSheet(
  goals: { weightage: number }[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (goals.length > 8) {
    errors.push("Maximum 8 goals allowed per employee.");
  }

  for (const goal of goals) {
    if (goal.weightage < 10) {
      errors.push(`Each goal must have a minimum weightage of 10%.`);
      break;
    }
  }

  const total = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (Math.abs(total - 100) > 0.01) {
    errors.push(`Total weightage must equal 100%. Current total: ${total}%.`);
  }

  return { valid: errors.length === 0, errors };
}

export function formatScore(score: number): string {
  return `${score.toFixed(1)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

export function getScoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-100 text-emerald-800";
  if (score >= 70) return "bg-blue-100 text-blue-800";
  if (score >= 50) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}
