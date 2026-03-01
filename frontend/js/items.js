const API_BASE = "https://salty-taxis-rule.loca.lt";

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

let dashboardMap = null;
let mapMarkers = [];

function initDashboardMap() {
  const mapEl = document.getElementById('dashboard-map');
  if (!mapEl) return;

  // Default center 
  dashboardMap = L.map('dashboard-map').setView([8.5415, 39.2903], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(dashboardMap);
}

function updateMapMarkers(items) {
  if (!dashboardMap) return;

  // Clear existing markers
  mapMarkers.forEach(marker => dashboardMap.removeLayer(marker));
  mapMarkers = [];

  // Custom icons mapping
  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  items.forEach(item => {
    if (item.locationLat && item.locationLng) {
      const icon = item.status === 'lost' ? redIcon : greenIcon;
      const marker = L.marker([item.locationLat, item.locationLng], { icon: icon }).addTo(dashboardMap);

      marker.bindPopup(`
        <strong>${item.title}</strong><br>
        Status: ${item.status.toUpperCase()}<br>
        <a href="item-details.html?id=${item.id}" target="_blank">View Details</a>
      `);

      mapMarkers.push(marker);
    }
  });
}

async function fetchItems(queryParams = "") {
  const listEl = document.getElementById("items-grid");
  if (!listEl) return;

  try {
    const res = await fetch(`${API_BASE}/api/items${queryParams}`);
    const items = await res.json();

    listEl.innerHTML = "";
    if (!items.length) {
      listEl.innerHTML = "<p>No items found.</p>";
      updateMapMarkers([]);
      return;
    }

    updateMapMarkers(items);

    for (const item of items) {
      const card = document.createElement("div");
      card.className = "item-card";

      // Placeholder image if none
      let imgHtml = "";
      if (item.imagePath) {
        const normalizedPath = item.imagePath.replace(/\\/g, '/');
        imgHtml = `<img src="${API_BASE}/${normalizedPath}" alt="${item.title}" />`;
      } else {
        imgHtml = `<span style="color:#94a3b8; font-size: 0.8rem;">No Image</span>`;
      }

      let actionBtnHtml = `<button class="btn-card-action btn-card-blue" onclick="window.location.href='item-details.html?id=${item.id}'">View Details</button>`;

      const auth = getAuth();
      if (
        auth &&
        item.status !== "claimed" &&
        item.owner !== auth.user.id
      ) {
        actionBtnHtml = `<button class="btn-card-action btn-card-red" onclick="submitClaim('${item.id}')">Claim Now</button>`;
      } else if (item.status === 'claimed') {
        actionBtnHtml = `<button class="btn-card-action btn-card-orange" disabled style="opacity:0.6; cursor:not-allowed;">Claimed</button>`;
      }

      // Determine text color class based on status
      const statusClass = item.status === "lost" ? "text-red" : "text-green";

      card.innerHTML = `
        <div class="item-image-wrapper">
          ${imgHtml}
        </div>
        <div class="item-details">
          <div class="item-title">${item.title}</div>
          <div class="item-status ${statusClass}">${item.category} ${item.status === 'lost' ? 'Lost' : 'Found'}</div>
          ${actionBtnHtml}
        </div>
      `;
      listEl.appendChild(card);
    }
  } catch (err) {
    console.error(err);
  }
}

async function fetchItemDetails() {
  const container = document.getElementById("item-details-container");
  if (!container) return; // not on item-details page

  const params = new URLSearchParams(window.location.search);
  const itemId = params.get("id");
  if (!itemId) {
    container.innerHTML = "<p>Invalid Item ID</p>";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/items/${itemId}`);
    if (!res.ok) throw new Error("Item not found");
    const item = await res.json();

    let imgHtml = "";
    if (item.imagePath) {
      const normalizedPath = item.imagePath.replace(/\\/g, '/');
      imgHtml = `<img src="${API_BASE}/${normalizedPath}" alt="${item.title}" style="max-width: 100%; border-radius: 8px; margin-bottom: 20px;" />`;
    }

    const statusClass = item.status === "lost" ? "text-red" : "text-green";

    // Determine Phone and Telegram (fallback to owner profile if missing - we skipped populate for brevity, so we rely on what was submitted)
    // Actually, since we didn't populate owner, we only have contactPhone/contactTelegram from the item directly for now.
    // In a full app we'd populate `owner` in `GET /:id` but since owner is an ID we can't get it.
    // Let's just use the item's `contactPhone` and `contactTelegram` fields or hide them.

    let contactInfoHtml = "";
    if (item.contactPhone) {
      contactInfoHtml += `
        <a href="tel:${item.contactPhone}" class="btn-card-action btn-card-blue" style="display:inline-block; margin-right: 10px; margin-bottom: 10px; text-decoration: none;">
          📞 Call ${item.status === 'lost' ? 'Owner' : 'Finder'}
        </a>
      `;
    }
    if (item.contactTelegram) {
      // Remove @ if they typed it
      const tgUser = item.contactTelegram.replace('@', '');
      contactInfoHtml += `
        <a href="https://t.me/${tgUser}" target="_blank" class="btn-card-action btn-card-blue" style="display:inline-block; text-decoration: none; background-color: #0088cc; color: white;">
          💬 Message on Telegram
        </a>
      `;
    }

    if (!contactInfoHtml) {
      contactInfoHtml = `<p style="color: #666; font-style: italic;">No specific contact info provided. Please use the Claim button to contact the system admin.</p>`;
    }


    container.innerHTML = `
      <div class="card" style="padding: 2rem;">
        ${imgHtml}
        <h2>${item.title}</h2>
        <p class="item-status ${statusClass}" style="font-weight: bold; margin-bottom: 10px;">${item.category} - ${item.status.toUpperCase()}</p>
        <p style="margin-bottom: 5px;"><strong>Location:</strong> ${item.location || 'N/A'}</p>
        <p style="margin-bottom: 5px;"><strong>Date:</strong> ${item.dateLost ? new Date(item.dateLost).toLocaleDateString() : (item.dateFound ? new Date(item.dateFound).toLocaleDateString() : 'N/A')}</p>
        <div style="margin: 20px 0; line-height: 1.6;">
          <strong>Description:</strong><br/>
          ${item.description || "No description provided."}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <h3>Contact Info</h3>
          <div style="margin-top: 15px;">
            ${contactInfoHtml}
          </div>
        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error loading item details.</p>";
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

  const auth = getAuth();
  if (auth && auth.user) {
    const greetingEl = document.getElementById("user-greeting");
    if (greetingEl) {
      greetingEl.innerHTML = `<span style="margin-right: 15px;">Welcome, <strong>${auth.user.name}</strong></span>`;
    }

    // Role-based sidebar show/hide
    if (auth.user.role === "admin") {
      const sidebar = document.getElementById("admin-sidebar");
      if (sidebar) sidebar.style.display = "flex";
      // Admin.js will handle populating the stats grid and sidebar itself
    } else {
      // Hide global stats grid for pure users (matches mockup showing it mainly for admins or as a global read)
      // We'll leave it visible for the sake of the mockup, but hide the admin sidebar
    }
  }

  if (document.getElementById("items-grid")) {
    ensureLoggedIn();
    initDashboardMap();
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

  // If we are on the item-details page, fetch single item
  if (document.getElementById("item-details-container")) {
    fetchItemDetails();
  }
});

