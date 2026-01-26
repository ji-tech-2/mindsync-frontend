# MindSync Frontend

A React-based mental health screening and wellness application with JWT authentication, real-time prediction polling, and personalized health advice.

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Testing](#-testing)
- [Authentication](#-authentication)
- [API Integration](#-api-integration)
- [Conventions](#-conventions)
- [Documentation](#-documentation)

## Features

- **JWT Authentication** - Secure token-based authentication with Spring Boot backend
- **Protected Routes** - Route guards for authenticated-only pages
- **Mental Health Screening** - Interactive questionnaire for mental wellness assessment
- **Real-time Polling** - Live prediction results with partial status updates
- **AI-Powered Advice** - Personalized mental health recommendations
- **Responsive Design** - Mobile-friendly interface
- **Comprehensive Testing** - 76 unit tests with Vitest

## Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.9.6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS Modules
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
mindsync-frontend/
├── public/                          # Static assets
├── src/
│   ├── assets/                      # Images, icons, etc.
│   ├── components/                  # Reusable components
│   │   ├── Advice.jsx              # Health advice display component
│   │   ├── Advice.module.css
│   │   ├── AdviceFactor.jsx        # Individual advice factor component
│   │   ├── LogoutButton.jsx        # Example logout component
│   │   └── ProtectedRoute.jsx      # Route guard component 
│   ├── config/
│   │   └── api.js                  # Axios instance, interceptors, token manager 
│   ├── contexts/
│   │   └── AuthContext.jsx         # Global authentication state 
│   ├── pages/
│   │   ├── css/                    # Page-specific styles
│   │   │   ├── dashboard.css
│   │   │   ├── login.css
│   │   │   ├── register.css
│   │   │   ├── result.css
│   │   │   └── screening.css
│   │   ├── main/
│   │   │   ├── Dashboard.jsx       # Home/Dashboard page
│   │   │   ├── Login.jsx           # Login page 
│   │   │   ├── Register.jsx        # Registration page 
│   │   │   ├── Result.jsx          # Test results page
│   │   │   └── Screening.jsx       # Mental health screening form
│   │   └── utils/
│   │       ├── pollingHelper.js    # Prediction result polling utility
│   │       └── sessionHelper.js    # Session management utilities
│   ├── test/
│   │   └── setup.js                # Test environment setup
│   ├── utils/
│   │   └── authHelper.js           # Authentication helper functions 
│   ├── App.jsx                     # Root component with routes 
│   ├── App.css                     # Global styles
│   ├── index.css                   # Base styles
│   └── main.jsx                    # Application entry point
├── .gitignore
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Vite configuration
├── vitest.config.js                # Vitest testing configuration
├── Dockerfile                      # Docker containerization
├── README.md                       # This file
├── AUTHENTICATION.md               # Auth implementation details
├── JWT_AUTHENTICATION_GUIDE.md     # Complete JWT guide 
└── AUTH_QUICK_REFERENCE.md         # Quick auth reference 


```

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Backend**: Spring Boot backend running on `http://139.59.109.5:8000` (or configure in `api.js`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindsync-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (optional)
   
   Edit `src/config/api.js` if your backend is on a different URL:
   ```javascript
   export const API_CONFIG = {
     BASE_URL: import.meta.env.DEV ? "/api" : "http://your-backend-url:8000",
     // ...
   };
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Application will be available at `http://localhost:5173`

## Development

### Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm test             # Run tests in watch mode
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate test coverage report
```

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
VITE_API_URL=http://139.59.109.5:8000
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Testing

The project uses **Vitest** and **React Testing Library** for testing.

```bash
# Run all tests
npm test -- --run

# Run tests in watch mode
npm test

# Run with UI
npm test:ui

# Generate coverage report
npm run test:coverage
```

**Test Coverage**: 76 tests covering:
- Authentication flows (Login/Register)
- Protected routes
- API interceptors
- Polling mechanisms
- Component rendering
- Form validation

## Authentication

### Overview

The application uses **JWT (JSON Web Tokens)** for authentication with the Spring Boot backend.

### Key Components

1. **AuthContext** (`src/contexts/AuthContext.jsx`)
   - Global authentication state
   - Provides `login`, `logout`, `user`, `isAuthenticated`

2. **ProtectedRoute** (`src/components/ProtectedRoute.jsx`)
   - Guards routes from unauthenticated access
   - Redirects to login if not authenticated

3. **API Client** (`src/config/api.js`)
   - Axios instance with interceptors
   - Automatic token injection: `Authorization: Bearer <token>`
   - Automatic 401 error handling

### Usage Examples

**Check authentication status:**
```jsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Make authenticated API calls:**
```jsx
import apiClient from './config/api';

// Token automatically attached!
const response = await apiClient.get('/user/profile');
```

**Protect routes:**
```jsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```



## API Integration

### Backend Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/login` | POST | No | User login, returns JWT token |
| `/register` | POST | No | User registration |
| `/v0-1/model-predict` | POST | Yes | Submit screening data for prediction |
| `/v0-1/model-result/{id}` | GET | Yes | Poll for prediction results |
| `/v0-1/model-advice` | GET | Yes | Get AI-generated health advice |

### Request/Response Format

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Login Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "userId": 123
  }
}
```

**Protected Requests:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Conventions

### File Naming

- **Components**: PascalCase (e.g., `Dashboard.jsx`, `ProtectedRoute.jsx`)
- **Utilities**: camelCase (e.g., `pollingHelper.js`, `authHelper.js`)
- **CSS Modules**: Component.module.css (e.g., `Advice.module.css`)
- **Page CSS**: kebab-case (e.g., `login.css`, `dashboard.css`)
- **Tests**: ComponentName.test.jsx (e.g., `Login.test.jsx`)

### Code Style

- **Imports Order**:
  1. React/library imports
  2. Context/hooks
  3. Components
  4. Utilities/helpers
  5. Styles

- **Component Structure**:
  ```jsx
  // 1. Imports
  import { useState } from 'react';
  import { useAuth } from '../contexts/AuthContext';
  
  // 2. Component definition
  export default function ComponentName() {
    // 3. Hooks
    const { user } = useAuth();
    const [state, setState] = useState();
    
    // 4. Event handlers
    const handleClick = () => { };
    
    // 5. Effects
    useEffect(() => { }, []);
    
    // 6. JSX return
    return ( );
  }
  ```

- **API Calls**: Always use `apiClient` from `src/config/api.js` (not `fetch`)
- **Authentication**: Use `useAuth()` hook from AuthContext
- **Error Handling**: Always include try-catch for async operations

### Git Workflow

```bash
# Feature branch
git checkout -b feature/your-feature-name

# Commit messages
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in component"
git commit -m "docs: update README"
git commit -m "test: add tests for login"

# Conventional commits prefixes:
# feat, fix, docs, style, refactor, test, chore
```

### CSS Conventions

- **Global styles**: `src/index.css`, `src/App.css`
- **Page styles**: `src/pages/css/page-name.css`
- **Component styles**: CSS Modules (`.module.css`)
- **Class naming**: BEM convention for global, camelCase for modules

### Testing Conventions

- **Test files**: Co-located with components (`Component.test.jsx`)
- **Test structure**: Describe blocks for grouping related tests
- **Mocking**: Mock external dependencies (API, router, context)
- **Assertions**: Use `@testing-library/jest-dom` matchers

## Documentation

- **[JWT_AUTHENTICATION_GUIDE.md](JWT_AUTHENTICATION_GUIDE.md)** - Complete authentication implementation guide
- **[AUTH_QUICK_REFERENCE.md](AUTH_QUICK_REFERENCE.md)** - Quick reference for auth tasks
- **[AUTHENTICATION.md](AUTHENTICATION.md)** - Initial auth setup documentation

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t mindsync-frontend .

# Run container
docker run -p 3000:3000 mindsync-frontend
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Before submitting PR:

- [ ] Run tests: `npm test -- --run`
- [ ] Run linter: `npm run lint`
- [ ] Update documentation if needed
- [ ] Add tests for new features

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5173
npx kill-port 5173
```

**CORS errors:**
- Verify backend is running
- Check CORS configuration in Spring Boot backend
- Ensure `withCredentials: true` in `api.js`

**401 Unauthorized:**
- Check token is being sent (DevTools → Network → Headers)
- Verify backend JWT validation
- Token may have expired

**Tests failing:**
```bash
# Clear test cache
npm test -- --clearCache

# Run with verbose output
npm test -- --run --reporter=verbose
```


