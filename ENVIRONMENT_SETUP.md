# DebtEase Frontend Environment Configuration

This guide explains how to easily switch between local development and production environments for the DebtEase frontend.

## 🚀 Quick Start

### Option 1: Using NPM Scripts (Recommended)

```bash
# Local Development (connects to http://localhost:8000)
npm run dev:local

# Staging Environment (connects to production server with debug enabled)
npm run dev:staging

# Production Environment (connects to production server)
npm run dev:prod
```

### Option 2: Using Environment Files

The project automatically loads environment variables based on Vite's mode:

- **Development**: `.env.development` (local backend)
- **Staging**: `.env.staging` (prod backend, debug enabled)
- **Production**: `.env.production` (prod backend, optimized)

## 📁 Environment Files

### `.env.development` (Local Development)
```env
VITE_APP_ENV=development
VITE_API_BASE_URL=http://localhost:8000
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=DebtEase (Local)
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### `.env.staging` (Staging)
```env
VITE_APP_ENV=staging
VITE_API_BASE_URL=https://debtease-server.onrender.com
VITE_API_URL=https://debtease-server.onrender.com/api
VITE_APP_NAME=DebtEase (Staging)
VITE_DEBUG=true
VITE_LOG_LEVEL=info
```

### `.env.production` (Production)
```env
VITE_APP_ENV=production
VITE_API_BASE_URL=https://debtease-server.onrender.com
VITE_API_URL=https://debtease-server.onrender.com/api
VITE_APP_NAME=DebtEase
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

## 🛠️ Available Scripts

| Script | Environment | Backend URL | Debug | Use Case |
|--------|-------------|-------------|-------|----------|
| `npm run dev:local` | development | localhost:8000 | ON | Local development |
| `npm run dev:staging` | staging | render.com | ON | Testing with prod data |
| `npm run dev:prod` | production | render.com | OFF | Production preview |
| `npm run build:dev` | development | localhost:8000 | ON | Dev build |
| `npm run build:staging` | staging | render.com | ON | Staging build |
| `npm run build:prod` | production | render.com | OFF | Production build |

## 🔧 Environment Switcher (Development Only)

When running in development mode, you'll see an environment switcher in the bottom-right corner:

- **🛠️ DEVELOPMENT**: Local backend (blue)
- **🔄 STAGING**: Production backend with debugging (yellow)
- **🚀 PRODUCTION**: Production backend, optimized (red)

> **Note**: The switcher only appears when `VITE_DEBUG=true`. It shows instructions for switching environments but requires restarting the dev server.

## 📊 Features by Environment

### Development Mode (`debug: true`)
- ✅ Detailed console logging
- ✅ Environment switcher UI
- ✅ API request/response logging
- ✅ Error stack traces
- ✅ Performance metrics

### Production Mode (`debug: false`)
- ❌ Minimal logging (errors only)
- ❌ No environment switcher
- ❌ No API debugging
- ✅ Optimized performance
- ✅ Clean user experience

## 🐛 Troubleshooting

### Problem: CORS errors with localhost backend
**Solution**: Ensure your local backend is running on port 8000:
```bash
cd server
python -m uvicorn app.main:app --reload --port 8000
```

### Problem: Can't connect to production backend
**Solution**: Check if the backend is deployed and accessible:
```bash
curl https://debtease-server.onrender.com/health
```

### Problem: Environment switcher not showing
**Solution**: Ensure you're in development mode:
```bash
npm run dev:local
```

### Problem: Changes not reflecting
**Solution**: Clear browser cache and restart dev server:
```bash
# Clear localStorage and restart
localStorage.clear()
npm run dev:local
```

## 🔐 Security Notes

- **Never commit production secrets** to environment files
- **Use different API keys** for different environments
- **The production build** automatically disables debug features
- **Environment switcher** only works in development mode

## 📝 Usage Examples

### Local Development Workflow
```bash
# 1. Start local backend
cd server
python -m uvicorn app.main:app --reload

# 2. Start frontend (local mode)
cd client
npm run dev:local
```

### Testing Against Production
```bash
# Test frontend against production backend
npm run dev:staging

# Or build for staging deployment
npm run build:staging
```

### Production Deployment
```bash
# Build optimized production bundle
npm run build:prod

# Preview production build locally
npm run preview
```

## 🎯 Best Practices

1. **Use `dev:local` for development** - connects to local backend
2. **Use `dev:staging` for integration testing** - connects to prod backend
3. **Use `build:prod` for deployments** - optimized production build
4. **Check the environment switcher** - visible in bottom-right corner (dev only)
5. **Monitor the browser console** - shows environment info and API calls (dev mode)

---

## 🔄 Migration from Old Setup

If you were previously manually editing `.env` files:

### Old Way ❌
```bash
# Manual editing
vim .env
# Change VITE_API_BASE_URL manually
npm run dev
```

### New Way ✅
```bash
# Automatic environment loading
npm run dev:local     # for localhost
npm run dev:staging   # for staging
npm run dev:prod      # for production
```

The new system is more reliable and prevents environment configuration mistakes!