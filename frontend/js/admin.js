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

    if (!claims.length) {
      listEl.innerHTML = "<li>No pending claims right now.</li>";
      return;
    }

    for (const claim of claims) {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Item: ${claim.itemTitle}</strong> (Item ID: ${claim.itemId})<br/>
        <small>Claimant ID: ${claim.claimantId} | Requested on: ${new Date(claim.createdAt).toLocaleDateString()}</small>
        <div style="margin-top: 5px;">
          <button onclick="approveClaim('${claim.id}')" style="background:green; color:white;">Approve</button>
          <button onclick="rejectClaim('${claim.id}')" style="background:red; color:white; margin-left:10px;">Reject</button>
        </div>
      `;
      listEl.appendChild(li);
    }
  } catch (err) {
    console.error(err);
    listEl.innerHTML = "<li>Error loading claims.</li>";
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

