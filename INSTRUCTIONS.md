# AI Test Accelerator - Project Instructions

## 1) What this project is

AI Test Accelerator is a full-stack QA tool that:

- Executes API calls and stores run results.
- Tracks run history and dashboard metrics.
- Uses Anthropic Claude to generate testing artifacts:
  - RestAssured (Java)
  - Gatling (Scala)
  - Postman Collection (JSON)

## 2) Project structure

- `backend/` - Spring Boot 3.2 + MongoDB + JWT security
- `frontend/` - React (CRA) SPA with auth, dashboard, history, and test runner UI

## 3) Core backend flow (high-level)

1. User authenticates via `/api/auth/login` and receives a JWT token.
2. Frontend stores token in `localStorage` and sends it on protected requests.
3. User submits an API test request to `/api/tests/run`.
4. Backend:
   - Executes the API call using `RestTemplate`.
   - Computes metrics (status, response time, throughput, pass/fail).
   - Calls Anthropic API to generate RestAssured/Gatling/Postman artifacts.
   - Saves all data to MongoDB (`test_runs` collection).
5. Dashboard and history endpoints read from MongoDB.

## 4) Core frontend flow (high-level)

- `Login` page handles login/registration.
- `Dashboard` polls stats + recent runs every 10 seconds.
- `TestRunner` builds request payload, runs test, and generates code artifacts.
- `History` lists user test runs.
- `TestDetail` shows metrics + generated artifacts for a run.

## 5) Prerequisites

- Java 17 or higher
- Maven 3.9+
- Node.js 18+ (Node 20 recommended)
- npm 9+
- MongoDB running locally on default port

### Installing MongoDB on macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (if needed)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Alternative MongoDB Installation Methods

If Homebrew doesn't work:

1. **Download MongoDB directly:**
   - Visit: https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for macOS
   - Follow installation instructions

2. **Using Docker (if available):**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

## 6) Configuration

Backend configuration file: `backend/src/main/resources/application.properties`

Current defaults (from project):

- Backend port: `8088` (changed from 8087 due to port conflicts)
- Mongo URI: `mongodb://localhost:27017/qa_command_center`
- CORS origin: `http://localhost:3000`
- Anthropic model: `claude-sonnet-4-20250514`

Important: set a real Anthropic API key before generation features will work.

Replace:

- `anthropic.api.key=YOUR_ANTHROPIC_API_KEY_HERE`

If key is missing/invalid, generation endpoints return an error string in the `code` field.

## 7) Run locally

Open two terminals from repo root.

### Terminal 1 - backend

```bash
cd backend
mvn spring-boot:run
```

### Terminal 2 - frontend

```bash
cd frontend
npm install
npm start
```

App URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8088/api` (changed from 8087)

## 8) Build checks (verified)

The following commands were executed successfully in this workspace:

```bash
mvn -q -f backend/pom.xml -DskipTests compile
npm --prefix frontend run build
```

## 9) API surface (current)

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`

Tests:

- `POST /api/tests/run`
- `POST /api/tests/generate/restassured`
- `POST /api/tests/generate/gatling`
- `POST /api/tests/generate/postman`
- `GET /api/tests/history`
- `GET /api/tests/recent`
- `GET /api/tests/stats`
- `GET /api/tests/{id}`

## 10) Known implementation notes

- Frontend API base URL is updated to `http://localhost:8088/api` in `frontend/src/services/api.js`.
- Backend CORS allowed origin is hardcoded in `SecurityConfig` to `http://localhost:3000`.
- `cors.allowed.origins` exists in `application.properties` but is not currently used by `SecurityConfig`.
- No automated tests are present in current source tree.
- Throughput is calculated as `1000 / responseTimeMs`; extremely fast responses may produce unstable values.
- Test execution endpoints (`/api/tests/run` and `/api/tests/generate/**`) are now public - no authentication required.

## 11) Troubleshooting

### Port Issues
- **Backend fails to start with "Port already in use":**
  ```bash
  # Find process using the port
  lsof -ti:8088
  # Kill the process (replace PID with actual process ID)
  kill -9 <PID>
  # Or use a different port by changing server.port in application.properties
  ```

### MongoDB Issues
- **Backend hangs during startup or fails to connect:**
  ```bash
  # Check if MongoDB is running
  brew services list | grep mongodb
  # Start MongoDB if not running
  brew services start mongodb-community
  # Test MongoDB connection
  mongosh --eval "db.runCommand('ping')"
  ```

### Authentication & CORS Issues
- **403 errors when running tests (FIXED):**
  - Test execution endpoints are now public - no login required for `/api/tests/run`
  - Authentication is only required for user-specific history (`/api/tests/history`)

- **401 errors after login:**
  - Ensure token exists in browser `localStorage`.
  - Re-login to refresh token.

- **CORS errors:**
  - Confirm frontend is on `http://localhost:3000`.
  - Update `SecurityConfig` if you use a different frontend origin.

### Test Execution Issues
- **Test run saved as FAILED:**
  - Check target endpoint reachability.
  - Check auth settings and headers in the test form.

- **AI generation returns error text:**
  - Verify `anthropic.api.key` and internet access.

### Quick Start (Skip Database for Testing)
If you want to test the frontend without setting up MongoDB:
1. Comment out MongoDB dependencies in `pom.xml` temporarily
2. Remove `@Repository` annotations from repository classes
3. Use in-memory lists instead of MongoDB collections

## 12) Suggested next improvements

- Move API base URL and CORS origins to environment-driven config.
- Add backend tests for auth and `TestRunService` behavior.
- Add frontend error boundary and richer request validation.
- Improve API error handling with consistent error DTOs.

