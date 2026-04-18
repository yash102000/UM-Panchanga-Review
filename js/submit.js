async function submitWorklist() {
    const tables = document.querySelectorAll("#worklistContainer table.work-table");
    if (tables.length === 0) {
        alert("No items in worklist.");
        return;
    }

    const list = [];

    tables.forEach(table => {
        const dateStr = table.getAttribute("data-date");
        const lang = table.getAttribute("data-lang");
        const inputs = table.querySelectorAll("input");
        
        const [y, m, d] = dateStr.split("-");
        const payload = {
            language: lang,
            date: d,
            month: m,
            year: y,
            update_fields: []
        };

        let tableHasData = false;
        inputs.forEach(inp => {
            const fieldId = inp.getAttribute("data-field");
            const val = inp.value.trim();
            if (val !== "") {
                payload[fieldId] = val;
                payload.update_fields.push(fieldId);
                tableHasData = true;
            }
        });

        if (tableHasData) {
            list.push(payload);
        }
    });

    if (list.length === 0) {
        alert("Please enter at least one value in the tables.");
        return;
    }

    const API_BASE = window.API_BASE || "";
    const token = localStorage.getItem("authToken");

    const btn = document.querySelector("button[onclick='submitWorklist()']");
    const originalText = btn.innerText;
    btn.innerText = "Submitting...";
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/save`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify(list)
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message || "Saved successfully!");
            if (typeof clearWorklistData === "function") clearWorklistData();
        } else {
            alert("Error: " + (data.message || "Failed to save."));
        }
    } catch (err) {
        console.error("Submission Error:", err);
        const API_BASE = window.API_BASE || "";
        alert(`Server error!\n\nFailed to connect to: ${API_BASE}/save\n\nDetails: ${err.message}\n\nPlease ensure your local backend is running (START.bat).`);
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
