export default function applyTax(balances, investedArr, frequency, years, months) {
    const taxBrackets = [
        { limit: 2_400_000, rate: 0.13 },
        { limit: 5_000_000, rate: 0.15 },
        { limit: 20_000_000, rate: 0.18 },
        { limit: 50_000_000, rate: 0.20 },
        { limit: Infinity, rate: 0.22 }
    ];

    const totalMonths = years * 12 + months;
    let monthlyProfits = [];

    if (frequency === "daily") {
        const daysPerMonth = 30.4166;
        for (let m = 1; m <= totalMonths; m++) {
            const dayIndex = Math.min(Math.floor(m * daysPerMonth), balances.length - 1);
            const prevDayIndex = Math.min(Math.floor((m - 1) * daysPerMonth), balances.length - 1);

            const profitMonth = (balances[dayIndex] - investedArr[dayIndex]) -
                (balances[prevDayIndex] - investedArr[prevDayIndex]);
            monthlyProfits.push(profitMonth);
        }
    } else if (frequency === "monthly") {
        for (let m = 1; m < balances.length; m++) {
            const profitMonth = (balances[m] - investedArr[m]) -
                (balances[m - 1] - investedArr[m - 1]);
            monthlyProfits.push(profitMonth);
        }
    } else if (frequency === "quarterly") {
        for (let q = 1; q < balances.length; q++) {
            const profitQuarter = (balances[q] - investedArr[q]) -
                (balances[q - 1] - investedArr[q - 1]);
            const profitMonth = profitQuarter / 3;
            for (let i = 0; i < 3; i++) monthlyProfits.push(profitMonth);
        }
    } else if (frequency === "yearly") {
        for (let y = 1; y < balances.length; y++) {
            const profitYear = (balances[y] - investedArr[y]) -
                (balances[y - 1] - investedArr[y - 1]);
            const profitMonth = profitYear / 12;
            for (let i = 0; i < 12; i++) monthlyProfits.push(profitMonth);
        }
    } else if (frequency === "once") {
        const totalProfit = balances[1] - investedArr[1];
        const profitMonth = totalProfit / totalMonths;
        for (let i = 0; i < totalMonths; i++) monthlyProfits.push(profitMonth);
    }

    let totalProfit = 0;
    let totalTax = 0;
    let yearProfit = 0;
    let yearTax = 0;

    for (let i = 0; i < monthlyProfits.length; i++) {
        yearProfit += monthlyProfits[i];
        totalProfit += monthlyProfits[i];

        let tempTax = 0;
        let prevLimit = 0;
        for (const bracket of taxBrackets) {
            if (yearProfit > bracket.limit) {
                tempTax += (bracket.limit - prevLimit) * bracket.rate;
                prevLimit = bracket.limit;
            } else {
                tempTax += (yearProfit - prevLimit) * bracket.rate;
                break;
            }
        }

        const taxThisMonth = tempTax - yearTax;
        yearTax = tempTax;
        totalTax += taxThisMonth;

        if ((i + 1) % 12 === 0) {
            yearProfit = 0;
            yearTax = 0;
        }
    }

    return totalTax;
}