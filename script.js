let currentMode = 'SIP';

function setMode(mode) {
    currentMode = mode;
    document.getElementById('sipBtn').classList.toggle('active', mode === 'SIP');
    document.getElementById('lumpsumBtn').classList.toggle('active', mode === 'Lumpsum');
    
    document.getElementById('resultLabel').innerText = 
        mode === 'SIP' ? "Monthly SIP Required:" : "One-time Investment Required:";
    
    document.getElementById('results').style.display = 'none';
}

// 1. Input field formatting
function formatNumber(input) {
    input.classList.remove('error');
    
    let value = input.value.replace(/,/g, '');
    value = value.replace(/[^0-9.]/g, ''); 
    
    if (value.length > 3) {
        let parts = value.split('.');
        let integer = parts[0];
        let decimal = parts.length > 1 ? '.' + parts[1] : '';
        
        let lastThree = integer.slice(-3);
        let otherNumbers = integer.slice(0, -3);
        
        if (otherNumbers) {
            otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        value = integer + decimal;
    }
    input.value = value;
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() { 
        formatNumber(this); 
    });
});

function calculate() {
    const requiredFields = ['target', 'rate', 'years'];
    let isValid = true;

    // 2. Validation Logic
    requiredFields.forEach(id => {
        const element = document.getElementById(id);
        if (element.value.trim() === "") {
            element.classList.add('error');
            isValid = false;
        } else {
            element.classList.remove('error');
        }
    });

    if (!isValid) return;

    // 3. Original Math Logic (STRICTLY PRESERVED)
    const getVal = id => parseFloat(document.getElementById(id).value.replace(/,/g, '')) || 0;
    const target = getVal('target');
    const annualRate = getVal('rate');
    const years = getVal('years');

    let primaryAmount = 0;
    let totalInvested = 0;
    let wealthGained = 0;

    if (currentMode === 'SIP') {
        const i = annualRate / 12 / 100;
        const n = years * 12;
        primaryAmount = (target * i) / (Math.pow(1 + i, n) - 1);
        totalInvested = primaryAmount * n;
        wealthGained = target - totalInvested;

        document.getElementById('totalInvestedRow').style.display = 'flex';
        document.getElementById('wealthGainedRow').style.display = 'flex';
    } else {
        const r = annualRate / 100;
        primaryAmount = target / Math.pow(1 + r, years);
        
        document.getElementById('totalInvestedRow').style.display = 'none';
        document.getElementById('wealthGainedRow').style.display = 'none';
    }

    displayResults(primaryAmount, totalInvested, wealthGained);
}

// 4. Fixed Formatting Logic (Fixed Zero Counts)
function displayResults(primary, total, wealth) {
    const formatToWords = num => {
        // Explicit Constants to avoid zero-counting errors
        const ONE_CRORE = 10000000; // 1,00,00,000 (7 zeros)
        const ONE_LAKH = 100000;    // 1,00,000 (5 zeros)

        if (num >= ONE_CRORE) {
            // Rounding up to 2 decimal places as per your Lumpsum template
            const value = Math.ceil((num / ONE_CRORE) * 100) / 100;
            return `₹${value.toFixed(2)} Crore`;
        } else if (num >= ONE_LAKH) {
            const value = Math.ceil((num / ONE_LAKH) * 100) / 100;
            return `₹${value.toFixed(2)} Lakh`;
        } else {
            // Standard Indian Comma Format for amounts below 1 Lakh
            let integer = Math.ceil(num).toString();
            if (integer.length > 3) {
                let lastThree = integer.slice(-3);
                let otherNumbers = integer.slice(0, -3);
                otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
                integer = otherNumbers + "," + lastThree;
            }
            return "₹" + integer;
        }
    };

    document.getElementById('primaryResult').innerText = formatToWords(primary);
    document.getElementById('totalInvested').innerText = formatToWords(total);
    document.getElementById('wealthGained').innerText = formatToWords(wealth);
    document.getElementById('results').style.display = 'block';
}
