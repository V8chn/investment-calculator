export default function applyInflation(balances, inflationRate = 0.088, frequency, years, months, NDFL) {
    const totalYears = years + months / 12;
    const totalMonths = years * 12 + months;
    const totalQuarters = Math.ceil(totalMonths / 3);
    const totalDays = Math.floor(totalMonths * 30.41666);

    const finalAmount = balances.at(-1) - NDFL;
    let adjusted;

    if (frequency === "daily") {
        adjusted = finalAmount / Math.pow(1 + inflationRate, totalDays / 365);
    } else if (frequency === "monthly") {
        adjusted = finalAmount / Math.pow(1 + inflationRate, totalMonths / 12);
    } else if (frequency === "quarterly") {
        adjusted = finalAmount / Math.pow(1 + inflationRate, totalQuarters / 4);
    } else if (frequency === "yearly") {
        adjusted = finalAmount / Math.pow(1 + inflationRate, years);
    } else if (frequency === "once") {
        adjusted = finalAmount / Math.pow(1 + inflationRate, totalYears);
    }

    return adjusted;
}