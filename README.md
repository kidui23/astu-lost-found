# ASTU Digital Lost & Found System

## 🟢 Background & Problem Statement
Students at ASTU frequently lose personal belongings such as ID cards, calculators, USB drives, lab coats, and books. Previously, there was no centralized digital system to report, search, or track these lost and found items. This scattered approach often resulted in missing items never being returned to their rightful owners. 

This project solves that by creating a structured, secure, and visually interactive digital solution for the entire campus community.

## 🎯 Project Features & Capabilities
We designed a modern, highly interactive platform that allows ASTU students to:
- **Report lost and found items** immediately with descriptions, images, and mandatory contact details.
- **Pinpoint Item Locations** on an **Interactive Campus Map** (Red pins for Lost items, Green pins for Found items).
- **Search and filter** for missing belongings dynamically using Categories, Status (Lost/Found/Claimed), and search terms.
- **Interact with Dashboard Statistics** by clicking overview stat cards (Lost, Found, Pending, Recovered) to instantly filter the grid.
- **Toggle Themes** seamlessly between a stunning Light Mode and a sleek Dark Mode UI.
- **Claim recovered items** securely and alert system administrators.

The system includes robust user authentication, MongoDB data persistence for reliability, and a responsive glassmorphism user interface.

## 👥 System Roles

### Student
- Register securely and log in to personalized dashboards.
- View real-time listings of all reported lost and found items on the map and grid.
- Submit new lost or found reports (requires a Contact Phone number for coordination).
- Submit verified claim requests for items they own.
- Contact finders directly via Phone or Telegram.

### Admin (Student Union / Authorized Staff)
- Access a specialized, dynamic Admin Dashboard.
- Monitor global platform statistics (Total Users, Active Lost/Found counts, Recovery Rates) in real-time.
- Review pending claim requests.
- Approve or reject claims, ensuring items are returned to verified owners.

## 💻 Tech Stack Implemented
- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Modular design, Custom variable tokens, Glassmorphism elements, CSS Grid).
- **Interactive Maps**: Leaflet.js
- **Backend Architecture**: Node.js runtime, Express.js web framework.
- **Database**: MongoDB (via Mongoose ORM) connected to MongoDB Atlas for persistent storage of Users, Items, and Claims.
- **Security**: JWT (JSON Web Tokens) for session encryption, bcrypt for password hashing.
- **File Uploads**: Multer middleware handling local image storage.

## 🚀 How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Database**:
   Ensure your local MongoDB service is running, or that your `.env` contains a valid MongoDB Atlas connection string (which it currently does).

3. **Start the Server & Frontend**:
   ```bash
   npm start
   ```
   *This automatically serves both the backend API and the frontend client.*

4. **Access the application**:
   Open a browser and navigate to `http://localhost:5000`.
