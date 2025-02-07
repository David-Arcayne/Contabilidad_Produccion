export const codigos = {
    codigoVerProduccion: Array.from({ length: 5 }, () => rand()).join("") + "codigoVerProduccion",
    codigosPrincipal: Array.from({ length: 5 }, () => rand()).join("") + "codigosPrincipal",
    codigosEncurso: Array.from({ length: 5 }, () => rand()).join("") + "codigosEncurso",
    codigosControlCalidad: Array.from({ length: 5 }, () => rand()).join("") + "codigosControlCalidad",
    codigosCaracteristicasEvaluacion: Array.from({ length: 5 }, () => rand()).join("") + "codigosCaracteristicasEvaluacion",
    codigosCaracteristicasMuestra: Array.from({ length: 5 }, () => rand()).join("") + "codigosCaracteristicasMuestra",
    codigosVistaPreviaPdf: Array.from({ length: 5 }, () => rand()).join("") + "codigosVistaPreviaPdf",
    codigosPrepararAlmacen_produccion: Array.from({ length: 5 }, () => rand()).join("") + "codigosPrepararAlmacen_produccion",
    actulizar_form_ctr_cal: Array.from({ length: 5 }, () => rand()).join("") + "actulizar_form_ctr_cal",
}; 

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}//codigosControlCalidad