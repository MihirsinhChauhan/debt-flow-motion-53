import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { OnboardingProvider, useOnboarding } from './OnboardingContext'
import { apiService } from '../lib/api'

// Mock the API service
vi.mock('../lib/api', () => ({
  apiService: {
    getOnboardingStatus: vi.fn(),
    startOnboarding: vi.fn(),
    updateProfile: vi.fn(),
    skipDebtEntry: vi.fn(),
    setGoals: vi.fn(),
    completeOnboarding: vi.fn(),
    getOnboardingAnalytics: vi.fn(),
  },
}))

// Test component that uses the context
function TestComponent() {
  const {
    currentStep,
    completedSteps,
    onboardingData,
    progressPercentage,
    isCompleted,
    isLoading,
    error,
    startOnboarding,
    updateProfile,
    skipDebtEntry,
    setGoals,
    completeOnboarding,
    goToStep,
    refreshStatus,
  } = useOnboarding()

  return (
    <div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="completed-steps">{JSON.stringify(completedSteps)}</div>
      <div data-testid="progress-percentage">{progressPercentage}</div>
      <div data-testid="is-completed">{isCompleted.toString()}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      <div data-testid="onboarding-data">{JSON.stringify(onboardingData)}</div>

      <button onClick={startOnboarding} data-testid="start-onboarding">
        Start Onboarding
      </button>
      <button onClick={() => updateProfile({ monthly_income: 50000, employment_status: 'employed', financial_experience: 'beginner' })} data-testid="update-profile">
        Update Profile
      </button>
      <button onClick={skipDebtEntry} data-testid="skip-debt">
        Skip Debt
      </button>
      <button onClick={() => setGoals({ goal_type: 'debt_freedom', preferred_strategy: 'snowball' })} data-testid="set-goals">
        Set Goals
      </button>
      <button onClick={completeOnboarding} data-testid="complete-onboarding">
        Complete Onboarding
      </button>
      <button onClick={() => goToStep('profile_setup')} data-testid="go-to-step">
        Go to Profile
      </button>
      <button onClick={refreshStatus} data-testid="refresh-status">
        Refresh Status
      </button>
    </div>
  )
}

