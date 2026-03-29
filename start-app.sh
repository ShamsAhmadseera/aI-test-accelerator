#!/bin/bash

echo "🔧 AI Test Accelerator - Network Fix Script"
echo "============================================"

# Check if backend is running
echo "🔍 Checking Backend (Port 8091)..."
if lsof -i :8091 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 8091"
else
    echo "❌ Backend is NOT running. Starting backend..."
    cd /Users/shams.alafeef/Code/qa-compass/aI-test-accelerator/backend
    mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dserver.port=8091" > backend.log 2>&1 &
    echo "⏳ Backend starting... (check backend.log for details)"
    sleep 15
fi

# Test backend API
echo "🧪 Testing Backend API..."
if curl -s http://localhost:8091/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin"}' | grep -q "Login successful"; then
    echo "✅ Backend API is responding correctly"
    echo "✅ Admin login works: admin/admin"
else
    echo "❌ Backend API is not responding properly"
fi

# Check if frontend is running
echo "🔍 Checking Frontend (Port 3000)..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3000"
else
    echo "❌ Frontend is NOT running. Starting frontend..."
    cd /Users/shams.alafeef/Code/qa-compass/aI-test-accelerator/frontend
    npm start > frontend.log 2>&1 &
    echo "⏳ Frontend starting... (check frontend.log for details)"
fi

echo ""
echo "🎯 APPLICATION STATUS:"
echo "Backend:  http://localhost:8091/api"
echo "Frontend: http://localhost:3000"
echo ""
echo "🔑 LOGIN CREDENTIALS:"
echo "Username: admin"
echo "Password: admin"
echo ""
echo "📝 Logs:"
echo "Backend:  backend.log"
echo "Frontend: frontend.log"
echo ""
echo "✨ Once both are running, open http://localhost:3000 and login with admin/admin"
