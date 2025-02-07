export const codigos = {
    codigo_reportes_produccion_etapa:Array.from({ length: 5 }, () => rand()).join("") + "codigo_reportes_produccion_etapa",
    codigo_reporte_solicitud_material:Array.from({ length: 5 }, () => rand()).join("") + "codigo_reporte_solicitud_material",
    codigo_orden_produccion:Array.from({ length: 5 }, () => rand()).join("") + "codigo_orden_produccion",
    codigo_salida_produccion:Array.from({ length: 5 }, () => rand()).join("") + "codigo_salida_produccion",
    codigo_modal_detalle_produccion:Array.from({ length: 5 }, () => rand()).join("") + "codigo_modal_detalle_produccion"
};
  
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    return String.fromCharCode(65 + indice) + codigo;
}