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
    // Populate the new Top Stats Grid
    const statLost = document.getElementById("stat-lost");
    const statFound = document.getElementById("stat-found");
    const statPending = document.getElementById("stat-pending"); // handled in fetchPendingClaims below
    const statRecovered = document.getElementById("stat-recovered");

    if (statLost) statLost.textContent = data.byStatus.lost;
    if (statFound) statFound.textContent = data.byStatus.found;
    if (statRecovered) statRecovered.textContent = data.byStatus.claimed;

    // Optional: Populate the sidebar simple stats box
    const sysStats = document.getElementById("admin-stats");
    if (sysStats) {
      sysStats.innerHTML = `
        <div class="sidebar-stat-row"><span>Total Lost:</span><strong>${data.byStatus.lost}</strong></div>
        <div class="sidebar-stat-row"><span>Total Found:</span><strong>${data.byStatus.found}</strong></div>
        <div class="sidebar-stat-row"><span>Total Claimed:</span><strong>${data.byStatus.claimed}</strong></div>
       `;
    }
  } catch (err) {
    console.error(err);
    statsEl.textContent = "Error loading stats";
  }
}

async function fetchPendingClaims() {
  const listEl = document.getElementById("claims-list");
  if (!listEl) return;

  const auth = getAuthAdmin();
  if (!auth || !auth.token) return;

  try {
    const res = await fetch(`${API_BASE}/api/admin/claims`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    if (!res.ok) {
      listEl.innerHTML = "<li>Failed to load claims.</li>";
      return;
    }

    const claims = await res.json();
    listEl.innerHTML = "";

    // Update counts
    const pendingSidebarCount = document.getElementById("sidebar-pending-count");
    if (pendingSidebarCount) pendingSidebarCount.textContent = claims.length;

    const pendingGlobalCount = document.getElementById("stat-pending");
    if (pendingGlobalCount) pendingGlobalCount.textContent = claims.length;

    if (!claims.length) {
      listEl.innerHTML = "<p>No pending claims right now.</p>";
      return;
    }

    for (const claim of claims) {
      const div = document.createElement("div");
      div.style.marginBottom = "1rem";
      div.style.borderBottom = "1px solid #e2e8f0";
      div.style.paddingBottom = "0.75rem";

      div.innerHTML = `
        <div style="font-weight:600; font-size:0.9rem;">${claim.itemTitle}</div>
        <div style="font-size:0.8rem; color:#64748b; margin-bottom:0.5rem;">User ID: ${claim.claimantId.substring(0, 6)}...</div>
        <div class="admin-action-btns">
          <button onclick="approveClaim('${claim.id}')">Approve</button>
          <button onclick="rejectClaim('${claim.id}')">Reject</button>
        </div>
      `;
      listEl.appendChild(div);
    }
  } catch (err) {
    console.error(err);
    listEl.innerHTML = "<p>Error loading claims.</p>";
  }
}

window.approveClaim = async function (claimId) {
  const auth = getAuthAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/admin/claims/${claimId}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (res.ok) {
      alert("Claim approved!");
      fetchPendingClaims();
      fetchAdminStats(); // refresh stats since status changed
    } else {
      alert("Failed to approve claim.");
    }
  } catch (err) {
    console.error(err);
    alert("Error approving claim.");
  }
};

window.rejectClaim = async function (claimId) {
  const auth = getAuthAdmin();
  try {
    const res = await fetch(`${API_BASE}/api/admin/claims/${claimId}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    if (res.ok) {
      alert("Claim rejected.");
      fetchPendingClaims();
    } else {
      alert("Failed to reject claim.");
    }
  } catch (err) {
    console.error(err);
    alert("Error rejecting claim.");
  }
};

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

  if (document.getElementById("claims-list")) {
    fetchPendingClaims();
  }
});

