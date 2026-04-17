function submitData() {
    const rows = document.querySelectorAll("#dataTable tbody tr");
    const language = document.getElementById("language").value;

    if (!rows.length) { alert("No data generated."); return; }
    if (!language) { alert("Please select a language."); return; }

    // 1. Identify all data columns
    const columns = document.querySelectorAll("th.data-col");
    const selectedFields = []; // e.g., ["rutu", "masa"]
    
    columns.forEach((th) => {
        selectedFields.push(th.getAttribute("data-field"));
    });

    let list = [];
    let anySelectedRow = false;

    rows.forEach(row => {
        const checkbox = row.querySelector(".rowCheckbox");
        if (!checkbox || !checkbox.checked) return;

        anySelectedRow = true;
        const inputs = row.querySelectorAll("input:not([type='checkbox'])");
        const cells = row.querySelectorAll("td");

        const payload = {
            language: language,
            date: cells[1]?.innerText.trim(),
            month: cells[2]?.innerText.trim(),
            year: cells[3]?.innerText.trim(),
            update_fields: [] // Will only contain fields that have data in this specific row
        };

        // Only add fields that have a value in this row
        selectedFields.forEach((fieldName, i) => {
            const value = inputs[i]?.value.trim();
            
            if (value && value !== "") {
                payload[fieldName] = value;
                payload.update_fields.push(fieldName);
            }
        });

        if (payload.update_fields.length > 0) {
            list.push(payload);
        }
    });

    if (!anySelectedRow) {
        alert("Please select at least one row (checkbox on left) to submit.");
        return;
    }

    const API_BASE = window.API_BASE || "";
    const token = localStorage.getItem("authToken");

    fetch(`${API_BASE}/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(list)
    })
    .then(res => Promise.all([res.ok, res.json()]))
    .then(([ok, data]) => {
        if (!ok) {
            alert(data.message || "Error saving data.");
        } else {
            alert(data.message || "Data updated successfully!");
            if (typeof clearAll === "function") clearAll();
            if (typeof updateRowCount === "function") updateRowCount();
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server error. Please check your connection.");
    });
}


function deleteSelectedRows() {

    const rows = document.querySelectorAll("#dataTable tbody tr");
    let deleted = false;

    rows.forEach(row => {
        const checkbox = row.querySelector(".rowCheckbox");

        if (checkbox && checkbox.checked) {
            row.remove();
            deleted = true;
        }
    });

    if (!deleted) {
        alert("Select at least one row to delete");
    }

    updateRowCount();
}


function clearSelectedRows() {

    const rows = document.querySelectorAll("#dataTable tbody tr");
    let cleared = false;

    rows.forEach(row => {
        const checkbox = row.querySelector(".rowCheckbox");

        if (checkbox && checkbox.checked) {

            const inputs = row.querySelectorAll("input:not([type='checkbox'])");
            inputs.forEach(input => input.value = "");


            const selects = row.querySelectorAll("select");
            selects.forEach(select => {
                select.selectedIndex = 0;
            });

            row.classList.remove("invalid");

            cleared = true;
        }
    });

    if (!cleared) {
        alert("Select at least one row to clear");
    }
}


function updateRowCount() {
    const rows = document.querySelectorAll("#dataTable tbody tr");
    const rowsField = document.getElementById("rows");

    if (rowsField) {
        rowsField.value = rows.length;
    }
}
