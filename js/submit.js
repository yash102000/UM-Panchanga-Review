function submitData() {
    const rows = document.querySelectorAll("#dataTable tbody tr");
    const language = document.getElementById("language").value;

    if (!rows.length) { alert("No data generated."); return; }
    if (!language) { alert("Please select a language."); return; }

    // 1. Identify which columns are selected for update
    const columnSelectors = document.querySelectorAll(".col-selector");
    const selectedFields = []; // e.g., ["rutu", "masa"]
    const selectedIndices = []; // e.g., [0, 1]

    columnSelectors.forEach((selector, index) => {
        if (selector.checked) {
            selectedFields.push(selector.getAttribute("data-field"));
            selectedIndices.push(index);
        }
    });

    if (selectedFields.length === 0) {
        alert("Please select at least one column (checkbox in header) to update.");
        return;
    }

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
            update_fields: selectedFields // Tell backend which fields to update
        };

        // Only add the fields that were selected in the header
        selectedIndices.forEach((inputIdx, i) => {
            const fieldName = selectedFields[i];
            const value = inputs[inputIdx].value.trim();
            payload[fieldName] = value;
        });

        list.push(payload);
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
