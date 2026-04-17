function showErrorPopup(message) {
    const existing = document.getElementById("authErrorPopup");
    if (existing) existing.remove();

    const popup = document.createElement("div");
    popup.id = "authErrorPopup";
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4d4d;
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        z-index: 9999;
        animation: fadeInDown 0.3s ease;
    `;
    popup.textContent = message;
    document.body.appendChild(popup);

    
    setTimeout(() => { if (popup.parentNode) popup.remove(); }, 3000);
}


if (!document.getElementById("popupStyles")) {
    const style = document.createElement("style");
    style.id = "popupStyles";
    style.textContent = `@keyframes fadeInDown { from { opacity:0; top:0; } to { opacity:1; top:20px; } }`;
    document.head.appendChild(style);
}

const API_BASE = window.API_BASE || "";


function togglePassword() {
    const input = document.querySelector("input[type='password']");
    input.type = input.type === "password" ? "text" : "password";
}


document.getElementById("loginForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        showErrorPopup("Please fill in all fields.");
        return;
    }

    fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                localStorage.setItem("isLoggedIn", "true");
                if (data.token) {
                    localStorage.setItem("authToken", data.token);
                }
                window.location.replace("/dashboard");
            } else {
                showErrorPopup(data.message || "Invalid email or password.");
            }
        })
        .catch(() => showErrorPopup("Server error. Please try again."));
});


document.getElementById("forgotForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("resetEmail").value.trim();

    if (!email) {
        showErrorPopup("Please enter your email address.");
        return;
    }

    fetch(`${API_BASE}/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message || "Reset link sent! Check your email.");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        })
        .catch(() => showErrorPopup("Server error. Please try again."));
});


function getToken() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("token");
}

function resetPassword() {
    const token = getToken();
    if (!token) {
        showErrorPopup("Invalid reset link. Please request a new password reset email.");
        return;
    }

    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword") ? document.getElementById("confirmPassword").value.trim() : newPassword;

    if (!newPassword) {
        showErrorPopup("Please enter a new password.");
        return;
    }

    if (newPassword !== confirmPassword) {
        showErrorPopup("Passwords do not match!");
        return;
    }

    fetch(`${API_BASE}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: newPassword })
    })
        .then(res => Promise.all([res.ok, res.json()]))
        .then(([ok, data]) => {
            if (ok) {
                alert(data.message || "Password updated successfully! Redirecting to login...");
                window.location.replace("/login");
            } else {
                showErrorPopup(data.message || "Reset failed. Please try again.");
            }
        })
        .catch(() => showErrorPopup("Server error. Please try again."));
}


document.getElementById("signupForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const lastname = document.getElementById("lastname") ? document.getElementById("lastname").value.trim() : "";
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
        showErrorPopup("Please fill in all required fields.");
        return;
    }

    fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, lastname, email, password })
    })
        .then(res => Promise.all([res.ok, res.json()]))
        .then(([ok, data]) => {
            if (!ok) {
                showErrorPopup(data.message || "Signup failed. Please try again.");
            } else {
                alert(data.message || "Registered successfully! Please log in.");
                window.location.href = "/login";
            }
        })
        .catch(() => showErrorPopup("Server error. Please try again."));
});
