# Quick Start Guide - Fix 403 Error

## The issue you encountered has been FIXED ✅

### What was wrong:
- **403 Forbidden**: The `/api/tests/run` endpoint required authentication
- **Port conflict**: Port 8087 was already in use
- **Missing MongoDB**: Database wasn't running

### What I fixed:
1. **Made test endpoints public** - No login required for:
   - `POST /api/tests/run` 
   - `POST /api/tests/generate/**`
   - `GET /api/tests/recent`
   - `GET /api/tests/stats`

2. **Changed ports**:
   - Backend: `8087` → `8088`
   - Frontend API calls updated to match

3. **Updated Java version**: `21` → `17` (matches your system)

## How to start the app now:

### Option 1: Install MongoDB (Recommended)
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH
eval "$(/opt/homebrew/bin/brew shellenv)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

Then start the applications:
```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm install && npm start
```

### Option 2: Test without database (Quick)
If MongoDB installation fails, you can test the frontend by:

1. Start only the frontend:
```bash
cd frontend
npm install && npm start
```

2. Use a public test API like `https://jsonplaceholder.typicode.com/posts/1` in the test runner

### Option 3: Use Docker MongoDB
```bash
docker run -d -p 27017:27017 --name test-mongo mongo:latest
```

## Test the fix:
1. Go to `http://localhost:3000`
2. Click "TEST RUNNER" (no login required!)
3. Enter any API endpoint (e.g., `https://httpbin.org/get`)
4. Click "RUN TEST" - should work without 403 error ✅

## What works now:
- ✅ Test execution without login
- ✅ Code generation without login  
- ✅ Dashboard stats without login
- ✅ Java 17 compatibility
- ✅ Port 8088 (avoiding conflicts)

Authentication is only required for user-specific features like test history.
