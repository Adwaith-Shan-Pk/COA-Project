// --- CONFIGURATION ---
const BIT_COUNT = 8;
const inputModes = {
    A: 'binary',
    B: 'binary'
};

// --- UI UTILITIES ---

/**
 * Utility function to show custom message box (instead of alert).
 * @param {string} msg - The message to display.
 */
function showMessage(msg) {
    document.getElementById('messageContent').innerHTML = msg; // Changed to innerHTML to allow formatting
    document.getElementById('messageBox').classList.remove('hidden');
    document.getElementById('messageBox').classList.add('flex');
}

/**
 * Hides the custom message box.
 */
function hideMessage() {
    document.getElementById('messageBox').classList.add('hidden');
    document.getElementById('messageBox').classList.remove('flex');
}


function showHelpInfo() {
    const helpContent = `
        <h3 class="text-xl font-bold text-teal-400 mb-3">About CPU Flags Visualizer</h3>
        <p class="mb-3 text-gray-300">This tool simulates an 8-bit addition (ADD) operation and calculates the resulting status flags (C, Z, S, O).</p>
        
        <h4 class="font-semibold text-teal-500 mt-4 mb-1">Flag Definitions:</h4>
        <ul class="list-disc list-inside text-sm text-gray-400 space-y-1">
            <li><strong class="text-gray-100">C (Carry):</strong> Set if there is a carry-out from the MSB (most significant bit). Indicates an <strong class="text-teal-400">unsigned overflow</strong>.</li>
            <li><strong class="text-gray-100">Z (Zero):</strong> Set if the entire result of the operation is zero.</li>
            <li><strong class="text-gray-100">S (Sign):</strong> Set equal to the value of the MSB of the result. Indicates a <strong class="text-teal-400">negative result</strong> in signed mode.</li>
            <li><strong class="text-gray-100">O (Overflow):</strong> Set if the signed result is too large (positive) or too small (negative) to fit in the ${BIT_COUNT} bits. Indicates a <strong class="text-teal-400">signed overflow</strong>. Calculated as: Carry-in to MSB XOR Carry-out from MSB.</li>
        </ul>
    `;
    showMessage(helpContent);
}


function showExamples() {
    const examplesContent = `
        <h3 class="text-xl font-bold text-teal-400 mb-3">Illustrative Examples (8-bit ADD)</h3>
        
        <div class="space-y-3 text-sm text-gray-400">
            <p><strong>1. Unsigned Overflow (C=1):</strong></p>
            <p class="font-mono bg-gray-600 p-2 rounded-lg text-gray-200">A = 200 (11001000) + B = 100 (01100100)</p>
            <p>Expected Result: 300 (Overflows 255). <strong class="text-teal-400">C=1, Z=0, S=0, O=1</strong></p>

            <p><strong>2. Signed Positive Overflow (O=1):</strong></p>
            <p class="font-mono bg-gray-600 p-2 rounded-lg text-gray-200">A = 100 (01100100) + B = 50 (00110010)</p>
            <p>Expected Result: 150 (Overflows max signed +127). <strong class="text-teal-400">C=0, Z=0, S=1, O=1</strong></p>

            <p><strong>3. Zero Result (Z=1):</strong></p>
            <p class="font-mono bg-gray-600 p-2 rounded-lg text-gray-200">A = 50 (00110010) + B = -50 (11001110) in signed mode</p>
            <p>Expected Result: 0. <strong class="text-teal-400">C=1, Z=1, S=0, O=0</strong></p>
        </div>
    `;
    showMessage(examplesContent);
}


/**
 * Sets the input mode (Decin or Binary) for Input A or B and updates UI.
 * @param {string} input - 'A' or 'B'
 * @param {string} mode - 'decin' or 'binary'
 */
