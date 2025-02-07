export const codigos = {
    codigoPrincipal: Array.from({ length: 5 }, () => rand()).join("") + "principal",
    codigoLinea_produccion: Array.from({ length: 5 }, () => rand()).join("") + "linea_produccion",
    codigoproducto_categoria: Array.from({ length: 5 }, () => rand()).join("") + "producto_categoria",
    codigoproducto_medida: Array.from({ length: 5 }, () => rand()).join("") + "producto_medida",


};

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}