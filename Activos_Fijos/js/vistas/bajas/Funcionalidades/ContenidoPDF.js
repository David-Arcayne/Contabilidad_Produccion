import { FormatoDate, FormatoDateTime, FormatoEnUs } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";
import { FiltrosPDF } from "../../../funciones/VistaPDF.js";

export const ContenidoPDF = (formulario, extra) => {

    return async () => {
        const cuerpo = new FormData(formulario);
        const objAFTI = JSON.parse(sessionStorage.getItem("af_tipo_inventario"));
        const datosExtra = extra(cuerpo, formulario);
        cuerpo.append("informacion", datosExtra);
        const data = await fetch(`./api/activo-fijo/bajas/reporte/${objAFTI.tipo_inventario}`, {
            method:"POST",
            body: cuerpo
        })
        .then(res => res.json())
        .then(res => { return res; })
        .catch(error => {return false;});

        if (!data || !data.hasOwnProperty("data")) {
            return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
        }
        
        const subtitulo = FiltrosPDF(data.info);

        let htmlTable = "";
        data.data.forEach(value => {
            htmlTable += `
                <tr>
                    <td>${value.codigo}</td>
                    <td class="afr-te">${value.cantidad}</td>
                    <td class="afr-te">${value.cantidadaltas}</td>
                    <td>${value.nombre}</td>
                    <td>${value.detalle}</td>
                    <td class="afr-te">${FormatoEnUs(value.precio)}</td>
                    <td class="afr-te">${FormatoDate(value.fechacompra)}</td>
                    <td>${value.nombrecategoria}</td>
                    <td>${value.nombretipobien}</td>
                    <td>${value.nombretiposeguro || "-"}</td>
                </tr>`;
        });

        let html = `
            <div>
                <h1>Reporte de Activos Fijos - Bajas</h1>
            </div>
            <div class="afr-filters-t">
                ${subtitulo}
            </div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cantidad</th>
                        <th>Cantidad actual</th>
                        <th>Nombre</th>
                        <th>Detalle</th>
                        <th>Precio</th>
                        <th>Fecha de ingreso</th>
                        <th>Categoría</th>
                        <th>Tipo de Bien</th>
                        <th>Tipo seguro</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTable}
                </tbody>
            </table>`;

        return html;
    }
}

export const HistorialPDF = (url) =>  async () => {
    const data = await obtenerDatos(`${url}`);
    if (!data || !data.hasOwnProperty("data")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    const dataFA = data.data;
    let unsubscribeFA = data.dataUFA;
    let htmlState = "";
    
    if (unsubscribeFA && unsubscribeFA.length > 0) {
        let tableU = `
        <table class="afr-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Cantidad</th>
                    <th>Detalle</th>
                    <th>Precio</th>
                    <th>Fecha de baja</th>
                    <th>Tipo de baja</th>
                    <th>Responsable baja</th>
                </tr>
            </thead>
            <tbody>`;
    
        unsubscribeFA.forEach(value => {
            tableU += `<tr>
                <td>${value.codigo}</td>
                <td class="afr-te">${value.cantidad}</td>
                <td>${value.detallebaja}</td>
                <td class="afr-te">${FormatoEnUs(value.precio)}</td>
                <td class="afr-te">${FormatoDateTime(value.fechabaja)}</td>
                <td>${value.nombretipobaja}</td>
                <td>${value.nombretrabajador}</td>
            </tr>`;
        });
    
        tableU += `</tbody></table>`;
        htmlState = tableU;
    } else {
        htmlState = '<p class="afr-center">Sin bajas</p>';
    }
    
    let html = `
        <div>
            <h1>Bajas: ${dataFA.nombre}</h1>
        </div>
        <div class="afr-filter-void"></div>
        <div class="afr-info">
            <div><span>Nombre:</span> ${dataFA.nombre}</div>
            <div><span>Código:</span> ${dataFA.codigo}</div>
            <div><span>Cantidad:</span> ${dataFA.cantidad}</div>
            <div><span>Detalle:</span> ${dataFA.detalle}</div>
            <div><span>Estado:</span> ${dataFA.nombretipoestado}</div>
            <div><span>Fecha de ingreso:</span> ${FormatoDate(dataFA.fechacompra)}</div>
        </div>
        <div>
            <p><b>Bajas del activo: </b></p>
            ${htmlState}
        </div>`;

    return html;
}