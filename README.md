# Debtease Frontend - React Client Application

The Debtease frontend is a modern, responsive React application that provides users with an intuitive interface for managing their debts, tracking financial progress, and receiving AI-powered insights.

## 🎯 Overview

This is the client-side application for Debtease, built with React and TypeScript. It features a beautiful, accessible UI designed for both desktop and mobile users, providing seamless debt management capabilities with real-time AI coaching.

## 🚀 Key Features

- **Modern React Architecture**: Built with React 18, TypeScript, and Vite for optimal performance
- **Responsive Design**: Mobile-first approach with Tailwind CSS and shadcn/ui components
- **Real-time Updates**: WebSocket integration for live debt tracking and notifications
- **Progressive Web App**: Offline capabilities and native app-like experience
- **Accessibility First**: WCAG compliant with keyboard navigation and screen reader support

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context API with custom hooks
- **Routing**: React Router for seamless navigation
- **Testing**: Vitest for unit and integration tests
- **Deployment**: Optimized for Vercel deployment

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm (or yarn/pnpm)
- Git for version control

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Development: http://localhost:5173
   - The app will automatically reload when you make changes

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run test` - Run test suite
- `npm run lint` - Check code for linting errors
- `npm run type-check` - Run TypeScript type checking

## 📂 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, inputs, etc.)
│   ├── auth/            # Authentication components
│   ├── debt/            # Debt management components
│   ├── dashboard/       # Main dashboard components
│   ├── insights/        # AI insights and analytics
│   └── ...
├── pages/               # Main application pages/routes
├── hooks/               # Custom React hooks
├── context/             # React context providers
├── lib/                 # Utility functions and configurations
├── types/               # TypeScript type definitions
└── integrations/        # External service integrations
```

## 🎨 Component Architecture

### Core Components
- **Layout Components**: Navigation, sidebar, header
- **Feature Components**: Debt widgets, payment trackers, AI insights
- **UI Components**: Buttons, forms, modals, charts
- **Utility Components**: Loading states, error boundaries, notifications

### State Management
- **AuthContext**: User authentication state
- **OnboardingContext**: New user setup flow
- **ThemeContext**: Dark/light theme management

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration for code consistency
- Use functional components with hooks
- Implement proper error boundaries

### Component Guidelines
- Keep components small and focused on single responsibilities
- Use custom hooks for reusable logic
- Implement proper loading and error states
- Ensure accessibility with ARIA labels and keyboard navigation

### API Integration
- Use the centralized API client in `src/lib/api.ts`
- Implement proper error handling for all API calls
- Use React Query for server state management
- Handle offline scenarios gracefully

## 🧪 Testing

The project uses Vitest for testing. Key testing areas:
- Component unit tests with React Testing Library
- Hook testing with custom render functions
- Integration tests for critical user flows
- API mocking for reliable test execution

## 🚀 Deployment

### Production Build
```bash
npm run build
```

The build output is optimized for deployment to:
- **Vercel** (recommended)
- **Netlify**
- **Any static hosting service**

### Environment Variables
Create a `.env` file for environment-specific configuration:
```
VITE_API_URL=your_backend_api_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation for API changes
4. Ensure all linting checks pass before submitting PRs

## 📚 Additional Resources

- **[Main Project README](../README.md)** - Overview of the entire Debtease system
- **[Backend Documentation](../server/README.md)** - Server-side architecture and APIs
- **[Component Documentation](./src/components/)** - Detailed component guides
