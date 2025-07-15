import { obtenerDatos } from "../../../funciones/Solicitudes.js";

export const ContenidoPDF = (url, divPage, datosExtra) => async () => {
    const cuerpo = new FormData();
    cuerpo.append("informacion", datosExtra());
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
    
    const dataMovement = data.data;
    const dataMNFA = data.dataMNFA;
    const dataMovementFA = data.dataMFA;
    const info = data.info;

    let stateMov = dataMovement.estado;
    let individual = data.individual;

    let movement = function () {
        let tbody = '';
        let counter = 0;

        if (stateMov === 12 && !individual) {
            dataMovementFA.forEach((value, index) => {
                counter++;
                tbody += `
                    <tr>
                        <td>${counter}</td>
                        <td class="afr-te">${value.codigo}</td>
                        <td>${value.nombrecategoria}</td>
                        <td>${value.nombre}</td>
                        <td class="afr-w-150">${value.detalle}</td>
                        <td class="afr-te">${value.cantidad_ma}</td>
                        <td>${value.nombresucursal ?? "-"}</td>
                        <td>${value.nombrearea ?? "-"}</td>
                        <td>${value.nombretrabajador ?? "-"}</td>
                        <td>${value.nombresucursaldestino ?? "-"}</td>
                        <td>${value.nombreareadestino ?? "-"}</td>
                        <td>${value.nombretrabajadordestino ?? "-"}</td>
                        <td>${value.trabajador_id && value.trabajador_destino ? "Reasignación" : (value.trabajador_id ? "Devolución" : "Asignación")}</td>
                    </tr>`;
            });
        } else {
            dataMovementFA.forEach((value, index) => {
                let stateM = '';
                if (stateMov === 12) {
                    stateM = value.trabajador_id ? "Devolución" : "Asignación";
                } else if (stateMov === 6 || stateMov === 7) {
                    stateM = value.estado_ma === 1 ? "Devolución" : "Rechazado";
                } else if (stateMov === 3 || stateMov === 1) {
                    stateM = value.estado_ma === 1 ? "Asignación" : "Rechazado";
                }

                counter++;
                tbody += `
                    <tr>
                        <td>${counter}</td>
                        <td class="afr-te">${value.codigo}</td>
                        <td>${value.nombrecategoria}</td>
                        <td>${value.nombre}</td>
                        <td>${value.detalle}</td>
                        <td class="afr-te">${value.cantidad_ma}</td>
                        <td>${stateM}</td>
                    </tr>`;
            });
        }

        dataMNFA.forEach((value) => {
            counter++;
            tbody += `
                <tr>
                    <td>${counter}</td>
                    <td class="afr-te"> - </td>
                    <td> - </td>
                    <td>${value.nombre}</td>
                    <td>${value.detalle}</td>
                    <td class="afr-te">${value.cantidad}</td>
                    <td> - </td>
                    <td>${value.estado === 3 ? "Rechazado" : "Asignación"}</td>
                </tr>`;
        });

        return tbody;
    };

    let contentMovement = '';
    let page = "Letter";

    if (dataMovement) {
        let tbody = movement();

        let thead = '';
        let dataInfo = '';

        if (stateMov === 12 && !individual) {
            page = "Letter-L";
            dataInfo = `
                <div><span>Responsable:</span> ${info.responsable}</div>`;
            thead = `
                <tr>
                    <th>N°</th>
                    <th>Código</th>
                    <th>Categoria</th>
                    <th>Nombre</th>
                    <th>Detalle</th>
                    <th>Cantidad</th>
                    <th>Sucursal Origen</th>
                    <th>Área origen</th>
                    <th>Trabajador origen</th>
                    <th>Sucursal destino</th>
                    <th>Área destino</th>
                    <th>Trabajador destino</th>
                    <th>Estado</th>
                </tr>`;
        } else {
            dataInfo = `
                <div><span>Responsable:</span> ${info.responsable}</div>
                <div><span>Sucursal:</span> ${info.sucursal}</div>
                <div><span>Área de trabajo:</span> ${info.area}</div>
                <div><span>Personal:</span> ${info.personal}</div>`;
            thead = `
                <tr>
                    <th>N°</th>
                    <th>Código</th>
                    <th>Categoria</th>
                    <th>Nombre</th>
                    <th>Detalle</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                </tr>`;
        }

        contentMovement = `
            <div class="afr-info">
                ${dataInfo}
            </div>
            <div>
                <p><b>Activos Fijos:</b></p>
                <table class="afr-table">
                    <thead>
                        ${thead}
                    </thead>
                    ${tbody}
                </table>
            </div>`;
    }

    let mainContent = `
        <div>
            <h1>Reporte Movimiento</h1>
        </div>
        <div class="afr-filter-void"></div>
        ${contentMovement}`;

    if (page == "Letter") {
        divPage.style.minWidth = "8.5in";
        divPage.style.maxWidth = "8.5in";
        divPage.style.minHeight = "11in";
    } else {
        divPage.style.minWidth = "11in";
        divPage.style.maxWidth = "11in";
        divPage.style.minHeight = "8.5in";
    }

    return mainContent;
}

export const MisBienesPDF = (url) => async () => {
    const data = await obtenerDatos(url);
    
    if (!data || !data.hasOwnProperty("data")) {
        return `<div class="py-5 fw-bold text-center text-danger">Ocurrio un error al cargar los datos</div>`;
    }
    
    const datoMA = data.data;

    let tbody = "";
    for (const value of datoMA) {
        tbody += `<tr>
            <td>${ value["codigo"]} </td>
            <td>${ value["nombre"]} </td>
            <td>${ value["detalle"]} </td>
            <td>${ value["micantidad"]} </td>
        </tr>`; 
    }

    let table = '';
    if (datoMA) {
        table = `                                            
            <table class="afr-table">
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Detalle</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                ${tbody}
            </table>`;
    }
    
    const html  = `
        <div>
            <h1>Mis bienes</h1>
        </div>
        <div class="afr-filter-void"></div>
        ${table}
    `;

    return html;
}