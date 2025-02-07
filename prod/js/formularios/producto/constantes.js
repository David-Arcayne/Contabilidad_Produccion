export const codigos = {
  codigoPrincipal:
    Array.from({ length: 5 }, () => rand()).join("") + "Producto",
  codigoEditar:
    Array.from({ length: 5 }, () => rand()).join("") + "Editar_producto",
  codigoEstandar: 
    Array.from({length:5},()=>rand()).join("") + "Estandar_producto",
};

function rand() {
  const indice = Math.floor(Math.random() * 26);
  const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
  return String.fromCharCode(65 + indice) + codigo;
}
