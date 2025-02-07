export const codigos = {
    codigomodal_editar: Array.from({ length: 5 }, () => rand()).join("") + "codigomodal_editar",
    codigosPrincipal: Array.from({ length: 5 }, () => rand()).join("") + "codigosPrincipal",
    
}; 

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}