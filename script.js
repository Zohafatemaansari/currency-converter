const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");
const resultText = document.getElementById("resultText");
const rateText = document.getElementById("rateText");

async function convertCurrency() {
    const amount = Number(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    if (amount <= 0) {
        resultText.textContent = "Enter a valid amount";
        rateText.textContent = "";
        return;
    }
    if (from === to) {
        resultText.textContent = amount.toFixed(2) + " " + to;
        rateText.textContent = `1 ${from} = 1 ${to}`;
        return;
    }

    resultText.textContent = "Converting...";
    rateText.textContent = "Getting latest exchange rate...";

    try {
        
        const response = await fetch(
            `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
        );

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.rates ||!data.rates[to]) {
            throw new Error("Rate not found");
        }

        const convertedAmount = data.rates[to];
        resultText.textContent = convertedAmount.toFixed(2) + " " + to;
        rateText.textContent = `1 ${from} = ${(convertedAmount / amount).toFixed(4)} ${to}`;

    } catch (error) {
        console.error("Real error:", error);
        
        try {
            const fallback = await fetch(`https://open.er-api.com/v6/latest/${from}`);
            const fData = await fallback.json();
            const rate = fData.rates[to];
            const converted = amount * rate;
            resultText.textContent = converted.toFixed(2) + " " + to;
            rateText.textContent = `1 ${from} = ${rate.toFixed(4)} ${to} (via fallback)`;
        } catch (e) {
            resultText.textContent = "Something went wrong";
            rateText.textContent = error.message;
        }
    }
}

swapBtn.addEventListener("click", function () {
    const oldFrom = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = oldFrom;
    convertCurrency();
});

convertBtn.addEventListener("click", convertCurrency);
amountInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") convertCurrency();
});

convertCurrency();