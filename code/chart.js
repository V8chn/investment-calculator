function checkIsMobile() {
    return window.innerWidth < 600;
}

let chartInstance;
export default function createChart(chartLabels, investedArr, balances) {
    const chartEl = document.getElementById("profitChart");

    if (!chartInstance) {
        chartInstance = echarts.init(chartEl);
    }

    const option = {
        title: {
            text: "Рост инвестиций",
            top: 30,
            left: 10,
            textStyle: {
                color: "rgb(47, 79, 79)",
                fontSize: checkIsMobile() ? 16 : 24,
                fontFamily: "Nunito",
                fontWeight: "normal",
            }
        },
        tooltip: {
            trigger: "axis",
            backgroundColor: "rgba(47,79,79,0.9)",
            textStyle: {
                color: "#fff",
                fontSize: checkIsMobile() ? 12 : 15,
                fontWeight: "lighter",
            },
            formatter: params => {
                let header = `<b>${params[0].axisValue}</b>`;

                let values = params.map(p =>
                    `<b>${p.seriesName}</b>: ${formatResult(p.value)} ₽`
                ).join("<br>");

                return header + "<br>" + values;
            },
            confine: true,
            padding: checkIsMobile() ? 2 : 5,
            position: function (point, params, dom, rect, size) {
                let x = point[0];
                let y = point[1];

                const viewWidth = size.viewSize[0];
                const viewHeight = size.viewSize[1];
                const boxWidth = size.contentSize[0];
                const boxHeight = size.contentSize[1];

                if (x + boxWidth > viewWidth) {
                    x = viewWidth - boxWidth - 10;
                }

                if (y + boxHeight > viewHeight) {
                    y = viewHeight - boxHeight - 10;
                }

                return [x, y];
            }
        },
        legend: {
            top: 5,
            textStyle: {
                fontSize: checkIsMobile() ? 12 : 16,
            },
        },
        grid: {
            left: 75,
            right: checkIsMobile() ? 20 : 40,
            top: 80,
            bottom: checkIsMobile() ? 40 : 80,
        },
        xAxis: {
            type: "category",
            data: chartLabels,
            axisLabel: { interval: "auto" },
        },
        yAxis: {
            type: "value",
            axisLabel: {
                formatter: function (value) {
                    if (value >= 1_000_000_000) {
                        return value.toExponential(2);
                    }
                    return value.toString();
                }
            },
        },
        dataZoom: checkIsMobile() ? [
                { type: "inside" }] :
            [ { type: "inside" },
                {
                    type: "slider",
                    left: 70,
                    right: 90,
                    bottom: 20,
                },
            ],
        toolbox: {
            feature: {
                saveAsImage: { title: "Скачать" },
                restore: {},
            },
            right: 10,
            top: 25,
        },
        series: [
            {
                name: "Вложенные средства",
                type: "line",
                smooth: true,
                showSymbol: false,
                data: investedArr,
                lineStyle: { color: "#4E79A7", width: 2 },
                itemStyle: { color: "#4E79A7" },
                emphasis: { focus: "none" },
            },
            {
                name: "Сумма на счете",
                type: "line",
                smooth: true,
                showSymbol: false,
                data: balances,
                lineStyle: { color: "#59A14F", width: 3 },
                itemStyle: { color: "#59A14F" },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: "rgba(89, 161, 79, 0.6)" },
                        { offset: 1, color: "rgba(89, 161, 79, 0)" }
                    ])
                },
                emphasis: { focus: "none" }
            }
        ],
        animationDuration: 1500,
        animationEasing: 'cubicOut'
    };

    chartInstance.setOption(option, true);
}