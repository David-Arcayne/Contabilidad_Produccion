export const codigos = {
    codigoPrincipal: Array.from({ length: 5 }, () => rand()).join("") + "principal",
    codigoRiesgos: Array.from({ length: 5 }, () => rand()).join("") + "codigoRiesgos",
    codigoRecursos: Array.from({ length: 5 }, () => rand()).join("") + "codigoRecursos",
    codigoProcedimiento: Array.from({ length: 5 }, () => rand()).join("") + "codigoProcedimiento",
    codigoEmergencia: Array.from({ length: 5 }, () => rand()).join("") + "codigoEmergencia",
    codigo_empleado: Array.from({ length: 5 }, () => rand()).join("") + "codigo_empleado",
   
    
};

function rand(){
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}