describe('OnboardingContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock API responses
    apiService.getOnboardingStatus.mockResolvedValue({
      id: null,
      user_id: 'test-user-id',
      current_step: 'welcome',
      completed_steps: [],
      onboarding_data: {},
      is_completed: false,
      progress_percentage: 0,
      started_at: null,
      completed_at: null,
    })

    apiService.startOnboarding.mockResolvedValue({
      id: 'test-onboarding-id',
      user_id: 'test-user-id',
      current_step: 'welcome',
      completed_steps: [],
      onboarding_data: {},
      is_completed: false,
      progress_percentage: 0,
      started_at: '2024-01-01T00:00:00Z',
      completed_at: null,
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('provides default state when no onboarding exists', async () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('welcome')
      expect(screen.getByTestId('completed-steps')).toHaveTextContent('[]')
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('0')
      expect(screen.getByTestId('is-completed')).toHaveTextContent('false')
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      expect(screen.getByTestId('error')).toHaveTextContent('null')
    })
  })

  it('loads onboarding status on mount', async () => {
    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(apiService.getOnboardingStatus).toHaveBeenCalledTimes(1)
    })
  })

  it('handles startOnboarding successfully', async () => {
    const user = userEvent.setup()

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })

    const startButton = screen.getByTestId('start-onboarding')
    await user.click(startButton)

    expect(apiService.startOnboarding).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('welcome')
    })
  })

  it('handles updateProfile successfully', async () => {
    const user = userEvent.setup()

    // Mock successful profile update
    apiService.updateProfile.mockResolvedValue({
      id: 'test-onboarding-id',
      user_id: 'test-user-id',
      current_step: 'profile_setup',
      completed_steps: ['welcome', 'profile_setup'],
      onboarding_data: {
        profile: {
          monthly_income: 50000,
          employment_status: 'employed',
          financial_experience: 'beginner'
        }
      },
      is_completed: false,
      progress_percentage: 50,
      started_at: '2024-01-01T00:00:00Z',
      completed_at: null,
    })

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })

    const updateButton = screen.getByTestId('update-profile')
    await user.click(updateButton)

    expect(apiService.updateProfile).toHaveBeenCalledWith({
      monthly_income: 50000,
      employment_status: 'employed',
      financial_experience: 'beginner'
    })

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('profile_setup')
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('50')
    })
  })

  it('handles skipDebtEntry successfully', async () => {
    const user = userEvent.setup()

    apiService.skipDebtEntry.mockResolvedValue({
      id: 'test-onboarding-id',
      user_id: 'test-user-id',
      current_step: 'goal_setting',
      completed_steps: ['welcome', 'profile_setup', 'debt_collection'],
      onboarding_data: { debts: { skip_debt_entry: true } },
      is_completed: false,
      progress_percentage: 75,
      started_at: '2024-01-01T00:00:00Z',
      completed_at: null,
    })

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })

    const skipButton = screen.getByTestId('skip-debt')
    await user.click(skipButton)

    expect(apiService.skipDebtEntry).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('goal_setting')
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('75')
    })
  })

  it('handles setGoals successfully', async () => {
    const user = userEvent.setup()

    apiService.setGoals.mockResolvedValue({
      id: 'test-onboarding-id',
      user_id: 'test-user-id',
      current_step: 'goal_setting',
      completed_steps: ['welcome', 'profile_setup', 'debt_collection', 'goal_setting'],
      onboarding_data: {
        goals: {
          goal_type: 'debt_freedom',
          preferred_strategy: 'snowball'
        }
      },
      is_completed: false,
      progress_percentage: 100,
      started_at: '2024-01-01T00:00:00Z',
      completed_at: null,
    })

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })

    const goalsButton = screen.getByTestId('set-goals')
    await user.click(goalsButton)

    expect(apiService.setGoals).toHaveBeenCalledWith({
      goal_type: 'debt_freedom',
      preferred_strategy: 'snowball'
    })

    await waitFor(() => {
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('100')
    })
  })

  it('handles completeOnboarding successfully', async () => {
    const user = userEvent.setup()

    apiService.completeOnboarding.mockResolvedValue({
      id: 'test-onboarding-id',
      user_id: 'test-user-id',
      current_step: 'completed',
      completed_steps: ['welcome', 'profile_setup', 'debt_collection', 'goal_setting', 'dashboard_intro'],
      onboarding_data: {},
      is_completed: true,
      progress_percentage: 100,
      started_at: '2024-01-01T00:00:00Z',
      completed_at: '2024-01-01T01:00:00Z',
    })

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })

    const completeButton = screen.getByTestId('complete-onboarding')
    await user.click(completeButton)

    expect(apiService.completeOnboarding).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(screen.getByTestId('is-completed')).toHaveTextContent('true')
      expect(screen.getByTestId('current-step')).toHaveTextContent('completed')
    })
  })

  it('handles goToStep correctly', async () => {
    const user = userEvent.setup()

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })

    const goToStepButton = screen.getByTestId('go-to-step')
    await user.click(goToStepButton)

    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('profile_setup')
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()

    // Mock API error
    apiService.startOnboarding.mockRejectedValue(new Error('Network error'))

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })

    const startButton = screen.getByTestId('start-onboarding')
    await user.click(startButton)

    expect(apiService.startOnboarding).toHaveBeenCalledTimes(1)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error')
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })
  })

  it('shows loading state during API calls', async () => {
    const user = userEvent.setup()

    // Mock slow API response
    apiService.startOnboarding.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        id: 'test-onboarding-id',
        user_id: 'test-user-id',
        current_step: 'welcome',
        completed_steps: [],
        onboarding_data: {},
        is_completed: false,
        progress_percentage: 0,
        started_at: '2024-01-01T00:00:00Z',
        completed_at: null,
      }), 100))
    )

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })

    const startButton = screen.getByTestId('start-onboarding')
    await user.click(startButton)

    // Should show loading immediately
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true')

    // Should hide loading after API completes
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })
  })

  it('handles onboarding status API failure gracefully', async () => {
    // Mock initial status call failure (but not 404)
    apiService.getOnboardingStatus.mockRejectedValue(new Error('Connection failed'))

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Connection failed')
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })
  })

  it('ignores 404 errors from getOnboardingStatus (user hasn\'t started)', async () => {
    // Mock 404 error (user hasn't started onboarding)
    const error404 = new Error('Not found')
    error404.message = '404' // Simulate 404
    apiService.getOnboardingStatus.mockRejectedValue(error404)

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    // Should not show error for 404 (normal for new users)
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('null')
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      // Should maintain default state
      expect(screen.getByTestId('current-step')).toHaveTextContent('welcome')
    })
  })

  it('throws error when useOnboarding is used outside provider', () => {
    // Mock console.error to avoid console output during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useOnboarding must be used within an OnboardingProvider')

    consoleSpy.mockRestore()
  })

  it('maintains state consistency across operations', async () => {
    const user = userEvent.setup()

    // Mock successful operations
    apiService.startOnboarding.mockResolvedValue({
      id: 'test-onboarding-id',
      user_id: 'test-user-id',
      current_step: 'welcome',
      completed_steps: [],
      onboarding_data: {},
      is_completed: false,
      progress_percentage: 0,
      started_at: '2024-01-01T00:00:00Z',
      completed_at: null,
    })

    apiService.updateProfile.mockResolvedValue({
      id: 'test-onboarding-id',
      user_id: 'test-user-id',
      current_step: 'profile_setup',
      completed_steps: ['welcome', 'profile_setup'],
      onboarding_data: { profile: { monthly_income: 50000 } },
      is_completed: false,
      progress_percentage: 50,
      started_at: '2024-01-01T00:00:00Z',
      completed_at: null,
    })

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    })

    // Start onboarding
    await user.click(screen.getByTestId('start-onboarding'))
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('welcome')
    })

    // Update profile
    await user.click(screen.getByTestId('update-profile'))
    await waitFor(() => {
      expect(screen.getByTestId('current-step')).toHaveTextContent('profile_setup')
      expect(screen.getByTestId('progress-percentage')).toHaveTextContent('50')
      expect(screen.getByTestId('completed-steps')).toHaveTextContent('["welcome","profile_setup"]')
    })

    // Verify onboarding data is preserved
    const onboardingData = JSON.parse(screen.getByTestId('onboarding-data').textContent || '{}')
    expect(onboardingData.profile.monthly_income).toBe(50000)
  })
})