function setMode(input, mode) {
    inputModes[input] = mode;
    const inputEl = document.getElementById('input' + input);
    const errorEl = document.getElementById('error' + input);
    
    // Update button styles for the dark theme
    document.querySelectorAll(`.mode-btn-${input.toLowerCase()}`).forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.remove('bg-gray-700', 'text-gray-300');
            btn.classList.add('bg-teal-500', 'text-white');
        } else {
            btn.classList.add('bg-gray-700', 'text-gray-300');
            btn.classList.remove('bg-teal-500', 'text-white');
        }
    });

    // Update input attributes
    if (mode === 'binary') {
        inputEl.placeholder = `Binary (max ${BIT_COUNT} bits)`;
        inputEl.maxLength = BIT_COUNT;
    } else {
        inputEl.placeholder = `Decimal (max ${Math.pow(2, BIT_COUNT) - 1})`;
        inputEl.maxLength = 3; 
    }
    // Clear input and error message on mode change
    inputEl.value = '';
    errorEl.textContent = '';
}

// Initial setup for the modes
setMode('A', 'binary');
setMode('B', 'binary');

/**
 * Validates input based on the current mode (Binary or Decimal).
 * @param {string} input - 'A' or 'B'
 */
function validateInput(input) {
    const inputEl = document.getElementById('input' + input);
    const errorEl = document.getElementById('error' + input);
    let value = inputEl.value.trim();
    errorEl.textContent = '';
    
    if (inputModes[input] === 'binary') {
        // Remove non-binary characters and limit length
        value = value.replace(/[^01]/g, '').slice(0, BIT_COUNT);
        inputEl.value = value;
        
        if (value.length > BIT_COUNT) {
            errorEl.textContent = `Must be ≤ ${BIT_COUNT} bits.`;
        }
    } else { // Decin mode
        // Remove non-digit characters
        value = value.replace(/[^0-9]/g, '');
        inputEl.value = value;
        
        const decVal = parseInt(value, 10);
        const maxValue = Math.pow(2, BIT_COUNT) - 1;

        if (value === '') {
            // Do nothing
        } else if (isNaN(decVal)) {
            errorEl.textContent = 'Invalid number.';
        } else if (decVal < 0 || decVal > maxValue) {
            errorEl.textContent = `Must be between 0 and ${maxValue}.`;
        }
    }
}

/**
 * Converts the input value to a padded, BIT_COUNT-length binary string.
 * @param {string} input - 'A' or 'B'
 * @returns {string|null} - Padded binary string or null if invalid/empty
 */
function getPaddedBinaryValue(input) {
    const inputEl = document.getElementById('input' + input);
    const mode = inputModes[input];
    let value = inputEl.value.trim();

    if (mode === 'binary') {
        if (value.length === 0 || value.length > BIT_COUNT) return null;
        // Pad with leading zeros to BIT_COUNT length
        return value.padStart(BIT_COUNT, '0');
    } else { // Decin mode
        if (value.length === 0) return null;
        const decVal = parseInt(value, 10);
        if (isNaN(decVal) || decVal < 0 || decVal > Math.pow(2, BIT_COUNT) - 1) return null;
        // Convert decimal to binary and pad
        return decVal.toString(2).padStart(BIT_COUNT, '0');
    }
}

// --- CORE LOGIC ---

/**
 * Core logic for 8-bit binary addition and flag calculation.
 */
