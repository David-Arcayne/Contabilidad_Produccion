import { obtenerDatos } from "../../../funciones/Solicitudes.js";

export const ContenidoPDF = async () => {
    const data = await obtenerDatos(`./api/tipo-baja/reporte-js`);
    if (!data || !data.hasOwnProperty("data")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }
    
    const dataUT = data.data;

    const tableContent = () => {
        let tbody = '';
        for (const value of dataUT) {
            tbody += `
                <tr>
                    <td>${value.nombre}</td>
                    <td>${value.descripcion}</td>
                </tr>`;
        };
        return tbody;
    };

    let table = '';
    if (dataUT && dataUT.length > 0) {
        const tbody = tableContent();
        table = `
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
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
            <h1>Reporte motivos de baja</h1>
        </div>
        <div class="afr-filter-void"></div>
        ${table}`;

    return html;
}