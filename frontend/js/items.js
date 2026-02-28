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

// Global submitClaim function so inline onclick handler works
window.submitClaim = async function (itemId) {
  const auth = ensureLoggedIn();
  try {
    const res = await fetch(`${API_BASE}/api/items/${itemId}/claim`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      alert("Failed to claim: " + (data.message || "Unknown error"));
      return;
    }

    alert("Claim request submitted successfully!");
    // Refresh items to show any changes in UI if necessary
    fetchItems();
  } catch (err) {
    console.error(err);
    alert("Error submitting claim request");
  }
};

async function fetchItems(queryParams = "") {
  const listEl = document.getElementById("items-list");
  if (!listEl) return;

  try {
    const res = await fetch(`${API_BASE}/api/items${queryParams}`);
    const items = await res.json();

    listEl.innerHTML = "";
    if (!items.length) {
      listEl.innerHTML = "<li>No items yet.</li>";
      return;
    }

    for (const item of items) {
      const li = document.createElement("li");

      let imgHtml = "";
      if (item.imagePath) {
        // Correct path for windows multer dest ("uploads\\filename")
        const normalizedPath = item.imagePath.replace(/\\/g, '/');
        imgHtml = `<img src="${API_BASE}/${normalizedPath}" alt="${item.title}" style="max-width: 200px; display: block; margin-top: 10px; border-radius: 4px;" />`;
      }

      let claimBtnHtml = "";
      const auth = getAuth();
      // Show claim button if it's not already claimed and current user isn't the owner
      if (
        auth &&
        item.status !== "claimed" &&
        item.owner !== auth.user.id
      ) {
        claimBtnHtml = `<button onclick="submitClaim('${item.id}')" style="margin-top:10px;">Claim this Item</button>`;
      }

      li.innerHTML = `
        <strong>${item.title}</strong>
        <span class="badge badge-${item.status}">${item.status}</span>
        <div>${item.description || ""}</div>
        <small>Location: ${item.location || "Not specified"}</small>
        <small> | Category: ${item.category || "Not specified"}</small>
        ${imgHtml}
        <div>${claimBtnHtml}</div>
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

  const filterForm = document.getElementById("filter-form");
  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const search = document.getElementById("search-input").value;
      const category = document.getElementById("filter-category").value;
      const status = document.getElementById("filter-status").value;
      const location = document.getElementById("filter-location").value;

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (status) params.append("status", status);
      if (location) params.append("location", location);

      const queryString = params.toString() ? `?${params.toString()}` : "";
      fetchItems(queryString);
    });
  }

  if (document.getElementById("post-item-form")) {
    setupPostItemForm();
  }
});

