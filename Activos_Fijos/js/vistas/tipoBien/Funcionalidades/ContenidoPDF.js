import { obtenerDatos } from "../../../funciones/Solicitudes.js";

export const ContenidoPDF = async () => {
    const data = await obtenerDatos(`./api/tipo-bien/reporte-js`);
    if (!data || !data.hasOwnProperty("data")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }
    
    const dataAT = data.data;

    const tableContent = () => {
        let tbody = '';
        for (const value of dataAT) {
            tbody += `
                <tr>
                    <td>${value.codificacion}</td>
                    <td>${value.nombre}</td>
                    <td>${value.descripcion}</td>
                    <td>${value.nombrecategoria}</td>
                </tr>`;
        };
        return tbody;
    };

    let table = '';
    if (dataAT && dataAT.length > 0) {
        const tbody = tableContent();
        table = `
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Codigo</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Categoría</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbody}
                </tbody>
            </table>`;
    }

    const html = `
        <div>
            <h1>Reporte Tipo de bien</h1>
        </div>
        <div class="afr-filter-void"></div>
        ${table}`;

    return html;
}