import { obtenerDatos } from "../../../funciones/Solicitudes.js";

export const ContenidoPDF = async () => {
    const data = await obtenerDatos(`./api/categoria/reporte-js`);
    if (!data || !data.hasOwnProperty("data")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }
    
    const dataCategory = data.data;

    const tableContent = () => {
        let tbody = '';
        for (const value of dataCategory) {
            tbody += `
                <tr>
                    <td>${value.codificacion}</td>
                    <td>${value.nombre}</td>
                    <td class="afr-te">${value.vidautil}</td>
                    <td class="afr-te">${value.coeficiente}</td>
                    <td>${value.descripcion}</td>
                </tr>`;
        };
        return tbody;
    };

    let table = '';
    if (dataCategory && dataCategory.length > 0) {
        const tbody = tableContent();
        table = `
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Codigo</th>
                        <th>Nombre</th>
                        <th>Vida util</th>
                        <th>Coeficiente</th>
                        <th>Descripción</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbody}
                </tbody>
            </table>`;
    }

    const html = `
        <div>
            <h1>Reporte Categoria</h1>
        </div>
        <div class="afr-filter-void"></div>
        ${table}`;

    return html;
}