import React from 'react';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { OnboardingFlow } from '@/components/onboarding';

const Onboarding = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
};

export default Onboarding;