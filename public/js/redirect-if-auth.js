(async function () {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    // No token, user is not authenticated, so they should be on the login/register page.
    return;
  }

  try {
    const res = await fetch("/api/v1/auth/check-status", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const { data } = await res.json();
      const userRole = data.role;

      // Store role if not already present, for convenience
      localStorage.setItem("role", userRole);

      // Redirect based on role
      switch (userRole) {
        case "PATIENT":
          window.location.href = "/patient/dashboard";
          break;
        case "DOCTOR":
          window.location.href = "/doctor/dashboard";
          break;
        case "ADMIN":
          window.location.href = "/admin/dashboard";
          break;
        case "STAFF":
          window.location.href = "/staff/dashboard";
          break;
        case "SUPER_ADMIN":
          window.location.href = "/super-admin/dashboard";
          break;
      }
    } else {
      // If API returns an error (e.g., 401 for expired/invalid token), clear storage.
      localStorage.clear();
    }
  } catch (error) {
    console.error("Error checking authentication status:", error);
  }
})();