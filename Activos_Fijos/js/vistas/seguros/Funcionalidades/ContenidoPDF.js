import { FormatoDate, FormatoDateTime, FormatoEnUs } from "../../../funciones/Funciones.js";
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
        
        const subtitulo = FiltrosPDF(data.info);

        let htmlTable = "";
        for (const value of data.data) {
            htmlTable += `
                <tr>
                    <td>${data.company[value.empresaseguro_id] ? data.company[value.empresaseguro_id] : "-"}</td>
                    <td>${value.nombretiposeguro}</td>
                    <td>${value.poliza}</td>
                    <td>${value.codigo}</td>
                    <td>${value.certificado}</td>
                    <td class="afr-te">${FormatoDateTime(value.periodoa)}</td>
                    <td class="afr-te">${FormatoDateTime(value.periodob)}</td>
                    <td>${value.detalle}</td>
                    <td>${value.contacto}</td>
                </tr>`;
        };

        let html = `
            <div>
                <h1>Reporte Seguros</h1>
            </div>
            <div class="afr-filters-t">
                ${subtitulo}
            </div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Aseguradora</th>
                        <th>Tipo de seguro</th>
                        <th>Nro. Póliza</th>
                        <th>Código</th>
                        <th>Certificado</th>
                        <th>Fecha inicio seguro</th>
                        <th>Caducidad</th>
                        <th>Detalle</th>
                        <th>Contacto</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTable}
                </tbody>
            </table>`;

        return html;
    }
}

export const ActivosFjosPDF = (url, formulario, extra) => {
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
        
        const subtitulo = FiltrosPDF(data.info);

        let htmlTable = "";
        for (const value of data.data) {
            htmlTable += `
                <tr>
                    <td>${value.codigo}</td>
                    <td class="afr-te">${value.cantidad}</td>
                    <td>${value.nombre}</td>
                    <td>${value.detalle}</td>
                    <td class="afr-te">${FormatoEnUs(value.precio)}</td>
                    <td class="afr-te">${FormatoDate(value.fechacompra)}</td>
                    <td>${value.nombrecategoria}</td>
                    <td>${value.nombretipobien}</td>
                    <td>${value.nombretiposeguro || "-"}</td>
                </tr>`;
        };

        let html = `
            <div>
                <h1>Reporte Seguros - Activos fijos</h1>
            </div>
            <div class="afr-filters-t">
                ${subtitulo}
            </div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Cantidad</th>
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