import validate from "./validate";
import calculationInvestment from "./calculate";
import applyInflation from "./inflation";
import applyTax from "./tax";
import createDonutChart from "./donut";
import createChart from "./chart";
import createExcel from "./excel";

let lastEndInflation = null;
let lastBalances = null;
let lastInvestedArr = null;
let lastNDFL = null;
let lastAdjustInflation = null;
let lastAdjustTax = null;

function outputData(frequency, balances) {
    let chartLabels;

    if(frequency === "daily") {
        chartLabels = balances.map((_, i) => `День ${i}`);
    } else if (frequency === "monthly") {
        chartLabels = balances.map((_, i) => `Месяц ${i}`);
    } else if (frequency === "quarterly") {
        chartLabels = balances.map((_, i) => `Квартал ${i}`);
    } else if (frequency === "yearly") {
        chartLabels = balances.map((_, i) => `Год ${i}`);
    } else if (frequency === "once") {
        chartLabels = ["Начало", "Конец"];
    }

    return chartLabels;
}

function formatResult(value) {
    value = Math.round(value);

    if (value >= 1_000_000_000_000) {
        return value.toExponential(2);
    }
    return value.toLocaleString("ru-RU");
}



function runCalculation() {

    const amount = +window.amountMask.unmaskedValue;
    const rate = parseFloat(document.getElementById("rate").value);
    const years = parseInt(document.getElementById("years").value);
    const months = parseInt(document.getElementById("months").value);
    const frequency = document.getElementById("frequency").value;

    const totalMonths = years * 12 + months;
    const totalDays = Math.floor(totalMonths * 30.41666);

    const adjustInflation = document.getElementById("adjustInflation").checked;
    const adjustTax = document.getElementById("adjustTax").checked;
    const adjustRecurrent = document.getElementById("adjustmentRecurrent").checked;

    const depositAmount = +window.recurrentMask.unmaskedValue || 0;

    let recurrentData = null;
    if (adjustRecurrent) {
        const depositType = document.getElementById("deposits").value;

        recurrentData = {
            enabled: true,
            type: depositType,
            amount: depositAmount
        };
    }

    if (!validate(amount, rate, years, months, depositAmount, adjustRecurrent)) {
        return;
    }

    const {balances, investedArr} = calculationInvestment(
        amount, rate, years, months, frequency, recurrentData
    );

    const chartLabels = outputData(frequency, balances, totalMonths, totalDays);

    const NDFL = adjustTax ? applyTax(balances, investedArr, frequency, years, months) : 0;
    const inflationRate = 0.088;
    const endInflation = adjustInflation ?
        applyInflation(balances, inflationRate, frequency, years, months, NDFL) :
        balances.at(-1) - NDFL;

    const resultsEl = document.getElementById("result");

    let resultHTML = `
    <p class="text-result"><b>Начальная сумма:</b><br> ${formatResult(amount)} ₽</p>`;
    if (adjustRecurrent) {
        resultHTML += `<p class="text-result"><b>Сумма пополнений:</b><br> ${formatResult(investedArr.at(-1) - amount)} ₽</p>`;
    }
    resultHTML += `<p class="text-result"><b>Потенциальная прибыль:</b><br> ${formatResult(balances.at(-1) - investedArr.at(-1))} ₽</p>`;
    if (adjustTax) {
        resultHTML += `<p class="text-result"><b>Налог:</b><br> -${formatResult(NDFL)} ₽</p>`;
    }
    if (adjustInflation) {
        resultHTML += `<p class="text-result"><b>Инфляция:</b><br> ${formatResult(balances.at(-1) - endInflation - NDFL)} ₽<br>
                      <span class="additionalInflation">
                      Сумма с учётом инфляции: ${formatResult(endInflation)} ₽</span></p>`;
    }

    resultHTML += `<p class="final-sum text-result"><b>Итоговая сумма:</b><br> ${formatResult(balances.at(-1) - NDFL)} ₽</p>`;

    resultsEl.innerHTML = resultHTML;

    document.querySelector('.chart').style.display = 'block';
    document.querySelector('.calculator__result-wrapper').classList.add('show');

    lastEndInflation = endInflation;
    lastBalances = balances;
    lastInvestedArr = investedArr;
    lastNDFL = NDFL;
    lastAdjustInflation = adjustInflation;
    lastAdjustTax = adjustTax;

    createChart(chartLabels, investedArr, balances);
    createDonutChart(endInflation, balances, investedArr, NDFL, adjustInflation, adjustTax);

    document.getElementById("exportExcel").onclick = () => {
        createExcel(chartLabels, investedArr, balances);
    };
}


