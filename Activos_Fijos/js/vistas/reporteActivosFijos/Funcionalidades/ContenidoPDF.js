import { FormatoDate } from "../../../funciones/Funciones.js";
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
        let contador = 0;
        for (const value of data.data) {
            contador++;
            htmlTable += `
                <tr>
                    <td>${contador}</td>
                    <td>${value.codigo}</td>
                    <td class="afr-te">${value.cantidad}</td>
                    <td>${value.nombre}</td>
                    <td>${value.detalle}</td>
                    <td class="afr-te">${FormatoDate(value.fechacompra)}</td>
                    <td>${value.nombrecategoria}</td>
                    <td>${value.nombretipobien}</td>
                    <td>${value.nombretiposeguro || "-"}</td>
                    <td>${value.nombreestado || "-"}</td>
                    <td>${value.nombrearea || "-"}</td>
                    <td>${value.nombretrabajador || "-"}</td>
                </tr>`;
        };

        let html = `
            <div>
                <h1>Reporte de Activos Fijos</h1>
            </div>
            <div class="afr-filters-t">
                ${subtitulo}
            </div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>Código</th>
                        <th>Cantidad</th>
                        <th>Nombre</th>
                        <th>Detalle</th>
                        <th>Fecha de ingreso</th>
                        <th>Categoría</th>
                        <th>Tipo de Bien</th>
                        <th>Tipo seguro</th>
                        <th>Estado</th>
                        <th>Área</th>
                        <th>Responsable</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTable}
                </tbody>
            </table>`;

        return html;
    }
}