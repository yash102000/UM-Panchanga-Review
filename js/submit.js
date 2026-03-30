function submitData() {

    const rows = document.querySelectorAll("#dataTable tbody tr");

    if (!rows.length) {
        alert("No data");
        return;
    }

    const language = document.getElementById("language").value;

    if (!language) {
        alert("Select language");
        return;
    }

    let list = [];
    let valid = true;
    let anySelected = false;

    rows.forEach(row => {

        const checkbox = row.querySelector(".rowCheckbox");

        
        if (!checkbox || !checkbox.checked) return;

        anySelected = true;
        row.classList.remove("invalid");

        const inputs = row.querySelectorAll("input:not([type='checkbox'])");
        const cells = row.querySelectorAll("td");

        const date  = cells[1]?.innerText.trim();
        const month = cells[2]?.innerText.trim();
        const year  = cells[3]?.innerText.trim();

        let rowValid = true;

        inputs.forEach(input => {
            if (!input.value || !input.value.trim()) {
                rowValid = false;
            }
        });

        if (!rowValid || !date || !month || !year) {
            valid = false;
            row.classList.add("invalid");
            return;
        }

        if (inputs.length < 16) {
            console.log("Input count mismatch:", inputs.length);
            valid = false;
            row.classList.add("invalid");
            return;
        }

        const obj = new Panchanga_Database(
            language,
            date,
            month,
            year,
            inputs[0].value.trim(),
            inputs[1].value.trim(),
            inputs[2].value.trim(),
            inputs[3].value.trim(),
            inputs[4].value.trim(),
            inputs[5].value.trim(),
            inputs[6].value.trim(),
            inputs[7].value.trim(),
            inputs[8].value.trim(),
            inputs[9].value.trim(),
            inputs[10].value.trim(),
            inputs[11].value.trim(),
            inputs[12].value.trim(),
            inputs[13].value.trim(),
            inputs[14].value.trim(),
            inputs[15].value.trim()
        );

        list.push(obj);
    });

    if (!anySelected) {
        alert("Select at least one row to submit");
        return;
    }

    if (!valid) {
        alert("Fill all fields in the selected rows");
        return;
    }

    const API_BASE = (window.API_BASE || "http://127.0.0.1:5000");
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
                alert(data.message || "Error saving data. Please ensure you are logged in.");
                if (data.message && data.message.toLowerCase().includes("log in")) {
                    window.location.replace("pages/login.html");
                }
            } else {
                alert(data.message);
                console.log("Submitted Data:", list);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error saving data. Server unreachable.");
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
