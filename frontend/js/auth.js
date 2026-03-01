const API_BASE = "http://localhost:5000";

function saveAuthData(token, user) {
  localStorage.setItem(
    "auth",
    JSON.stringify({
      token,
      user,
    })
  );
}

function getAuthData() {
  const raw = localStorage.getItem("auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("auth");
  window.location.href = "index.html";
}

// Attach logout handler if button exists
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const res = await fetch(`${API_BASE}/api/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          alert("Login failed");
          return;
        }

        const data = await res.json();
        saveAuthData(data.token, data.user);

        // Admins go to admin page, others to dashboard
        if (data.user.role === "admin") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "dashboard.html";
        }
      } catch (err) {
        console.error(err);
        alert("Error logging in");
      }
    });
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("register-name").value;
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const phoneNumber = document.getElementById("register-phone")?.value || "";
      const telegramUsername = document.getElementById("register-telegram")?.value || "";

      try {
        const res = await fetch(`${API_BASE}/api/users/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phoneNumber, telegramUsername }),
        });

        if (!res.ok) {
          try {
            const data = await res.json();
            alert("Registration failed: " + data.message);
          } catch {
            alert("Registration failed. Please check your connection.");
          }
          return;
        }

        alert("Registration successful. You can now log in.");
        window.location.href = "index.html";
      } catch (err) {
        console.error(err);
        alert("Error registering");
      }
    });
  }
});

