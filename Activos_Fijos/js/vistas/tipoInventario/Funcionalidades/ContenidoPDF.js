// import { AF_ENV } from "../../../../db/environment.js";
// import { crearElemento } from "../../../funciones/Funciones.js";
import { obtenerDatos } from "../../../funciones/Solicitudes.js";

// export const VistaPrevia = () => {
    
//     const modalH1 = crearElemento("h1", {class: "modal-title fs-5"}, ["Vista previa"]);
//     const btnCerrar = crearElemento("button", {type: "button", class: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close"});
//     const modalHeader = crearElemento("div", {class: "modal-header"}, [modalH1, btnCerrar]);

//     const divPage = crearElemento("div", {style: "padding:0px; width: 100%; max-width: 8.5in; background-color: #ffffff;", class:"af-seccion"}, ["..."]);
//     const modalBody = crearElemento("div", {class: "modal-body shadow-none row justify-content-center bg-secondary"}, [divPage]);

//     const btnCerrarModal = crearElemento("button", {type: "button", class: "btn btn-secondary", "data-bs-dismiss": "modal"}, ["Cerrar"]);
//     const modalFooter = crearElemento("div", {class: "modal-footer"}, [btnCerrarModal]);

//     const modalContent = crearElemento("div", {class: "modal-content"}, [modalHeader, modalBody, modalFooter]);

//     const modalDialog = crearElemento("div", {class: "modal-dialog modal-fullscreen"}, [modalContent]);

//     const modal = crearElemento("div", {class: "modal fade", id: `${"exampleModal"}`, tabindex: "-1", "aria-labelledby": "exampleModalLabel", "aria-hidden": "true"}, [modalDialog]);

//     pdfPrincipal(divPage);

//     return modal;
// };

// const pdfPrincipal = async (divPage) => {
//     const empresa = JSON.parse(localStorage.getItem("yofinanciero"))[0].empresa;
//     const cuerpo = await cuerpoPDF();
//     const htmlHeader =`
//         <div class="reportaf" style="margin: 15mm">
//             <div class="afr-header afr-h-mb">
//                 <div class="afr-h-left afr-pb">
//                     <div class="afr-text-lg"> ${empresa.nombre} </div>
//                     <div> ${empresa.direccion} </div>
//                     <div> ${empresa.ociudad} </div>
//                     <div> ${empresa.oestado} </div>
//                     <div> ${empresa.opais} </div>
//                 </div>
//                 <div class="afr-h-center">
//                     <table class="afr-h-table">
//                         <tr>
//                             <td>
//                                 <img class="afr-logo" src="${AF_ENV.apiUrl}/app/em/${empresa.logo}">
//                             </td>
//                         </tr>
//                     </table>
//                 </div>
//                 <div class="afr-h-right afr-pb">
//                     <div class="afr-text-lg"> NIT: ${empresa.nit} </div>
//                     <div>Tel: ${empresa.telefono} </div>
//                     <div>Cel: ${empresa.ocelular} </div>
//                     <div> ${empresa.email} </div>
//                     <div> ${empresa.ositioweb} </div>
//                 </div>
//             </div>
//             <main>
//                 ${cuerpo}
//             </main>
//         </div>`;

//     divPage.innerHTML =  htmlHeader;
// }

export const ContenidoPDF = async () => {
    const data = await obtenerDatos(`./api/tipo-inventario/reporte-js`);
    if (!data || !data.hasOwnProperty("data")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }
    
    const datoTipoInventario = data.data;

    let tbody = "";
    for (const value of datoTipoInventario) {
        tbody += `<tr>
            <td>${ value["nombre"]} </td>
            <td>${ value["detalle"]} </td>
            <td>${ (value["tipo"] == 1 ? "Depreciable" : "No Depreciable")} </td>
        </tr>`; 
    }

    let table = '';
    if (datoTipoInventario) {
        table = `                                            
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Detalle</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                ${tbody}
            </table>`;
    }
    
    const html  = `
        <div>
            <h1>Reporte Tipo Inventario</h1>
        </div>
        <div class="afr-filter-void"></div>
        ${table}
    `;

    return html;
}