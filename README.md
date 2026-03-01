# ASTU Digital Lost & Found System

## 🟢 Background & Problem Statement
Students at ASTU frequently lose personal belongings such as ID cards, calculators, USB drives, lab coats, and books. Currently, there is no centralized digital system to report, search, or track these lost and found items. This scattered approach often results in missing items never being returned to their rightful owners. 

This project aims to solve that by creating a structured, secure, and visually interactive digital solution for the entire campus community.

## 🎯 Project Objective
Design and implement a modern digital platform that allows ASTU students to:
- **Report lost items** immediately with descriptions and locations.
- **Report found items** to help fellow students retrieve their belongings.
- **Search and filter** for missing belongings using a dynamic, real-time dashboard.
- **Claim recovered items** securely.
- **Track item status** through an administrative approval workflow.

The system includes robust user authentication, MongoDB data persistence for reliability, and a stunning, responsive user interface.

## 👥 System Roles

### Student
- Register and securely log in.
- View real-time listings of all reported lost and found items.
- Submit new lost or found reports containing images and categorization.
- Submit verified claim requests for items they own.

### Admin (Student Union / Authorized Staff)
- Access a specialized, dynamic Admin Dashboard.
- Monitor global platform statistics (Total Users, Active Lost/Found counts, Recovery Rates).
- Review pending claim requests.
- Approve or reject claims, ensuring items are returned to verified owners.

## 💻 Tech Stack Implemented
- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (Modular design, CSS Grid/Flexbox layouts, Custom variable tokens, Glassmorphism elements).
- **Backend Architecture**: Node.js runtime, Express.js web framework.
- **Database**: MongoDB (via Mongoose ORM) for persistent, schema-validated storage of Users, Items, and Claims.
- **Security**: JWT (JSON Web Tokens) for session encryption, bcrypt for password hashing.
- **File Uploads**: Multer middleware handling local image storage.

## 🎨 Interactive User Interface
The project features a high-fidelity, mockup-driven interface. Key UI highlights include:
- **Dual-Column Layout**: A responsive dashboard that prominently features system statistics alongside actionable item cards.
- **Micro-Animations**: Clean transitions and hover effects on buttons and item cards that simulate a tactile, interactive app experience.
- **Rich Media Integrations**: System-generated dynamic placeholder images for various item categories ensuring the listings grid remains visually stunning even if a user forgets to upload a photo.

## 🚀 How to Run Locally

1. **Start the Backend server**:
   ```bash
   node index.js
   ```
   *(Ensure MongoDB is running locally or a valid `.env` connection string is provided)*

2. **Start the Frontend client** (Using a local web server):
   ```bash
   cd frontend
   python -m http.server 8000
   ```
3. **Access the application**:
   Open a browser and navigate to `http://localhost:8000/index.html`.
