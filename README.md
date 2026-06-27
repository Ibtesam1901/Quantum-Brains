# 🛒 KiranaSync

**KiranaSync** is an intelligent WhatsApp ordering system designed specifically for local retail businesses (Kirana stores). It brings unorganized retail into the digital age without requiring customers to download any new apps—they just text their local store on WhatsApp!

The store owner manages everything from a beautiful, real-time React dashboard featuring animated Kanban boards, automatic customer CRM, and live revenue tracking.

---

## 🚀 Key Features

### For the Customer:
- **Zero Friction:** Order groceries directly through WhatsApp using a conversational bot.
- **Automated Menu & Billing:** The bot handles the catalog, calculates totals, and confirms orders 24/7.
- **Status Updates:** Customers receive real-time SMS/WhatsApp updates when their order is processed or ready for pickup.

### For the Store Owner:
- **Real-Time Kanban Board:** Manage incoming orders with a drag-and-drop style animated board. Orders instantly appear on the dashboard the second a customer texts the bot.
- **Professional Dashboard:** Track daily orders, live revenue, and pending tasks with beautiful Recharts data visualizations.
- **Automated CRM:** The system silently builds a customer database, tracking phone numbers, order frequencies, and total lifetime value.

---

## 💻 Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion (Animations), Recharts (Data Visualization), Lucide React (Icons).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Mongoose).
- **Integrations:** Twilio API (WhatsApp Business Integration).

---

## 🛠️ Local Setup Instructions

### 1. Prerequisites
- Node.js installed
- MongoDB URI (Local or MongoDB Atlas)
- Twilio Account (for WhatsApp Sandbox)
- Ngrok (to expose your local backend to Twilio)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Connect Twilio via Ngrok
1. In a new terminal, run Ngrok to expose port 5000:
   ```bash
   ngrok http 5000
   ```
2. Copy the generated HTTPS Forwarding URL (e.g., `https://your-ngrok-url.ngrok-free.app`).
3. Go to your Twilio Console -> Messaging -> Try it out -> Send a WhatsApp message -> Sandbox settings.
4. Set the **"WHEN A MESSAGE COMES IN"** URL to:
   ```
   https://your-ngrok-url.ngrok-free.app/api/whatsapp/webhook
   ```
5. Save the configuration. Your WhatsApp bot is now live!

---

## 🎨 Design Philosophy

This project features a **Professional Light Theme** with "Glassmorphism" aesthetics. It prioritizes clean data tables, highly readable text, and smooth micro-animations to ensure the store owner feels like they are using a premium, state-of-the-art enterprise software.

---

*Built with ❤️ for the Hackathon.*
