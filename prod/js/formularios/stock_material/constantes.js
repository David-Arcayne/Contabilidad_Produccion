export const codigos = {
    codigoPrincipal:Array.from({ length: 5 }, () => rand()).join("") + "codigoPrincipal",
    codigo_stock:Array.from({ length: 5 }, () => rand()).join("") + "codigo_stock",
    codigo_por_material:Array.from({ length: 5 }, () => rand()).join("") + "codigo_por_material",
    codigo_por_compra:Array.from({ length: 5 }, () => rand()).join("") + "codigo_por_compra",
    

};
  
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    return String.fromCharCode(65 + indice) + codigo;
}