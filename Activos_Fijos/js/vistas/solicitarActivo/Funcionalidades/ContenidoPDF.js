import { FormatoDateTime } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";

export const ContenidoPDF = (url) => async () => {
    const data = await obtenerDatos(url);
    if (!data || !data.hasOwnProperty("data")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }
    
    const dataMovFA = data.data;
    const dataMov = data.dataMov;
    
    let fixedAsset = "";
    if (dataMovFA && dataMovFA.length > 0) {
        fixedAsset = `
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Código</th>
                        <th>Activo Fijo</th>
                        <th>Detalle</th>
                        <th>Cantidad</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>`;
        let index = 0;
        for (const value of dataMovFA) {
            fixedAsset += `
                <tr>
                    <td class="afr-te">${index + 1}</td>
                    <td>${value.codigoactivofijo ?? "-"}</td>
                    <td>${value.nombreactivofijo ?? value.nombre}</td>
                    <td>${value.detalleactivofijo ? value.detalleactivofijo : value.detalle}</td>
                    <td class="afr-te">${value.cantidad}</td>
                    <td class="afr-fwbi">${value.estado == 1 ? "Aceptado" : "Rechazado"}</td>
                </tr>`;
        };
    
        fixedAsset += `
                </tbody>
            </table>`;
    } else {
        fixedAsset = '<p class="afr-center"> Sin componentes </p>';
    }
    
    let html = `
        <h2 class="afr-end">N°: ${dataMov.cod_comprobante}</h2>
        <div>
            <h1>Comprobante</h1>
        </div>
        <div class="afr-filters-t">
            <div><span>Tipo Solicitud:</span> ${
                dataMov.estado == 1 || dataMov.estado == 3 ? "Asignación" : "Devolución"
            }</div>
        </div>
        <div class="afr-info">
            <div class="afr-info-left">
                <div><span>Solicitante:</span> ${dataMov.nombretrabajador}</div>
                <div><span>Título:</span> ${dataMov.detalle}</div>
                <div><span>Fecha Solicitud:</span> ${FormatoDateTime(dataMov.fechasolicitud)}</div>
            </div>
            <div class="afr-info-right">
                <div><span>Responsable:</span> ${dataMov.nombreencargado}</div>
                <div><span>Fecha asignación:</span> ${FormatoDateTime(dataMov.fecharespuesta)}</div>
            </div>
        </div>
        <div>
            <p><b>Activos Fijos:</b></p>
            ${fixedAsset}
        </div>`;
    
    return html;
}