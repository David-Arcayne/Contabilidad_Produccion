import { setLogoEmpresaBase64 } from "../../funciones/VistaPDF.js";
import { Divisa } from "./Divisa.js";
import { Notificaciones } from "./Notificaciones.js";

// Función principal para inicializar las opciones del módulo
export const CtOpciones = (permisos) => {

    setLogoEmpresaBase64();

    Notificaciones(permisos);

    Divisa();
}