document.addEventListener("DOMContentLoaded", function () {
    const frequencySelect = document.getElementById("frequency");
    const depositsAddOption = document.getElementById("deposits");
    const depositsAddInput = document.getElementById("depositsAdd");
    const recurrentCheckbox = document.getElementById("adjustmentRecurrent");
    const monthsAdd = document.getElementById("months");

    const inputAmount = document.getElementById("amount");

    window.amountMask = IMask(inputAmount, {
        mask: Number,
        min: 0,
        max: 1000000000000,
        thousandsSeparator: ' ',
    });

    const inputRecurrent = document.getElementById("depositsAdd");

    window.recurrentMask = IMask(inputRecurrent, {
        mask: Number,
        min: 1,
        max: 1000000000000,
        thousandsSeparator: ' ',
    });

    const updateDepositAddState = () => {
        if (frequencySelect.value === "once") {
            recurrentCheckbox.checked = false;
            recurrentCheckbox.disabled = true;
            depositsAddOption.disabled = true;
            depositsAddInput.disabled = true;
            depositsAddInput.value = "";
        } else {
            recurrentCheckbox.disabled = false;
            depositsAddOption.disabled = !recurrentCheckbox.checked;
            depositsAddInput.disabled = !recurrentCheckbox.checked;
            depositsAddInput.value = "";
        }
    };

    frequencySelect.addEventListener("change", updateDepositAddState);
    recurrentCheckbox.addEventListener("change", updateDepositAddState);
    updateDepositAddState();

    const absenceOfMonths = () => {
        if (frequencySelect.value === "yearly" || frequencySelect.value === "quarterly") {
            monthsAdd.disabled = true;
            monthsAdd.value = 0;
        } else {
            monthsAdd.disabled = false;
        }
    };

    frequencySelect.addEventListener("change", absenceOfMonths);
    absenceOfMonths();

    document.getElementById("calculateBtn").addEventListener("click", function (e) {
        e.preventDefault();
        runCalculation();
    });

    document.getElementById("calc-form").addEventListener("submit", function (e) {
        e.preventDefault();
        runCalculation();
    });

    function redrawCharts() {
        if (chartInstance) {
            chartInstance.resize();
        }
        if (lastBalances) {
            createDonutChart(
                lastEndInflation,
                lastBalances,
                lastInvestedArr,
                lastNDFL,
                lastAdjustInflation,
                lastAdjustTax
            );
        }
    }


    const portraitMediaQuery = window.matchMedia("(orientation: portrait)");
    const landscapeMediaQuery = window.matchMedia("(orientation: landscape)");

    function handleOrientationChange() {
        setTimeout(redrawCharts, 150);
    }

    portraitMediaQuery.addEventListener("change", handleOrientationChange);
    landscapeMediaQuery.addEventListener("change", handleOrientationChange);

    document.querySelectorAll(".help").forEach(el => {
        el.addEventListener("click", function (e) {
            e.stopPropagation();
            if (this.classList.contains("active")) {
                this.classList.remove("active");
            } else {
                document.querySelectorAll(".help.active").forEach(h => h.classList.remove("active"));
                this.classList.add("active");
            }
        });
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".help.active").forEach(h => h.classList.remove("active"));
    });
});