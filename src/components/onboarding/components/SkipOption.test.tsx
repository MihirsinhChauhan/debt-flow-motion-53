import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SkipOption } from './SkipOption'

describe('SkipOption', () => {
  const defaultProps = {
    onSkip: vi.fn(),
  }

  it('renders default title and description', () => {
    render(<SkipOption {...defaultProps} />)

    expect(screen.getByText('Skip this step')).toBeInTheDocument()
    expect(screen.getByText('You can always add this information later from your dashboard settings.')).toBeInTheDocument()
  })

  it('renders custom title and description', () => {
    const customTitle = 'Custom Skip Title'
    const customDescription = 'Custom description for skipping'

    render(
      <SkipOption
        {...defaultProps}
        title={customTitle}
        description={customDescription}
      />
    )

    expect(screen.getByText(customTitle)).toBeInTheDocument()
    expect(screen.getByText(customDescription)).toBeInTheDocument()
  })

  it('renders default button text', () => {
    render(<SkipOption {...defaultProps} />)

    const button = screen.getByRole('button', { name: /skip for now/i })
    expect(button).toBeInTheDocument()
  })

  it('renders custom button text', () => {
    const customButtonText = 'Skip This Section'

    render(
      <SkipOption
        {...defaultProps}
        buttonText={customButtonText}
      />
    )

    const button = screen.getByRole('button', { name: customButtonText })
    expect(button).toBeInTheDocument()
  })

  it('calls onSkip when button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnSkip = vi.fn()

    render(<SkipOption onSkip={mockOnSkip} />)

    const button = screen.getByRole('button', { name: /skip for now/i })
    await user.click(button)

    expect(mockOnSkip).toHaveBeenCalledTimes(1)
  })

  it('shows loading state when isLoading is true', () => {
    render(<SkipOption {...defaultProps} isLoading={true} />)

    const button = screen.getByRole('button', { name: /skip for now/i })
    expect(button).toBeDisabled()
  })

  it('does not show loading state when isLoading is false', () => {
    render(<SkipOption {...defaultProps} isLoading={false} />)

    const button = screen.getByRole('button', { name: /skip for now/i })
    expect(button).not.toBeDisabled()
  })

  it('applies custom className', () => {
    const customClass = 'custom-skip-class'
    const { container } = render(
      <SkipOption {...defaultProps} className={customClass} />
    )

    expect(container.firstChild).toHaveClass('border-dashed', 'border-muted-foreground/30', 'bg-muted/10', customClass)
  })

  it('has proper accessibility structure', () => {
    render(<SkipOption {...defaultProps} />)

    // Should have info icon
    const infoIcon = document.querySelector('svg') // Info icon from lucide-react
    expect(infoIcon).toBeInTheDocument()

    // Should have proper button with accessible name
    const button = screen.getByRole('button', { name: /skip for now/i })
    expect(button).toBeInTheDocument()
  })

  it('maintains card layout structure', () => {
    render(<SkipOption {...defaultProps} />)

    // Should use Card components
    const card = screen.getByText('Skip this step').closest('.card')
    expect(card).toBeInTheDocument()

    // Should have CardContent
    const content = screen.getByText('Skip this step').parentElement
    expect(content).toHaveClass('card-content')
  })

  it('shows skip forward icon', () => {
    render(<SkipOption {...defaultProps} />)

    // Should have skip forward icon (from lucide-react)
    const icons = document.querySelectorAll('svg')
    const skipIcon = Array.from(icons).find(icon =>
      icon.querySelector('path') // SkipForward icon has specific path
    )
    expect(skipIcon).toBeInTheDocument()
  })

  it('displays information in proper layout', () => {
    render(<SkipOption {...defaultProps} />)

    // Title should be in a heading-like element
    const title = screen.getByText('Skip this step')
    expect(title).toBeInTheDocument()

    // Description should be present
    const description = screen.getByText('You can always add this information later from your dashboard settings.')
    expect(description).toBeInTheDocument()

    // Button should be on the right side
    const button = screen.getByRole('button', { name: /skip for now/i })
    expect(button).toBeInTheDocument()
  })

  it('handles long descriptions gracefully', () => {
    const longDescription = 'This is a very long description that should wrap properly and still maintain good layout and readability within the component structure.'

    render(
      <SkipOption
        {...defaultProps}
        description={longDescription}
      />
    )

    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })

  it('maintains consistent styling across different content lengths', () => {
    const { rerender } = render(<SkipOption {...defaultProps} />)

    // Short content
    expect(screen.getByText('Skip this step')).toBeInTheDocument()

    // Re-render with longer content
    rerender(
      <SkipOption
        {...defaultProps}
        title="Skip this very long and detailed step name"
        description="This is a much longer description that explains in detail what will happen if you skip this step and what you can expect in the future."
      />
    )

    expect(screen.getByText('Skip this very long and detailed step name')).toBeInTheDocument()
  })
})









