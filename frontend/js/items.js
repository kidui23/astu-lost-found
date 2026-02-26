const API_BASE = "http://localhost:5000";

function getAuth() {
  const raw = localStorage.getItem("auth");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function ensureLoggedIn() {
  const auth = getAuth();
  if (!auth || !auth.token) {
    window.location.href = "index.html";
  }
  return auth;
}

async function fetchItems() {
  const listEl = document.getElementById("items-list");
  if (!listEl) return;

  try {
    const res = await fetch(`${API_BASE}/api/items`);
    const items = await res.json();

    listEl.innerHTML = "";
    if (!items.length) {
      listEl.innerHTML = "<li>No items yet.</li>";
      return;
    }

    for (const item of items) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${item.title}</strong>
        <span class="badge badge-${item.status}">${item.status}</span>
        <div>${item.description || ""}</div>
        <small>${item.location || ""}</small>
      `;
      listEl.appendChild(li);
    }
  } catch (err) {
    console.error(err);
  }
}

function setupPostItemForm() {
  const form = document.getElementById("post-item-form");
  if (!form) return;

  const auth = ensureLoggedIn();
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("auth");
      window.location.href = "index.html";
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const res = await fetch(`${API_BASE}/api/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        alert("Failed to post item");
        return;
      }

      alert("Item posted!");
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      alert("Error posting item");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("auth");
      window.location.href = "index.html";
    });
  }

  if (document.getElementById("items-list")) {
    ensureLoggedIn();
    fetchItems();
  }

  if (document.getElementById("post-item-form")) {
    setupPostItemForm();
  }
});

