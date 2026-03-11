export const formularioTipoCambio = [
    {
        id: "tipocambio-fecha",
        label: "Fecha:",
        forma: "input",
        tipo: "date",
        nombre: "fecha",
        valor: "fecha",
        requerido: true
    },
    {
        id: "tipocambio-dolar",
        label: "Dolar",
        forma: "input",
        tipo: "number",
        intervalo: "0.01",
        valorMinimo: "0",
        nombre: "dolar",
    },
    {
        id: "tipocambio-ufv",
        label: "UFV",
        forma: "input",
        tipo: "number",
        intervalo: "any",
        valorMinimo: "0",
        nombre: "ufv",
        requerido: true
    },
];