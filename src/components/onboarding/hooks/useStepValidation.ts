import { useState, useCallback } from 'react';
import { OnboardingProfileData, OnboardingGoalData } from '@/types/debt';

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const useStepValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateProfileData = useCallback((data: OnboardingProfileData): ValidationResult => {
    const newErrors: Record<string, string> = {};

    if (!data.monthly_income || data.monthly_income <= 0) {
      newErrors.monthly_income = 'Please enter a valid monthly income';
    }

    if (!data.employment_status) {
      newErrors.employment_status = 'Please select your employment status';
    }

    if (!data.financial_experience) {
      newErrors.financial_experience = 'Please select your financial experience level';
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, []);

  const validateGoalData = useCallback((data: OnboardingGoalData): ValidationResult => {
    const newErrors: Record<string, string> = {};

    if (!data.goal_type) {
      newErrors.goal_type = 'Please select a primary goal';
    }

    if (data.goal_type === 'specific_amount' && (!data.target_amount || data.target_amount <= 0)) {
      newErrors.target_amount = 'Please enter a valid target amount';
    }

    if (!data.preferred_strategy) {
      newErrors.preferred_strategy = 'Please select a repayment strategy';
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateProfileData,
    validateGoalData,
    clearErrors
  };
};













