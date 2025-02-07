export const codigos = {
    codigoadmin_sollicitudes: Array.from({ length: 5 }, () => rand()).join("") + "admin_sollicitudes",
    codigosolicitud_pendientes: Array.from({ length: 5 }, () => rand()).join("") + "solicitud_pendientes",
    codigosolicitud_negativos: Array.from({ length: 5 }, () => rand()).join("") + "solicitud_negativos",
    codigomodal_enviar: Array.from({ length: 5 }, () => rand()).join("") + "modal_enviar",
    codigosolicitud_finalizados: Array.from({ length: 5 }, () => rand()).join("") + "solicitud_finalizados",
    codigosolicitud_curso:  Array.from({ length: 5 }, () => rand()).join("") + "solicitud_curso",
    codigomodal_editar: Array.from({ length: 5 }, () => rand()).join("") + "modal_editar",
  };
  
  function rand() {
    const indice = Math.floor(Math.random() * 26);
    const codigo = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    return String.fromCharCode(65 + indice) + codigo;
  }
  