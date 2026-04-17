function generateRows() {

    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    const tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";

    if (!fromDate) {
        alert("Select From Date");
        return;
    }

    let start = new Date(fromDate);
    let end = toDate ? new Date(toDate) : new Date(fromDate);

    let count = 0;

    while (start <= end) {

        const dates = start.toISOString().split("T")[0];
        const [year, month, date] = dates.split("-");

        const row = document.createElement("tr");

        row.innerHTML = `
            <td><input type="checkbox" class="rowCheckbox"></td>
            <td>${date}</td>
            <td>${month}</td>
            <td>${year}</td>

            ${Array(11).fill('<td><input></td>').join("")}
        `;

//         row.innerHTML = `
//     <td><input type="checkbox" class="rowCheckbox"></td>
//     <td>${day}</td>
//     <td>${month}</td>
//     <td>${year}</td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
//     <td><input type="text"></td>
// `;

        tbody.appendChild(row);

        start.setDate(start.getDate() + 1);
        count++;
    }

    document.getElementById("rows").value = count;
}