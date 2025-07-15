import { FormatoDateTime, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";

export const ContenidoPDF = (url) => async () => {
    const data = await obtenerDatos(url);
    
    if (!data || !data.hasOwnProperty("data")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    const dataH = data.data;
    let html = `
        <h2 class="afr-end">N°: ${dataH.cod_comprobante}</h2>
        <div>
            <h1>Comprobante</h1>
        </div>
        <div class="afr-filter-void"></div>
        <div>
            <p><b>Situación: </b>${dataH["nombretiposituacion"]}</p>
                
            <p><b>Ingreso:</b></p>
            <table class="afr-table" data-tname="ingreso">
                <thead >
                    <tr>
                        <th>Código</th>
                        <th>Activo Fijo</th>
                        <th>Componente</th>
                        <th>Detalle situación</th>
                        <th>Fecha de ingreso</th>
                        <th>Fecha tentativa de salida</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${dataH["codigoactivofijo"]}</td>
                        <td>${dataH["nombreactivofijo"]}</td>
                        <td>${dataH["nombrecomponente"] ?? "-"}</td>
                        <td>${dataH["detalle"]}</td>
                        <td class="afr-te">${FormatoDateTime(dataH["fechaingreso"])}</td>
                        <td class="afr-te">${FormatoDateTime(dataH["fechafin"])}</td>
                    </tr>
                </tbody>
            </table>
            <p><b>Salida:</b></p>
            <table class="afr-table" data-tname="salida">
                <thead >
                    <tr>
                        <th>Fecha de salida</th>
                        <th>Costo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${FormatoDateTime(dataH["fechasalida"])}</td>
                        <td>${FormatoEnUs(dataH["costo"])}</td>
                    </tr>
                </tbody>
            </table>

            <br/>
            <p><b>Responsable: </b>${dataH["nombreeditor"]}</p>
        </div>`;

    return html;
}