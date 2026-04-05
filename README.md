# Task Manager Pro - Production Ready MERN Application

A modern, secure, and scalable task management application built with the MERN stack, following industry best practices and production-ready standards.

## 🚀 Features

### Security
- **JWT Authentication** with secure token handling and expiration
- **Input Validation & Sanitization** preventing XSS and NoSQL injection
- **Rate Limiting** on all endpoints with stricter limits on auth routes
- **CORS Protection** with environment-specific origins
- **Helmet.js** for security headers and CSP
- **Password Hashing** with bcrypt and salt rounds

### Backend Architecture
- **Clean Architecture** with separated concerns (Controllers, Routes, Models, Middleware)
- **Centralized Error Handling** with proper logging and user-friendly messages
- **Input Validation** using express-validator with comprehensive rules
- **Request Logging** with performance metrics
- **Graceful Shutdown** handling SIGTERM and SIGINT
- **Environment Configuration** with proper variable management

### Frontend Architecture
- **Modern React** with hooks and functional components
- **Axios Interceptors** for centralized API communication
- **Custom Hooks** for API calls, pagination, and caching
- **Error Boundaries** for graceful error handling
- **Reusable UI Components** with consistent design system
- **Loading States** and optimistic updates
- **Toast Notifications** for user feedback
- **Responsive Design** optimized for all devices

### Performance & UX
- **Debounced API Calls** to reduce server load
- **Cached API Responses** with configurable cache time
- **Real-time Data Updates** with configurable intervals
- **Pagination Support** for large datasets
- **Optimistic Updates** for better perceived performance
- **Loading Spinners** and skeleton screens

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 4.4+
- Git

## 🛠️ Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/fitto-0/Syntecxhub_Task_management.git
   cd task-manager-pro
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task_manager
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Frontend Setup

1. **Install client dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:5000/api" > .env
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🏗️ Project Structure

```
task-manager-pro/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Database configuration
│   │   ├── controllers/
│   │   │   ├── authController.js  # Authentication logic
│   │   │   └── ...               # Other controllers
│   │   ├── middleware/
│   │   │   ├── auth.js           # Authentication middleware
│   │   │   ├── errorHandler.js   # Error handling
│   │   │   ├── logger.js         # Request logging
│   │   │   └── validation.js     # Input validation
│   │   ├── models/
│   │   │   ├── User.js           # User model
│   │   │   ├── Task.js           # Task model
│   │   │   └── ...               # Other models
│   │   ├── routes/
│   │   │   ├── auth.js           # Auth routes
│   │   │   ├── tasks.js          # Task routes
│   │   │   └── ...               # Other routes
│   │   └── index.js              # Server entry point
│   ├── package.json
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── ErrorBoundary.jsx # Error boundary
│   │   │   └── ...               # Other components
│   │   ├── hooks/
│   │   │   └── useApi.js         # Custom API hooks
│   │   ├── services/
│   │   │   └── api.js            # API service with interceptors
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── ...               # Other pages
│   │   └── ...
│   ├── package.json
│   └── .env
└── README.md
```

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens** with configurable expiration
- **Secure Password Hashing** with bcrypt (12 salt rounds)
- **Protected Routes** with authentication middleware
- **Token Validation** and automatic refresh

### Input Validation
- **Server-side Validation** using express-validator
- **XSS Protection** with input sanitization
- **NoSQL Injection Prevention** with mongo-sanitize
- **File Upload Security** (if implemented)

### Rate Limiting
- **Global Rate Limit**: 100 requests per 15 minutes
- **Auth Rate Limit**: 5 requests per 15 minutes
- **Configurable Limits** via environment variables

### Security Headers
- **Content Security Policy** with strict directives
- **X-Frame-Options**, **X-Content-Type-Options**
- **Referrer Policy** and other security headers

## 📊 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### GET /api/auth/me
Get current user profile (requires authentication).

#### PUT /api/auth/profile
Update user profile (requires authentication).

#### PUT /api/auth/password
Change user password (requires authentication).

### Task Endpoints

#### GET /api/tasks
Get all tasks for authenticated user.

#### POST /api/tasks
Create a new task (requires authentication).

#### PUT /api/tasks/:id
Update a task (requires authentication).

#### DELETE /api/tasks/:id
Delete a task (requires authentication).

## 🎨 Frontend Components

### UI Components
- **Button**: Configurable button with loading states
- **Alert**: Contextual alerts with dismissible option
- **LoadingSpinner**: Consistent loading indicators
- **ErrorBoundary**: Graceful error handling

### Custom Hooks
- **useApi**: Generic API call hook with loading/error states
- **useAsyncOperation**: Optimistic updates support
- **usePagination**: Pagination with infinite scroll
- **useRealTimeData**: Auto-refreshing data
- **useDebouncedApi**: Debounced API calls
- **useCachedApi**: Cached API responses

### Services
- **apiService**: Centralized API communication
- **authService**: Authentication methods
- **taskService**: Task management methods
- **projectService**: Project management methods
- **monthGoalService**: Monthly goals methods

## 🚀 Deployment

### Production Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
JWT_EXPIRE=30d
FRONTEND_URL=https://yourdomain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api
```

## 📈 Performance Optimization

### Backend
- **Database Indexing** on frequently queried fields
- **Connection Pooling** for MongoDB
- **Response Compression** with gzip
- **Caching Strategy** for frequently accessed data

### Frontend
- **Code Splitting** with React.lazy
- **Image Optimization** and lazy loading
- **Bundle Analysis** and optimization
- **Service Workers** for offline support

## 🔧 Development

### Code Style
- **ESLint** and **Prettier** configuration
- **Consistent Naming** conventions
- **Self-documenting Code** with minimal comments
- **TypeScript Ready** structure

### Git Workflow
- **Feature Branches** for new features
- **Pull Requests** with code review
- **Semantic Versioning** for releases
- **Conventional Commits** for commit messages

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please email support@taskmanagerpro.com or create an issue in the repository.

---

**Built with ❤️ using modern web development best practices**
