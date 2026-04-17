function clearAll() {
    document.querySelector("#dataTable tbody").innerHTML = "";
    document.getElementById("rows").value = "";
}

function resetAll() {
    clearAll();
    document.getElementById("language").value = "";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
}

function applyBulkValue() {
    const field = document.getElementById("bulkField").value;
    const value = document.getElementById("bulkValue").value;
    
    if (!field) {
        alert("Please select a field from the dropdown.");
        return;
    }
    
    const fieldMap = {
        "rutu": 0,
        "masa": 1,
        "masaNiyamaka": 2,
        "paksha": 3,
        "thithi": 4,
        "vasara": 5,
        "nakshatra": 6,
        "yoga": 7,
        "karana": 8,
        "shradhatithi": 9,
        "vishesha": 10
    };
    
    const index = fieldMap[field];
    const rows = document.querySelectorAll("#dataTable tbody tr");
    let appliedCount = 0;
    
    rows.forEach(row => {
        const checkbox = row.querySelector(".rowCheckbox");
        if (checkbox && checkbox.checked) {
            const inputs = row.querySelectorAll("td input:not([type='checkbox'])");
            if (inputs[index]) {
                inputs[index].value = value;
                // Trigger validation logic for sequels
                inputs[index].dispatchEvent(new Event('input', { bubbles: true }));
                appliedCount++;
            }
        }
    });

    if (appliedCount === 0) {
        alert("No rows selected. Please select rows using the checkboxes on the left.");
    }
}
