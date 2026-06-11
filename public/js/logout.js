export async function logout() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        window.location.href = "/";
        return;
    }

    try {
        await fetch("/api/v1/auth/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (err) {
        console.error("Logout Error:", err);
    } finally {
        localStorage.removeItem("accessToken");
        window.location.href = "/";
    }
}