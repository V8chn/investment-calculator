export default function calculationInvestment(amount, rate, years, months, frequency, recurrentData = null) {
    const interestRate = rate / 100;
    const totalMonths = years * 12 + months;
    const totalDays = Math.floor(totalMonths * 30.41666);
    let balance = amount;
    let invested = amount;

    const balances = [balance];
    const investedArr = [invested];
    const depositsTimeline = [];


    if (recurrentData && recurrentData.enabled && recurrentData.amount > 0) {
        const {type, amount: depositAmount} = recurrentData;

        if (type === "monthlyAdd") {

            for (let month = 1; month <= totalMonths; month++) {
                const day = Math.floor((month - 1) * 30.41666) + 1;
                depositsTimeline.push({day: day, amount: depositAmount});
            }
        } else if (type === "yearlyAdd") {

            for (let year = 1; year <= years; year++) {
                const day = Math.floor((year - 1) * 12 * 30.41666) + 1;
                depositsTimeline.push({day: day, amount: depositAmount});
            }
        } else if (type === "quarterlyAdd") {

            for (let quarter = 1; quarter <= Math.ceil(totalMonths / 3); quarter++) {
                const day = Math.floor((quarter - 1) * 3 * 30.41666) + 1;
                depositsTimeline.push({day: day, amount: depositAmount});
            }
        }
    }

    if (frequency === "daily") {
        const dailyRate = interestRate / 365;
        for (let day = 1; day <= totalDays; day++) {

            const todayDeposits = depositsTimeline.filter(d => d.day === day);

            todayDeposits.forEach(deposit => {
                balance += deposit.amount;
                invested += deposit.amount;
            });

            balance *= 1 + dailyRate;
            balances.push(balance);
            investedArr.push(invested);
        }
    } else if (frequency === "monthly") {
        const monthlyRate = interestRate / 12;
        const daysPerMonth = 30.41666;

        for (let month = 1; month <= totalMonths; month++) {
            const startDay = Math.floor((month - 1) * daysPerMonth) + 1;
            const endDay = Math.floor(month * daysPerMonth);

            // Проверяем пополнения в этом месяце
            const monthDeposits = depositsTimeline.filter(d =>
                d.day >= startDay && d.day <= endDay
            );

            monthDeposits.forEach(deposit => {
                balance += deposit.amount;
                invested += deposit.amount;
            });

            balance *= 1 + monthlyRate;
            balances.push(balance);
            investedArr.push(invested);
        }
    } else if (frequency === "quarterly") {
        const quarterlyRate = interestRate / 4;
        const daysPerQuarter = 91.25;

        const totalQuarters = Math.ceil(totalMonths / 3);

        for (let quarter = 1; quarter <= totalQuarters; quarter++) {
            const startDay = Math.floor((quarter - 1) * daysPerQuarter) + 1;
            const endDay = Math.floor(quarter * daysPerQuarter);

            // Проверяем пополнения в этом квартале
            const quarterDeposits = depositsTimeline.filter(d =>
                d.day >= startDay && d.day <= endDay
            );

            quarterDeposits.forEach(deposit => {
                balance += deposit.amount;
                invested += deposit.amount;
            });

            balance *= 1 + quarterlyRate;
            balances.push(balance);
            investedArr.push(invested);
        }
    } else if (frequency === "yearly") {
        const daysPerYear = 365;

        for (let year = 1; year <= years; year++) {
            const startDay = (year - 1) * daysPerYear + 1;
            const endDay = year * daysPerYear;

            const yearDeposits = depositsTimeline.filter(d =>
                d.day >= startDay && d.day <= endDay
            );

            yearDeposits.forEach(deposit => {
                balance += deposit.amount;
                invested += deposit.amount;
            });

            balance *= 1 + interestRate;
            balances.push(balance);
            investedArr.push(invested);
        }
    } else {
        const totalYears = years + months / 12;
        balance *= (1 + interestRate * totalYears);
        balances.push(balance);
        investedArr.push(invested);
    }

    return {balances, investedArr};
}