function executeOperation() {
    const binaryA = getPaddedBinaryValue('A');
    const binaryB = getPaddedBinaryValue('B');
    const signedMode = document.getElementById('signedMode').checked;

    // 1. Validation
    if (!binaryA || !binaryB) {
        showMessage('Please enter valid, non-empty values for both Input A and Input B.');
        return;
    }

    // 2. Binary Addition (Iterative full adder simulation)
    let sumBinary = '';
    let carryOut = 0;
    let finalCarryOut = 0; // Carry out of MSB (C flag)
    let carryInToMSB = 0;  // Carry into MSB (used for O flag calculation)
    
    // Loop from LSB (right: index 7) to MSB (left: index 0)
    for (let i = BIT_COUNT - 1; i >= 0; i--) {
        const bitA = parseInt(binaryA[i]);
        const bitB = parseInt(binaryB[i]);
        
        // Full Adder logic: Sum = A XOR B XOR CarryIn
        const sumBit = bitA ^ bitB ^ carryOut;
        // CarryOut = (A AND B) OR (A AND CarryIn) OR (B AND CarryIn)
        const newCarryOut = (bitA & bitB) | (bitA & carryOut) | (bitB & carryOut);
        
        sumBinary = sumBit + sumBinary;

        // Track carry into the MSB (position i=0)
        if (i === 1) {
            carryInToMSB = carryOut;
        }
        
        // Track the final carry out of the MSB
        if (i === 0) {
            finalCarryOut = newCarryOut;
        }
        
        carryOut = newCarryOut;
    }

    // The resulting binary string is 8 bits long (discarding finalCarryOut)
    const resultBinary = sumBinary.slice(-BIT_COUNT); 
    const resultDecimal = parseInt(resultBinary, 2);

    // 3. Flag Calculation
    let flags = { C: 0, Z: 0, S: 0, O: 0 };
    
    // a) Zero Flag (Z): Set if result is all zeros
    flags.Z = (resultDecimal === 0) ? 1 : 0;
    
    // b) Sign Flag (S): Set if MSB of the result is 1 (resultBinary[0])
    flags.S = parseInt(resultBinary[0]); 
    
    // c) Carry Flag (C): Set if there is a carry out of the MSB
    flags.C = finalCarryOut;

    // d) Overflow Flag (O): XOR of the carry-in and carry-out of the MSB
    if (signedMode) {
        // Overflow (O) = CarryIn_MSB XOR CarryOut_MSB
        flags.O = carryInToMSB ^ finalCarryOut;
    } else {
        // O flag is typically ignored or set to 0 in unsigned arithmetic
        flags.O = 0;
    }

    // 4. Update UI
    updateResultDisplay(resultBinary, signedMode);
    updateFlagsDisplay(flags);
}

/**
 * Updates the Result Display with binary, unsigned decimal, and signed decimal values.
 * @param {string} binaryResult - The 8-bit result of the operation.
 * @param {boolean} signedMode - If the operation was performed in signed mode.
 */
function updateResultDisplay(binaryResult, signedMode) {
    const outputEl = document.getElementById('resultOutput');
    
    // Display binary result with space separators
    let formattedBinary = '';
    for (let i = 0; i < BIT_COUNT; i++) {
        formattedBinary += binaryResult[i];
        if ((i + 1) % 4 === 0 && i !== BIT_COUNT - 1) {
            formattedBinary += ' '; 
        }
    }
    
    outputEl.innerHTML = `
        <span class="text-3xl font-extrabold text-teal-300">${formattedBinary}</span>
    `;

    // Calculate and display decimal values
    const unsignedDec = parseInt(binaryResult, 2);
    let signedDec = 0;

    if (signedMode) {
        // Two's complement calculation for signed value
        if (binaryResult[0] === '1') {
            // Negative number: invert all bits and add 1
            let inverted = '';
            for (const bit of binaryResult) {
                inverted += (bit === '0' ? '1' : '0');
            }
            // Add 1 to inverted and make it negative
            signedDec = -(parseInt(inverted, 2) + 1); 
        } else {
            // Positive number
            signedDec = unsignedDec;
        }
        
        outputEl.innerHTML += `
            <p class="text-sm text-gray-400 mt-2">Unsigned Dec: ${unsignedDec}</p>
            <p class="text-sm text-gray-400">Signed Dec: ${signedDec}</p>
        `;
    } else {
        outputEl.innerHTML += `
            <p class="text-sm text-gray-400 mt-2">Unsigned Dec: ${unsignedDec}</p>
        `;
    }
}

/**
 * Updates the visual state of the flag indicators.
 * @param {object} flags - Object containing C, Z, S, O flag values (0 or 1).
 */
function updateFlagsDisplay(flags) {
    for (const flag in flags) {
        const el = document.getElementById('flag' + flag);
        
        el.classList.remove('flag-active', 'flag-inactive');

        if (flags[flag] === 1) {
            el.classList.add('flag-active');
            el.textContent = flag + ' (1)';
        } else {
            el.classList.add('flag-inactive');
            el.textContent = flag + ' (0)';
        }
    }
}
