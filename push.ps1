Set-Location "e:\Quantum-Brains"

"node_modules/`n.env`n.DS_Store" | Out-File -Encoding UTF8 .gitignore
"node_modules/`n.env" | Out-File -Encoding UTF8 backend/.gitignore
"node_modules/`n.env`ndist/`nbuild/" | Out-File -Encoding UTF8 frontend/.gitignore

git add .gitignore backend/.gitignore frontend/.gitignore backend/app.js backend/config backend/models backend/routes backend/utils backend/package.json backend/package-lock.json package.json package-lock.json
git commit -m "feat: Initialize project and backend core (Node.js & MongoDB)"

git add backend/whatsapp
git commit -m "feat: Implement Twilio WhatsApp Chatbot logic"

git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/index.html frontend/src/main.jsx frontend/src/App.jsx frontend/src/components/Sidebar.jsx
git commit -m "feat: Initialize React frontend and basic layout"

git add frontend/src/pages/Orders.jsx frontend/src/components/KanbanBoard.jsx
git commit -m "feat: Build animated Kanban Board for orders"

git add frontend/src/pages/Customers.jsx
git commit -m "feat: Create Customers database page"

git add .
git commit -m "style: Apply professional Light Theme and final polish"

git push origin main
