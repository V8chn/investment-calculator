function checkIsMobile() {
    return window.innerWidth < 600;
}

let lastEndInflation = null;
let lastBalances = null;
let lastInvestedArr = null;
let lastNDFL = null;
let lastAdjustInflation = null;
let lastAdjustTax = null;

let donutChart;
export default function createDonutChart(endInflation, balances, investedArr, NDFL, adjustInflation, adjustTax) {
    const donutEl = document.getElementById("donutChart");

    if (donutChart) {
        donutChart.dispose();
    }

    donutChart = echarts.init(donutEl);

    const finalBalance = balances.at(-1);
    const finalInvested = investedArr.at(-1);

    const realInflation = adjustInflation ? finalBalance - NDFL - endInflation : 0;
    const profit = adjustInflation
        ? finalBalance - finalInvested - realInflation - (adjustTax ? NDFL : 0)
        : finalBalance - finalInvested - (adjustTax ? NDFL : 0);

    const data = [
        { value: Math.round(finalInvested), name: 'Вложенные\n средства', itemStyle: { color: 'steelblue' } },
        { value: Math.round(profit), name: 'Доход', itemStyle: { color: 'seagreen' } }
    ];

    if (adjustInflation) {
        data.push({ value: Math.round(realInflation), name: 'Инфляция', itemStyle: { color: 'crimson' } });
    }

    if (adjustTax) {
        data.push({ value: Math.round(NDFL), name: 'НДФЛ', itemStyle: { color: 'orange' } });
    }

    const option = {
        title: checkIsMobile() ? { show: false } : {
            text: 'Структура итоговой суммы',
            left: 'center',
            top: 10,
            textStyle: {
                color: 'white',
                fontSize: 24,
                fontFamily: "Nunito",
                fontWeight: "lighter",
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                const formattedValue = formatResult(params.value);
                return `${params.name}: ${formattedValue} (${Math.round(params.percent)}%)`;
            },
            textStyle: { fontSize: checkIsMobile() ? 12 : 15 },
            confine: true,
            padding: checkIsMobile() ? 2 : 5,
        },
        series: [
            {
                type: 'pie',
                radius: checkIsMobile() ? ['25%', '50%'] : ['35%', '63%'],
                label: {
                    formatter: p => `${p.name}\n${Math.round(p.percent)}%`,
                    fontSize: checkIsMobile() ? 13 : 16,
                    fontWeight: 'bold',
                    fontFamily: "Nunito",
                },
                data: data
            }
        ]
    };

    donutChart.setOption(option, true);

    lastEndInflation = endInflation;
    lastBalances = balances;
    lastInvestedArr = investedArr;
    lastNDFL = NDFL;
    lastAdjustInflation = adjustInflation;
    lastAdjustTax = adjustTax;
}