import * as listarFunctions from "../../funciones/listar.js";
import { codigos } from "../constantes.js";
import { crearModal } from "../../funciones/modales/modal_registrar.js";






export async function control_tiempo(code, permisos, refrescar,ids) {
    code_ = code;
    permisos_ = permisos;
    refrescar_ = refrescar;
    privilegios = [...permisos.toString()].map((digito) => parseInt(digito));
    id_grupo_etapas = ids[0];
    id_produccion = ids[1];
    app=document.querySelector(`#contenido2${codigos.codigoproduccion_comenzar}`);
    sitio();    
    
}