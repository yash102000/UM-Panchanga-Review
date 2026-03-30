(function () {
    // Helper to normalize URL and strip trailing slash
    function normalize(url) {
        return (url || "").replace(/\/+$/, "");
    }

    // Allow setting once via window.API_BASE_URL, persisted in localStorage for friends
    const stored = window.localStorage ? window.localStorage.getItem("API_BASE_URL") : "";
    const origin =
        (window.location && /^https?:/i.test(window.location.origin) && window.location.origin !== "null")
            ? window.location.origin
            : "";

    const resolved =
        normalize(window.API_BASE_URL) ||
        normalize(stored) ||
        normalize(origin) ||
        "http://127.0.0.1:5000";

    window.API_BASE = resolved;
    if (window.localStorage && resolved !== stored) {
        window.localStorage.setItem("API_BASE_URL", resolved);
    }

    // helper for manual override from console or another script
    window.setApiBase = function (url) {
        const norm = normalize(url);
        window.API_BASE = norm;
        if (window.localStorage) {
            window.localStorage.setItem("API_BASE_URL", norm);
        }
        return norm;
    };

    // Date bounds for review form (override via window.PANCHANGA_DATE_MIN/MAX before this script)
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
