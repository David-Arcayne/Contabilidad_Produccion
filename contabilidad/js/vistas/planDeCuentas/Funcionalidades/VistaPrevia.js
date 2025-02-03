import { crearElemento, exportarAXlsx, FormatoDate } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js"

export const VPCuentas = (url_rep) => async() => {
    const datoReporte = await obtenerDatos(url_rep);
    if (!datoReporte) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }

    const fechaActual = new Date();
    const miFecha = fechaActual.toISOString().slice(0,10);

    const subtitulo = `<div><h4>Plan de cuentas</h4></div> <span>Al: ${FormatoDate(miFecha)}</span>`;
    let htmlTable = "";
    for (const value of datoReporte) {
        htmlTable += `
            <tr>
                <td>${value.numero}</td>
                <td>${value.plan}</td>
                <td>${value.tipo}</td>
                <td>${value.descripcion}</td>
            </tr>`;
    };

    const html = `
        <div class="afr-filters-t">
            ${subtitulo}
        </div>
        <table class="afr-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Cuenta</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                </tr>
            </thead>
            <tbody>
                ${htmlTable}
            </tbody>
        </table>
        `;

    return html;
}

export const ExportarCuenta = (url_rep, encabezado) => {
    const icono = crearElemento("i", { class: "bi bi-table pe-1" });
    const btnExportar = crearElemento("button", { class: "btn btn-success" }, [icono, " Exportar EXCEL"]);

    btnExportar.addEventListener("click", async(e) => {
        e.preventDefault();

        const datoReporte = await obtenerDatos(url_rep);
        if (!datoReporte) {
            return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
        }
    
        const filas = datoReporte.map(dato => [dato.numero, dato.plan, dato.tipo, dato.descripcion]);
        const data = [encabezado, ...filas];
        
        exportarAXlsx(data, "plan_de_cuentas");
        
    });

    return btnExportar;

}