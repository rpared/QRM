Deployment Guide

1. Prerequisites
Before deploying the application, ensure you have the following:
Node.js
MongoDB: For database storage
A server: A cloud provider or your own server

2. Clone the Repository
Clone the repository from your version control system (e.g., GitHub).
git clone https://github.com/your-repo/qr-menu.git

3. Environment Configuration
Create a .env file in the root directory of your project with the following environment variables:
PORT=8000
DB_HOST=mongodb://localhost:27017/qr-menu
SESSION_SECRET=your-session-secret

* Replace mongodb://localhost:27017/qr-menu with your MONGODB_URI, 8000 with your prefered port, your-session-secret and your-qr-code-secret with appropriate secure values.

4. Install Dependencies
Install the required dependencies using npm
npm install

5. Run index.js