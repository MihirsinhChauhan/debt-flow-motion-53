import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WelcomeStep } from './WelcomeStep'
import { OnboardingProvider } from '@/context/OnboardingContext'

// Mock the onboarding context
const mockStartOnboarding = vi.fn()
const mockContextValue = {
  currentStep: 'welcome' as const,
  completedSteps: [],
  onboardingData: {},
  progressPercentage: 0,
  isCompleted: false,
  isLoading: false,
  error: null,
  startOnboarding: mockStartOnboarding,
  updateProfile: vi.fn(),
  skipDebtEntry: vi.fn(),
  setGoals: vi.fn(),
  completeOnboarding: vi.fn(),
  goToStep: vi.fn(),
  refreshStatus: vi.fn(),
}

vi.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => mockContextValue,
  OnboardingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('WelcomeStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders welcome title and description', () => {
    render(<WelcomeStep />)

    expect(screen.getByText('Welcome to DebtEase')).toBeInTheDocument()
    expect(screen.getByText('Your AI-powered companion for debt management and financial freedom')).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    render(<WelcomeStep />)

    expect(screen.getByText('Personalized Debt Strategy')).toBeInTheDocument()
    expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
    expect(screen.getByText('Secure & Private')).toBeInTheDocument()
    expect(screen.getByText('Smart AI Assistant')).toBeInTheDocument()
  })

  it('renders feature descriptions', () => {
    render(<WelcomeStep />)

    expect(screen.getByText('Get AI-powered recommendations tailored to your financial situation')).toBeInTheDocument()
    expect(screen.getByText('Monitor your debt payoff journey with detailed analytics and insights')).toBeInTheDocument()
    expect(screen.getByText('Your financial data is encrypted and never shared with third parties')).toBeInTheDocument()
    expect(screen.getByText('Receive intelligent suggestions to optimize your debt repayment plan')).toBeInTheDocument()
  })

  it('renders feature icons', () => {
    render(<WelcomeStep />)

    // Check for emoji icons (they're rendered as text)
    expect(screen.getByText('🎯')).toBeInTheDocument()
    expect(screen.getByText('📊')).toBeInTheDocument()
    expect(screen.getByText('🔒')).toBeInTheDocument()
    expect(screen.getByText('🤖')).toBeInTheDocument()
  })

  it('renders what you will get section', () => {
    render(<WelcomeStep />)

    expect(screen.getByText('What you\'ll get with DebtEase:')).toBeInTheDocument()
    expect(screen.getByText('Get personalized payoff strategies (Snowball vs Avalanche)')).toBeInTheDocument()
    expect(screen.getByText('Track interest savings and payoff timelines')).toBeInTheDocument()
    expect(screen.getByText('Receive AI-powered debt optimization suggestions')).toBeInTheDocument()
  })

  it('renders data collection info', () => {
    render(<WelcomeStep />)

    expect(screen.getByText('What we\'ll need:')).toBeInTheDocument()
    expect(screen.getByText('• Your monthly income and employment details')).toBeInTheDocument()
    expect(screen.getByText('• Information about your debts (optional to skip)')).toBeInTheDocument()
    expect(screen.getByText('• Your financial goals and preferred strategies')).toBeInTheDocument()
  })

  it('renders get started button', () => {
    render(<WelcomeStep />)

    const button = screen.getByRole('button', { name: /get started/i })
    expect(button).toBeInTheDocument()
  })

  it('calls startOnboarding when get started button is clicked', async () => {
    const user = userEvent.setup()
    render(<WelcomeStep />)

    const button = screen.getByRole('button', { name: /get started/i })
    await user.click(button)

    expect(mockStartOnboarding).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when onboarding is starting', () => {
    // Mock loading state
    mockContextValue.isLoading = true

    render(<WelcomeStep />)

    const button = screen.getByRole('button', { name: /get started/i })
    expect(button).toBeDisabled()

    // Reset for other tests
    mockContextValue.isLoading = false
  })

  it('has proper accessibility structure', () => {
    render(<WelcomeStep />)

    // Should have proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 2, name: 'Welcome to DebtEase' })
    expect(mainHeading).toBeInTheDocument()

    // Should have accessible button
    const button = screen.getByRole('button', { name: /get started/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
  })

  it('maintains proper layout structure', () => {
    render(<WelcomeStep />)

    // Should use OnboardingCard component
    const card = screen.getByText('Welcome to DebtEase').closest('.card')
    expect(card).toBeInTheDocument()

    // Should have proper content sections
    expect(screen.getByText('What we\'ll need:')).toBeInTheDocument()
    expect(screen.getByText('What you\'ll get with DebtEase:')).toBeInTheDocument()
  })

  it('renders privacy information', () => {
    render(<WelcomeStep />)

    expect(screen.getByText('Your AI-powered companion for debt management and financial freedom')).toBeInTheDocument()
  })

  it('has responsive design considerations', () => {
    render(<WelcomeStep />)

    // Should use responsive grid classes
    const featureGrid = screen.getByText('Personalized Debt Strategy').closest('.grid')
    expect(featureGrid).toHaveClass('sm:grid-cols-2')
  })

  it('handles long feature descriptions', () => {
    // This test verifies the component can handle content of various lengths
    render(<WelcomeStep />)

    // All feature descriptions should be visible
    const descriptions = [
      'Get AI-powered recommendations tailored to your financial situation',
      'Monitor your debt payoff journey with detailed analytics and insights',
      'Your financial data is encrypted and never shared with third parties',
      'Receive intelligent suggestions to optimize your debt repayment plan'
    ]

    descriptions.forEach(desc => {
      expect(screen.getByText(desc)).toBeInTheDocument()
    })
  })
})








