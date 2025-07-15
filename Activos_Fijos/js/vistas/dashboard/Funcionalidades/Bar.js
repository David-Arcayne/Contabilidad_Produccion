export const Bar = async (canvasId, datos) => {
  
    new Chart(document.getElementById(canvasId), {
        type: "bar",
        data: {
            labels: Object.keys(datos),
            datasets: [
                {
                    label: "Valor",
                    data: Object.values(datos),
                },
            ],
        },
        options: {
            scales: {
              y: {
                beginAtZero: true
              }
            },
            indexAxis: 'y',
          },
    });
};
