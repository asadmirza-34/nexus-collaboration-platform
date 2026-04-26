export type PasswordStrength = 'very_weak' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  score: number; // 0..4
  level: PasswordStrength;
  label: string;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (checks.minLength) score += 1;
  if (checks.hasUpper && checks.hasLower) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSymbol) score += 1;

  if (password.length >= 12 && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSymbol) {
    score = 4;
  }

  const levels: PasswordStrength[] = ['very_weak', 'weak', 'fair', 'good', 'strong'];
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const safeScore = Math.max(0, Math.min(4, score));

  return {
    score: safeScore,
    level: levels[safeScore],
    label: labels[safeScore],
    checks,
  };
}

