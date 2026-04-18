function clearAll() {
    document.querySelector("#dataTable tbody").innerHTML = "";
    document.getElementById("rows").value = "";
}

function resetAll() {
    clearAll();
    document.getElementById("language").value = "";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";
    
    // Also clear the bulk entry section
    const bulkField = document.getElementById("bulkField");
    const bulkValue = document.getElementById("bulkValue");
    if (bulkField) bulkField.value = "";
    if (bulkValue) bulkValue.value = "";

    // Reset field selectors to default (all checked)
    if (typeof toggleAllFields === "function") toggleAllFields(true);
}

function toggleAllFields(checked) {
    const toggles = document.querySelectorAll(".field-toggle");
    toggles.forEach(t => t.checked = checked);
    syncColumnVisibility();
}

function applyBulkValue() {
    const field = document.getElementById("bulkField").value;
    const value = document.getElementById("bulkValue").value;
    
    if (!field) {
        alert("Please select a field from the dropdown.");
        return;
    }
    
    // Find the static index of this field
    const inputIndex = ALL_FIELDS.findIndex(f => f.id === field);

    if (inputIndex === -1) {
        alert(`The field "${field}" is not valid.`);
        return;
    }

    const rows = document.querySelectorAll("#dataTable tbody tr");
    let appliedCount = 0;
    
    rows.forEach(row => {
        const checkbox = row.querySelector(".rowCheckbox");
        if (checkbox && checkbox.checked) {
            const inputs = row.querySelectorAll("td input:not([type='checkbox'])");
            if (inputs[inputIndex]) {
                inputs[inputIndex].value = value;
                // Trigger validation logic for sequels
                inputs[inputIndex].dispatchEvent(new Event('input', { bubbles: true }));
                appliedCount++;
            }
        }
    });

    if (appliedCount === 0) {
        alert("No rows selected. Please select rows using the checkboxes on the left.");
    }
}
