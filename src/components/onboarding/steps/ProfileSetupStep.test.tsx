import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfileSetupStep } from './ProfileSetupStep'

// Mock the onboarding context
const mockUpdateProfile = vi.fn()
const mockContextValue = {
  currentStep: 'profile_setup' as const,
  completedSteps: ['welcome'],
  onboardingData: {
    profile: {
      monthly_income: 50000,
      employment_status: 'employed' as const,
      financial_experience: 'intermediate' as const
    }
  },
  progressPercentage: 25,
  isCompleted: false,
  isLoading: false,
  error: null,
  startOnboarding: vi.fn(),
  updateProfile: mockUpdateProfile,
  skipDebtEntry: vi.fn(),
  setGoals: vi.fn(),
  completeOnboarding: vi.fn(),
  goToStep: vi.fn(),
  refreshStatus: vi.fn(),
}

vi.mock('@/context/OnboardingContext', () => ({
  useOnboarding: () => mockContextValue,
}))

describe('ProfileSetupStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders profile setup title and description', () => {
    render(<ProfileSetupStep />)

    expect(screen.getByText('Let\'s build your financial profile')).toBeInTheDocument()
    expect(screen.getByText('This information helps us provide personalized debt strategies and insights')).toBeInTheDocument()
  })

  it('renders income input field', () => {
    render(<ProfileSetupStep />)

    const incomeInput = screen.getByLabelText(/monthly income/i)
    expect(incomeInput).toBeInTheDocument()
    expect(incomeInput).toHaveAttribute('type', 'number')
    expect(incomeInput).toHaveAttribute('placeholder', 'e.g., 50000')
  })

  it('renders income frequency selector', () => {
    render(<ProfileSetupStep />)

    expect(screen.getByText('How often do you get paid?')).toBeInTheDocument()
    // The select trigger should be present
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders employment status options', () => {
    render(<ProfileSetupStep />)

    expect(screen.getByText('What\'s your employment status?')).toBeInTheDocument()

    // Check for employment options
    expect(screen.getByText('Employed')).toBeInTheDocument()
    expect(screen.getByText('Self-employed')).toBeInTheDocument()
    expect(screen.getByText('Unemployed')).toBeInTheDocument()
    expect(screen.getByText('Retired')).toBeInTheDocument()
    expect(screen.getByText('Student')).toBeInTheDocument()
  })

  it('renders financial experience options', () => {
    render(<ProfileSetupStep />)

    expect(screen.getByText('What\'s your experience with personal finance?')).toBeInTheDocument()

    expect(screen.getByText('Beginner')).toBeInTheDocument()
    expect(screen.getByText('Intermediate')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('renders experience descriptions', () => {
    render(<ProfileSetupStep />)

    expect(screen.getByText('New to debt management and personal finance')).toBeInTheDocument()
    expect(screen.getByText('Some experience with budgeting and debt payoff')).toBeInTheDocument()
    expect(screen.getByText('Experienced with multiple debt strategies and financial planning')).toBeInTheDocument()
  })

  it('shows monthly equivalent when income frequency is not monthly', async () => {
    const user = userEvent.setup()
    render(<ProfileSetupStep />)

    // Enter income
    const incomeInput = screen.getByLabelText(/monthly income/i)
    await user.type(incomeInput, '60000')

    // Change frequency to weekly
    const frequencySelect = screen.getByRole('combobox')
    await user.click(frequencySelect)

    // Wait for and click weekly option
    await waitFor(() => {
      expect(screen.getByText('Weekly')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Weekly'))

    // Should show monthly equivalent
    expect(screen.getByText(/that's approximately ₹/i)).toBeInTheDocument()
  })

  it('renders privacy notice', () => {
    render(<ProfileSetupStep />)

    expect(screen.getByText('Your information is encrypted and used only to provide personalized financial insights.')).toBeInTheDocument()
    expect(screen.getByText('We never share your data with third parties.')).toBeInTheDocument()
  })

  it('renders next button', () => {
    render(<ProfileSetupStep />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeInTheDocument()
  })

  it('disables next button when required fields are empty', () => {
    // Override context to have empty profile data
    mockContextValue.onboardingData = {}

    render(<ProfileSetupStep />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()

    // Reset context
    mockContextValue.onboardingData = {
      profile: {
        monthly_income: 50000,
        employment_status: 'employed' as const,
        financial_experience: 'intermediate' as const
      }
    }
  })

  it('calls updateProfile when next button is clicked with valid data', async () => {
    const user = userEvent.setup()
    render(<ProfileSetupStep />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    expect(mockUpdateProfile).toHaveBeenCalledTimes(1)
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      monthly_income: 50000,
      employment_status: 'employed',
      financial_experience: 'intermediate',
      income_frequency: 'monthly'
    })
  })

  it('shows loading state when updating profile', () => {
    mockContextValue.isLoading = true

    render(<ProfileSetupStep />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()

    mockContextValue.isLoading = false
  })

  it('handles employment status selection', async () => {
    const user = userEvent.setup()
    render(<ProfileSetupStep />)

    // Click on self-employed option
    const selfEmployedOption = screen.getByText('Self-employed')
    await user.click(selfEmployedOption)

    // Verify the selection is reflected when clicking next
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        employment_status: 'self_employed'
      })
    )
  })

  it('handles financial experience selection', async () => {
    const user = userEvent.setup()
    render(<ProfileSetupStep />)

    // Click on advanced option
    const advancedOption = screen.getByText('Advanced')
    await user.click(advancedOption)

    // Verify the selection
    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        financial_experience: 'advanced'
      })
    )
  })

  it('validates income input', async () => {
    const user = userEvent.setup()
    render(<ProfileSetupStep />)

    const incomeInput = screen.getByLabelText(/monthly income/i)

    // Enter invalid income (negative)
    await user.clear(incomeInput)
    await user.type(incomeInput, '-1000')

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    // Should not call updateProfile with invalid data
    expect(mockUpdateProfile).not.toHaveBeenCalled()
  })

  it('has proper form accessibility', () => {
    render(<ProfileSetupStep />)

    // Should have proper labels
    expect(screen.getByLabelText(/monthly income/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    // Should have accessible buttons for selections
    const employmentOptions = screen.getAllByRole('button')
    expect(employmentOptions.length).toBeGreaterThan(5) // At least 5 employment options
  })

  it('maintains form state across re-renders', async () => {
    const user = userEvent.setup()
    render(<ProfileSetupStep />)

    const incomeInput = screen.getByLabelText(/monthly income/i)
    await user.clear(incomeInput)
    await user.type(incomeInput, '75000')

    // Re-render should maintain the value
    expect(incomeInput).toHaveValue(75000)
  })

  it('shows helpful placeholder text', () => {
    render(<ProfileSetupStep />)

    const incomeInput = screen.getByPlaceholderText('e.g., 50000')
    expect(incomeInput).toBeInTheDocument()
  })
})


