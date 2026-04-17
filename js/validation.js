/**
 * Panchanga Real-time Validation & Suggestion System
 * Handles automatic sequence prediction for Thithi, Nakshatra, and Vasara.
 */

const PANCHANGA_CONSTANTS = {
    // 30 Thithis in a full lunar month
    thithi: [
        "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami",
        "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
    ],
    // 27 Nakshatras
    nakshatra: [
        "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ],
    // 7 Vasaras (Days)
    vasara: [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
        "Bhanuvara", "Somavara", "Mangalavara", "Budhavara", "Guruvara", "Shukravara", "Shanivara",
        "Aditya", "Soma", "Mangala", "Budha", "Guru", "Shukra", "Shani"
    ],
    paksha: ["Shukla", "Krishna"]
};

// Map column indices (relative to data inputs)
const FIELD_INDICES = {
    rutu: 0,
    masa: 1,
    masaNiyamaka: 2,
    paksha: 3,
    thithi: 4,
    vasara: 5,
    nakshatra: 6
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
        // ONLY suggest data if the row is selected
        if (!nextRowCheckbox || !nextRowCheckbox.checked) return;

        const inputsInCurrentRow = row.querySelectorAll("td input:not([type='checkbox'])");
        const inputsInNextRow = nextRow.querySelectorAll("td input:not([type='checkbox'])");
        
        // Find which field is being edited
        let fieldIndex = -1;
        inputsInCurrentRow.forEach((inp, idx) => {
            if (inp === input) fieldIndex = idx;
        });

        const val = input.value.trim();
        if (!val) return;

        // --- Suggestion Logic ---

        // 1. Vasara (Day of Week)
        if (fieldIndex === FIELD_INDICES.vasara) {
            handleSequenceSuggestion(val, PANCHANGA_CONSTANTS.vasara, inputsInNextRow[FIELD_INDICES.vasara], 7);
        }

        // 2. Nakshatra
        if (fieldIndex === FIELD_INDICES.nakshatra) {
            handleSequenceSuggestion(val, PANCHANGA_CONSTANTS.nakshatra, inputsInNextRow[FIELD_INDICES.nakshatra], 27);
        }

        // 3. Thithi & Paksha Relationship
        if (fieldIndex === FIELD_INDICES.thithi) {
            const currentThithiIdx = findIndexInSequence(val, PANCHANGA_CONSTANTS.thithi);
            if (currentThithiIdx !== -1) {
                const nextThithiIdx = (currentThithiIdx + 1) % 30;
                const nextThithiVal = PANCHANGA_CONSTANTS.thithi[nextThithiIdx];
                
                // Set next Thithi
                if (!inputsInNextRow[FIELD_INDICES.thithi].value) {
                    inputsInNextRow[FIELD_INDICES.thithi].value = nextThithiVal;
                    highlightSuggestion(inputsInNextRow[FIELD_INDICES.thithi]);
                }

                // Handle Paksha Toggle (Shukla -> Krishna or Krishna -> Shukla)
                if (val.toLowerCase() === "pournami") {
                    suggestPaksha(inputsInNextRow[FIELD_INDICES.paksha], "Krishna");
                } else if (val.toLowerCase() === "amavasya") {
                    suggestPaksha(inputsInNextRow[FIELD_INDICES.paksha], "Shukla");
                } else {
                    // Normal day: inherit paksha
                    if (!inputsInNextRow[FIELD_INDICES.paksha].value) {
                        inputsInNextRow[FIELD_INDICES.paksha].value = inputsInCurrentRow[FIELD_INDICES.paksha].value;
                    }
                }
            }
        }

        // 4. Inherit stationary fields (Masa, Rutu, etc.)
        const stationaryFields = [FIELD_INDICES.rutu, FIELD_INDICES.masa, FIELD_INDICES.masaNiyamaka, FIELD_INDICES.paksha];
        if (stationaryFields.includes(fieldIndex)) {
            if (!inputsInNextRow[fieldIndex].value) {
                inputsInNextRow[fieldIndex].value = val;
            }
        }
    }
});

function handleSequenceSuggestion(currentVal, sequence, nextInput, module) {
    if (nextInput.value) return; // Don't override user data

    const currentIdx = findIndexInSequence(currentVal, sequence);
    if (currentIdx !== -1) {
        // Handle wraparound for that specific sequence module
        const startOfModule = Math.floor(currentIdx / module) * module;
        const relativeIdx = currentIdx % module;
        const nextRelativeIdx = (relativeIdx + 1) % module;
        const nextVal = sequence[startOfModule + nextRelativeIdx];
        
        nextInput.value = nextVal;
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
    input.style.backgroundColor = "#e0f2fe"; // Light blue to show it was auto-filled
    setTimeout(() => {
        input.style.transition = "background-color 1s";
        input.style.backgroundColor = "";
    }, 2000);
}
