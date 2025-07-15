import { FormatoDate, FormatoDateTime } from "../../../funciones/Funciones.js";
import { FiltrosPDF } from "../../../funciones/VistaPDF.js";

export const ContenidoPDF = (url, formulario, extra) => {
    return async () => {
        const cuerpo = new FormData(formulario);
        const datosExtra = extra(cuerpo, formulario);
        cuerpo.append("informacion", datosExtra);
        const data = await fetch(url, {
            method:"POST",
            body: cuerpo
        })
        .then(res => res.json())
        .then(res => { return res; })
        .catch(error => {return false;});

        if (!data || !data.hasOwnProperty("data")) {
            return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
        }
        
        const dataI = data["dataInventarios"];
        const subtitulo = FiltrosPDF(data.info);

        let htmlTable = "";
        for (const value of data.data) {
            htmlTable += `
                <tr>
                    <td class="afr-tc">${value.codigo}</td>
                    <td>${value.nombre}</td>
                    <td>${value.detalle}</td>
                    <td class="afr-te">${FormatoDate(value.fechacompra)}</td>
                    <td>${value.nombrecategoria}</td>
                    <td>${value.nombretipobien}</td>
                    <td>${value.nombretiposeguro ? value.nombretiposeguro : "-"}</td>
                    <td>${value.nombreestado ? value.nombreestado : "-"}</td>
                    <td>${value.observacioninv ? value.observacioninv : "-"}</td>
                </tr>`;
        };

        let html = `
            <div>
                <h1>Reporte de Inventario Activos Fijos</h1>
            </div>
            <div class="afr-filters-t">
                ${subtitulo}
            </div>
            <div class="afr-info">
                <div class="afr-info-left">
                    <div><span>Responsable:</span> ${dataI.nombrecompleto}</div>
                    <div><span>Fecha inicio:</span> ${FormatoDateTime(dataI.fecha)}</div>
                    <div><span>Fecha Finalización:</span> ${FormatoDateTime(dataI.fechafin)}</div>
                </div>
                <div class="afr-info-right">
                    <div><span>Título:</span> ${dataI.descripcion}</div>
                </div>
            </div>
            <br/>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Detalle</th>
                        <th>Fecha de ingreso</th>
                        <th>Categoría</th>
                        <th>Tipo de Bien</th>
                        <th>Tipo seguro</th>
                        <th>Estado</th>
                        <th>Observación</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTable}
                </tbody>
            </table>`;

        return html;
    }
}