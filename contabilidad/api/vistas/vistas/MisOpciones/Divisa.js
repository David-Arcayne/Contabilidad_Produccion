import { CT_URLAPI, getEmpresaId } from "../../funciones/DatosAuxiliares.js";
import { obtenerDatos } from "../../funciones/Solicitudes.js";

export const Divisa = async () => {
    const URL = CT_URLAPI;
    const empresa_id = getEmpresaId();
    const URL_LT = `${URL}listar_divisa/${empresa_id}`;

    const listaDivisas = await obtenerDatos(URL_LT);
    if (listaDivisas) {
        for (const divisa of listaDivisas) {
            if(divisa.estado === 1) {
                localStorage.setItem("divisa", JSON.stringify(divisa));
                break;
            }
        }
    } else {
        localStorage.removeItem("divisa");
    }
}