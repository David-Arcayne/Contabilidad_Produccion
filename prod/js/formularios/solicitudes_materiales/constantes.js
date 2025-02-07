export const codigos = {
    codigoPrincipal: Array.from({ length: 5 }, () => rand()).join("") + "principal",
    codigosDetalleSolicitud :  Array.from({ length: 5 }, () => rand()).join("") + "codigosDetalleSolicitud",
    codigoModalverStock:  Array.from({ length: 5 }, () => rand()).join("") + "codigoModalverStock",
    codigomodalFinalizarSOlicitud:  Array.from({ length: 5 }, () => rand()).join("") + "codigomodalFinalizarSOlicitud",
}; 

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}