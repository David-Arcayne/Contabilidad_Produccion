
export const codigos = {
    codigoPrincipal: Array.from({ length: 5 }, () => rand()).join("") + "principal",
    codigoRegistrar: Array.from({ length: 5 }, () => rand()).join("") + "registrar_etapa",
    codigosubmenu_grupo: Array.from({ length: 5 }, () => rand()).join("") + "submenu_grupo",
    codigoGrupo_crear: Array.from({ length: 5 }, () => rand()).join("") + "registrar_grupo",
    codigoGrupo_editar: Array.from({ length: 5 }, () => rand()).join("") + "editar_grupo",
    codigoGrupo_producto: Array.from({ length: 5 }, () => rand()).join("") + "agregar_producto",
    codigo_etapa_maquina: Array.from({length: 5}, () => rand()).join("") + "maquina_etapa",
    codigo_etapa_empleado: Array.from({length: 5}, () => rand()).join("") + "codigo_etapa_empleado",
    codigo_etapa: Array.from({length: 5}, () => rand()).join("") + "codigo_etapa",
    codigo_empleado: Array.from({length: 5}, () => rand()).join("") + "codigo_empleado",
    codigo_maquina: Array.from({length: 5}, () => rand()).join("") + "codigo_maquina",
    codigo_estandar_etapa_produccion: Array.from({length: 5}, () => rand()).join("") + "codigo_estandar_etapa_produccion",
    codigo_grupo: Array.from({length: 5}, () => rand()).join("") + "codigo_grupo",
    codigo_producto: Array.from({length: 5}, () => rand()).join("") + "codigo_producto",
    
};

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}