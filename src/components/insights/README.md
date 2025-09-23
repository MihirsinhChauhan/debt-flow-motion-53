# AI Insights Components

This directory contains the comprehensive AI-powered debt optimization components for the DebtEase application.

## Components Overview

### 1. **RecommendedStrategyCard**
- **Purpose**: Displays the AI-recommended debt repayment strategy
- **Features**:
  - Visual metrics display (time to debt-free, total savings)
  - Progress indicators and benefits breakdown
  - Action buttons for strategy application
- **Props**: `strategy`, `isRecommended`, `totalDebt`, `onApplyStrategy`, `onLearnMore`

### 2. **SimulationControls**
- **Purpose**: Interactive controls for real-time payment scenario simulation
- **Features**:
  - Monthly payment slider with preset buttons
  - Strategy selection (Avalanche/Snowball/Custom)
  - Extra payment input for bonus scenarios
  - Live impact preview with debounced API calls
- **Props**: `currentMonthlyPayment`, `totalDebt`, `minimumPayment`, `onSimulate`, `simulationResults`, `isLoading`

### 3. **StrategyComparisonTable**
- **Purpose**: Side-by-side comparison of Avalanche vs Snowball strategies
- **Features**:
  - Tabbed interface (Overview, Details, Timeline)
  - Detailed metrics comparison with visual indicators
  - Benefits breakdown for each strategy
  - Strategy selection actions
- **Props**: `comparison`, `onSelectStrategy`, `onViewDetails`

### 4. **PaymentTimelineChart**
- **Purpose**: Visual timeline of debt repayment progress using Recharts
- **Features**:
  - Multiple chart types (debt balance, payments, breakdown)
  - Interactive tooltips with detailed information
  - Timeframe filtering (6m, 1y, 2y, 5y, all)
  - Export functionality
- **Props**: `timelineData`, `strategies`, `currentStrategy`, `onTimeframeChange`, `onExport`

### 5. **AlternativeStrategiesSection**
- **Purpose**: Displays additional AI-generated optimization suggestions
- **Features**:
  - Collapsible cards with implementation steps
  - Priority-based sorting and visual indicators
  - Simulation and application actions
  - Impact metrics and warnings for high-impact changes
- **Props**: `suggestions`, `onApplySuggestion`, `onSimulateSuggestion`, `onViewDetails`

### 6. **AIInsightsLoadingState**
- **Purpose**: Comprehensive loading skeleton for the entire insights page
- **Features**:
  - Realistic loading placeholders for all components
  - AI-themed loading indicators
  - Progressive loading states
- **Props**: `className`

## Integration with Backend

The components integrate with the enhanced AI backend endpoints:

- **GET** `/api/ai/insights/enhanced` - Complete AI insights data
- **POST** `/api/ai/simulate` - Real-time payment scenarios
- **GET** `/api/ai/strategies/compare` - Avalanche vs Snowball comparison
- **GET** `/api/ai/timeline` - Month-by-month payment timeline
- **POST** `/api/ai/optimize` - Optimization metrics calculation

## Key Features

### Real-time Simulation
- Debounced API calls (500ms) for performance
- Live parameter adjustment with instant feedback
- Error handling with user-friendly messages

### Interactive Visualizations
- Recharts-based timeline charts with multiple views
- Responsive design for all screen sizes
- Export and sharing capabilities

### Strategy Comparison
- Mathematical vs psychological approach comparison
- Detailed financial impact breakdown
- Clear visual indicators for better strategies

### Mobile Responsiveness
- Grid layouts that adapt to screen size
- Touch-friendly controls and interactions
- Optimized chart rendering for mobile

## Performance Considerations

- **Component Memoization**: Using React.memo for expensive components
- **API Call Optimization**: Debounced simulation requests
- **Chart Performance**: Efficient data transformation and rendering
- **Loading States**: Prevent blocking user interactions
- **Error Boundaries**: Graceful error handling

## Accessibility Features

- **WCAG Compliance**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Descriptive text and labels
- **Color Contrast**: High contrast color scheme
- **Focus Management**: Clear focus indicators

## Usage Example

```tsx
import { AIInsightsPage } from '@/pages/Insights';

// The main insights page automatically handles:
// - Data loading and error states
// - Component orchestration
// - User interactions and feedback
// - Real-time simulations
```

## File Structure

```
src/components/insights/
├── RecommendedStrategyCard.tsx
├── SimulationControls.tsx
├── StrategyComparisonTable.tsx
├── PaymentTimelineChart.tsx
├── AlternativeStrategiesSection.tsx
├── AIInsightsLoadingState.tsx
└── README.md
```

## Dependencies

- **UI Components**: Shadcn/ui components (Card, Button, Slider, etc.)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography
- **Utilities**: Date-fns for date formatting, clsx for conditional classes

## Future Enhancements

- **Advanced Filtering**: More granular timeline filters
- **Custom Strategies**: User-defined repayment strategies
- **Goal Setting**: Integration with user financial goals
- **Predictive Analytics**: ML-powered debt forecasting
- **Social Features**: Strategy sharing and community insights