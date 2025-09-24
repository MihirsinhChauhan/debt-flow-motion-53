import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { OnboardingCard } from './OnboardingCard'

describe('OnboardingCard', () => {
  const defaultProps = {
    title: 'Test Title',
    children: <div>Test content</div>,
  }

  it('renders title and content correctly', () => {
    render(<OnboardingCard {...defaultProps} />)

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    const description = 'Test description'
    render(<OnboardingCard {...defaultProps} description={description} />)

    expect(screen.getByText(description)).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<OnboardingCard {...defaultProps} />)

    // Should not have any description element
    const card = screen.getByText('Test Title').closest('.card')
    const description = card?.querySelector('.text-muted-foreground')
    expect(description).toBeNull()
  })

  it('applies custom className to root element', () => {
    const customClass = 'custom-card-class'
    const { container } = render(
      <OnboardingCard {...defaultProps} className={customClass} />
    )

    expect(container.firstChild).toHaveClass('w-full', 'max-w-2xl', 'mx-auto', customClass)
  })

  it('applies custom contentClassName to CardContent', () => {
    const contentClass = 'custom-content-class'
    render(<OnboardingCard {...defaultProps} contentClassName={contentClass} />)

    const content = screen.getByText('Test content').parentElement
    expect(content).toHaveClass('px-6', 'pb-6', contentClass)
  })

  it('renders children correctly', () => {
    const complexChildren = (
      <div>
        <h3>Complex Child</h3>
        <p>With multiple elements</p>
        <button>Action Button</button>
      </div>
    )

    render(<OnboardingCard {...defaultProps} children={complexChildren} />)

    expect(screen.getByText('Complex Child')).toBeInTheDocument()
    expect(screen.getByText('With multiple elements')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
  })

  it('has proper accessibility structure', () => {
    render(<OnboardingCard {...defaultProps} />)

    // Should have proper heading structure
    const heading = screen.getByRole('heading', { level: 2, name: 'Test Title' })
    expect(heading).toBeInTheDocument()
  })

  it('maintains card layout structure', () => {
    render(<OnboardingCard {...defaultProps} />)

    // Check that it uses the Card components
    const card = screen.getByText('Test Title').closest('.card')
    expect(card).toBeInTheDocument()

    // Should have CardHeader and CardContent sections
    const header = screen.getByText('Test Title').parentElement?.parentElement
    expect(header).toHaveClass('card-header')

    const content = screen.getByText('Test content').parentElement
    expect(content).toHaveClass('card-content')
  })
})











