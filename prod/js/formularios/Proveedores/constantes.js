export const codigos = {
  codigoPrincipal:
    Array.from({ length: 5 }, () => rand()).join("") + "principal_proveedores",
  codigoRegistrar:
    Array.from({ length: 5 }, () => rand()).join("") + "registrar",
  codigoproveedor_insumos:
    Array.from({ length: 5 }, () => rand()).join("") + "proveedor_insumos",
  codigoEditarProveedor:
    Array.from({ length: 5 }, () => rand()).join("") + "Editar_proveedor",
  codigoAddMatPro:
    Array.from({ length: 5 }, () => rand()).join("") + "Add_material_proveesor",
  codigo_proveedor:
    Array.from({ length: 5 }, () => rand()).join("") + "codigo_select_proveedor",
  codigo_material:
    Array.from({ length: 5 }, () => rand()).join("") + "codigo_select_material",
};

function rand() {
  const indice = Math.floor(Math.random() * 26);
  const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  return String.fromCharCode(65 + indice) + codigo;
}
