/**
 * Panchanga Real-time Validation & Suggestion System (Dynamic Column Aware)
 * Handles automatic sequence prediction for Thithi, Nakshatra, and Vasara.
 */

const PANCHANGA_CONSTANTS = {
    thithi: [
        "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami",
        "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
    ],
    nakshatra: [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ],
    vasara: [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
        "Bhanuvara", "Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara",
        "Aditya", "Soma", "Mangala", "Budha", "Guru", "Shukra", "Shani"
    ],
    paksha: ["Shukla", "Krishna"]
};

document.addEventListener('input', function (e) {
    if (e.target.tagName === 'INPUT' && e.target.closest('#dataTable')) {
        const input = e.target;
        const cell = input.parentElement;
        const row = cell.parentElement;
        const allRows = Array.from(document.querySelectorAll("#dataTable tbody tr"));
        const rowIndex = allRows.indexOf(row);
        const nextRow = allRows[rowIndex + 1];

        if (!nextRow) return;

        const nextRowCheckbox = nextRow.querySelector(".rowCheckbox");
        if (!nextRowCheckbox || !nextRowCheckbox.checked) return;

        // Dynamic Field Detection
        const headers = Array.from(document.querySelectorAll("#dataTable thead th"));
        const cellsInRow = Array.from(row.querySelectorAll("td"));
        const currentCellIndex = cellsInRow.indexOf(cell);
        
        const fieldId = headers[currentCellIndex].getAttribute("data-field");
        if (!fieldId) return; // Not a data field

        const val = input.value.trim();
        if (!val) return;

        // Fetch inputs for relative fields in next row
        const getNextInput = (id) => {
            const idx = headers.findIndex(th => th.getAttribute("data-field") === id);
            return idx !== -1 ? nextRow.querySelectorAll("td")[idx].querySelector("input") : null;
        };
        
        const getCurrentInput = (id) => {
            const idx = headers.findIndex(th => th.getAttribute("data-field") === id);
            return idx !== -1 ? row.querySelectorAll("td")[idx].querySelector("input") : null;
        };

        // --- Suggestion Logic ---

        if (fieldId === "vasara") {
            const nextInp = getNextInput("vasara");
            if (nextInp) handleSequenceSuggestion(val, PANCHANGA_CONSTANTS.vasara, nextInp, 7);
        }

        if (fieldId === "nakshatra") {
            const nextInp = getNextInput("nakshatra");
            if (nextInp) handleSequenceSuggestion(val, PANCHANGA_CONSTANTS.nakshatra, nextInp, 27);
        }

        if (fieldId === "thithi") {
            const nextThithiInp = getNextInput("thithi");
            const nextPakshaInp = getNextInput("paksha");
            const currentPakshaInp = getCurrentInput("paksha");

            const currentThithiIdx = findIndexInSequence(val, PANCHANGA_CONSTANTS.thithi);
            if (currentThithiIdx !== -1 && nextThithiInp) {
                const nextThithiIdx = (currentThithiIdx + 1) % 30;
                if (!nextThithiInp.value) {
                    nextThithiInp.value = PANCHANGA_CONSTANTS.thithi[nextThithiIdx];
                    highlightSuggestion(nextThithiInp);
                }

                if (nextPakshaInp) {
                    if (val.toLowerCase() === "pournami") suggestPaksha(nextPakshaInp, "Krishna");
                    else if (val.toLowerCase() === "amavasya") suggestPaksha(nextPakshaInp, "Shukla");
                    else if (currentPakshaInp && !nextPakshaInp.value) {
                        nextPakshaInp.value = currentPakshaInp.value;
                    }
                }
            }
        }

        // Stationary Inherit
        const stationary = ["rutu", "masa", "masaNiyamaka", "paksha"];
        if (stationary.includes(fieldId)) {
            const nextInp = getNextInput(fieldId);
            if (nextInp && !nextInp.value) {
                nextInp.value = val;
            }
        }
    }
});

function handleSequenceSuggestion(currentVal, sequence, nextInput, module) {
    if (nextInput.value) return;
    const currentIdx = findIndexInSequence(currentVal, sequence);
    if (currentIdx !== -1) {
        const startOfModule = Math.floor(currentIdx / module) * module;
        const relativeIdx = currentIdx % module;
        const nextRelativeIdx = (relativeIdx + 1) % module;
        nextInput.value = sequence[startOfModule + nextRelativeIdx];
        highlightSuggestion(nextInput);
    }
}

function findIndexInSequence(val, sequence) {
    const lowVal = val.toLowerCase();
    return sequence.findIndex(item => item.toLowerCase() === lowVal);
}

function suggestPaksha(input, value) {
    input.value = value;
    highlightSuggestion(input);
}

function highlightSuggestion(input) {
    input.style.backgroundColor = "#e0f2fe";
    setTimeout(() => {
        input.style.transition = "background-color 1s";
        input.style.backgroundColor = "";
    }, 2000);
}
