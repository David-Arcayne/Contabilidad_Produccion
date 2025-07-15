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

        let method = {
            1: "Línea recta",
            2: "Suma de dígitos",
            3: "Unidades Producción"
        };        
        let htmlTable = "";
        for (const value of data.data) {
            let metodo = method[value.metododepreciacion_id] || "-";
            htmlTable += `
                <tr>
                    <td>${metodo}</td>
                    <td class="afr-te">${value.codigoactivofijo}</td>
                    <td>${value.nombreactivofijo}</td>
                    <td>${value.detalleactivofijo}</td>
                </tr>`;
        };

        let html = `
            <div>
                <h1>Método Activos Fijos</h1>
            </div>
            <div class="afr-filters-t">
                ${subtitulo}
            </div>
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Método</th>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Detalle</th>
                    </tr>
                </thead>
                <tbody>
                    ${htmlTable}
                </tbody>
            </table>`;

        return html;
    }
}