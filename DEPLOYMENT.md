# Deployment Guide 🚀

This project consists of two parts: a **Static Frontend** (HTML/JS/CSS) and a **Node.js/Express Backend API** connected to MongoDB. 

Here are the step-by-step instructions to get the application live on the internet.

---

## 🏗️ Method 1: The Modern Cloud Approach (Free & Easy)
This splits the application into two optimized services.

### 1. Backend (Render / Vercel / Railway)
The easiest way to host the Node.js API is via [Render.com](https://render.com).
1. Create a free account on Render and link your GitHub.
2. Click **New +** -> **Web Service**.
3. Select your repository.
4. Set the internal configuration:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click on **Advanced** and add these Environment Variables:
   - `MONGODB_URI` = `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lostfound?retryWrites=true&w=majority`
   - `JWT_SECRET` = `(generate a strong random string yourself)`
6. Click **Create Web Service**. 
7. Once live, Render gives you a URL (e.g., `https://api.your-app.render.com`).
8. ⚠️ **Update CORS in `index.js`**:
   ```js
   app.use(cors({ origin: "https://your-frontend-domain.com" }));
   ```

### 2. Frontend (Vercel / Netlify / GitHub Pages)
The static frontend can be hosted indefinitely for free on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
1. Go into `frontend/js/auth.js` and `frontend/js/items.js` and change `const API_BASE = "http://localhost:5000";` to your new live backend URL:
   ```js
   const API_BASE = "https://api.your-app.render.com";
   ```
2. Create an account on Vercel or Netlify and link GitHub.
3. Import your repository. 
4. Important: Set the **Root Directory** or **Publish directory** to `/frontend`.
5. Click **Deploy**.

---

## 🐳 Method 2: The Self-Hosted Docker Approach
If you have your own VPS (Virtual Private Server) from DigitalOcean, AWS EC2, or Linode, you can deploy the entire stack immediately using the provided Docker configurations.

### Prerequisites on your VPS:
- Git installed
- Docker & Docker Compose installed

### Steps:
```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# 3. Create a .env file locally with your secrets
cat <<EOT >> .env
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/lostfound
JWT_SECRET=super-secret-key-change-this-now
EOT

# 4. Start the stack in detached mode
docker-compose up -d --build
```

### Checking Status
- See running containers: `docker ps`
- View backend logs: `docker-compose logs -f api`
- Restart the backend: `docker-compose restart api`

---

## 🔒 Security Post-Deployment Checklist
- [x] Ensure your `JWT_SECRET` is strong and securely stored only in actual production environments (never commit to `.env`).
- [x] In your MongoDB Atlas Dashboard, lock down "Network Access" to only allow the IP address of your API server, rather than `0.0.0.0/0` (everyone).
- [ ] If using self-hosted option, set up NGINX reverse proxy with a free SSL certificate from Let's Encrypt (Certbot).
