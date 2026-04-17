(function () {
    function normalize(url) {
        return (url || "").replace(/\/+$/, "");
    }

    
    const stored = window.localStorage ? window.localStorage.getItem("API_BASE_URL") : "";
    const origin =
        (window.location && /^https?:/i.test(window.location.origin) && window.location.origin !== "null")
            ? window.location.origin
            : "";

    // If we're on a common static host, we might need an external backend.
    // Otherwise, if we're on Render (or similar), we use the same origin.
    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
    const isStaticHost = origin.includes("github.io") || origin.includes("netlify.app") || origin.includes("vercel.app");

    let resolved = "";

    // Priority:
    // 1. Explicitly set window.API_BASE_URL (highest priority)
    // 2. Previously stored URL in localStorage
    // 3. Current origin (if not a static host like GitHub Pages)
    // 4. Fallback to AWS (last resort)

    if (window.API_BASE_URL) {
        resolved = normalize(window.API_BASE_URL);
    } else if (stored) {
        resolved = normalize(stored);
    } else if (origin && !isStaticHost) {
        resolved = normalize(origin);
    } else {
        resolved = "https://2plrprlxqh.execute-api.ap-south-1.amazonaws.com/prod";
    }

    // Special case: if we are on Render, definitely use the origin
    if (origin.includes("onrender.com")) {
        resolved = origin;
    }

    window.API_BASE = resolved;
    if (window.localStorage && resolved !== stored) {
        window.localStorage.setItem("API_BASE_URL", resolved);
    }

    
    window.setApiBase = function (url) {
        const norm = normalize(url);
        window.API_BASE = norm;
        if (window.localStorage) {
            window.localStorage.setItem("API_BASE_URL", norm);
        }
        return norm;
    };


    window.PANCHANGA_DATE_MIN = window.PANCHANGA_DATE_MIN || "2026-03-20";
    window.PANCHANGA_DATE_MAX = window.PANCHANGA_DATE_MAX || "2027-04-08";

    function applyDateBounds() {
        const min = window.PANCHANGA_DATE_MIN;
        const max = window.PANCHANGA_DATE_MAX;
        ["fromDate", "toDate"].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            if (min) el.min = min;
            if (max) el.max = max;
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyDateBounds);
    } else {
        applyDateBounds();
    }
})();
