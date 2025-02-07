export const codigos = {
    codigoprincipal: Array.from({ length: 5 }, () => rand()).join("") + "codigoprincipal",
    codigoMantenimiento: Array.from({ length: 5 }, () => rand()).join("") + "codigoMantenimiento",
    codigoTareas: Array.from({ length: 5 }, () => rand()).join("") + "codigoTareas",



}; 

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}