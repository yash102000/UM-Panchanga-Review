(function () {
    function normalize(url) {
        return (url || "").replace(/\/+$/, "");
    }

    
    const stored = window.localStorage ? window.localStorage.getItem("API_BASE_URL") : "";
    const origin =
        (window.location && /^https?:/i.test(window.location.origin) && window.location.origin !== "null")
            ? window.location.origin
            : "";

    // Skip GitHub Pages and other static hosts - use AWS endpoint instead
    const isStaticHost = origin.includes("github.io") || origin.includes("netlify.app") || origin.includes("vercel.app");
    const originToUse = !isStaticHost && origin ? origin : "";

    const resolved =
        normalize(window.API_BASE_URL) ||
        normalize(stored) ||
        normalize(originToUse) ||
        "https://2plrprlxqh.execute-api.ap-south-1.amazonaws.com/prod";

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
