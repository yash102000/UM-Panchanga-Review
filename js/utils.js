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
