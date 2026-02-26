const API_BASE = "http://localhost:5000";

function getAuthAdmin() {
  const raw = localStorage.getItem("auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function fetchAdminStats() {
  const statsEl = document.getElementById("admin-stats");
  const auth = getAuthAdmin();
  if (!auth || !auth.token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    if (!res.ok) {
      statsEl.textContent = "Failed to load stats (are you an admin?)";
      return;
    }

    const data = await res.json();
    statsEl.innerHTML = `
      <p>Total users: <strong>${data.usersCount}</strong></p>
      <p>Total items: <strong>${data.itemsCount}</strong></p>
      <p>
        By status:
        lost: <strong>${data.byStatus.lost}</strong>,
        found: <strong>${data.byStatus.found}</strong>,
        claimed: <strong>${data.byStatus.claimed}</strong>
      </p>
    `;
  } catch (err) {
    console.error(err);
    statsEl.textContent = "Error loading stats";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("auth");
      window.location.href = "index.html";
    });
  }

  if (document.getElementById("admin-stats")) {
    fetchAdminStats();
  }
});

