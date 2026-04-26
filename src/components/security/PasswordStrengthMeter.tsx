import React from 'react';
import { evaluatePasswordStrength } from '../../utils/passwordStrength';

export const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  const result = evaluatePasswordStrength(password);

  const barColors = ['bg-error-500', 'bg-error-500', 'bg-warning-500', 'bg-secondary-500', 'bg-success-500'];
  const textColors = ['text-error-700', 'text-error-700', 'text-warning-700', 'text-secondary-700', 'text-success-700'];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">Password strength</span>
        <span className={`text-xs font-semibold ${textColors[result.score]}`}>{result.label}</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1.5 rounded-full ${i <= result.score ? barColors[result.score] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <ul className="text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
        <li className={result.checks.minLength ? 'text-success-700' : ''}>8+ characters</li>
        <li className={result.checks.hasUpper ? 'text-success-700' : ''}>Uppercase letter</li>
        <li className={result.checks.hasLower ? 'text-success-700' : ''}>Lowercase letter</li>
        <li className={result.checks.hasNumber ? 'text-success-700' : ''}>Number</li>
        <li className={result.checks.hasSymbol ? 'text-success-700' : ''}>Special character</li>
      </ul>
    </div>
  );
};

