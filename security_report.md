# Security Report

This report outlines a common web vulnerability, explains how it could be exploited in the context of the Digital Lost & Found System, and details how the system is designed to prevent it.

## Vulnerability: Insecure Direct Object Reference (IDOR) on Claim Approvals

### Description
Insecure Direct Object Reference (IDOR) occurs when an application provides direct access to objects based on user-supplied input. In our system, the critical objects are **Claims** and **Items**. Without proper authorization checks, a malicious user could interact with claims they do not own or approve claims without having the correct administrative privileges.

### How it could be exploited
If the endpoint `/api/admin/claims/:claimId/approve` only checked if an user was logged in (valid JWT) but didn't verify their role, an exploit would look like this:
1. A standard student logs into the system. They intercept the network traffic to retrieve their JWT token.
2. The student wants an item that another person claimed. They guess or enumerate the `claimId` (e.g., `1`, `2`, `3`).
3. The student sends an unauthorized POST request to `http://localhost:5000/api/admin/claims/1/approve` using their standard student token in the `Authorization` header.
4. Because the server only verified the token's validity and ignored the user's role, the server approves the claim. The student successfully bypassed the admin approval workflow.

### How it was prevented
We mitigated this vulnerability by implementing **Role-Based Access Control (RBAC)** via custom middleware.

Our system uses two specific middlewares on sensitive routes:
1. `authenticate`: Verifies that the JWT is valid and attaches the decoded user payload to the request (`req.user = payload;`).
2. `requireAdmin`: Explicitly checks that `req.user.role === "admin"`. If not, it rejects the request outright with a `403 Forbidden` status.

```javascript
// middleware/auth.js
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// routes/admin.js (Usage)
router.post("/claims/:claimId/approve", authenticate, requireAdmin, (req, res) => {
  // Logic to approve the claim...
});
```

By adding `requireAdmin` to the route definition, any HTTP request hitting the approval endpoint from a student account will instantly hit the `403 Forbidden` block, guaranteeing that only authenticated administrators can mutate the claim status.
