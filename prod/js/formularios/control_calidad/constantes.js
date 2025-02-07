export const codigos = {
    codigoVercompra: Array.from({ length: 5 }, () => rand()).join("") + "codigoVercompra",
    codigoVerproduccion: Array.from({ length: 5 }, () => rand()).join("") + "codigoVerproduccion",
    codigosPrincipal: Array.from({ length: 5 }, () => rand()).join("") + "codigosPrincipal",
    codigosEncurso: Array.from({ length: 5 }, () => rand()).join("") + "codigosEncurso",
    codigoFinalizados: Array.from({ length: 5 }, () => rand()).join("") + "codigoFinalizados",
    codigosControlCalidad: Array.from({ length: 5 }, () => rand()).join("") + "codigosControlCalidad",
    codigosCaracteristicasEvaluacion: Array.from({ length: 5 }, () => rand()).join("") + "codigosCaracteristicasEvaluacion",
    codigosCaracteristicasMuestra: Array.from({ length: 5 }, () => rand()).join("") + "codigosCaracteristicasMuestra",
    codigosVistaPreviaPdf: Array.from({ length: 5 }, () => rand()).join("") + "codigosVistaPreviaPdf",
    codigosPrepararAlmacen: Array.from({ length: 5 }, () => rand()).join("") + "codigosPrepararAlmacen",
    codigoPendientes : Array.from({ length: 5 }, () => rand()).join("") + "codigoPendientes",
    actulizar_form_ctr_cal : Array.from({ length: 5 }, () => rand()).join("") + "actulizar_form_ctr_cal",

}; 

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}