export const codigos = {
    codigoPrincipal: Array.from({ length: 5 }, () => rand()).join("") + "principal",
    codigosolicitud_pendientes :  Array.from({ length: 5 }, () => rand()).join("") + "solicitud_pendientes",
    codigoplanaceacion_etapas: Array.from({ length: 5 }, () => rand()).join("") + "planaceacion_etapas",
    codigoproduccion_comenzar: Array.from({ length: 5 }, () => rand()).join("") + "produccion_comenzar",
    codigoproductos_p: Array.from({ length: 5 }, () => rand()).join("") + "produccion_productos",
    codigoRegistrar_usuMaquina: Array.from({ length: 5 }, ()=> rand()).join("") + "Uso_maquina",
    codigoSolicitud_material: Array.from({ length: 5 }, ()=> rand()).join("") + "solicitud_material",
    codigoComenzar_etapa_produccion: Array.from({ length: 5 }, ()=> rand()).join("") + "comenzar_etapa_produccion",
    codigoFinalizar_etapa_produccion: Array.from({ length: 5 }, ()=> rand()).join("") + "Finalizar_etapa_produccion",
    codigodetalleEtapa: Array.from({ length: 5 }, ()=> rand()).join("") + "detalle_etapa",
    codigosEditarSolicitudmaterial: Array.from({ length: 5 }, ()=> rand()).join("") + "Editar_solicitud_material",
    codigosDetalleSolicitud: Array.from({ length: 5 }, ()=> rand()).join("") + "detalle_solicitud",
    codigoDetalleProduccion: Array.from({ length: 5 }, ()=> rand()).join("") + "detalle_produccion",
    codigoSalidaProduccion: Array.from({ length:5}, ()=> rand()).join("") + "codigoSalidaProduccion",
    Finalizar_produccion_codigo: Array.from({length:5},()=> rand()).join("") + "Finalizar_produccion_codigo",
}; 

function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = (Math.floor(Math.random() * (1000 - 100 + 1)) + 100);
    return String.fromCharCode(65 + indice) + codigo;
}