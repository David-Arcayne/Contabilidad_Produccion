export const codigos = {
    codigoPrincipal:Array.from({ length: 5 }, () => rand()).join("") + "principal_proveedores",
    codigoCompras:Array.from({ length: 5 }, () => rand()).join("") + "codigoCompras",
    codigolista_pedidos:Array.from({ length: 5 }, () => rand()).join("") + "codigolista_pedidos",
    codigo_reporte_ventas:Array.from({ length: 5 }, () => rand()).join("") + "codigo_reporte_ventas",
    codigo_material:Array.from({ length: 5 }, () => rand()).join("") + "codigo_material",
    codigo_proveedor:Array.from({ length: 5 }, () => rand()).join("") + "codigo_proveedor",
    codigo_envase:Array.from({ length: 5 }, () => rand()).join("") + "codigo_envase",
    codigo_detalle_compras:Array.from({ length: 5 }, () => rand()).join("") + "codigo_detalle_compras",
    codigo_pdf:Array.from({ length: 5 }, () => rand()).join("") + "codigo_pdf",
    codigo_anular_compra:Array.from({ length: 5 }, () => rand()).join("") + "codigo_anular_compra",
};
  
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    return String.fromCharCode(65 + indice) + codigo;
}