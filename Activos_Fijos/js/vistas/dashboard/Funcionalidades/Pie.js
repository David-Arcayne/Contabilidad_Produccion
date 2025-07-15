export const Pie = async (canvasId, datos) => {
    new Chart(document.getElementById(canvasId), {
        type: "pie",
        data: {
            labels: Object.keys(datos),
            datasets: [
                {
                    label: 'Valor',
                    data: Object.values(datos),
                },
            ],
        },
        options: {
            plugins: {
                emptyDoughnut: {
                    color: '#aaa',
                    width: 2,
                    radiusDecrease: 20
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let allData = context.dataset.data;
                            let tooltipLabel = context.label;
                            let tooltipData = allData[context.dataIndex];
                            let total = 0;
                            for (let i in allData) {
                                total += parseInt(allData[i]);
                            }
                            let tooltipPercentage = Math.round((tooltipData / total) * 100);
                            return "Valor" + ': ' + tooltipData + ' (' + tooltipPercentage + '%)';
                        }
                    }
                }
            }
        },
        plugins: [plugin]
    });
};

const plugin = {
    id: 'emptyDoughnut',
    afterDraw(chart, args, options) {
      const {datasets} = chart.data;
      const {color, width, radiusDecrease} = options;
      let hasData = false;
  
      for (let i = 0; i < datasets.length; i += 1) {
        const dataset = datasets[i];
        hasData |= dataset.data.length > 0;
      }
  
      if (!hasData) {
        const {chartArea: {left, top, right, bottom}, ctx} = chart;
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const r = Math.min(right - left, bottom - top) / 2;
  
        ctx.beginPath();
        ctx.lineWidth = width || 2;
        ctx.strokeStyle = color || '#aaa';
        ctx.arc(centerX, centerY, (r - radiusDecrease || 0), 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };