const ALL_FIELDS = [
    { id: "rutu", label: "Rutu" },
    { id: "masa", label: "Masa" },
    { id: "masaNiyamaka", label: "Masa Niyamaka" },
    { id: "paksha", label: "Paksha" },
    { id: "thithi", label: "Thithi" },
    { id: "vasara", label: "Vasara" },
    { id: "nakshatra", label: "Nakshatra" },
    { id: "yoga", label: "Yoga" },
    { id: "karana", label: "Karana" },
    { id: "shradhatithi", label: "Shradha Tithi" },
    { id: "vishesha", label: "Vishesha" }
];

let worklist = []; // Array of { id, date, lang, fields, values }

document.addEventListener("DOMContentLoaded", () => {
    initFieldChecklist();
    setDefaultDates();
});

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const targetDateInput = document.getElementById("targetDate");
    if (targetDateInput) targetDateInput.value = today;
}

function initFieldChecklist() {
    const container = document.getElementById("fieldChecklist");
    if (!container) return;
    
    container.innerHTML = ALL_FIELDS.map(f => `
        <label style="display: flex; align-items: center; gap: 5px; font-size: 13px; cursor: pointer;">
            <input type="checkbox" class="field-check" value="${f.id}">
            ${f.label}
        </label>
    `).join("");
}

function toggleAllChecks(checked) {
    document.querySelectorAll(".field-check").forEach(c => c.checked = checked);
}

function addTargetedRows() {
    const dateVal = document.getElementById("targetDate").value;
    const language = document.getElementById("language").value;
    const checkedFields = Array.from(document.querySelectorAll(".field-check:checked")).map(i => i.value);

    if (!dateVal) { alert("Please select a date."); return; }
    if (!language) { alert("Please select a language."); return; }
    if (checkedFields.length === 0) { alert("Please select at least one field."); return; }

    const entry = {
        id: Date.now(),
        date: dateVal,
        lang: language,
        fields: [...checkedFields],
        values: {} // Track inputs so they aren't lost on re-render
    };

    worklist.push(entry);
    renderWorklist();
    
    // Reset checklist
    document.querySelectorAll(".field-check").forEach(c => c.checked = false);
}

function renderWorklist() {
    const container = document.getElementById("worklistContainer");
    const section = document.getElementById("worklistSection");

    if (worklist.length === 0) {
        section.style.display = "none";
        return;
    }
    section.style.display = "block";

    // Preserve existing values before clearing
    const tables = container.querySelectorAll("table.work-table");
    tables.forEach(table => {
        const id = table.getAttribute("data-id");
        const entry = worklist.find(e => e.id == id);
        if (entry) {
            table.querySelectorAll("input").forEach(inp => {
                const f = inp.getAttribute("data-field");
                entry.values[f] = inp.value;
            });
        }
    });

    container.innerHTML = "";

    worklist.forEach(entry => {
        const wrapper = document.createElement("div");
        wrapper.className = "table-container";
        wrapper.style.marginBottom = "20px";
        wrapper.style.border = "1px solid rgba(0,0,0,0.1)";
        wrapper.style.borderRadius = "8px";
        wrapper.style.overflow = "hidden";

        const [y, m, d] = entry.date.split("-");

        const table = document.createElement("table");
        table.className = "work-table";
        table.setAttribute("data-id", entry.id);
        table.setAttribute("data-date", entry.date);
        table.setAttribute("data-lang", entry.lang);

        // Header
        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th style="width: 50px;">Date</th>
                <th style="width: 50px;">Month</th>
                <th style="width: 60px;">Year</th>
                ${entry.fields.map(fId => {
                    const f = ALL_FIELDS.find(field => field.id === fId);
                    return `<th>${f.label}</th>`;
                }).join("")}
                <th style="width: 80px;">Action</th>
            </tr>
        `;
        table.appendChild(thead);

        // Body
        const tbody = document.createElement("tbody");
        const row = document.createElement("tr");

        // UI Detail: If only one field is selected, make the input smaller so it doesn't span the whole page
        const isSingleField = entry.fields.length === 1;
        const inputWidth = isSingleField ? "250px" : "100%";

        row.innerHTML = `
            <td style="font-weight:bold;">${d}</td>
            <td>${m}</td>
            <td>${y}</td>
            ${entry.fields.map(fId => {
                const val = entry.values[fId] || "";
                return `<td style="text-align: left;"><input type="text" data-field="${fId}" value="${val}" style="width:${inputWidth}; min-width:120px; padding:8px; border:1px solid #ccc; border-radius:4px; box-sizing:border-box;"></td>`;
            }).join("")}
            <td><button class="btn btn-danger" style="padding:6px 14px; font-size:12px;" onclick="removeEntry(${entry.id})">Remove</button></td>
        `;
        tbody.appendChild(row);
        table.appendChild(tbody);

        wrapper.appendChild(table);
        container.appendChild(wrapper);
    });
}

function removeEntry(id) {
    worklist = worklist.filter(e => e.id != id);
    renderWorklist();
}

function resetWorklist() {
    if (confirm("Reset everything?")) {
        worklist = [];
        document.getElementById("language").value = "";
        document.querySelectorAll(".field-check").forEach(c => c.checked = false);
        renderWorklist();
    }
}

function clearWorklistData() {
    worklist = [];
    renderWorklist();
}