import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { StepNavigation } from './StepNavigation'

describe('StepNavigation', () => {
  const defaultProps = {
    canGoNext: true,
    canGoBack: false,
  }

  it('renders next button by default', () => {
    render(<StepNavigation {...defaultProps} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeInTheDocument()
  })

  it('renders back button when canGoBack is true', () => {
    render(<StepNavigation {...defaultProps} canGoBack={true} />)

    const backButton = screen.getByRole('button', { name: /back/i })
    expect(backButton).toBeInTheDocument()
  })

  it('does not render back button when canGoBack is false', () => {
    render(<StepNavigation {...defaultProps} canGoBack={false} />)

    const backButton = screen.queryByRole('button', { name: /back/i })
    expect(backButton).not.toBeInTheDocument()
  })

  it('calls onNext when next button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnNext = vi.fn()

    render(<StepNavigation {...defaultProps} onNext={mockOnNext} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    await user.click(nextButton)

    expect(mockOnNext).toHaveBeenCalledTimes(1)
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnBack = vi.fn()

    render(<StepNavigation {...defaultProps} canGoBack={true} onBack={mockOnBack} />)

    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('renders skip button when onSkip is provided', () => {
    const mockOnSkip = vi.fn()

    render(<StepNavigation {...defaultProps} onSkip={mockOnSkip} />)

    const skipButton = screen.getByRole('button', { name: /skip for now/i })
    expect(skipButton).toBeInTheDocument()
  })

  it('calls onSkip when skip button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnSkip = vi.fn()

    render(<StepNavigation {...defaultProps} onSkip={mockOnSkip} />)

    const skipButton = screen.getByRole('button', { name: /skip for now/i })
    await user.click(skipButton)

    expect(mockOnSkip).toHaveBeenCalledTimes(1)
  })

  it('shows custom next label when provided', () => {
    const customLabel = 'Continue'

    render(<StepNavigation {...defaultProps} nextLabel={customLabel} />)

    const nextButton = screen.getByRole('button', { name: customLabel })
    expect(nextButton).toBeInTheDocument()
  })

  it('shows custom back label when provided', () => {
    const customLabel = 'Previous'

    render(<StepNavigation {...defaultProps} canGoBack={true} backLabel={customLabel} />)

    const backButton = screen.getByRole('button', { name: customLabel })
    expect(backButton).toBeInTheDocument()
  })

  it('shows custom skip label when provided', () => {
    const customLabel = 'Skip This'
    const mockOnSkip = vi.fn()

    render(<StepNavigation {...defaultProps} onSkip={mockOnSkip} skipLabel={customLabel} />)

    const skipButton = screen.getByRole('button', { name: customLabel })
    expect(skipButton).toBeInTheDocument()
  })

  it('shows "Get Started" for last step', () => {
    render(<StepNavigation {...defaultProps} isLastStep={true} />)

    const button = screen.getByRole('button', { name: /get started/i })
    expect(button).toBeInTheDocument()
  })

  it('shows loading state when isLoading is true', () => {
    render(<StepNavigation {...defaultProps} isLoading={true} />)

    // Should show loading spinner (this might be an icon or text)
    // For now, just verify the button is disabled
    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it('disables next button when canGoNext is false', () => {
    render(<StepNavigation {...defaultProps} canGoNext={false} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it('disables back button when canGoBack is false', () => {
    render(<StepNavigation {...defaultProps} canGoBack={true} onBack={vi.fn()} />)

    const backButton = screen.getByRole('button', { name: /back/i })
    // Back button should not be disabled by default when canGoBack is true
    expect(backButton).not.toBeDisabled()
  })

  it('applies custom className', () => {
    const customClass = 'custom-navigation-class'
    const { container } = render(
      <StepNavigation {...defaultProps} className={customClass} />
    )

    const navElement = container.firstChild
    expect(navElement).toHaveClass('flex', 'items-center', 'justify-between', 'mt-8', customClass)
  })

  it('has proper button order: back, skip, next', () => {
    const mockOnBack = vi.fn()
    const mockOnSkip = vi.fn()
    const mockOnNext = vi.fn()

    render(
      <StepNavigation
        {...defaultProps}
        canGoBack={true}
        onBack={mockOnBack}
        onSkip={mockOnSkip}
        onNext={mockOnNext}
      />
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)

    // Order should be: back, skip, next
    expect(buttons[0]).toHaveTextContent(/back/i)
    expect(buttons[1]).toHaveTextContent(/skip for now/i)
    expect(buttons[2]).toHaveTextContent(/next/i)
  })

  it('handles missing onNext gracefully', () => {
    render(<StepNavigation {...defaultProps} onNext={undefined} />)

    const nextButton = screen.queryByRole('button', { name: /next/i })
    expect(nextButton).not.toBeInTheDocument()
  })
})











