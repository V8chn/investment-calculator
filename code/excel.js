export default function createExcel(chartLabels, investedArr, balances) {
    const table = [
        ["Период", "Начальная сумма", "Конечная сумма"],
    ];

    chartLabels.slice(1).forEach((label, i) => {
        const row = [
            label,
            investedArr[i + 1],
            balances[i + 1],
        ];
        table.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(table);
    worksheet['!cols'] = [
        { wch: 15 },
        { wch: 18 },
        { wch: 18 }
    ];

    for (let col = 0; col < 3; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
                font: { bold: true },
                alignment: { horizontal: 'center' }
            };
        }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Инвестиции");
    XLSX.writeFile(workbook, "investments.xlsx");
}