# Contributing to Facebook Campaign Launcher

Thank you for your interest in contributing to the Facebook Campaign Launcher! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Facebook-Campaign-Launcher.git
   cd Facebook-Campaign-Launcher
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ArielleTolome/Facebook-Campaign-Launcher.git
   ```

## Development Setup

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

### Database Setup

```bash
# Create database
createdb facebook_campaign_launcher

# Run seed data (optional)
cd backend
npm run seed
```

## Making Changes

### Creating a Branch

Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### Development Workflow

1. Make your changes
2. Test your changes thoroughly
3. Lint your code:
   ```bash
   # Backend
   cd backend && npm run lint
   
   # Frontend
   cd frontend && npm run lint
   ```
4. Commit your changes with clear messages
5. Push to your fork
6. Create a Pull Request

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual Testing

1. Start the backend and frontend
2. Test the affected features in the UI
3. Test API endpoints using curl or Postman
4. Verify database changes

## Submitting Changes

### Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update the CHANGELOG if applicable
4. Create a Pull Request with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Reference any related issues
   - Screenshots for UI changes

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- List of changes

## Testing
How to test the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Fixes #(issue number)
```

## Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Use async/await for asynchronous operations
- Follow airbnb style guide
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### React

- Use functional components with hooks
- Prop-types for type checking (optional)
- Keep components focused on single responsibility
- Use custom hooks for reusable logic
- Follow React best practices

### CSS

- Use BEM naming convention
- Keep styles modular
- Avoid inline styles
- Use CSS variables for colors and spacing

### Database

- Use descriptive column names (snake_case)
- Add proper indexes for foreign keys
- Document complex queries
- Use migrations for schema changes

### API Design

- Follow RESTful conventions
- Use proper HTTP status codes
- Validate input data
- Return consistent response formats
- Document all endpoints

## Project Structure

### Backend Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── package.json
└── .env.example
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom hooks
│   ├── styles/          # CSS files
│   ├── App.js
│   └── index.js
├── public/
└── package.json
```

## Adding New Features

### Backend Feature

1. Create/update models in `src/models/`
2. Add service logic in `src/services/`
3. Create controller in `src/controllers/`
4. Add routes in `src/routes/`
5. Update API documentation

### Frontend Feature

1. Create component in `src/components/`
2. Add page in `src/pages/` if needed
3. Update routing in `App.js`
4. Add API calls in `src/services/api.js`
5. Add styles in `src/styles/`

## Common Issues and Solutions

### Database Connection Issues

- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists

### Port Conflicts

- Backend: Change PORT in `.env`
- Frontend: Accept alternative port when prompted

### Module Not Found

```bash
rm -rf node_modules
npm install
```

## Documentation

When adding new features, update:

- README.md - User-facing documentation
- API_DOCUMENTATION.md - API endpoint documentation
- Code comments - For complex logic
- CHANGELOG.md - Version changes

## Questions?

If you have questions:

- Check existing issues and pull requests
- Review documentation
- Open a new issue for discussion

## Recognition

Contributors will be recognized in:

- GitHub contributors page
- Project README (for significant contributions)
- Release notes

Thank you for contributing to Facebook Campaign Launcher! 🚀
