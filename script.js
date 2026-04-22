let currentMode = 'SIP';

function setMode(mode) {
    currentMode = mode;
    document.getElementById('sipBtn').classList.toggle('active', mode === 'SIP');
    document.getElementById('lumpsumBtn').classList.toggle('active', mode === 'Lumpsum');
    
    document.getElementById('resultLabel').innerText = 
        mode === 'SIP' ? "Monthly SIP Required:" : "One-time Investment Required:";
    
    // Reset results view when switching
    document.getElementById('results').style.display = 'none';
}

function formatNumber(input) {
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
    input.addEventListener('input', function() { formatNumber(this); });
});

function calculate() {
    const getVal = id => parseFloat(document.getElementById(id).value.replace(/,/g, '')) || 0;
    const target = getVal('target');
    const annualRate = getVal('rate');
    const years = getVal('years');

    if (target <= 0 || annualRate <= 0 || years <= 0) {
        alert("Please enter valid numbers");
        return;
    }

    let primaryAmount = 0;
    let totalInvested = 0;
    let wealthGained = 0;

    if (currentMode === 'SIP') {
        const i = annualRate / 12 / 100;
        const n = years * 12;
        // Ordinary Annuity Formula (Matches SEBI/AMFI)
        primaryAmount = (target * i) / (Math.pow(1 + i, n) - 1);
        totalInvested = primaryAmount * n;
        wealthGained = target - totalInvested;

        // Show SIP-specific rows
        document.getElementById('totalInvestedRow').style.display = 'flex';
        document.getElementById('wealthGainedRow').style.display = 'flex';
    } else {
        const r = annualRate / 100;
        // Lumpsum Present Value Formula
        primaryAmount = target / Math.pow(1 + r, years);
        
        // Hide secondary rows for Lumpsum
        document.getElementById('totalInvestedRow').style.display = 'none';
        document.getElementById('wealthGainedRow').style.display = 'none';
    }

    displayResults(primaryAmount, totalInvested, wealthGained);
}

function displayResults(primary, total, wealth) {
    const formatIndian = num => {
        let integer = Math.round(num).toString();
        if (integer.length > 3) {
            let lastThree = integer.slice(-3);
            let otherNumbers = integer.slice(0, -3);
            otherNumbers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
            integer = otherNumbers + "," + lastThree;
        }
        return integer;
    };

    document.getElementById('primaryResult').innerText = "₹" + formatIndian(primary);
    document.getElementById('totalInvested').innerText = "₹" + formatIndian(total);
    document.getElementById('wealthGained').innerText = "₹" + formatIndian(wealth);
    document.getElementById('results').style.display = 'block';
}