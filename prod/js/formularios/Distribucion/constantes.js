export const codigos = {
    codigoPrincipal:Array.from({ length: 5 }, () => rand()).join("") + "principal_proveedores",
    codigo_distribucion:Array.from({ length: 5 }, () => rand()).join("") + "codigo_distribucion",
    
    codigo_reporte_distribucion:Array.from({ length: 5 }, () => rand()).join("") + "codigo_reporte_distribucion",
    codigo_producto:Array.from({ length: 5 }, () => rand()).join("") + "codigo_producto",
    codigo_proveedor:Array.from({ length: 5 }, () => rand()).join("") + "codigo_proveedor",
    codigo_envase:Array.from({ length: 5 }, () => rand()).join("") + "codigo_envase",
    codigo_detalle_solicitud:Array.from({ length: 5 }, () => rand()).join("") + "codigo_detalle_solicitud",
    codigo_pdf:Array.from({ length: 5 }, () => rand()).join("") + "codigo_pdf",
    codigo_anular_distribucion:Array.from({ length: 5 }, () => rand()).join("") + "codigo_anular_distribucion",
    codigoModalverStock:Array.from({ length: 5 }, () => rand()).join("") + "codigoModalverStock",
};
  
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    return String.fromCharCode(65 + indice) + codigo;
}