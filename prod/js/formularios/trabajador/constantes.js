export const codigos = {
    codigoPrincipal:Array.from({ length: 5 }, () => rand()).join("") + "codigoPrincipal",
    codigoTrabajador:Array.from({ length: 5 }, () => rand()).join("") + "codigoTrabajador",
    codigoAreas:Array.from({ length: 5 }, () => rand()).join("") + "codigoAreas",
    codigoCargos:Array.from({ length: 5 }, () => rand()).join("") + "codigoCargos",
    codigoTipoContrato:Array.from({ length: 5 }, () => rand()).join("") + "coidgoTipoContrato",
    codigoModoPago:Array.from({ length: 5 }, () => rand()).join("") + "codigoModoPago",
    codigoContrato:Array.from({ length: 5 }, () => rand()).join("") + "codigoContrato",

};
  
function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    return String.fromCharCode(65 + indice) + codigo;
}